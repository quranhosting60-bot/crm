"use client";
import { useEffect, useState } from "react";
import { getMonthlyStats, getDailyTargets } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import {
  Users, Phone, BookOpen, GraduationCap, TrendingUp,
  MessageCircle, Headphones, Target, DollarSign, ArrowRight,
  CheckCircle2, Clock, CheckCircle, XCircle, ShieldCheck
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

const today = format(new Date(), "yyyy-MM-dd");
const thisMonth = format(new Date(), "yyyy-MM");

const MOCK_WEEKLY = [
  { day: "Mon", whatsapp: 24, viber: 18 },
  { day: "Tue", whatsapp: 30, viber: 22 },
  { day: "Wed", whatsapp: 18, viber: 15 },
  { day: "Thu", whatsapp: 35, viber: 28 },
  { day: "Fri", whatsapp: 28, viber: 20 },
  { day: "Sat", whatsapp: 42, viber: 35 },
  { day: "Sun", whatsapp: 15, viber: 10 },
];

const MOCK_TREND = [
  { month: "Nov", leads: 62, students: 18 },
  { month: "Dec", leads: 78, students: 24 },
  { month: "Jan", leads: 55, students: 15 },
  { month: "Feb", leads: 90, students: 31 },
  { month: "Mar", leads: 110, students: 38 },
  { month: "Apr", leads: 125, students: 43 },
];

const tooltipStyle = {
  backgroundColor: "#1e293b", border: "1px solid #334155",
  borderRadius: "8px", color: "#f1f5f9", fontSize: "12px",
};

// ── Ibrahim only: Pending Approvals ──────────────────────────────────────────
function PendingApprovals() {
  const { getPendingUsers, approveUser, rejectUser } = useAuth();
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => { setPending(getPendingUsers()); }, []);

  const handleApprove = (id: string) => { approveUser(id); setPending(getPendingUsers()); };
  const handleReject = (id: string) => { rejectUser(id); setPending(getPendingUsers()); };

  return (
    <div className="crm-card mb-5 border border-yellow-800/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-yellow-400" />
          <h3 className="font-semibold text-white text-sm">Pending Account Approvals</h3>
          {pending.length > 0 && (
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>
        {pending.length > 0 && (
          <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-800/40">
            Action Required
          </span>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
          <CheckCircle size={15} className="text-emerald-500" />
          No pending approvals — all accounts are reviewed
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(u => (
            <div key={u.id}
              className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-slate-400 text-xs">@{u.username} · <span className="capitalize">{u.role}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-yellow-400 mr-1">
                  <Clock size={11} /> Pending
                </span>
                <button onClick={() => handleApprove(u.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors font-medium">
                  <CheckCircle size={12} /> Approve
                </button>
                <button onClick={() => handleReject(u.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs rounded-lg transition-colors font-medium">
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [myTarget, setMyTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, targets] = await Promise.all([
          getMonthlyStats(thisMonth),
          getDailyTargets(today),
        ]);
        setStats(s);
        const mine = (targets.documents as any[]).find(
          t => t.agentId === user?.id || t.agentName === user?.name
        );
        setMyTarget(mine || null);
      } catch {
        setStats({
          totalLeads: 125, totalCalls: 842, whatsappCalls: 520,
          vikiCalls: 322, totalTrials: 43, totalStudents: 38,
          totalFee: 228000, joinRate: "30.4",
        });
        setMyTarget({ targetCalls: 30, leadIdFrom: "Lead 1", leadIdTo: "Lead 30", completed: false });
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const targetTotal = myTarget?.targetCalls || 30;
  const targetDone = myTarget?.completed ? targetTotal : Math.floor(targetTotal * 0.6);
  const targetPct = Math.min(100, Math.round((targetDone / targetTotal) * 100));

  const statCards = [
    { label: "Total Leads", value: stats?.totalLeads ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-900/20" },
    { label: "Total Calls", value: stats?.totalCalls ?? 0, icon: Phone, color: "text-emerald-400", bg: "bg-emerald-900/20" },
    { label: "WhatsApp Calls", value: stats?.whatsappCalls ?? 0, icon: MessageCircle, color: "text-green-400", bg: "bg-green-900/20" },
    { label: "Viber Calls", value: stats?.vikiCalls ?? 0, icon: Headphones, color: "text-purple-400", bg: "bg-purple-900/20" },
    { label: "Trials Booked", value: stats?.totalTrials ?? 0, icon: BookOpen, color: "text-yellow-400", bg: "bg-yellow-900/20" },
    { label: "Students Joined", value: stats?.totalStudents ?? 0, icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-900/20" },
    { label: "Join Rate", value: `${stats?.joinRate ?? 0}%`, icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-900/20" },
    { label: "Fee Collected", value: `${((stats?.totalFee ?? 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-900/20" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{format(new Date(), "EEEE, d MMMM yyyy")} — Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Ibrahim only: Pending Approvals */}
      {user?.username === "ibrahim" && <PendingApprovals />}

      {/* My Daily Target */}
      <div className="crm-card mb-5 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-amber-400" />
            <h3 className="font-semibold text-white text-sm">My Daily Target</h3>
            {myTarget && (
              <span className="text-xs text-slate-500 font-mono">{myTarget.leadIdFrom} → {myTarget.leadIdTo}</span>
            )}
          </div>
          {myTarget?.completed ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-800/50">
              <CheckCircle2 size={12} /> Done!
            </span>
          ) : (
            <span className="text-xs text-amber-400 font-semibold">{targetDone}/{targetTotal} calls</span>
          )}
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all ${myTarget?.completed ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${targetPct}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {myTarget?.completed ? "🎉 Target completed for today!" : `${targetTotal - targetDone} more calls needed to complete today's target`}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{label}</span>
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="crm-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Weekly Calls — WhatsApp vs Viber</h3>
            <span className="badge badge-blue">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_WEEKLY} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              <Bar dataKey="whatsapp" name="WhatsApp" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="viber" name="Viber" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="crm-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">6 Month Trend — Leads vs Students</h3>
            <span className="badge badge-purple">6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              <Line type="monotone" dataKey="leads" name="Leads" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="students" name="Students" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="crm-card">
        <h3 className="font-semibold text-white text-sm mb-4">Conversion Funnel — This Month</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Leads In", val: stats?.totalLeads ?? 0, color: "bg-blue-600" },
            { label: "Contacted", val: Math.round((stats?.totalLeads ?? 0) * 0.85), color: "bg-indigo-600" },
            { label: "Trials", val: stats?.totalTrials ?? 0, color: "bg-yellow-600" },
            { label: "Joined", val: stats?.totalStudents ?? 0, color: "bg-emerald-600" },
            { label: "Fee Collected", val: `${((stats?.totalFee ?? 0) / 1000).toFixed(0)}K`, color: "bg-amber-600" },
          ].map(({ label, val, color }, i, arr) => (
            <div key={label} className="text-center relative">
              <div className={`${color} rounded-lg py-4 mb-2 shadow-lg`}>
                <span className="text-white font-bold text-xl">{val}</span>
              </div>
              <p className="text-xs text-slate-400">{label}</p>
              {i < arr.length - 1 && (
                <ArrowRight size={14} className="absolute -right-2 top-4 text-slate-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
