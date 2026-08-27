"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, LockKeyhole } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
import { apiRequest } from "@/lib/api";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("Reset token is missing. Please request a new reset email.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: { token, password },
      });
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure reset"
      title="Create a fresh password."
      subtitle="Your reset link is time-limited and protected by a hashed token on the backend."
      panelTitle="New password"
      panelSubtitle="Choose a stronger password for your JourniQ AI account."
      icon={KeyRound}
      accent="coral"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField label="New password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="grid grid-cols-4 gap-2" aria-label="Password strength">
          {[0, 1, 2, 3].map((step) => (
            <span key={step} className={`h-2 rounded-full ${strength > step ? "bg-[var(--color-coral)]" : "bg-slate-200"}`} />
          ))}
        </div>
        <InputField label="Confirm password" type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {message ? <Message type="success" text={message} /> : null}
        {error ? <Message type="error" text={error} /> : null}
        <button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-midnight)] px-4 py-3 font-extrabold text-white disabled:opacity-60">
          <LockKeyhole size={17} /> {loading ? "Saving..." : "Update password"}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Done? <Link href="/login" className="font-extrabold text-[var(--color-teal)]">Login again</Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--color-ivory)]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
