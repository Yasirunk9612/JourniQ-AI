"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Brain, LayoutDashboard, LifeBuoy, LogOut, Menu, MessageCircle, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const links = [
  ["Home", "/"],
  ["Destinations", "/destinations"],
  ["Hotels", "/hotels"],
  ["Experiences", "/experiences"],
  ["Recommendations", "/recommendations"],
  ["AI Planner", "/ai-trip-planner"],
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isHome = pathname === "/";
  const isTourist = user?.role === "tourist";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || !isHome || open;
  const navTone = solid ? "text-[var(--color-midnight)]" : "text-white";

  const initials = useMemo(() => user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "T", [user?.name]);

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    setOpen(false);
    router.push("/login");
  };

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition hover:bg-white/12 ${
      active ? "after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[var(--color-gold)]" : ""
    }`;
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${solid ? "border-b border-white/60 bg-[rgba(252,250,246,0.9)] shadow-sm backdrop-blur-2xl" : "bg-transparent"}`}>
      <div className={`tourist-container flex min-h-[88px] items-center justify-between gap-4 py-2.5 ${navTone}`}>
        <Link
          href="/"
          className={`group relative flex shrink-0 items-center gap-3 rounded-[2rem] border py-2 pl-2 pr-4 transition duration-300 ${
            solid
              ? "border-[rgba(12,59,53,0.12)] bg-white/90 shadow-[0_18px_44px_rgba(7,26,34,0.1)]"
              : "border-white/20 bg-[rgba(7,26,34,0.28)] shadow-[0_18px_46px_rgba(0,0,0,0.18)] backdrop-blur-md"
          }`}
          onClick={() => setOpen(false)}
        >
          <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-white bg-[var(--color-gold)] shadow-sm" aria-hidden="true" />
          <span className="relative size-[64px] shrink-0 overflow-hidden rounded-[1.45rem] bg-[var(--color-midnight)] shadow-[0_18px_38px_rgba(7,26,34,0.28)] ring-2 ring-white/85 transition duration-300 group-hover:scale-[1.03] max-sm:size-[58px]">
            <Image src="/LOGO2.png" alt="JourniQ AI logo" fill sizes="(max-width: 640px) 58px, 64px" className="object-cover scale-[1.14]" priority />
          </span>
          <span className="hidden leading-none sm:block">
            <span className={`block whitespace-nowrap font-serif text-[1.65rem] font-black leading-[0.86] ${solid ? "text-[var(--color-midnight)]" : "text-white"}`}>JourniQ AI</span>
            <span className={`mt-1.5 block whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] ${solid ? "text-[var(--color-teal)]" : "text-[var(--color-gold)]"}`}>Sri Lanka travel</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/hotels" aria-label="Search stays" className={`grid size-11 place-items-center rounded-full border transition ${solid ? "border-[rgba(12,59,53,0.16)] bg-white/70" : "border-white/25 bg-white/10"}`}>
            <Search size={18} />
          </Link>
          {isTourist ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 text-sm font-bold ${solid ? "border-[rgba(12,59,53,0.16)] bg-white/80" : "border-white/25 bg-white/10"}`}
              >
                <span className="grid size-8 place-items-center rounded-full bg-[var(--color-teal)] text-xs text-white">{initials}</span>
                {user?.name}
              </button>
              {accountOpen ? (
                <div className="absolute right-0 mt-3 w-64 rounded-[1.2rem] border border-[rgba(12,59,53,0.12)] bg-white p-2 text-[var(--color-midnight)] shadow-[var(--shadow-lift)]">
                  <Link href="/dashboard" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold hover:bg-[var(--color-muted)]"><LayoutDashboard size={16} /> Tourist profile</Link>
                  <Link href="/dashboard/ai-profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold hover:bg-[var(--color-muted)]"><Brain size={16} /> AI profile</Link>
                  <Link href="/dashboard/messages" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold hover:bg-[var(--color-muted)]"><MessageCircle size={16} /> Messages</Link>
                  <Link href="/help" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold hover:bg-[var(--color-muted)]"><LifeBuoy size={16} /> Help chat</Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-red-700 hover:bg-red-50"><LogOut size={16} /> Logout</button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link href="/login" className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-extrabold">Login</Link>
              <Link href="/ai-trip-planner" className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-coral)] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm">
                <Sparkles size={16} /> Plan my trip
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className={`grid size-12 place-items-center rounded-full border xl:hidden ${solid ? "border-[rgba(12,59,53,0.18)] bg-white/80" : "border-white/25 bg-white/10"}`} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-x-0 top-[96px] z-50 mx-3 rounded-[1.5rem] border border-white/70 bg-[var(--color-ivory)] p-4 text-[var(--color-midnight)] shadow-[var(--shadow-lift)] xl:hidden">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-base font-extrabold hover:bg-[var(--color-muted)]">
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2 border-t border-[rgba(12,59,53,0.1)] pt-4">
            {isTourist ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="whitespace-nowrap rounded-full bg-[var(--color-teal)] px-5 py-3 text-center text-sm font-extrabold text-white">Tourist profile</Link>
                <Link href="/dashboard/ai-profile" onClick={() => setOpen(false)} className="whitespace-nowrap rounded-full border border-[rgba(12,59,53,0.18)] px-5 py-3 text-center text-sm font-extrabold">AI profile</Link>
                <Link href="/dashboard/messages" onClick={() => setOpen(false)} className="whitespace-nowrap rounded-full border border-[rgba(12,59,53,0.18)] px-5 py-3 text-center text-sm font-extrabold">Messages</Link>
                <Link href="/help" onClick={() => setOpen(false)} className="whitespace-nowrap rounded-full border border-[rgba(12,59,53,0.18)] px-5 py-3 text-center text-sm font-extrabold">Help chat</Link>
                <button onClick={handleLogout} className="whitespace-nowrap rounded-full border border-red-200 px-5 py-3 text-sm font-extrabold text-red-700">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="whitespace-nowrap rounded-full border border-[rgba(12,59,53,0.18)] px-5 py-3 text-center text-sm font-extrabold">Login</Link>
                <Link href="/ai-trip-planner" onClick={() => setOpen(false)} className="whitespace-nowrap rounded-full bg-[var(--color-coral)] px-5 py-3 text-center text-sm font-extrabold text-white">Plan my trip</Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
