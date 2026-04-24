"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, AlertTriangle, Clock } from "lucide-react";

function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

export default function LoginPage() {
  const { login, signup, isIbrahimSetup } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "salesperson",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(0);

  useEffect(() => {
    if (isIbrahimSetup === false) router.push("/setup");
  }, [isIbrahimSetup]);

  useEffect(() => {
    if (lockout <= 0) return;
    const t = setTimeout(() => setLockout(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [lockout]);

  const { score, checks } = getPasswordStrength(form.password);
  const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][score];
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-400"][score];

  const validateUsername = (u: string) => {
    if (u.length < 3) return "Username must be at least 3 characters";
    if (/\s/.test(u)) return "Username cannot contain spaces";
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return "Only letters, numbers, underscore allowed";
    return "";
  };

  const validatePassword = (p: string) => {
    if (!checks.length) return "At least 8 characters required";
    if (!checks.uppercase) return "At least one uppercase letter required";
    if (!checks.lowercase) return "At least one lowercase letter required";
    if (!checks.number) return "At least one number required";
    if (!checks.special) return "At least one special character required (!@#$...)";
    return "";
  };

  const handleLogin = async () => {
    if (lockout > 0) return;
    setError("");
    setSuccessMsg("");
    if (!form.username) { setError("Please enter username"); return; }
    if (!form.password) { setError("Please enter password"); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(form.username, form.password);
    setLoading(false);

    if (!result.ok) {
      if (result.error?.includes("pending") || result.error?.includes("rejected")) {
        setError(result.error);
        return;
      }
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockout(LOCKOUT_SECONDS);
        setAttempts(0);
        setError(`Too many failed attempts. Try again in ${LOCKOUT_SECONDS}s`);
      } else {
        setError(`${result.error || "Invalid credentials"}. ${MAX_ATTEMPTS - newAttempts} attempt(s) left`);
      }
      return;
    }
    router.push("/dashboard");
  };

  const handleSignup = async () => {
    setError("");
    setSuccessMsg("");
    if (!form.name.trim()) { setError("Full name is required"); return; }
    if (form.name.trim().length < 2) { setError("Name must be at least 2 characters"); return; }
    const uErr = validateUsername(form.username);
    if (uErr) { setError(uErr); return; }
    const pErr = validatePassword(form.password);
    if (pErr) { setError(pErr); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const res = signup(form.name, form.username, form.password, form.role as any);
    setLoading(false);

    if (!res.ok) { setError(res.error || "Signup failed"); return; }
    setMode("login");
    setForm({ name: "", username: "", password: "", confirmPassword: "", role: "salesperson" });
    setSuccessMsg("Account created! Waiting for admin approval before you can login.");
  };

  const isLocked = lockout > 0;

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
          <p className="text-slate-500 text-sm mt-1">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl">

          {isLocked && (
            <div className="mb-4 px-3 py-2.5 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
              <AlertTriangle size={15} />
              Too many attempts. Try again in <span className="font-bold">{lockout}s</span>
            </div>
          )}

          {error && !isLocked && (
            <div className="mb-4 px-3 py-2.5 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
              {error.includes("pending") ? <Clock size={14} /> : <AlertTriangle size={14} />}
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 px-3 py-2.5 bg-emerald-900/20 border border-emerald-800/50 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
              <ShieldCheck size={14} />
              {successMsg}
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Full Name</label>
              <input className="crm-input" placeholder="Your full name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Username</label>
            <input className="crm-input" placeholder="Enter username" value={form.username}
              autoComplete="username"
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
          </div>

          <div className="mb-2">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Password</label>
            <div className="relative">
              <input className="crm-input pr-10"
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === "signup" && form.password.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-1 mb-1 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? strengthColor : "bg-slate-700"}`} />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Strength:{" "}
                <span className={`font-semibold ${score >= 4 ? "text-emerald-400" : score >= 3 ? "text-yellow-400" : "text-red-400"}`}>
                  {strengthLabel}
                </span>
              </p>
              <ul className="mt-2 space-y-0.5">
                {[
                  { label: "8+ characters", ok: checks.length },
                  { label: "Uppercase letter", ok: checks.uppercase },
                  { label: "Lowercase letter", ok: checks.lowercase },
                  { label: "Number", ok: checks.number },
                  { label: "Special character (!@#...)", ok: checks.special },
                ].map(({ label, ok }) => (
                  <li key={label} className={`text-xs flex items-center gap-1.5 ${ok ? "text-emerald-400" : "text-slate-500"}`}>
                    <span>{ok ? "✓" : "○"}</span> {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <input className="crm-input pr-10"
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  autoComplete="new-password"
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.confirmPassword.length > 0 && (
                <p className={`text-xs mt-1 ${form.password === form.confirmPassword ? "text-emerald-400" : "text-red-400"}`}>
                  {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Role</label>
              <select className="crm-select" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="salesperson">Sales Person</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            className="btn-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={mode === "login" ? handleLogin : handleSignup}
            disabled={loading || isLocked}
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <ShieldCheck size={15} />}
            {mode === "login" ? "Sign In Securely" : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            {mode === "login" ? (
              <>No account?{" "}
                <button onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); setAttempts(0); }}
                  className="text-emerald-400 font-semibold hover:text-emerald-300">Sign Up</button>
              </>
            ) : (
              <>Already have account?{" "}
                <button onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                  className="text-emerald-400 font-semibold hover:text-emerald-300">Sign In</button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          New accounts require admin approval before login
        </p>
      </div>
    </div>
  );
}
