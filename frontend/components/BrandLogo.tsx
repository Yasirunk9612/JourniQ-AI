import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  label?: string;
  sublabel?: string;
  inverted?: boolean;
  compact?: boolean;
  size?: "sm" | "md" | "nav" | "lg";
  className?: string;
  onClick?: () => void;
};

export default function BrandLogo({
  href,
  label = "JourniQ AI",
  sublabel,
  inverted = false,
  compact = false,
  size,
  className = "",
  onClick,
}: BrandLogoProps) {
  const resolvedSize = size ?? (compact ? "sm" : "md");
  const logoSize = {
    sm: "size-12 rounded-[1.15rem]",
    md: "size-14 rounded-[1.25rem]",
    nav: "size-16 rounded-[1.45rem]",
    lg: "size-20 rounded-[1.75rem]",
  }[resolvedSize];
  const imageSize = {
    sm: "48px",
    md: "56px",
    nav: "64px",
    lg: "80px",
  }[resolvedSize];
  const titleSize = {
    sm: "text-lg",
    md: "text-xl",
    nav: "text-2xl",
    lg: "text-3xl",
  }[resolvedSize];
  const imageFit = resolvedSize === "nav" || resolvedSize === "lg" ? "object-cover scale-[1.2]" : "object-cover scale-[1.12]";

  const content = (
    <>
      <span className={`${logoSize} relative shrink-0 overflow-hidden bg-[var(--color-midnight)] shadow-[0_16px_40px_rgba(7,26,34,0.24)] ring-2 ${inverted ? "ring-white/25" : "ring-white"}`}>
        <Image src="/LOGO2.png" alt="JourniQ AI logo" fill sizes={imageSize} className={imageFit} priority={resolvedSize === "nav"} />
      </span>
      <span className="min-w-0">
        <span className={`block whitespace-nowrap font-serif font-black leading-none tracking-normal ${titleSize} ${inverted ? "text-white" : "text-[var(--color-midnight)]"}`}>{label}</span>
        {sublabel ? <span className={`mt-1 block whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] ${inverted ? "text-white/52" : "text-slate-500"}`}>{sublabel}</span> : null}
      </span>
    </>
  );

  const classes = `inline-flex items-center gap-3 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
