"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, MailCheck, RefreshCw, XCircle } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { InputField } from "@/components/FormFields";
import { apiRequest } from "@/lib/api";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    const verify = async () => {
      setStatus("loading");
      try {
        const data = await apiRequest<{ message: string; token: string | null }>("/auth/verify-email", {
          method: "POST",
          body: { token },
        });
        if (data.token) localStorage.setItem("journiq_token", data.token);
        setMessage(data.message);
        setStatus("success");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Verification failed.");
        setStatus("error");
      }
    };
    void verify();
  }, [token]);

  const resend = async () => {
    setResending(true);
    setMessage("");
    try {
      const data = await apiRequest<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
      setMessage(data.message);
      setStatus("success");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not send verification email.");
      setStatus("error");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Email trust"
      title="Confirm your JourniQ identity."
      subtitle="Verification keeps bookings, AI preferences, and provider conversations attached to the right traveler."
      panelTitle="Email verification"
      panelSubtitle={token ? "We are checking your secure email link." : "Enter your email to resend the verification link."}
      icon={MailCheck}
      accent="gold"
    >
      <div className="rounded-[1.5rem] border border-[rgba(12,59,53,0.12)] bg-[var(--color-muted)] p-5">
        {status === "loading" ? (
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--color-midnight)]"><RefreshCw className="animate-spin" size={17} /> Verifying email...</p>
        ) : null}
        {status === "success" ? (
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={17} /> {message}</p>
        ) : null}
        {status === "error" ? (
          <p className="flex items-center gap-2 text-sm font-bold text-red-700"><XCircle size={17} /> {message}</p>
        ) : null}
        {!token ? (
          <div className="space-y-4">
            <InputField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={resend} disabled={resending || !email} className="w-full rounded-2xl bg-[var(--color-teal)] px-4 py-3 font-extrabold text-white disabled:opacity-60">
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <button onClick={() => router.push("/dashboard")} className="rounded-full bg-[var(--color-midnight)] px-5 py-2.5 font-extrabold text-white">Continue</button>
        <Link href="/login" className="rounded-full border border-[rgba(12,59,53,0.16)] px-5 py-2.5 font-extrabold text-[var(--color-midnight)]">Login</Link>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--color-ivory)]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
