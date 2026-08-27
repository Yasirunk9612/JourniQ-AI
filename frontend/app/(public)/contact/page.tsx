"use client";

import { FormEvent, useState } from "react";
import HeroSection from "@/components/public/HeroSection";
import SectionHeader from "@/components/public/SectionHeader";
import { Badge, Button, Field, Message, SelectField, TextArea } from "@/components/public/TouristUI";
import { ArrowRight, HelpCircle, Hotel, LifeBuoy, MapPinned, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("Contact API is not implemented yet. Your message was validated locally but not sent to a backend.");
  };

  return (
    <main>
      <HeroSection compact title="Talk to JourniQ AI without losing the travel mood." subtitle="Support categories are ready in the interface. A real contact submission endpoint still needs to be added before messages can be sent." image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85" eyebrow="Contact">
        <div className="flex flex-wrap gap-3">
          <Link href="/help" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-coral)] px-5 py-2.5 text-sm font-extrabold text-white">Open help chat <MessageCircle size={16} /></Link>
          <Link href="/ai-assistant" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-extrabold text-[var(--color-forest)]">Ask AI assistant <Sparkles size={16} /></Link>
        </div>
      </HeroSection>

      <section className="tourist-container mt-16 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={onSubmit} className="journiq-panel rounded-[2rem] p-6">
          <SectionHeader eyebrow="Message us" title="What can we help with?" description="The form has accessible labels and local validation. Submission is disabled from pretending success until a contact endpoint exists." />
          <div className="mt-8 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
            </div>
            <SelectField label="Subject" name="subject" required defaultValue="tourist-support">
              <option value="tourist-support">Tourist support</option>
              <option value="booking">Booking question</option>
              <option value="recommendations">Recommendations</option>
              <option value="provider">Provider onboarding</option>
            </SelectField>
            <TextArea label="Message" name="message" required minLength={10} className="min-h-36" />
            {error ? <Message type="error" text={error} /> : null}
            {status ? <Message type="success" text={status} /> : null}
            <Button type="submit">Validate message</Button>
          </div>
        </form>
        <aside className="grid gap-4">
          {[
            { title: "Tourist planning", text: "Trip planning, recommendations, and account guidance.", icon: Sparkles },
            { title: "Booking support", text: "Hotel and experience booking request questions.", icon: Hotel },
            { title: "Local discovery", text: "Destination and community tourism information.", icon: MapPinned },
            { title: "FAQ preview", text: "Contact delivery needs a backend endpoint before real messages can be sent.", icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="journiq-hover-lift rounded-[1.75rem] bg-[var(--color-sand)] p-6 shadow-[var(--shadow-soft)]">
                <Icon className="text-[var(--color-teal)]" />
                <h3 className="mt-5 text-3xl leading-none text-[var(--color-midnight)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            );
          })}
          <Badge tone="gold">Configured contact details are not present in the frontend environment.</Badge>
        </aside>
      </section>
      <section className="tourist-container mt-14">
        <div className="journiq-dark-panel grid gap-6 rounded-[2rem] p-7 text-white md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <LifeBuoy className="text-[var(--color-gold)]" />
            <h2 className="mt-6 text-4xl leading-none">Use the right support path.</h2>
            <p className="mt-4 text-sm leading-6 text-white/68">The contact form is local-only until a backend endpoint exists. The help chat is the real platform support route already connected to conversations.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Real-time support chat", "/help"],
              ["AI travel assistant", "/ai-assistant"],
              ["Hotel booking questions", "/hotels"],
              ["Experience requests", "/experiences"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-extrabold hover:bg-white/12">
                {label} <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
