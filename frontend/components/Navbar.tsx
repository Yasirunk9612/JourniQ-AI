"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-white/70 bg-[rgba(252,250,246,0.9)] backdrop-blur-2xl">
      <div className="tourist-container flex items-center justify-between py-4">
        <BrandLogo href="/" size="md" />
        <nav className="flex items-center gap-3 text-sm text-[var(--color-forest)]">
          {user ? (
            <>
              <span className="hidden font-bold sm:block">{user.name}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-teal)] px-4 py-2 font-bold text-white transition hover:bg-[#0b615b]"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link className="font-bold hover:text-[var(--color-teal)]" href="/login">
                Login
              </Link>
              <Link
                className="rounded-full bg-[var(--color-coral)] px-4 py-2 font-bold text-white transition hover:bg-[#e85f42]"
                href="/register"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
