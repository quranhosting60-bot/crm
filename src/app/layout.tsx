// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import AppShell from "@/components/ui/AppShell";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Quran Hosting CRM",
  description: "Sales CRM for Quran Hosting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-slate-950 text-slate-100 font-sans antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
