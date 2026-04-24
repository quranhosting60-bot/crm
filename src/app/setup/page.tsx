"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";

export default function SetupPage() {
  const { setupIbrahim, isIbrahimSetup } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isIbrahimSetup) router.push("/login");
  }, [isIbrahimSetup]);

  const handleSetup = () => {
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(password)) { setError("Must include at least one uppercase letter"); return; }
    if (!/[0-9]/.test(password)) { setError("Must include at least one number"); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setError("Must include at least one special character"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setupIbrahim(password);
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,.07) 0, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,.07) 0, transparent 60%), #020817",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image src="/logo.webp" alt="Quran Hosting" width={200} height={60}
              style={{ width: "200px", height: "auto" }} className="object-contain" priority />
          </div>
          <p className="text-slate-400 text-sm mt-1">Admin First-Time Setup</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl">

          <div className="flex items-center gap-3 mb-6 p-3 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
            <div className="w-9 h-9 bg-emerald-900/40 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Welcome, Ibrahim!</p>
              <p className="text-slate-400 text-xs">Please set your admin password to continue</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                className="crm-input pr-10"
                type={showPass ? "text" : "password"}
                placeholder="Set a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <ul className="mt-2 space-y-0.5">
              {[
                { label: "8+ characters", ok: password.length >= 8 },
                { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
                { label: "Number", ok: /[0-9]/.test(password) },
                { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
              ].map(({ label, ok }) => (
                <li key={label} className={`text-xs flex items-center gap-1.5 ${ok ? "text-emerald-400" : "text-slate-500"}`}>
                  <span>{ok ? "✓" : "○"}</span> {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <input
                className="crm-input pr-10"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSetup()}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirm.length > 0 && (
              <p className={`text-xs mt-1 ${password === confirm ? "text-emerald-400" : "text-red-400"}`}>
                {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button className="btn-primary w-full justify-center" onClick={handleSetup}>
            <ShieldCheck size={15} />
            Set Admin Password
          </button>
        </div>
      </div>
    </div>
  );
}
