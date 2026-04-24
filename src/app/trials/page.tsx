// src/app/trials/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getLeads, updateLead, Lead } from "@/lib/appwrite";
import { format, isAfter } from "date-fns";
import toast from "react-hot-toast";
import { BookOpen, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function TrialsPage() {
  const [trials, setTrials] = useState<Lead[]>([]);
  const [donedTrials, setDoneTrials] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrials = async () => {
    try {
      const [booked, done] = await Promise.all([
        getLeads({ status: "trial_booked" }),
        getLeads({ status: "trial_done" }),
      ]);
      setTrials(booked.documents as unknown as Lead[]);
      setDoneTrials(done.documents as unknown as Lead[]);
    } catch {
      toast.error("Data load nahi hua — Appwrite connection check karein");
      setTrials([]);
      setDoneTrials([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTrials(); }, []);

  const handleOutcome = async (lead: Lead, outcome: "joined" | "not_joined") => {
    try {
      await updateLead(lead.$id, { status: outcome, trialDone: true });
      toast.success(outcome === "joined" ? "Student join kar liya!" : "Trial done, join nahi kiya");
      loadTrials();
    } catch { toast.error("Update fail hua"); }
  };

  const today = trials.filter((t) => t.trialDate === format(new Date(), "yyyy-MM-dd"));
  const upcoming = trials.filter((t) => t.trialDate && isAfter(new Date(t.trialDate), new Date()));
  const done = donedTrials;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trials</h1>
          <p className="page-subtitle">Trial sessions track karein</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Aaj ke Trials", val: today.length, icon: Calendar, color: "text-amber-400" },
          { label: "Upcoming Trials", val: upcoming.length, icon: Clock, color: "text-blue-400" },
          { label: "Trial Done", val: done.length, icon: CheckCircle2, color: "text-emerald-400" },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <span className="text-xs text-slate-500">{label}</span>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${color}`}>{val}</span>
              <Icon size={20} className={`${color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Trials */}
      <div className="crm-card mb-5">
        <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-yellow-400" /> Upcoming aur Aaj ke Trials
        </h3>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : trials.filter(t => t.status === "trial_booked").length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Koi upcoming trial nahi</p>
        ) : (
          <div className="space-y-3">
            {trials.filter(t => t.status === "trial_booked").map((trial) => {
              const isTodays = trial.trialDate === format(new Date(), "yyyy-MM-dd");
              return (
                <div key={trial.$id} className={`flex items-center justify-between p-4 rounded-xl border ${isTodays ? "border-yellow-700/50 bg-yellow-900/10" : "border-slate-800"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTodays ? "bg-yellow-900/30" : "bg-slate-800"}`}>
                      <Calendar size={16} className={isTodays ? "text-yellow-400" : "text-slate-500"} />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{trial.phone}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{trial.country}</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-xs text-slate-500">{trial.platform}</span>
                        {isTodays && <span className="badge badge-yellow text-xs">Aaj!</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-300">
                      {trial.trialDate ? format(new Date(trial.trialDate), "d MMM yyyy") : "—"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOutcome(trial, "joined")} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-medium hover:bg-emerald-900/50 transition-colors">
                        <CheckCircle2 size={12} /> Join
                      </button>
                      <button onClick={() => handleOutcome(trial, "not_joined")} className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-800 rounded-lg text-xs font-medium hover:bg-red-900/50 transition-colors">
                        <XCircle size={12} /> Nahi
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Trials */}
      <div className="crm-card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" /> Completed Trials
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Phone</th><th>Country</th><th>Platform</th><th>Trial Date</th><th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {done.map((t) => (
                <tr key={t.$id}>
                  <td><span className="font-medium text-white">{t.phone}</span></td>
                  <td>{t.country}</td>
                  <td>{t.platform}</td>
                  <td>{t.trialDate || "—"}</td>
                  <td><span className={`badge ${t.status === "joined" ? "badge-green" : "badge-red"}`}>{t.status === "joined" ? "Join Kar Liya" : "Nahi Kiya"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
