"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, LockKeyhole } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";

export default function ActivityProviderLoginPage() {
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
      if (user.role !== "activity_provider") {
        setError("This portal is for activity providers only.");
        return;
      }
      router.push("/activity-provider/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Experience studio"
      title="Bring local stories to travelers."
      subtitle="Manage community experiences, availability, booking requests, guest messages, and provider insights."
      panelTitle="Activity provider login"
      panelSubtitle="Sign in after your activity provider account has been approved."
      icon={Compass}
      accent="coral"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <InputField label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <Message type="error" text={error} />}
        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-coral)] px-4 py-3 font-extrabold text-white hover:bg-[#e85f42] disabled:opacity-60" disabled={loading}>
          <LockKeyhole size={17} /> {loading ? "Signing in..." : "Open experience portal"}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <Link href="/forgot-password" className="font-extrabold text-[var(--color-teal)]">Forgot password?</Link>
        <span>Need an account? <Link href="/register/activity-provider" className="font-extrabold text-[var(--color-teal)]">Apply here</Link></span>
      </div>
    </AuthShell>
  );
}
