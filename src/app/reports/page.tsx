"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getLeads, Lead } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Lock, DollarSign, TrendingUp, Users, Phone, GraduationCap, BarChart3 } from "lucide-react";

const TS = { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" };

const STATUS_LABELS: Record<string, string> = {
  new: "New", contacted: "Contacted", trial_booked: "Trial Booked",
  trial_done: "Trial Done", joined: "Joined", not_joined: "Not Joined", lost: "Lost",
};

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isAdmin) { router.replace("/dashboard"); return; }
    getLeads()
      .then(res => setLeads(res.documents as unknown as Lead[]))
      .catch(() => setLeads([]))
      .finally(() => setMounted(true));
  }, [isAdmin]);

  if (!mounted || !isAdmin) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mb-4"><Lock size={28} className="text-red-400" /></div>
      <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
      <p className="text-slate-500">Reports are visible to Admin and Super Admin only.</p>
    </div>
  );

  const joined    = leads.filter(l => l.status === "joined");
  const totalFee  = joined.reduce((s, l) => s + (Number((l as any).feeAmount) || 0), 0);
  const convRate  = leads.length ? Math.round((joined.length / leads.length) * 100) : 0;

  // Status breakdown
  const statusBreakdown = Object.entries(STATUS_LABELS).map(([val, label]) => ({
    name: label,
    count: leads.filter(l => l.status === val).length,
  })).filter(s => s.count > 0);

  // Platform breakdown
  const platformMap: Record<string, number> = {};
  leads.forEach(l => { platformMap[l.platform] = (platformMap[l.platform] || 0) + 1; });
  const platformData = Object.entries(platformMap).map(([name, count]) => ({ name, count }));

  // Source breakdown (Lead From)
  const sourceMap: Record<string, number> = {};
  leads.forEach(l => {
    const src = (l as any).leadSource || "Unknown";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([name, count]) => ({ name, count }));

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Performance analytics</p></div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Leads",     val: leads.length,     color: "text-blue-400",    icon: <Users size={18} /> },
          { label: "Students Joined", val: joined.length,    color: "text-emerald-400", icon: <GraduationCap size={18} /> },
          { label: "Conversion Rate", val: `${convRate}%`,   color: "text-pink-400",    icon: <TrendingUp size={18} /> },
          { label: "Fee Collected",   val: `PKR ${totalFee.toLocaleString()}`, color: "text-amber-400", icon: <DollarSign size={18} /> },
        ].map(({ label, val, color, icon }) => (
          <div key={label} className="stat-card">
            <div className={`mb-2 ${color}`}>{icon}</div>
            <span className="text-xs text-slate-500">{label}</span>
            <span className={`text-2xl font-bold ${color}`}>{val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Status Breakdown */}
        <div className="crm-card">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2"><BarChart3 size={15} className="text-blue-400" />Lead Status Breakdown</h3>
          {statusBreakdown.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusBreakdown} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TS} />
                <Bar dataKey="count" name="Leads" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="crm-card">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2"><Phone size={15} className="text-emerald-400" />Leads by Platform</h3>
          {platformData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TS} />
                <Bar dataKey="count" name="Leads" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Lead Source Breakdown */}
      <div className="crm-card mb-5">
        <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-amber-400" />Leads by Source</h3>
        {sourceData.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No lead source data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sourceData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TS} />
              <Bar dataKey="count" name="Leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="crm-card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0"><DollarSign size={22} className="text-amber-400" /></div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Total Fee Collected</p>
            <p className="text-2xl font-bold text-amber-400">PKR {totalFee.toLocaleString()}</p>
          </div>
        </div>
        <div className="crm-card flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0"><TrendingUp size={22} className="text-emerald-400" /></div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Lead to Student Conversion</p>
            <p className="text-2xl font-bold text-emerald-400">{convRate}%</p>
            <p className="text-xs text-slate-500">{joined.length} joined out of {leads.length} leads</p>
          </div>
        </div>
      </div>
    </div>
  );
}
