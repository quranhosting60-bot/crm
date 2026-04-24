"use client";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Database, X, ChevronDown, ChevronUp } from "lucide-react";

const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "quran_crm";
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";

function AppwriteInfoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isConfigured = !!APPWRITE_PROJECT_ID;

  if (dismissed) return null;

  return (
    <div
      style={{
        background: isConfigured
          ? "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.06) 100%)"
          : "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.07) 100%)",
        borderBottom: isConfigured ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(245,158,11,0.3)",
      }}
      className="px-5 py-2.5"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Database
            size={14}
            className={isConfigured ? "text-emerald-400 shrink-0" : "text-amber-400 shrink-0"}
          />
          {isConfigured ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="text-emerald-400 font-semibold">✓ Appwrite Connected</span>
              <span className="text-slate-400">
                Project:{" "}
                <span className="font-mono text-emerald-300 bg-emerald-900/20 px-1.5 py-0.5 rounded">
                  {APPWRITE_PROJECT_ID}
                </span>
              </span>
              {expanded && (
                <>
                  <span className="text-slate-400">
                    Database:{" "}
                    <span className="font-mono text-blue-300 bg-blue-900/20 px-1.5 py-0.5 rounded">
                      {APPWRITE_DATABASE_ID}
                    </span>
                  </span>
                  <span className="text-slate-400">
                    Endpoint:{" "}
                    <span className="font-mono text-slate-300 text-xs">{APPWRITE_ENDPOINT}</span>
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="text-amber-400 font-semibold">⚠ Appwrite Not Configured</span>
              <span className="text-slate-400">
                Mock data chal raha hai — Production ke liye{" "}
                <span className="font-mono text-amber-300 bg-amber-900/20 px-1.5 py-0.5 rounded">
                  .env
                </span>{" "}
                mein Project ID set karein
              </span>
              {expanded && (
                <span className="text-slate-500 text-xs">
                  NEXT_PUBLIC_APPWRITE_PROJECT_ID · NEXT_PUBLIC_APPWRITE_DATABASE_ID ·
                  NEXT_PUBLIC_APPWRITE_ENDPOINT
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title={expanded ? "Less info" : "More info"}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

const PUBLIC_ROUTES = ["/login", "/setup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isIbrahimSetup, isSuperAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    // Agar Ibrahim ka password set nahi — setup page par bhejo
    if (!isIbrahimSetup && pathname !== "/setup") {
      router.replace("/setup");
      return;
    }

    // Setup complete ho gaya — login par bhejo
    if (isIbrahimSetup && pathname === "/setup") {
      router.replace("/login");
      return;
    }

    // Login nahi — login page par bhejo
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
      return;
    }

    // Login ho gaya — dashboard par bhejo
    if (user && pathname === "/login") {
      router.replace("/dashboard");
      return;
    }
  }, [user, pathname, mounted, isIbrahimSetup]);

  if (!mounted) return null;

  // Public routes — sidebar nahi dikhana
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
        {isSuperAdmin && <AppwriteInfoBanner />}
        <div className="p-6 max-w-7xl mx-auto w-full flex-1">{children}</div>
      </main>
    </div>
  );
}
