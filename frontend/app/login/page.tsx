"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import { InputField, Message } from "@/components/FormFields";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== "tourist") {
        setError("This login is for tourists only. Please use your dedicated portal.");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[var(--color-ivory)] pt-20 lg:grid-cols-[1fr_0.92fr]">
      <section className="hidden bg-[var(--color-midnight)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo href="/" inverted />
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/78"><Sparkles size={14} /> Tourist portal</span>
          <h1 className="mt-6 max-w-xl text-7xl leading-[0.88]">Return to your Sri Lankan travel hub.</h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-white/68">Sign in to plan trips, request bookings, and keep your recommendations close.</p>
        </div>
        <p className="text-xs text-white/48">Partner accounts use their dedicated login portals.</p>
      </section>
      <section className="grid place-items-center px-4 py-10">
        <AuthCard title="Traveler login" subtitle="Use your tourist account to continue. Hotel owners, activity providers, and admins should use their dedicated portals.">
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <div className="relative">
              <InputField label="Password" type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && <Message type="error" text={error} />}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-extrabold text-[var(--color-teal)]">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 font-extrabold text-white transition hover:bg-[#0b615b] disabled:opacity-60">
              <LockKeyhole size={17} /> {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
            <p>New traveler? <Link href="/register" className="font-extrabold text-[var(--color-teal)]">Create a tourist account</Link></p>
            <p>Partner portals: <Link href="/login/hotel-owner" className="font-extrabold text-[var(--color-teal)]">Hotel owner</Link> · <Link href="/login/activity-provider" className="font-extrabold text-[var(--color-teal)]">Activity provider</Link> · <Link href="/login/admin" className="font-extrabold text-[var(--color-teal)]">Admin</Link></p>
          </div>
        </AuthCard>
      </section>
    </main>
  );
}
