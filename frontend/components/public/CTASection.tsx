import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection({
  title,
  description,
  buttonText,
  href = "/ai-trip-planner",
}: {
  title: string;
  description: string;
  buttonText: string;
  href?: string;
}) {
  return (
    <section className="surface-noise relative overflow-hidden rounded-[2rem] bg-[var(--color-midnight)] p-7 text-white shadow-[var(--shadow-lift)] md:p-12">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_60%_40%,rgba(255,107,74,0.34),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(217,164,65,0.26),transparent_28%)] md:block" />
      <div className="relative max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
          <Sparkles size={14} /> Tropical intelligence
        </span>
        <h3 className="mt-5 text-4xl leading-none md:text-6xl">{title}</h3>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">{description}</p>
        <Link href={href} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-extrabold text-[var(--color-midnight)] transition hover:bg-[#e4b85c]">
          {buttonText} <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
