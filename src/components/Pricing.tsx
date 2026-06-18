import React, { useState, useRef } from 'react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink, cn } from './Reveal';
import { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    id: "foundation",
    name: "Ignite",
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
    name: "Fusion",
    price: "₹24,999",
    tagline: "Expand Visibility",
    level: 2,
    capacity: "■■■□□",
    features: [
      "Everything in Ignite",
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
    bestFor: "Businesses wanting more visibility and inquiries.",
    highlight: true
  },
  {
    id: "dominance",
    name: "Catalyst",
    price: "₹49,999",
    tagline: "Automate Growth",
    level: 3,
    capacity: "■■■■■",
    features: [
      "Everything in Fusion",
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
    bestFor: "Businesses ready to automate and scale."
  }
];

interface CapacityBarProps {
  level: number;
  highlight?: boolean;
  tierId: string;
}

function ObsidianVisualizer() {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-950/40 border border-neutral-900/40 mb-2">
      {/* 1. Base visual frame: Shared grid reference system (Obsidian contrast) */}
      <div className="absolute inset-0 w-full h-full text-neutral-800/20">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 176" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Orthogonal Reference Lines */}
          <line x1="160" y1="0" x2="160" y2="176" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          <line x1="0" y1="88" x2="320" y2="88" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          {/* Concentric Evolution Tracks */}
          <circle cx="160" cy="88" r="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <circle cx="160" cy="88" r="65" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          <circle cx="160" cy="88" r="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* Central emerging signal beacon (Potential Discovered) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center pointer-events-none">
        {/* Soft, minimal single breathe and ripple pulses */}
        <div className="absolute w-12 h-12 rounded-full border border-white/5 animate-beacon-breath" />
        <div className="absolute w-12 h-12 rounded-full border border-white/20 animate-beacon-ripple" />
        
        {/* Precision discovered center node */}
        <div className="relative h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
      </div>

      {/* Narrative status display */}
      <div className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-neutral-600 uppercase select-none">
        MAPPED : 01.INIT
      </div>
      <div className="absolute top-3 right-4 font-mono text-[9px] tracking-wider text-neutral-600 select-none">
        POTENTIAL DISCOVERED
      </div>
    </div>
  );
}

function TitaniumVisualizer() {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-950/40 border border-neutral-900/45 mb-2">
      {/* 1. Base visual frame: Shared grid reference system (Titanium contrast) */}
      <div className="absolute inset-0 w-full h-full text-neutral-800/18">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 176" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Orthogonal Reference Lines */}
          <line x1="160" y1="0" x2="160" y2="176" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          <line x1="0" y1="88" x2="320" y2="88" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          {/* Concentric Evolution Tracks */}
          <circle cx="160" cy="88" r="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <circle cx="160" cy="88" r="65" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          <circle cx="160" cy="88" r="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />

          {/* Connection Lines (Potential Activated) */}
          <path d="M 160 88 L 213 51" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
          <path d="M 160 88 L 107 125" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />

          {/* Traveling Light Pulse paths */}
          <path 
            d="M 160 88 L 213 51" 
            stroke="#FFFFFF" 
            strokeWidth="1.25" 
            strokeLinecap="round"
            strokeDasharray="12 52" 
            className="animate-travel-pulse" 
          />
          <path 
            d="M 160 88 L 107 125" 
            stroke="#FFFFFF" 
            strokeWidth="1.25" 
            strokeLinecap="round"
            strokeDasharray="12 52" 
            className="animate-travel-pulse [animation-delay:1.5s]" 
          />

          {/* Symmetrical active node points */}
          <circle cx="160" cy="88" r="3" fill="#FFFFFF" />
          <circle cx="213" cy="51" r="2.5" fill="#94A3B8" className="animate-pulse" />
          <circle cx="107" cy="125" r="2.5" fill="#94A3B8" className="animate-pulse [animation-delay:1.5s]" />
        </svg>
      </div>

      {/* Narrative status display */}
      <div className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-[#64748B]/60 uppercase select-none">
        ACTIVE : 02.GROWTH
      </div>
      <div className="absolute top-3 right-4 font-mono text-[9px] tracking-wider text-[#64748B]/60 select-none">
        POTENTIAL ACTIVATED
      </div>
    </div>
  );
}

function WhiteGoldVisualizer() {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-2xl bg-[#ECEAE0] border border-[#CCCCCC] mb-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
      {/* 1. Base visual frame: Shared grid reference system (White Gold contrast) */}
      <div className="absolute inset-0 w-full h-full text-[#BDBBAF]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 176" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Orthogonal Reference Lines */}
          <line x1="160" y1="0" x2="160" y2="176" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 6" />
          <line x1="0" y1="88" x2="320" y2="88" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 6" />
          {/* Concentric Evolution Tracks */}
          <circle cx="160" cy="88" r="35" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
          <circle cx="160" cy="88" r="65" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 6" />
          <circle cx="160" cy="88" r="95" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* Three concentric orbital groups (Potential Compounding) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 176" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Central heavy anchor node with outer micro rotating ring */}
          <circle cx="160" cy="88" r="7" stroke="#1C1C1B" strokeWidth="0.5" strokeDasharray="1 1.5" className="opacity-40 animate-spin" style={{ transformOrigin: '160px 88px', animationDuration: '6s' }} />
          <circle cx="160" cy="88" r="4.5" fill="#1C1C1B" />

          {/* Track 1: Inner orbit (radius 35) */}
          <g className="animate-orbit-cw" style={{ transformOrigin: '160px 88px', animationDuration: '18s' }}>
            <line x1="160" y1="88" x2="160" y2="53" stroke="#1C1C1B" strokeWidth="0.75" strokeDasharray="1 3" className="opacity-50" />
            <circle cx="160" cy="53" r="3" fill="#1C1C1B" />
          </g>

          {/* Track 2: Mid orbit (radius 65) */}
          <g className="animate-orbit-ccw" style={{ transformOrigin: '160px 88px', animationDuration: '28s' }}>
            <line x1="160" y1="88" x2="160" y2="153" stroke="#1C1C1B" strokeWidth="0.75" strokeDasharray="1 3" className="opacity-65" />
            <circle cx="160" cy="153" r="4" fill="#1C1C1B" />
          </g>

          {/* Track 3: Outer orbit (radius 95) */}
          <g className="animate-orbit-cw" style={{ transformOrigin: '160px 88px', animationDuration: '40s' }}>
            <line x1="160" y1="88" x2="65" y2="88" stroke="#1C1C1B" strokeWidth="0.75" strokeDasharray="1 3" className="opacity-80" />
            <circle cx="65" cy="88" r="3.5" fill="#1C1C1B" />
          </g>
        </svg>
      </div>

      {/* Narrative status display */}
      <div className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-[#3E3E37] uppercase font-bold select-none">
        COMPOUND : 03.SCALE
      </div>
      <div className="absolute top-3 right-4 font-mono text-[9px] tracking-wider text-[#3E3E37] font-bold select-none">
        POTENTIAL COMPOUNDING
      </div>
    </div>
  );
}

function CapacityBar({ level, highlight, tierId }: CapacityBarProps) {
  if (tierId === 'foundation') {
    return <ObsidianVisualizer />;
  }
  if (tierId === 'growth') {
    return <TitaniumVisualizer />;
  }
  return <WhiteGoldVisualizer />;
}

interface TierCardProps {
  tier: PricingPlan;
}

export function TierCard({ tier }: TierCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized position from -0.5 to 0.5
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Extreme high-end precision tilt physics (subtle maximum 5 degrees)
    const maxTilt = 5;
    const tiltX = -normalizedY * maxTilt;
    const tiltY = normalizedX * maxTilt;
    
    // Precise light tracking offsets
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    
    setTilt({ x: tiltX, y: tiltY });
    setShine({ x: shineX, y: shineY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  };

  // Aesthetic material property setups
  let cardClass = "";
  let innerShine = null;
  let sweepLayer = null;
  let taglineClass = "";
  let headingClass = "";
  let priceClass = "";
  let featuresClass = "";
  let bulletColor = "";
  let bestForLabel = "";
  let bestForText = "";
  let footerBorder = "";
  let btnMarkup = null;

  if (tier.id === "foundation") {
    // OBSIDIAN: Highly polished deep volc-glass black, mirroring sharp laser streaks
    cardClass = "bg-[#050505] border-neutral-900 shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)]";
    taglineClass = "text-neutral-500 text-xs tracking-[0.2em] uppercase font-mono";
    headingClass = "text-white text-glow";
    priceClass = "text-neutral-100 font-display";
    featuresClass = "text-neutral-400";
    bulletColor = "bg-neutral-600";
    bestForLabel = "text-neutral-500 font-mono text-[10px] tracking-widest uppercase";
    bestForText = "text-neutral-300";
    footerBorder = "border-neutral-900";
    
    innerShine = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.02) 45%, transparent 65%)`,
          mixBlendMode: 'overlay'
        }}
      />
    );
    
    sweepLayer = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 rounded-3xl overflow-hidden"
      >
        <div 
          className="absolute inset-[-100%] bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.8)_42%,rgba(255,255,255,1)_50%,rgba(255,255,255,0.8)_58%,transparent_70%)] animate-card-sweep"
        />
      </div>
    );

    btnMarkup = (
      <Button 
        as="a" 
        href={getMailtoLink(`${tier.name} — CodeFuser`)}
        variant="ghost"
        className="w-full border-neutral-800 text-neutral-300 hover:border-white hover:text-white"
      >
        Choose {tier.name}
      </Button>
    );

  } else if (tier.id === "growth") {
    // TITANIUM: Tac-brushed space-grade metallic grey catching a brushed, satin sheen
    cardClass = "bg-gradient-to-b from-[#111111] via-[#0b0b0b] to-[#040404] border-neutral-800 shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.07)] hover:border-neutral-700/60";
    taglineClass = "text-slate-450 text-xs tracking-[0.2em] uppercase font-mono";
    headingClass = "text-[#E2E8F0] text-glow";
    priceClass = "text-slate-200 font-display";
    featuresClass = "text-slate-300/90";
    bulletColor = "bg-slate-500";
    bestForLabel = "text-slate-400 font-mono text-[10px] tracking-widest uppercase";
    bestForText = "text-slate-200";
    footerBorder = "border-neutral-800/80";

    innerShine = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(230, 235, 245, 0.08) 0%, rgba(230,235,245,0.01) 45%, transparent 60%)`,
          mixBlendMode: 'screen'
        }}
      />
    );

    sweepLayer = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] group-hover:opacity-[0.1] transition-opacity duration-700 rounded-3xl overflow-hidden"
      >
        <div 
          className="absolute inset-[-100%] bg-[linear-gradient(110deg,transparent_30%,rgba(148,163,184,0.4)_42%,rgba(255,255,255,0.7)_50%,rgba(148,163,184,0.4)_58%,transparent_70%)] animate-card-sweep"
        />
      </div>
    );

    btnMarkup = (
      <Button 
        as="a" 
        href={getMailtoLink(`${tier.name} — CodeFuser`)}
        variant="ghost"
        className="w-full border-neutral-700 text-[#E2E8F0] hover:border-[#E2E8F0] hover:text-white"
      >
        Choose {tier.name}
      </Button>
    );

  } else {
    // WHITE GOLD: High-contrast pure luxury. Luminescent gold-alloy metal plate with rich charcoal typography
    cardClass = "bg-gradient-to-b from-[#FEFEFC] via-[#F4F3ED] to-[#ECEAE1] border-[#DDDCD5] shadow-[0_20px_45px_rgba(0,0,0,0.45),inset_0_1.5px_1px_rgba(255,255,255,1)]";
    taglineClass = "text-[#6E6D66] text-xs tracking-[0.2em] uppercase font-mono font-semibold";
    headingClass = "text-[#0A0A0A] font-medium";
    priceClass = "text-[#000000] font-display font-medium";
    featuresClass = "text-[#1C1C1B]";
    bulletColor = "bg-[#0A0A0A]/40";
    bestForLabel = "text-[#5C5B54] font-mono text-[10px] tracking-widest uppercase font-semibold";
    bestForText = "text-[#1C1C1B] font-medium";
    footerBorder = "border-[#DAD8D0]";

    innerShine = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 1) 0%, rgba(235, 232, 221, 0.45) 50%, transparent 80%)`,
          mixBlendMode: 'overlay'
        }}
      />
    );

    sweepLayer = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.14] group-hover:opacity-[0.22] transition-opacity duration-700 rounded-3xl overflow-hidden"
      >
        <div 
          className="absolute inset-[-100%] bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.7)_42%,rgba(244,241,234,1)_50%,rgba(255,255,255,0.7)_58%,transparent_70%)] animate-card-sweep"
        />
      </div>
    );

    btnMarkup = (
      <a 
        href={getMailtoLink(`${tier.name} — CodeFuser`)}
        className="btn-pressure inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40 w-full bg-[#0A0A0A] text-[#FAF9F5] hover:bg-neutral-900 font-medium shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98]"
      >
        Choose {tier.name}
      </a>
    );
  }

  // Dynamic perspective scaling & tilt layout styles
  const transformStyle = {
    transform: isHovered 
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.015, 1.015, 1.015)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: isHovered 
      ? 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)'
      : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
  };

  return (
    <article 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 sm:p-7 select-none transition-shadow duration-500",
        cardClass,
        isHovered ? "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)]" : ""
      )}
    >
      {/* Light Sweeper & Pointer-following Spotlights */}
      {sweepLayer}
      {innerShine}
      
      {/* Top hairline glass effect exclusively on Obsidian */}
      {tier.id === "foundation" && <div className="absolute inset-x-0 top-0 h-px bg-white/5" />}

      {/* Capacity Indicator Progress bar */}
      <CapacityBar level={tier.level} highlight={tier.highlight} tierId={tier.id} />
      
      <div className="mt-6 text-center relative z-10">
        {tier.highlight && (
          <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-[10px] font-mono font-bold tracking-wider text-amber-400 shadow-sm uppercase">
            ⭐ Most Popular
          </div>
        )}
        <p className={taglineClass}>{tier.tagline}</p>
        <h3 className={cn("font-display mt-2.5 text-3xl tracking-tight transition-all duration-300", headingClass)}>
          {tier.name}
        </h3>
        <p className={cn("font-display mt-5 text-5xl tracking-tight transition-all duration-300", priceClass)}>
          {tier.price}
        </p>
      </div>
      
      <ul className={cn("mt-8 space-y-2 text-sm transition-all duration-300 relative z-10", featuresClass)}>
        {tier.features.map(feat => (
          <li key={feat} className="flex items-start gap-3">
            <span className={cn("mt-2 h-[1.5px] w-3 shrink-0 rounded-full", bulletColor)} />
            {feat}
          </li>
        ))}
      </ul>
      
      <div className="mt-auto pt-6 relative z-10">
        <div className={cn("border-t pt-4 transition-all duration-300", footerBorder)}>
          <p className={bestForLabel}>Best For</p>
          <p className={cn("mt-2 text-sm transition-all duration-300", bestForText)}>{tier.bestFor}</p>
        </div>
        
        <div className="mt-5">
          {btnMarkup}
        </div>
      </div>
    </article>
  );
}

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="relative overflow-hidden px-5 py-28 lg:py-32 sm:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <Eyebrow>05 — Pricing</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] text-foreground text-glow animate-text-in">
            Choose Your Growth Capacity.
          </h2>
          <p className="font-display mt-5 text-lg text-foreground/75 sm:text-xl">
            Build the system your business actually needs.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground animate-para-in">
            Not every business needs more traffic. Most need a stronger foundation.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 sm:mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
        {pricingPlans.map((tier, index) => (
          <Reveal key={tier.id} delay={index * 120}>
            <TierCard tier={tier} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={300} className="mx-auto mt-14 sm:mt-16 max-w-2xl text-center">
        <p className="font-display text-balance text-lg leading-snug text-foreground/75 sm:text-xl">
          A stronger system scales further.
        </p>
      </Reveal>
    </section>
  );
};

export default Pricing;
