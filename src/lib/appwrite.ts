// src/lib/appwrite.ts
import { Client, Databases, Account, Query, ID } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "quran_crm";

// Collection IDs
export const COLLECTIONS = {
  LEADS: "leads",
  CALLS: "calls",
  TARGETS: "targets",
  TRIALS: "trials",
  STUDENTS: "students",
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type Platform = "Facebook" | "Instagram" | "YouTube" | "TikTok" | "WhatsApp" | "Other";
export type CallType = "whatsapp" | "viki";
export type LeadStatus = "new" | "contacted" | "trial_booked" | "trial_done" | "joined" | "not_joined" | "lost";

export interface Lead {
  $id: string;
  $createdAt: string;
  phone: string;
  country: string;
  platform: Platform;
  status: LeadStatus;
  notes?: string;
  assignedTo?: string;
  trialDate?: string;
  trialDone?: boolean;
  joinedDate?: string;
  feeAmount?: number;
  feePaid?: boolean;
}

export interface CallLog {
  $id: string;
  $createdAt: string;
  leadId: string;
  agentId: string;
  agentName: string;
  callType: CallType;
  duration?: number; // minutes
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  outcome: "no_answer" | "callback" | "interested" | "not_interested" | "trial_booked" | "joined";
}

export interface DailyTarget {
  $id: string;
  $createdAt: string;
  agentId: string;
  agentName: string;
  date: string;
  leadIdFrom: string;
  leadIdTo: string;
  targetCalls: number;
  completed: boolean;
}

// ─── Lead Functions ───────────────────────────────────────────────────────────

export async function createLead(data: Omit<Lead, "$id" | "$createdAt">) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.LEADS, ID.unique(), data);
}

export async function getLeads(filters?: { status?: LeadStatus; platform?: Platform; country?: string }) {
  const queries: string[] = [Query.orderDesc("$createdAt"), Query.limit(200)];
  if (filters?.status) queries.push(Query.equal("status", filters.status));
  if (filters?.platform) queries.push(Query.equal("platform", filters.platform));
  if (filters?.country) queries.push(Query.equal("country", filters.country));
  return databases.listDocuments(DATABASE_ID, COLLECTIONS.LEADS, queries);
}

export async function updateLead(id: string, data: Partial<Lead>) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.LEADS, id, data);
}

export async function deleteLead(id: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEADS, id);
}

// ─── Call Log Functions ───────────────────────────────────────────────────────

export async function logCall(data: Omit<CallLog, "$id" | "$createdAt">) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.CALLS, ID.unique(), data);
}

export async function getCallsForLead(leadId: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTIONS.CALLS, [
    Query.equal("leadId", leadId),
    Query.orderDesc("date"),
    Query.limit(100),
  ]);
}

export async function getDailyCallReport(date: string, agentId?: string) {
  const queries = [Query.equal("date", date), Query.limit(500)];
  if (agentId) queries.push(Query.equal("agentId", agentId));
  return databases.listDocuments(DATABASE_ID, COLLECTIONS.CALLS, queries);
}

export async function getMonthlyCallReport(yearMonth: string) {
  // yearMonth format: "2024-01"
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;
  return databases.listDocuments(DATABASE_ID, COLLECTIONS.CALLS, [
    Query.greaterThanEqual("date", start),
    Query.lessThanEqual("date", end),
    Query.limit(1000),
  ]);
}

// ─── Target Functions ─────────────────────────────────────────────────────────

export async function setDailyTarget(data: Omit<DailyTarget, "$id" | "$createdAt">) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.TARGETS, ID.unique(), data);
}

export async function getDailyTargets(date: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTIONS.TARGETS, [
    Query.equal("date", date),
    Query.limit(50),
  ]);
}

// ─── Stats Helpers ────────────────────────────────────────────────────────────

export async function getMonthlyStats(yearMonth: string) {
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;

  const [leads, calls, trials] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.LEADS, [
      Query.greaterThanEqual("$createdAt", `${start}T00:00:00`),
      Query.limit(1000),
    ]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.CALLS, [
      Query.greaterThanEqual("date", start),
      Query.lessThanEqual("date", end),
      Query.limit(2000),
    ]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.LEADS, [
      Query.equal("status", "trial_booked"),
      Query.limit(500),
    ]),
  ]);

  const students = leads.documents.filter((l) => l.status === "joined");
  const totalFee = students.reduce((sum: number, s: any) => sum + (s.feeAmount || 0), 0);
  const whatsappCalls = calls.documents.filter((c: any) => c.callType === "whatsapp").length;
  const vikiCalls = calls.documents.filter((c: any) => c.callType === "viki").length;

  return {
    totalLeads: leads.total,
    totalCalls: calls.total,
    whatsappCalls,
    vikiCalls,
    totalTrials: trials.total,
    totalStudents: students.length,
    totalFee,
    joinRate: leads.total > 0 ? ((students.length / leads.total) * 100).toFixed(1) : "0",
  };
}
