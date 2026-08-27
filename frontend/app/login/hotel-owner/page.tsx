"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LockKeyhole } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";

export default function HotelOwnerLoginPage() {
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
      if (user.role !== "hotel_owner") {
        setError("This portal is for hotel owners only.");
        return;
      }
      router.push("/hotel-owner/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Property command center"
      title="Run your stay with confidence."
      subtitle="Manage rooms, inquiries, bookings, revenue, and guest conversations from one refined hotel-owner portal."
      panelTitle="Hotel owner login"
      panelSubtitle="Sign in after your provider account has been approved by JourniQ AI admin."
      icon={Building2}
      accent="gold"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <InputField label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <Message type="error" text={error} />}
        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 font-extrabold text-white hover:bg-[#0b615b] disabled:opacity-60" disabled={loading}>
          <LockKeyhole size={17} /> {loading ? "Signing in..." : "Open hotel portal"}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <Link href="/forgot-password" className="font-extrabold text-[var(--color-teal)]">Forgot password?</Link>
        <span>Need an account? <Link href="/register/hotel-owner" className="font-extrabold text-[var(--color-teal)]">Apply here</Link></span>
      </div>
    </AuthShell>
  );
}
