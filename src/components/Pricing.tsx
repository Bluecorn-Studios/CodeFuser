import React from 'react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink, cn } from './Reveal';
import { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    id: "foundation",
    name: "Foundation",
    price: "₹9,999",
    tagline: "Remove The Ceiling",
    level: 1,
    capacity: "■■□□□",
    features: [
      "Premium One Page Website",
      "Mobile Responsive",
      "WhatsApp Integration",
      "Contact Form",
      "Google Maps",
      "Business Information Setup",
      "Basic SEO Setup",
      "Fast Loading Optimization",
      "SSL Assistance",
      "One Revision Round"
    ],
    bestFor: "Businesses starting online."
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹16,999",
    tagline: "Expand Visibility",
    level: 2,
    capacity: "■■■□□",
    features: [
      "Everything in Foundation",
      "Portfolio / Gallery",
      "Testimonials Section",
      "FAQ Section",
      "Booking Integration",
      "Enhanced SEO Structure",
      "Premium Design System",
      "Advanced Animations",
      "Conversion Focused Layout",
      "Two Revision Rounds"
    ],
    bestFor: "Businesses wanting more visibility and inquiries."
  },
  {
    id: "dominance",
    name: "Dominance",
    price: "₹35,999",
    tagline: "Automate Growth",
    level: 3,
    capacity: "■■■■■",
    features: [
      "Everything in Growth",
      "AI Receptionist Integration",
      "Lead Capture System",
      "CRM Ready Structure",
      "Advanced Automation Setup",
      "Analytics Dashboard Setup",
      "Strategy Consultation",
      "Premium Custom Design",
      "Priority Delivery",
      "Three Revision Rounds"
    ],
    bestFor: "Businesses ready to automate and scale.",
    highlight: true
  }
];

interface CapacityBarProps {
  level: number;
  highlight?: boolean;
}

function CapacityBar({ level, highlight }: CapacityBarProps) {
  const heightPercent = level === 1 ? 38 : level === 2 ? 64 : 96;
  return (
    <div className="relative mx-auto h-64 w-12 sm:h-72" aria-hidden="true">
      {/* Bottom hairline */}
      <div className="absolute inset-x-0 bottom-0 h-px hairline" />
      
      {/* Dynamic filling bar */}
      <div 
        className={cn(
          "absolute inset-x-0 bottom-0 origin-bottom rounded-t-sm",
          highlight ? "shadow-glow-soft" : ""
        )}
        style={{
          height: `${heightPercent}%`,
          background: "linear-gradient(to top, rgba(244,241,234,0.06), rgba(244,241,234,0.95))",
          transition: "height 1.2s cubic-bezier(0.22, 1, 0.36, 1)"
        }}
      >
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-foreground shadow-glow" />
      </div>
    </div>
  );
}

interface TierCardProps {
  tier: PricingPlan;
}

export function TierCard({ tier }: TierCardProps) {
  return (
    <article 
      className={cn(
        "card-lift relative flex h-full flex-col overflow-hidden rounded-3xl border p-8",
        tier.highlight ? "border-foreground/25 bg-card/60 shadow-glow-soft" : "border-border bg-card/30"
      )}
    >
      {tier.highlight && <div className="absolute inset-x-0 top-0 h-px hairline" />}
      
      <CapacityBar level={tier.level} highlight={tier.highlight} />
      
      <div className="mt-8 text-center">
        <p className="text-eyebrow">{tier.tagline}</p>
        <h3 className="font-display mt-3 text-3xl text-foreground text-glow">
          {tier.name}
        </h3>
        <p className="font-display mt-6 text-5xl text-platinum">
          {tier.price}
        </p>
      </div>
      
      <ul className="mt-10 space-y-2.5 text-sm text-foreground/85">
        {tier.features.map(feat => (
          <li key={feat} className="flex items-start gap-3">
            <span className="mt-2 h-px w-3 shrink-0 bg-foreground/50" />
            {feat}
          </li>
        ))}
      </ul>
      
      <div className="mt-auto pt-8">
        <div className="border-t border-border pt-5">
          <p className="text-eyebrow">Best For</p>
          <p className="mt-2 text-sm text-foreground/85">{tier.bestFor}</p>
        </div>
        
        <div className="mt-6">
          <Button 
            as="a" 
            href={getMailtoLink(`${tier.name} — CodeFuser`)}
            variant={tier.highlight ? "primary" : "ghost"}
            className="w-full"
          >
            Choose {tier.name}
          </Button>
        </div>
      </div>
    </article>
  );
}

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="relative overflow-hidden px-5 py-40 sm:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <Eyebrow>05 — Pricing</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow animate-text-in">
            Choose Your Growth Capacity.
          </h2>
          <p className="font-display mt-6 text-xl text-foreground/75 sm:text-2xl">
            Build the system your business actually needs.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground animate-para-in">
            Not every business needs more traffic. Most need a stronger foundation.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl gap-6 lg:grid-cols-3">
        {pricingPlans.map((tier, index) => (
          <Reveal key={tier.id} delay={index * 120}>
            <TierCard tier={tier} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={300} className="mx-auto mt-20 max-w-2xl text-center">
        <p className="font-display text-balance text-xl leading-snug text-foreground/75 sm:text-2xl">
          A stronger system scales further.
        </p>
      </Reveal>
    </section>
  );
};

export default Pricing;
