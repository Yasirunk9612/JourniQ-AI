import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const columns = [
  { title: "Discover", links: [["Destinations", "/destinations"], ["Hotels", "/hotels"], ["Experiences", "/experiences"], ["AI Planner", "/ai-trip-planner"], ["AI Assistant", "/ai-assistant"]] },
  { title: "Traveler", links: [["Recommendations", "/recommendations"], ["Profile", "/dashboard"], ["Login", "/login"], ["Register", "/register"]] },
  { title: "Partners", links: [["Hotel owners", "/login/hotel-owner"], ["Activity providers", "/login/activity-provider"], ["Admin portal", "/login/admin"]] },
  { title: "Support", links: [["Help chat", "/help"], ["About", "/about"], ["Contact", "/contact"]] },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 bg-[var(--color-midnight)] text-white">
      <div className="tourist-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,0.7fr)]">
        <div>
          <BrandLogo href="/" inverted sublabel="Sri Lanka travel intelligence" />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/68">AI-powered Sri Lankan discovery, responsible local booking, and trip planning shaped around the way each tourist travels.</p>
          <div className="mt-6 grid gap-2 text-sm text-white/66">
            <p className="flex items-center gap-2"><MapPin size={15} /> Colombo, Sri Lanka</p>
            <p className="flex items-center gap-2"><Mail size={15} /> Contact details can be configured in platform settings</p>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--color-gold)]">{column.title}</h4>
            <div className="mt-4 grid gap-2 text-sm text-white/68">
              {column.links.map(([label, href]) => <Link key={href} href={href} className="transition hover:text-white">{label}</Link>)}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="tourist-container flex flex-col gap-2 text-xs text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} JourniQ AI. All rights reserved.</p>
          <p>No newsletter or social links are shown until real integrations are configured.</p>
        </div>
      </div>
    </footer>
  );
}
