import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, RotateCcw } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "coral";
};

const buttonStyles = {
  primary: "bg-[var(--color-teal)] text-white shadow-[0_18px_36px_-24px_rgba(15,118,110,0.8)] hover:bg-[#0b615b]",
  secondary: "border border-[rgba(12,59,53,0.18)] bg-white/80 text-[var(--color-forest)] hover:bg-white",
  ghost: "text-[var(--color-forest)] hover:bg-[rgba(15,118,110,0.08)]",
  coral: "bg-[var(--color-coral)] text-white shadow-[0_18px_36px_-24px_rgba(255,107,74,0.8)] hover:bg-[#e85f42]",
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-55 ${buttonStyles[variant]} ${className}`}
    />
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${buttonStyles[variant || "primary"]} ${className}`}
    >
      {children}
    </Link>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  inverted?: boolean;
};

export function Field({ label, hint, inverted = false, className = "", ...props }: FieldProps) {
  return (
    <label className="block">
      <span className={`mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] ${inverted ? "text-white/72" : "text-[var(--color-forest)]/75"}`}>{label}</span>
      <input
        {...props}
        className={`min-h-12 w-full rounded-2xl border px-4 text-sm shadow-sm outline-none transition focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[rgba(217,164,65,0.18)] ${
          inverted
            ? "border-white/18 bg-white/12 text-white placeholder:text-white/45 [color-scheme:dark]"
            : "border-[rgba(12,59,53,0.16)] bg-white/90 text-[var(--color-midnight)] placeholder:text-slate-400"
        } ${className}`}
      />
      {hint ? <span className={`mt-1.5 block text-xs ${inverted ? "text-white/55" : "text-slate-500"}`}>{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-forest)]/75">{label}</span>
      <textarea
        {...props}
        className={`w-full rounded-2xl border border-[rgba(12,59,53,0.16)] bg-white/90 px-4 py-3 text-sm text-[var(--color-midnight)] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[rgba(217,164,65,0.18)] ${className}`}
      />
    </label>
  );
}

export function SelectField({
  label,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-forest)]/75">{label}</span>
      <select
        {...props}
        className={`min-h-12 w-full rounded-2xl border border-[rgba(12,59,53,0.16)] bg-white/90 px-4 text-sm text-[var(--color-midnight)] shadow-sm outline-none transition focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[rgba(217,164,65,0.18)] ${className}`}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({ children, tone = "teal" }: { children: React.ReactNode; tone?: "teal" | "gold" | "coral" | "dark" }) {
  const tones = {
    teal: "bg-[rgba(15,118,110,0.1)] text-[var(--color-teal)]",
    gold: "bg-[rgba(217,164,65,0.16)] text-[#8a6117]",
    coral: "bg-[rgba(255,107,74,0.12)] text-[#b74129]",
    dark: "bg-[rgba(7,26,34,0.08)] text-[var(--color-midnight)]",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${tones[tone]}`}>{children}</span>;
}

export function Rating({ value }: { value?: number }) {
  if (!value) return null;
  return <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-extrabold text-[#8a6117]">{value.toFixed(1)} rating</span>;
}

export function LoadingSkeleton({ count = 6, compact = false }: { count?: number; compact?: boolean }) {
  return (
    <div className={`grid gap-5 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`} aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/70 p-3 shadow-sm">
          <div className="h-44 animate-pulse rounded-[1.25rem] bg-slate-200" />
          <div className="space-y-3 p-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-[rgba(12,59,53,0.22)] bg-white/70 p-8 text-center shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[rgba(15,118,110,0.1)] text-[var(--color-teal)]">
        <AlertCircle size={22} />
      </div>
      <h3 className="mt-4 text-2xl text-[var(--color-midnight)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} variant="secondary" className="mt-5">
          <RotateCcw size={16} /> {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-red-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">Something interrupted this request.</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {onRetry ? (
          <Button onClick={onRetry} variant="secondary" className="bg-white text-red-800">
            Retry <ArrowRight size={16} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function InlineLoading({ label = "Working..." }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="animate-spin" size={16} /> {label}
    </span>
  );
}

export function Message({ type, text }: { type: "error" | "success"; text: string }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.1)] text-[var(--color-teal)]"}`}>
      {text}
    </div>
  );
}
