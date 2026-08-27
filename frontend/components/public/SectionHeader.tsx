import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  inverted = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  action?: { label: string; href: string };
  inverted?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${align === "center" ? "mx-auto max-w-3xl text-center md:block" : ""}`}>
      <div className={align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"}>
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--color-coral)]">{eyebrow}</p>
        <h2 className={`mt-3 text-4xl leading-[0.95] md:text-6xl ${inverted ? "text-white" : "text-[var(--color-midnight)]"}`}>{title}</h2>
        <p className={`mt-4 text-base leading-7 md:text-lg ${inverted ? "text-white/70" : "text-slate-600"}`}>{description}</p>
      </div>
      {action ? (
        <Link href={action.href} className={`inline-flex items-center gap-2 text-sm font-extrabold ${inverted ? "text-[var(--color-gold)]" : "text-[var(--color-teal)]"}`}>
          {action.label} <ArrowRight size={16} />
        </Link>
      ) : null}
    </div>
  );
}
