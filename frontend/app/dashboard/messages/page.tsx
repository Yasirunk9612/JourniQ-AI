"use client";

import ChatWorkspace from "@/components/chat/ChatWorkspace";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicNavbar from "@/components/public/PublicNavbar";
import SiteFooter from "@/components/public/SiteFooter";

export default function TouristMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["tourist"]}>
      <PublicNavbar />
      <main className="bg-[var(--color-ivory)] pb-16 pt-28">
        <section className="tourist-container">
          <div className="mb-8 rounded-[2rem] bg-[var(--color-midnight)] p-6 text-white shadow-[var(--shadow-lift)] md:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-100">Tourist inbox</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">Your travel conversations</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">Continue hotel inquiries, experience questions, booking conversations, and support messages from one polished inbox.</p>
          </div>
          <ChatWorkspace title="Travel messages" description="Continue your hotel, experience, and JourniQ help conversations." />
        </section>
      </main>
      <SiteFooter />
    </ProtectedRoute>
  );
}
