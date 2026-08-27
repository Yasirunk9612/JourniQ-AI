import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Compass, MailCheck, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const options = [
  {
    title: "Tourist",
    kicker: "Personalized travel profile",
    description: "Create a traveler account, answer preference questions, and receive AI-shaped Sri Lanka recommendations.",
    href: "/register/tourist",
    icon: Compass,
    primary: true,
    accent: "bg-[var(--color-coral)]",
    panel: "from-[rgba(255,107,74,0.18)] to-white",
  },
  {
    title: "Hotel owner",
    kicker: "Verified stay partner",
    description: "Apply to manage your hotel profile, room inventory, image galleries, bookings, and revenue signals.",
    href: "/register/hotel-owner",
    icon: Building2,
    accent: "bg-[var(--color-gold)]",
    panel: "from-[rgba(217,164,65,0.18)] to-white",
  },
  {
    title: "Activity provider",
    kicker: "Local experience partner",
    description: "Apply to publish cultural, community, adventure, food, wellness, or nature experiences for travelers.",
    href: "/register/activity-provider",
    icon: UsersRound,
    accent: "bg-[var(--color-teal)]",
    panel: "from-[rgba(15,118,110,0.16)] to-white",
  },
];

const steps = [
  { title: "Create account", text: "Submit the correct account type with secure credentials." },
  { title: "Email workflow", text: "Tourists verify email. Providers receive confirmation emails." },
  { title: "Admin trust layer", text: "Provider accounts are reviewed before dashboard access." },
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-ivory)] pt-24">
      <section className="tourist-container grid gap-8 pb-16 pt-8 lg:grid-cols-[0.84fr_1.16fr]">
        <aside className="relative overflow-hidden rounded-[2.5rem] bg-[var(--color-midnight)] p-7 text-white shadow-[var(--shadow-lift)] sm:p-10">
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_18%_18%,rgba(217,164,65,0.32),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(15,118,110,0.34),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.1)_0_1px,transparent_1px_80px)]" />
          <div className="relative flex min-h-[560px] flex-col justify-between">
            <div>
              <BrandLogo href="/" inverted size="md" />
              <p className="mt-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-100">
                <Sparkles size={14} /> Start with the right identity
              </p>
              <h1 className="mt-6 max-w-xl font-serif text-6xl font-black leading-[0.88] md:text-7xl">Join the JourniQ AI travel ecosystem.</h1>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
                One platform, different journeys: travelers get personalization, providers get verified tools, and admins keep the marketplace trusted.
              </p>
            </div>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[auto_1fr] gap-3 rounded-[1.4rem] border border-white/12 bg-white/8 p-4 backdrop-blur">
                  <span className="grid size-9 place-items-center rounded-full bg-white text-sm font-black text-[var(--color-midnight)]">{index + 1}</span>
                  <span>
                    <span className="block text-sm font-extrabold">{step.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/60">{step.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-teal)]">Choose account type</p>
            <h2 className="mt-3 max-w-2xl font-serif text-5xl font-black leading-none text-[var(--color-midnight)]">Select how you want to use JourniQ AI.</h2>
          </div>

          <div className="grid gap-4">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.title}
                  href={option.href}
                  className={`group relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br ${option.panel} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`}
                >
                  <div className="absolute -right-10 -top-12 size-36 rounded-full bg-[var(--color-muted)] opacity-70" />
                  <div className="relative grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <span className={`grid size-14 place-items-center rounded-2xl ${option.accent} text-white shadow-lg`}>
                      <Icon size={23} />
                    </span>
                    <span>
                      <span className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                        {option.kicker} {option.primary ? <Sparkles className="text-[var(--color-coral)]" size={15} /> : null}
                      </span>
                      <span className="mt-2 block font-serif text-3xl font-black leading-none text-[var(--color-midnight)]">{option.title}</span>
                      <span className="mt-3 block max-w-xl text-sm leading-6 text-slate-600">{option.description}</span>
                    </span>
                    <span className="inline-flex size-11 items-center justify-center rounded-full border border-[rgba(12,59,53,0.14)] bg-white text-[var(--color-midnight)] transition group-hover:bg-[var(--color-midnight)] group-hover:text-white">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 rounded-[1.75rem] border border-[rgba(12,59,53,0.1)] bg-white/75 p-5 text-sm text-slate-600 sm:grid-cols-3">
            <p className="flex items-center gap-2"><MailCheck className="text-[var(--color-teal)]" size={18} /> Gmail email flow ready</p>
            <p className="flex items-center gap-2"><ShieldCheck className="text-[var(--color-teal)]" size={18} /> Provider approval protected</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="text-[var(--color-teal)]" size={18} /> No public admin signup</p>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Already registered? <Link href="/login" className="font-extrabold text-[var(--color-teal)]">Login here</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
