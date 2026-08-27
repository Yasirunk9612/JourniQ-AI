import Image from "next/image";
import MotionReveal from "./MotionReveal";

const sriLankaFrames = [
  "https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=620&q=80",
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=620&q=80",
  "https://images.unsplash.com/photo-1586896420943-d3a2bfdcc269?auto=format&fit=crop&w=620&q=80",
];

export default function HeroSection({
  title,
  subtitle,
  children,
  image,
  eyebrow = "JourniQ AI",
  compact = false,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  image?: string;
  eyebrow?: string;
  compact?: boolean;
}) {
  return (
    <section className={`surface-noise relative overflow-hidden rounded-b-[2.2rem] bg-[var(--color-midnight)] text-white shadow-[var(--shadow-lift)] ${compact ? "pt-28 pb-16" : "min-h-[720px] pt-36 pb-16 md:pt-40"}`}>
      {image ? (
        <Image src={image} alt="" fill priority={!compact} sizes="100vw" className="object-cover opacity-72" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,107,74,0.28),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(217,164,65,0.24),transparent_24%),linear-gradient(135deg,var(--color-forest),var(--color-midnight))]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(7,26,34,0.92)] via-[rgba(7,26,34,0.58)] to-[rgba(7,26,34,0.34)]" />
      <div className={`tourist-container relative grid gap-10 ${compact ? "lg:grid-cols-[1fr_0.74fr] lg:items-end" : ""}`}>
        <MotionReveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--color-gold)]">{eyebrow}</p>
          <h1 className={`mt-5 max-w-5xl leading-[0.88] ${compact ? "text-5xl md:text-7xl" : "text-6xl md:text-8xl"}`}>{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-xl">{subtitle}</p>
          {children ? <div className="mt-9 max-w-5xl">{children}</div> : null}
        </MotionReveal>
        {compact ? (
          <MotionReveal delay={0.08}>
            <div className="relative hidden min-h-[360px] lg:block">
              <div className="journiq-float-slow absolute right-6 top-0 h-56 w-44 overflow-hidden rounded-[2rem] border border-white/18 bg-white/10 shadow-[var(--shadow-lift)] backdrop-blur">
                <Image src={sriLankaFrames[0]} alt="Sri Lankan heritage landscape" fill sizes="180px" className="object-cover" />
              </div>
              <div className="journiq-float-delay absolute bottom-8 right-36 h-48 w-56 overflow-hidden rounded-[2rem] border border-white/18 bg-white/10 shadow-[var(--shadow-lift)] backdrop-blur">
                <Image src={sriLankaFrames[1]} alt="Sri Lankan coast and palms" fill sizes="240px" className="object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 h-44 w-48 overflow-hidden rounded-[2rem] border border-white/18 bg-white/10 shadow-[var(--shadow-lift)] backdrop-blur">
                <Image src={sriLankaFrames[2]} alt="Sri Lankan highland scenery" fill sizes="220px" className="object-cover" />
              </div>
              <div className="absolute left-0 top-12 rounded-[1.35rem] border border-white/14 bg-white/12 p-4 text-white shadow-[var(--shadow-lift)] backdrop-blur-xl">
                <p className="journiq-live-dot text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-100">Live island layer</p>
                <p className="mt-2 max-w-44 text-sm font-semibold leading-5 text-white/72">Destinations, stays, AI matches, and support in one tourist flow.</p>
              </div>
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </section>
  );
}
