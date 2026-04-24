"use client";
import { useEffect, useState } from "react";
import { logCall, getDailyCallReport, getMonthlyCallReport, getLeads, CallLog, Lead } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Phone, MessageCircle, Headphones, Plus, Calendar, X, CheckCircle2, PhoneMissed } from "lucide-react";

const OUTCOMES = [
  { value: "no_answer", label: "No Answer" },
  { value: "callback", label: "Call Back Later" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "trial_booked", label: "Trial Booked" },
  { value: "joined", label: "Joined" },
];

const outcomeBadge = (o: string) => {
  const map: Record<string, string> = {
    no_answer: "badge-gray", callback: "badge-blue", interested: "badge-yellow",
    not_interested: "badge-red", trial_booked: "badge-purple", joined: "badge-green",
  };
  return map[o] || "badge-gray";
};

const MOCK_LEADS: Lead[] = Array.from({ length: 10 }, (_, i) => ({
  $id: `lead_${i + 1}`, $createdAt: new Date().toISOString(),
  phone: `+9230012${i}4567`, country: "Pakistan",
  platform: "WhatsApp" as any, status: "contacted" as any,
}));

const MOCK_CALLS: CallLog[] = Array.from({ length: 15 }, (_, i) => ({
  $id: `call_${i}`, $createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  leadId: `lead_${(i % 10) + 1}`,
  agentId: `agent_${(i % 3) + 1}`,
  agentName: ["Ahmed", "Bilal", "Usman"][i % 3],
  callType: i % 3 === 0 ? "viki" : "whatsapp",
  date: format(new Date(Date.now() - i * 86400000 * (i % 3 || 1)), "yyyy-MM-dd"),
  duration: Math.floor(Math.random() * 10) + 2,
  outcome: OUTCOMES[i % OUTCOMES.length].value as any,
  notes: i % 4 === 0 ? "Follow up needed" : undefined,
}));

export default function CallsPage() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    leadId: "", callType: "whatsapp" as "whatsapp" | "viki",
    outcome: "interested", duration: "", notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [callRes, leadRes] = await Promise.all([
        viewMode === "daily"
          ? getDailyCallReport(selectedDate)
          : getMonthlyCallReport(selectedDate.slice(0, 7)),
        getLeads(),
      ]);
      setCalls(callRes.documents as unknown as CallLog[]);
      setLeads(leadRes.documents as unknown as Lead[]);
    } catch {
      setCalls(MOCK_CALLS);
      setLeads(MOCK_LEADS);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [selectedDate, viewMode]);

  // Get lead display number (Lead 1, Lead 2...)
  const getLeadDisplay = (leadId: string) => {
    const idx = leads.findIndex(l => l.$id === leadId);
    if (idx >= 0) return `Lead ${idx + 1}`;
    // Fallback: extract number from mock lead id
    const match = leadId.match(/\d+$/);
    return match ? `Lead ${match[0]}` : "Lead";
  };

  const handleSave = async () => {
    if (!form.leadId) return toast.error("Please select a lead");
    setSaving(true);
    try {
      await logCall({
        leadId: form.leadId, agentId: user?.id || "", agentName: user?.name || "",
        callType: form.callType, date: form.date,
        duration: form.duration ? Number(form.duration) : undefined,
        outcome: form.outcome as any, notes: form.notes || undefined,
      });
      toast.success("Call logged!");
      setShowModal(false);
      setForm({ leadId: "", callType: "whatsapp", outcome: "interested", duration: "", notes: "", date: format(new Date(), "yyyy-MM-dd") });
      loadData();
    } catch { toast.error("Error saving call"); }
    finally { setSaving(false); }
  };

  const whatsappCount = calls.filter(c => c.callType === "whatsapp").length;
  const vikiCount = calls.filter(c => c.callType === "viki").length;
  const answeredCount = calls.filter(c => c.outcome !== "no_answer").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Log</h1>
          <p className="page-subtitle">Track all calls and chats</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            {(["daily", "monthly"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-4 py-2 text-xs font-semibold transition-colors capitalize ${viewMode === m ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>
          <input type={viewMode === "daily" ? "date" : "month"} className="crm-input w-auto"
            value={viewMode === "daily" ? selectedDate : selectedDate.slice(0, 7)}
            onChange={e => setSelectedDate(viewMode === "daily" ? e.target.value : e.target.value + "-01")} />
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Log Call</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Calls", val: calls.length, icon: Phone, color: "text-emerald-400" },
          { label: "WhatsApp", val: whatsappCount, icon: MessageCircle, color: "text-green-400" },
          { label: "Viber", val: vikiCount, icon: Headphones, color: "text-purple-400" },
          { label: "Answered", val: answeredCount, icon: CheckCircle2, color: "text-blue-400" },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <span className="text-xs text-slate-500">{label}</span>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-2xl font-bold ${color}`}>{val}</span>
              <Icon size={18} className={`${color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="crm-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Agent</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Outcome</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No calls found for this period</td></tr>
                )}
                {calls.map(call => (
                  <tr key={call.$id}>
                    {/* Show Lead 1, Lead 2 etc — NOT the database ID */}
                    <td><span className="font-bold text-emerald-400">{getLeadDisplay(call.leadId)}</span></td>
                    <td><span className="text-slate-300">{call.agentName}</span></td>
                    <td>
                      <span className={`badge ${call.callType === "whatsapp" ? "badge-green" : "badge-purple"}`}>
                        {call.callType === "whatsapp" ? "WhatsApp" : "Viber"}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">{call.date}</td>
                    <td className="text-slate-400">{call.duration ? `${call.duration} min` : "—"}</td>
                    <td><span className={`badge ${outcomeBadge(call.outcome)}`}>{OUTCOMES.find(o => o.value === call.outcome)?.label || call.outcome}</span></td>
                    <td className="text-slate-500 text-xs max-w-xs truncate">{call.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Log Call Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="font-semibold text-white">Log a Call</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Lead *</label>
                <select className="crm-select" value={form.leadId} onChange={e => setForm({ ...form, leadId: e.target.value })}>
                  <option value="">Select a lead...</option>
                  {leads.map((l, i) => (
                    <option key={l.$id} value={l.$id}>Lead {i + 1} — {l.phone}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Call Type</label>
                  <select className="crm-select" value={form.callType} onChange={e => setForm({ ...form, callType: e.target.value as any })}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="viki">Viber</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Date</label>
                  <input type="date" className="crm-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Outcome</label>
                  <select className="crm-select" value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })}>
                    {OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Duration (min)</label>
                  <input type="number" className="crm-input" placeholder="5" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Notes</label>
                <textarea className="crm-input resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Phone size={14} />}
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
