import React, { useState, useRef } from 'react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink, cn, useAppRouter } from './Reveal';
import { PricingPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MessageSquare, Gift, Globe, Check } from 'lucide-react';

export const pricingPlans: PricingPlan[] = [
  {
    id: "foundation",
    name: "⚡ Ignite",
    price: "₹7,999",
    tagline: "For businesses taking their first digital step.",
    level: 1,
    capacity: "■■□□□",
    features: [
      "Professional Business Website",
      "WhatsApp Integration",
      "Google Maps Integration",
      "Contact Form",
      "Mobile-Friendly Design",
      "Customer Enquiry Support"
    ],
    bestFor: "Businesses starting online."
  },
  {
    id: "growth",
    name: "✦ Fusion",
    price: "₹14,999",
    tagline: "Built for businesses ready to grow.",
    level: 2,
    capacity: "■■■□□",
    features: [
      "Everything in Ignite",
      "AI Chatbot",
      "Appointment Booking",
      "Gallery Showcase",
      "Customer Testimonials & Reviews",
      "SEO Foundation Setup"
    ],
    bestFor: "Businesses wanting more visibility and inquiries.",
    highlight: true
  },
  {
    id: "dominance",
    name: "⬢ Catalyst",
    price: "₹34,999",
    tagline: "Designed for businesses that want to dominate.",
    level: 3,
    capacity: "■■■■■",
    features: [
      "Everything in Fusion",
      "Online Payment Integration",
      "CRM Integration",
      "Smart AI Features",
      "Email Automation",
      "WhatsApp Automation",
      "Advanced SEO Setup",
      "Analytics Dashboard",
      "Priority Support"
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

export function renderTierName(name: string, id: string, className?: string) {
  const cleanName = name.replace(/[⚡✦⬢]/g, '').trim();
  const symbol = id === 'foundation' ? '⚡' : id === 'growth' ? '✦' : '⬢';
  const colorClass = id === 'foundation' 
    ? 'text-slate-100 [text-shadow:0_0_8px_rgba(255,255,255,0.35)]' 
    : id === 'growth' 
    ? 'text-[#EBC351] [text-shadow:0_0_8px_rgba(235,195,81,0.3)]' 
    : 'text-neutral-900 [text-shadow:0_0_8px_rgba(0,0,0,0.12)]';

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn(colorClass, "animate-premium-breathe transform translate-y-[0.5px] select-none text-[1.05em]")}>{symbol}</span>
      <span>{cleanName}</span>
    </span>
  );
}

interface FreePremiumBundleProps {
  tierId: string;
}

export const FreePremiumBundle: React.FC<FreePremiumBundleProps> = ({ tierId }) => {
  let bundleName = "🎁 FREE WEBSITE BENEFITS";
  let worthText = "";
  
  let titleColorClass = "";
  let worthColorClass = "";
  let includedFreeColorClass = "";
  let ambientGlowColor = "";
  let containerBorderClass = "";
  let badgeStyle = "";
  let cardClass = "";

  if (tierId === "foundation") {
    worthText = "₹1,499";
    titleColorClass = "text-white/85 [text-shadow:0_0_4px_rgba(255,255,255,0.05)]";
    worthColorClass = "text-white font-black text-3xl sm:text-[32px] tracking-tight [text-shadow:0_0_8px_rgba(255,255,255,0.1)]";
    includedFreeColorClass = "text-zinc-400 font-mono tracking-wider text-[11px] font-bold uppercase";
    ambientGlowColor = "bg-white/[0.002]";
    containerBorderClass = "border-t border-white/[0.04]";
    badgeStyle = "bg-white/5 border border-white/10 text-white font-mono text-[11.5px] tracking-wider px-3.5 py-1.5 rounded-full inline-block font-black [text-shadow:0_0_4px_rgba(255,255,255,0.08)]";
    cardClass = "bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.08]";
  } else if (tierId === "growth") {
    worthText = "₹3,499";
    titleColorClass = "text-[#EBC351]/85 [text-shadow:0_0_4px_rgba(235,195,81,0.08)]";
    worthColorClass = "text-[#EBC351] font-black text-3xl sm:text-[32px] tracking-tight [text-shadow:0_0_8px_rgba(235,195,81,0.14)]";
    includedFreeColorClass = "text-amber-500/70 font-mono tracking-wider text-[11px] font-bold uppercase";
    ambientGlowColor = "bg-[#EBC351]/[0.002]";
    containerBorderClass = "border-t border-white/[0.04]";
    badgeStyle = "bg-[#EBC351]/5 border border-[#EBC351]/10 text-[#EBC351] font-mono text-[11.5px] tracking-wider px-3.5 py-1.5 rounded-full inline-block font-black [text-shadow:0_0_4px_rgba(235,195,81,0.08)]";
    cardClass = "bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.08]";
  } else {
    worthText = "₹4,599";
    titleColorClass = "text-neutral-900 tracking-[0.12em] font-black [text-shadow:0_0_3px_rgba(0,0,0,0.02)]";
    worthColorClass = "text-neutral-900 font-black text-3xl sm:text-[32px] tracking-tight [text-shadow:0_0_4px_rgba(0,0,0,0.02)]";
    includedFreeColorClass = "text-neutral-500 font-mono tracking-wider text-[11px] font-bold uppercase";
    ambientGlowColor = "bg-red-500/[0.0005]";
    containerBorderClass = "border-t border-black/[0.04]";
    badgeStyle = "bg-neutral-900 text-white border border-neutral-850 font-mono text-[11.5px] tracking-wider px-3.5 py-1.5 rounded-full inline-block font-black";
    cardClass = "bg-black/[0.015] border border-black/[0.05] hover:bg-black/[0.03] hover:border-black/[0.08]";
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      className={cn("mt-8 pt-6 relative overflow-hidden flex flex-col items-center justify-center text-center group/bundle px-1 w-full", containerBorderClass)}
    >
      {/* Subtle package themed breathing ambient glow */}
      <div className={cn("absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700 group-hover/bundle:opacity-45 animate-ambient-breathe", ambientGlowColor)} />

      {/* Header Section */}
      <motion.div variants={itemVariants} className="space-y-1.5 select-none w-full mb-6">
        {/* FREE WEBSITE BENEFITS */}
        <h4 className={cn("text-xs sm:text-[13px] font-display tracking-[0.18em] uppercase font-black text-center", titleColorClass)}>
          {bundleName}
        </h4>
        
        {/* Value Presentation - FREE feeling comes before value amount */}
        <div className="space-y-0.5 text-center mt-3">
          <div className={worthColorClass}>
            Worth {worthText}
          </div>
          <div className={includedFreeColorClass}>
            Included FREE
          </div>
        </div>
      </motion.div>

      {/* Two Premium Extras Cards */}
      <div className="space-y-4 relative z-10 w-full text-left">
        {tierId === "foundation" && (
          <>
            {/* Benefit 1 Card */}
            <motion.div 
              variants={itemVariants} 
              className={cn("p-5 rounded-2xl border transition-all duration-300 w-full backdrop-blur-md shadow-sm space-y-3", cardClass)}
            >
              <div className="text-xs sm:text-[12.5px] font-mono font-extrabold uppercase tracking-[0.15em] text-white">
                🌐 YOUR BUSINESS NAME ONLINE
              </div>
              <div className="space-y-2.5">
                <div className="text-[16px] sm:text-[17px] font-extrabold font-sans tracking-wide text-white">
                  www.YourBusinessName.com
                </div>
                <div className="pt-0.5">
                  <span className={badgeStyle}>
                    FREE for 6 Months
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Benefit 2 Card */}
            <motion.div 
              variants={itemVariants} 
              className={cn("p-5 rounded-2xl border transition-all duration-300 w-full backdrop-blur-md shadow-sm space-y-3.5", cardClass)}
            >
              <div className="text-xs sm:text-[12.5px] font-mono font-extrabold uppercase tracking-[0.15em] text-white">
                ⭐ FREE WEBSITE ADMIN SPACE
              </div>
              <div className="space-y-2.5 text-[12px] sm:text-[13px] font-semibold leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-white">•</span>
                  <span className="text-neutral-200/95">Upload Business Photos</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-white">•</span>
                  <span className="text-neutral-200/95">Access Your Complete Website</span>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {tierId === "growth" && (
          <>
            {/* Benefit 1 Card */}
            <motion.div 
              variants={itemVariants} 
              className={cn("p-5 rounded-2xl border transition-all duration-300 w-full backdrop-blur-md shadow-sm space-y-3", cardClass)}
            >
              <div className="text-xs sm:text-[12.5px] font-mono font-extrabold uppercase tracking-[0.15em] text-white">
                🌐 YOUR BUSINESS NAME ONLINE
              </div>
              <div className="space-y-2.5">
                <div className="text-[16px] sm:text-[17px] font-extrabold font-sans tracking-wide text-white">
                  www.YourBusinessName.com
                </div>
                <div className="pt-0.5">
                  <span className={badgeStyle}>
                    FREE for 12 Months
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Benefit 2 Card */}
            <motion.div 
              variants={itemVariants} 
              className={cn("p-5 rounded-2xl border transition-all duration-300 w-full backdrop-blur-md shadow-sm space-y-3.5", cardClass)}
            >
              <div className="text-xs sm:text-[12.5px] font-mono font-extrabold uppercase tracking-[0.15em] text-white">
                ⭐ FREE WEBSITE ADMIN SPACE
              </div>
              <div className="space-y-2.5 text-[12px] sm:text-[13px] font-semibold leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-[#EBC351]">•</span>
                  <span className="text-neutral-200/95">Upload Business Photos</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-[#EBC351]">•</span>
                  <span className="text-neutral-200/95">Access Your Complete Website</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-[#EBC351]">•</span>
                  <span className="text-neutral-200/95">Update Business Information</span>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {tierId === "dominance" && (
          <>
            {/* Benefit 1 Card */}
            <motion.div 
              variants={itemVariants} 
              className={cn("p-5 rounded-2xl border transition-all duration-300 w-full backdrop-blur-md shadow-sm space-y-3", cardClass)}
            >
              <div className="text-xs sm:text-[12.5px] font-mono font-extrabold uppercase tracking-[0.15em] text-neutral-950 font-black">
                ⭐ FREE PREMIUM SETUP SUPPORT
              </div>
              <div className="space-y-2.5 text-[12px] sm:text-[13px] font-semibold leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-neutral-900">•</span>
                  <span className="text-neutral-900/90">VIP Onboarding Support</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-neutral-900">•</span>
                  <span className="text-neutral-900/90">Premium Setup Assistance</span>
                </div>
              </div>
            </motion.div>

            {/* Benefit 2 Card */}
            <motion.div 
              variants={itemVariants} 
              className={cn("p-5 rounded-2xl border transition-all duration-300 w-full backdrop-blur-md shadow-sm space-y-3.5", cardClass)}
            >
              <div className="text-xs sm:text-[12.5px] font-mono font-extrabold uppercase tracking-[0.15em] text-neutral-950 font-black">
                ⭐ FREE WEBSITE ADMIN SPACE
              </div>
              <div className="space-y-2.5 text-[12px] sm:text-[13px] font-semibold leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-neutral-900">•</span>
                  <span className="text-neutral-900/90">Access Your Complete Website</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-neutral-900">•</span>
                  <span className="text-neutral-900/90">Update Business Information</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-neutral-900">•</span>
                  <span className="text-neutral-900/90">Priority Website Access</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs select-none mt-0.5 leading-none font-bold text-neutral-900">•</span>
                  <span className="text-neutral-900/90">Dedicated Client Experience</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

interface TierCardProps {
  tier: PricingPlan;
}

export function TierCard({ tier }: TierCardProps) {
  const { navigate } = useAppRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

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
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 45%, transparent 65%)`,
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
        onClick={() => navigate(`/start-project?plan=${tier.id}`)}
        variant="ghost"
        className="w-full border-neutral-800 text-neutral-300 hover:border-white hover:text-white cursor-pointer"
      >
        Choose {tier.name}
      </Button>
    );

  } else if (tier.id === "growth") {
    // TITANIUM / CHAMPAGNE GOLD FUSION: Premium black glass with warm champagne gold edge light and soft ambient glow
    cardClass = "bg-[#050505] border-[1.5px] border-[#EBC351]/35 shadow-[0_20px_45px_rgba(235,195,81,0.04),0_15px_35px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-[#EBC351]/60";
    taglineClass = "text-slate-400 text-xs tracking-[0.2em] uppercase font-mono";
    headingClass = "text-[#E2E8F0] text-glow";
    priceClass = "text-slate-200 font-display";
    featuresClass = "text-slate-300/90";
    bulletColor = "bg-[#EBC351]/60";
    bestForLabel = "text-slate-400 font-mono text-[10px] tracking-widest uppercase";
    bestForText = "text-slate-200";
    footerBorder = "border-neutral-800/80";

    innerShine = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(235,195,81,0.05) 0%, rgba(235,195,81,0.01) 45%, transparent 60%)`,
          mixBlendMode: 'overlay'
        }}
      />
    );

    sweepLayer = (
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05] group-hover:opacity-[0.12] transition-opacity duration-700 rounded-3xl overflow-hidden"
      >
        <div 
          className="absolute inset-[-100%] bg-[linear-gradient(110deg,transparent_30%,rgba(235,195,81,0.15)_42%,rgba(255,255,255,0.25)_50%,rgba(235,195,81,0.15)_58%,transparent_70%)] animate-card-sweep"
        />
      </div>
    );

    btnMarkup = (
      <Button 
        onClick={() => navigate(`/start-project?plan=${tier.id}`)}
        variant="ghost"
        className="w-full border-neutral-700 text-[#E2E8F0] hover:border-[#E2E8F0] hover:text-white cursor-pointer"
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
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 50%, transparent 80%)`,
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
      <button 
        onClick={() => navigate(`/start-project?plan=${tier.id}`)}
        className="btn-pressure inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40 w-full bg-[#0A0A0A] text-[#FAF9F5] hover:bg-neutral-900 font-medium shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98] cursor-pointer"
      >
        Choose {tier.name}
      </button>
    );
  }

  // Dynamic perspective scaling & tilt layout styles with premium visual elevation for growth (Fusion)
  const isGrowth = tier.id === "growth";
  const transformStyle = {
    transform: isHovered 
      ? `perspective(1000px) translate3d(0, ${isGrowth ? '-14px' : '-8px'}, 0) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.015, 1.015, 1.015)`
      : `perspective(1000px) translate3d(0, ${isGrowth ? '-6px' : '0px'}, 0) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
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
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-5 xs:p-6 sm:p-7 select-none transition-all duration-500",
        cardClass,
        isHovered 
          ? (isGrowth 
            ? "shadow-[0_30px_60px_-15px_rgba(235,195,81,0.12),0_25px_50px_-12px_rgba(0,0,0,0.95)] border-[#EBC351]/60" 
            : "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)]") 
          : ""
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#EBC351]/15 to-[#EBC351]/8 border border-[#EBC351]/30 px-4.5 py-1.5 text-[10px] sm:text-[10.5px] font-mono font-extrabold tracking-[0.18em] text-[#EBC351] [text-shadow:0_0_8px_rgba(235,195,81,0.2)] shadow-[0_2px_10px_rgba(235,195,81,0.05)] uppercase select-none animate-premium-breathe">
            ⭐ MOST POPULAR
          </div>
        )}
        <p className={taglineClass}>{tier.tagline}</p>
        <h3 className={cn("font-display mt-2.5 text-3xl tracking-tight transition-all duration-300", headingClass)}>
          {renderTierName(tier.name, tier.id)}
        </h3>
        <p className={cn("font-display mt-5 text-5xl tracking-tight transition-all duration-300", priceClass)}>
          {tier.price}
        </p>
      </div>
      
      <ul className={cn("mt-8 space-y-2 text-sm transition-all duration-300 relative z-10", featuresClass)}>
        {tier.features.map((feat, idx) => {
          const isHiddenOnMobile = idx > 2 && !showAllFeatures;
          return (
            <li 
              key={feat} 
              className={cn(
                "items-start gap-3",
                isHiddenOnMobile ? "hidden md:flex" : "flex"
              )}
            >
              <span className={cn("mt-2 h-[1.5px] w-3 shrink-0 rounded-full", bulletColor)} />
              {feat}
            </li>
          );
        })}
      </ul>
      
      {tier.features.length > 3 && (
        <button 
          onClick={() => setShowAllFeatures(!showAllFeatures)}
          className="mt-4 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer block md:hidden self-start relative z-10"
        >
          {showAllFeatures ? "↑ Hide features" : `↓ See all features (+${tier.features.length - 3})`}
        </button>
      )}

      {/* FREE PREMIUM BUNDLE COMPARTMENT */}
      <FreePremiumBundle tierId={tier.id} />
      
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
  const [isCustomQuoteModalOpen, setIsCustomQuoteModalOpen] = useState(false);
  const [requirementsText, setRequirementsText] = useState("");

  const handleChipClick = (label: string) => {
    setRequirementsText(prev => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return `I want to build a custom ${label}: `;
      }
      return trimmed + `\n- Custom ${label}: `;
    });
  };

  const handleContactUs = () => {
    if (!requirementsText.trim()) return;
    const prefilled = `Hi CodeFuser,

I'm interested in a custom solution for my business.

Requirements:
${requirementsText.trim()}

Looking forward to discussing my project.`;

    const whatsappUrl = `https://wa.me/917449100307?text=${encodeURIComponent(prefilled)}`;
    window.open(whatsappUrl, '_blank');
    setIsCustomQuoteModalOpen(false);
    setRequirementsText("");
  };

  const presetExamples = [
    "AI Automations",
    "Customer Portals",
    "CRM Systems",
    "Custom Dashboards",
    "Booking Systems",
    "Business Platforms"
  ];

  return (
    <section id="pricing" className="lazy-section relative overflow-hidden px-5 py-[clamp(4.5rem,10vw,8rem)] sm:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <Eyebrow>05 — Pricing</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.2rem,4.8vw,3.9rem)] leading-[1.02] text-foreground text-glow font-bold animate-text-in">
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

      <Reveal delay={300} className="mx-auto mt-16 sm:mt-24 max-w-4xl text-center">
        <div className="relative group p-8 sm:p-12 rounded-3xl bg-[#050505]/60 border border-neutral-900 shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-neutral-800/80 hover:bg-[#070707] transition-all duration-300">
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 70%)`
            }}
          />
          <h3 className="font-display text-2xl sm:text-3xl text-white font-medium text-glow-soft">
            Have a bigger vision for your business?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Building something beyond a website? From smart automations to custom business systems, we're here to help you build what's next.
          </p>
          <div className="mt-8">
            <Button 
              onClick={() => setIsCustomQuoteModalOpen(true)}
              variant="ghost"
              className="border-neutral-800 text-neutral-300 hover:border-white hover:text-white cursor-pointer px-8 py-3"
            >
              Get a Custom Quote
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Beautiful Custom Quote Inbuilt Mini Chat/Modal */}
      <AnimatePresence>
        {isCustomQuoteModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setIsCustomQuoteModalOpen(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative max-w-lg w-full bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top ambient light glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsCustomQuoteModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-900 focus:outline-none"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                  <Sparkles size={18} className="text-amber-500 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg sm:text-xl font-medium text-white tracking-tight">
                    Tell Us About Your Vision
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Describe your custom solution below. We'll pre-fill a WhatsApp message to discuss your project directly with our team.
                  </p>
                </div>
              </div>

              {/* Suggestions chips */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-3">
                  Click a system to begin:
                </span>
                <div className="flex flex-wrap gap-2">
                  {presetExamples.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleChipClick(item)}
                      className="text-xs px-3 py-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all duration-200 cursor-pointer"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="relative mb-6">
                <textarea
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder="Tell us what you'd like to build... (e.g., I need a custom client dashboard where customers can login, track delivery timelines, and approve assets)"
                  className="w-full min-h-[140px] bg-[#050505] border border-neutral-800 rounded-2xl p-4 text-sm text-foreground placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all duration-300 resize-none leading-relaxed"
                />
              </div>

              {/* Action */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={handleContactUs}
                  disabled={!requirementsText.trim()}
                  className={cn(
                    "w-full py-3.5 px-6 font-semibold flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider rounded-full",
                    requirementsText.trim()
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "bg-neutral-900 text-neutral-600 border border-neutral-900 cursor-not-allowed"
                  )}
                >
                  Contact Us
                </Button>
                <button
                  onClick={() => setIsCustomQuoteModalOpen(false)}
                  className="w-full sm:w-auto text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-white py-3 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[10px] text-center text-neutral-500 mt-5">
                This opens WhatsApp with your pre-filled text. No commitment required.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Pricing;
