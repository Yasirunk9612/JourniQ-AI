import Link from "next/link";
import { LucideIcon, Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  icon: LucideIcon;
  accent?: "teal" | "coral" | "gold";
  children: React.ReactNode;
};

const accents = {
  teal: "from-[#0F766E] to-[#071A22]",
  coral: "from-[#FF6B4A] to-[#071A22]",
  gold: "from-[#D9A441] to-[#071A22]",
};

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  panelTitle,
  panelSubtitle,
  icon: Icon,
  accent = "teal",
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[var(--color-ivory)] pt-20 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <section className={`relative hidden overflow-hidden bg-gradient-to-br ${accents[accent]} p-10 text-white lg:flex lg:flex-col lg:justify-between`}>
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(217,164,65,0.2),transparent_28%),linear-gradient(135deg,transparent_0_55%,rgba(244,235,221,0.12)_55%_56%,transparent_56%)]" />
        <div className="relative">
          <BrandLogo href="/" inverted size="md" />
        </div>
        <div className="relative max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/78">
            <Sparkles size={14} /> {eyebrow}
          </p>
          <h1 className="mt-7 font-serif text-6xl font-black leading-[0.88] xl:text-7xl">{title}</h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-white/70">{subtitle}</p>
        </div>
        <div className="relative grid max-w-sm grid-cols-[auto_1fr] gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <span className="grid size-11 place-items-center rounded-2xl bg-white text-[var(--color-midnight)]">
            <Icon size={19} />
          </span>
          <p className="text-sm leading-6 text-white/72">Secure email workflows for verification, provider approvals, booking alerts, and password recovery.</p>
        </div>
      </section>

      <section className="grid place-items-center px-4 py-10">
        <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-lift)] backdrop-blur sm:p-8">
          <div className="mb-7 flex items-center justify-between gap-4">
            <BrandLogo href="/" size="sm" />
            <Link href="/" className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-teal)]">Home</Link>
          </div>
          <h2 className="font-serif text-4xl font-black leading-none text-[var(--color-midnight)]">{panelTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{panelSubtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </main>
  );
}
