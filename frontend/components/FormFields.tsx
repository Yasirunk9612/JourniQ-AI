interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function InputField({ label, ...props }: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-forest)]/75">{label}</span>
      <input
        {...props}
        className="min-h-12 w-full rounded-2xl border border-[rgba(12,59,53,0.16)] bg-white/90 px-4 text-[var(--color-midnight)] outline-none transition focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[rgba(217,164,65,0.18)]"
      />
    </label>
  );
}

export function Message({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ${
        type === "error"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-[rgba(15,118,110,0.1)] text-[var(--color-teal)] border border-[rgba(15,118,110,0.18)]"
      }`}
    >
      {text}
    </div>
  );
}
