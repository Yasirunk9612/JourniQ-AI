"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField, Message } from "@/components/FormFields";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const data = await apiRequest<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Get back to your journey."
      subtitle="We will send a secure Gmail-powered reset link so travelers and providers can recover access safely."
      panelTitle="Reset your password"
      panelSubtitle="Enter your account email. If it exists, JourniQ AI will send a reset link."
      icon={KeyRound}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {message ? <Message type="success" text={message} /> : null}
        {error ? <Message type="error" text={error} /> : null}
        <button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 font-extrabold text-white disabled:opacity-60">
          <Mail size={17} /> {loading ? "Sending..." : "Send reset email"}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Remembered it? <Link href="/login" className="font-extrabold text-[var(--color-teal)]">Back to login</Link>
      </p>
    </AuthShell>
  );
}
