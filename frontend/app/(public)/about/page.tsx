import CTASection from "@/components/public/CTASection";
import HeroSection from "@/components/public/HeroSection";
import SectionHeader from "@/components/public/SectionHeader";
import { Badge } from "@/components/public/TouristUI";
import { Brain, Building2, Compass, HeartHandshake, Route, ShieldCheck, Sparkles } from "lucide-react";

const values = [
  { title: "Local visibility", text: "Surface hotels and community providers as part of discovery, not as an afterthought.", icon: HeartHandshake },
  { title: "Responsible AI", text: "Use recommendation logic as a guide while keeping explanations understandable to tourists.", icon: Brain },
  { title: "Travel clarity", text: "Connect inspiration, planning, stays, and experiences through one coherent tourist flow.", icon: Route },
  { title: "Trust first", text: "Provider accounts go through admin approval before appearing publicly.", icon: ShieldCheck },
];

export default function AboutPage() {
  return (
    <main>
      <HeroSection compact title="A Sri Lankan tourism platform built for better discovery." subtitle="JourniQ AI combines destination storytelling, explainable recommendations, and local provider access into a fairer travel experience." image="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1800&q=85" eyebrow="About JourniQ AI">
        <div className="flex flex-wrap gap-3">
          <Badge tone="gold">Low-friction local discovery</Badge>
          <Badge tone="teal">Explainable AI</Badge>
          <Badge tone="coral">Sri Lanka focused</Badge>
        </div>
      </HeroSection>
      <section className="tourist-container mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeader eyebrow="Mission" title="Make Sri Lanka travel more personal, transparent, and locally connected." description="The project responds to generic discovery, high-commission platform pressure, and low visibility for rural or community tourism experiences." />
        <div className="journiq-orbit rounded-[2rem] bg-[var(--color-sand)] p-8 shadow-[var(--shadow-soft)]">
          <Badge tone="gold">Platform workflow</Badge>
          <div className="mt-6 grid gap-4 text-sm leading-6 text-slate-700">
            <p><strong>Tourists</strong> discover destinations, hotels, experiences, recommendations, and trip plans.</p>
            <p><strong>Hotel owners and providers</strong> manage listings through dedicated portals.</p>
            <p><strong>Admins</strong> approve users, monitor listings, manage commissions, and review platform analytics.</p>
          </div>
        </div>
      </section>
      <section className="tourist-container mt-16">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="journiq-dark-panel rounded-[2rem] p-8 text-white">
            <Compass className="text-[var(--color-gold)]" />
            <h2 className="mt-8 text-5xl leading-none">Not another generic travel catalogue.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">JourniQ is designed around the project proposal idea: tourists need personalization, local providers need visibility, and admins need responsible control over the ecosystem.</p>
          </article>
          <div className="grid gap-4">
            {[
              { title: "Tourist side", text: "Profile questions, AI planner behavior, recommendations, bookings, messages, and support.", icon: Sparkles },
              { title: "Provider side", text: "Hotel and activity owners manage listings, images, booking requests, and AI insights.", icon: Building2 },
              { title: "Admin side", text: "Approvals, destinations, analytics, recommendation audits, data quality, and help chats.", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="journiq-hover-lift rounded-[1.4rem] bg-white/88 p-5 shadow-[var(--shadow-soft)]">
                  <Icon className="text-[var(--color-teal)]" />
                  <h3 className="mt-4 text-2xl leading-none text-[var(--color-midnight)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="tourist-container mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {values.map((value) => {
          const Icon = value.icon;
          return (
            <article key={value.title} className="journiq-hover-lift rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[var(--shadow-soft)]">
              <Icon className="text-[var(--color-teal)]" />
              <h3 className="mt-8 text-3xl leading-none text-[var(--color-midnight)]">{value.title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">{value.text}</p>
            </article>
          );
        })}
      </section>
      <div className="tourist-container mt-16">
        <CTASection title="Explore the island through smarter local discovery." description="Start with AI planning, then continue into live hotels and community experiences." buttonText="Plan with JourniQ AI" />
      </div>
    </main>
  );
}
