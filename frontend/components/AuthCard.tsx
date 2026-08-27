import BrandLogo from "./BrandLogo";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-lift)] backdrop-blur sm:p-8">
      <BrandLogo href="/" size="md" className="mb-7" />
      <h1 className="text-4xl leading-none text-[var(--color-midnight)]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
