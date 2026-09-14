import Link from "next/link";
import { CheckCircle2, LucideIcon, MailCheck, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle: string;
  icon: LucideIcon;
  accent?: "teal" | "coral" | "gold";
  wide?: boolean;
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
  wide = false,
  children,
}: AuthShellProps) {
  const highlightClass = accent === "coral" ? "text-[var(--color-coral)]" : accent === "gold" ? "text-[var(--color-gold)]" : "text-[var(--color-teal)]";

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className={`relative hidden overflow-hidden bg-gradient-to-br ${accents[accent]} p-8 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between xl:p-10`}>
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.24),transparent_27%),radial-gradient(circle_at_82%_18%,rgba(217,164,65,0.22),transparent_26%),radial-gradient(circle_at_72%_84%,rgba(255,255,255,0.16),transparent_30%),linear-gradient(135deg,transparent_0_52%,rgba(244,235,221,0.13)_52%_53%,transparent_53%)]" />
        <div className="absolute -left-20 top-28 size-64 rounded-full border border-white/10" />
        <div className="absolute -bottom-24 right-8 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <BrandLogo href="/" inverted size="md" />
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur">
            JourniQ AI
          </span>
        </div>

        <div className="relative">
          <div className="mb-5 grid max-w-lg grid-cols-3 gap-3 xl:mb-8">
            {[
              ["01", "Apply"],
              ["02", "Review"],
              ["03", "Launch"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-2xl border border-white/12 bg-white/10 p-2.5 backdrop-blur xl:p-3">
                <p className={`text-xs font-black ${highlightClass}`}>{step}</p>
                <p className="mt-1 text-sm font-extrabold text-white/86">{label}</p>
              </div>
            ))}
          </div>

          <div className="max-w-xl">
            <span className="mb-4 inline-flex size-12 items-center justify-center rounded-[1.25rem] border border-white/15 bg-white text-[var(--color-midnight)] shadow-2xl xl:mb-5 xl:size-14">
              <Icon size={24} />
            </span>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/78">
            <Sparkles size={14} /> {eyebrow}
          </p>
          <h1 className="mt-5 font-serif text-5xl font-black leading-[0.9] xl:mt-7 xl:text-6xl 2xl:text-7xl">{title}</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70 xl:mt-6">{subtitle}</p>
          </div>
        </div>

        <div className="relative grid gap-3 xl:gap-4">
          <div className="grid grid-cols-2 gap-3 xl:gap-4">
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-3 backdrop-blur xl:p-4">
              <MapPinned className={highlightClass} size={22} />
              <p className="mt-3 text-sm font-extrabold">Map-ready profile</p>
              <p className="mt-1 text-xs leading-5 text-white/58">Pin your exact hotel or meeting point for admin approval.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-3 backdrop-blur xl:p-4">
              <MailCheck className={highlightClass} size={22} />
              <p className="mt-3 text-sm font-extrabold">Email workflow</p>
              <p className="mt-1 text-xs leading-5 text-white/58">Confirmations, approvals, and recovery emails stay connected.</p>
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-3 backdrop-blur xl:p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-[var(--color-midnight)]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <p className="font-extrabold text-white">Admin reviewed before publishing</p>
              <p className="mt-1 text-sm leading-5 text-white/62 xl:leading-6">Only approved partners can manage dashboards, uploads, bookings, and traveler messages.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-white/68">
            {["Secure login", "Cloudinary images", "Live map pin", "Dashboard access"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/8 px-3 py-1.5">
                <CheckCircle2 size={13} className={highlightClass} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid items-start justify-items-center px-4 py-8 lg:py-10">
        <div className={`w-full ${wide ? "max-w-4xl" : "max-w-lg"} rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-lift)] backdrop-blur sm:p-8`}>
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
