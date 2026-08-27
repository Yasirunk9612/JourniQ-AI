"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== "admin") {
        setError("This portal is for admins only.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure operations"
      title="Control the platform intelligence layer."
      subtitle="Review providers, destinations, bookings, analytics, AI monitoring, reports, and data quality from the admin console."
      panelTitle="Admin login"
      panelSubtitle="Use your seeded admin credentials. Public admin registration stays disabled."
      icon={ShieldCheck}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <InputField label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <Message type="error" text={error} />}
        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-midnight)] px-4 py-3 font-extrabold text-white hover:bg-[#0C3B35] disabled:opacity-60" disabled={loading}>
          <LockKeyhole size={17} /> {loading ? "Signing in..." : "Open admin console"}
        </button>
      </form>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        Admin accounts are created securely via seed. <Link href="/forgot-password" className="font-extrabold text-[var(--color-teal)]">Reset password by email</Link>
      </p>
    </AuthShell>
  );
}
