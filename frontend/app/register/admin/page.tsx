import Link from "next/link";
import { LockKeyhole, ShieldCheck, Terminal } from "lucide-react";
import AuthShell from "@/components/AuthShell";

export default function AdminRegisterPage() {
  return (
    <AuthShell
      eyebrow="Protected access"
      title="Admin accounts are never public."
      subtitle="JourniQ AI keeps platform control behind seeded admin credentials, approval rules, and protected backend routes."
      panelTitle="Admin registration disabled"
      panelSubtitle="This is intentional. Admin users must be created from the backend seed process, not from a public form."
      icon={ShieldCheck}
    >
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-[rgba(12,59,53,0.1)] bg-[var(--color-muted)] p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--color-midnight)]">
            <LockKeyhole size={17} /> Public admin signup is blocked for security.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use the backend seed configuration and then sign in through the admin portal with the created credentials.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-[var(--color-midnight)] p-5 text-white">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-gold)]">
            <Terminal size={15} /> Backend seed route
          </p>
          <code className="mt-3 block rounded-2xl bg-white/10 p-3 text-sm text-white/80">npm run seed:admin</code>
        </div>
        <Link href="/login/admin" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-teal)] px-4 py-3 text-sm font-extrabold text-white">
          Go to admin login
        </Link>
      </div>
    </AuthShell>
  );
}
