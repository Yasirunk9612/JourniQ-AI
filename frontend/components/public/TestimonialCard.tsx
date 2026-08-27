export default function TestimonialCard({ quote, name, country }: { quote: string; name: string; country: string }) {
  return (
    <article className="rounded-[1.5rem] border border-[rgba(12,59,53,0.12)] bg-white/85 p-6 shadow-sm">
      <p className="text-sm leading-6 text-slate-700">&ldquo;{quote}&rdquo;</p>
      <p className="mt-4 text-sm font-extrabold text-[var(--color-midnight)]">{name}</p>
      <p className="text-xs font-semibold text-[var(--color-teal)]">{country}</p>
    </article>
  );
}
