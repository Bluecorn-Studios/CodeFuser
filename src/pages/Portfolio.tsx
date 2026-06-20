import React from 'react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink, useAppRouter } from '../components/Reveal';
import { S as SectionHeader } from '../components/SectionHeader';
import { Ring } from '../components/FinalCta';
import { 
  Briefcase, 
  Search, 
  Compass, 
  Code2, 
  Cpu, 
  Rocket, 
  MessageSquare, 
  FileText, 
  Check, 
  ArrowRight,
  Shield,
  Activity,
  Calendar,
  Layers,
  MapPin,
  TrendingUp
} from 'lucide-react';

// =========================================================
// SVG Blueprint Schematics for Upcoming Case Studies
// =========================================================

function ClinicSchematic() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-xl bg-[#090909] border border-border/40 select-none">
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 text-white/[0.04] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 160" fill="none">
          <line x1="0" y1="20" x2="320" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="0" y1="60" x2="320" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="0" y1="100" x2="320" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="0" y1="140" x2="320" y2="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="80" y1="0" x2="80" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="160" y1="0" x2="160" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="240" y1="0" x2="240" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-10/12 h-5/6" viewBox="0 0 280 130" fill="none">
          {/* Clinic calendar layout wireframe */}
          <rect x="10" y="10" width="70" height="110" rx="4" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
          <circle cx="25" cy="25" r="5" fill="rgba(244,241,234,0.25)" />
          <line x1="38" y1="22" x2="70" y2="22" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
          <line x1="38" y1="28" x2="60" y2="28" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
          
          <rect x="20" y="42" width="50" height="14" rx="2" stroke="rgba(244,241,234,0.12)" strokeWidth="0.75" />
          <rect x="20" y="62" width="50" height="14" rx="2" stroke="rgba(244,241,234,0.12)" strokeWidth="0.75" />
          <rect x="20" y="82" width="50" height="14" fill="rgba(255,255,255,0.05)" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" />
          
          {/* Live appointment availability waves */}
          <rect x="95" y="10" width="175" height="110" rx="4" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
          <line x1="110" y1="24" x2="180" y2="24" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" />
          
          {/* Scheduling visual blocks */}
          <g className="opacity-70">
            <rect x="110" y="42" width="48" height="30" rx="2" fill="rgba(244,241,234,0.03)" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
            <line x1="115" y1="52" x2="135" y2="52" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" />
            <circle cx="115" cy="62" r="2" fill="#E6E5DE" className="animate-pulse" />
            
            <rect x="164" y="42" width="48" height="30" rx="2" fill="rgba(244,241,234,0.03)" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
            <line x1="169" y1="52" x2="185" y2="52" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" />
            
            <rect x="218" y="42" width="44" height="30" rx="2" fill="rgba(244,241,234,0.03)" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
            
            <rect x="110" y="80" width="75" height="30" rx="2" fill="rgba(244,241,234,0.05)" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
            <line x1="116" y1="90" x2="160" y2="90" stroke="rgba(244,241,234,0.25)" strokeWidth="0.75" />
            
            <rect x="191" y="80" width="71" height="30" rx="2" fill="rgba(244,241,234,0.02)" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
          </g>
        </svg>
      </div>

      <div className="absolute top-2 right-3 font-mono text-[8px] text-muted-foreground/50 tracking-wider">
        REF — CLINICAL TRUST SYSTEM v1.0
      </div>
      <div className="absolute bottom-2 left-3 flex items-center gap-1">
        <Activity className="h-3 w-3 text-platinum/70 animate-pulse" />
        <span className="font-mono text-[8px] text-muted-foreground/60 uppercase tracking-widest">Trust Indexing</span>
      </div>
    </div>
  );
}

function FitnessSchematic() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-xl bg-[#090909] border border-border/40 select-none">
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 text-white/[0.04] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 160" fill="none">
          <line x1="0" y1="40" x2="320" y2="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
          <line x1="0" y1="80" x2="320" y2="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
          <line x1="0" y1="120" x2="320" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
          <line x1="100" y1="0" x2="100" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
          <line x1="200" y1="0" x2="200" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-10/12 h-5/6" viewBox="0 0 280 130" fill="none">
          {/* Conversion rate graph & Schedule elements */}
          <path d="M 15,110 L 60,95 L 105,98 L 150,75 L 195,80 L 240,42 L 265,49" stroke="rgba(244,241,234,0.3)" strokeWidth="1" strokeLinecap="round" />
          {/* Anchor dots */}
          <circle cx="15" cy="110" r="2" fill="#E6E5DE" />
          <circle cx="60" cy="95" r="2" fill="#E6E5DE" />
          <circle cx="105" cy="98" r="2" fill="#E6E5DE" />
          <circle cx="150" cy="75" r="2" fill="#E6E5DE" />
          <circle cx="195" cy="80" r="2" fill="#E6E5DE" />
          <circle cx="240" cy="42" r="3.5" fill="#E6E5DE" />
          
          {/* Area under the growth curve */}
          <path d="M 15,110 L 60,95 L 105,98 L 150,75 L 195,80 L 240,42 L 265,49 L 265,115 L 15,115 Z" fill="rgba(244,241,234,0.02)" />

          {/* conversion funnel representation */}
          <line x1="15" y1="115" x2="265" y2="115" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
          
          {/* Dynamic grid panels mock */}
          <rect x="25" y="15" width="45" height="45" rx="3" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
          <circle cx="47.5" cy="37.5" r="10" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" strokeDasharray="2 2" />
          
          <rect x="80" y="15" width="85" height="45" rx="3" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" fill="rgba(255,255,255,0.01)" />
          <line x1="90" y1="30" x2="140" y2="30" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" />
          <line x1="90" y1="38" x2="125" y2="38" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
          
          <rect x="175" y="15" width="80" height="15" rx="2" fill="rgba(244,241,234,0.04)" stroke="rgba(244,241,234,0.15)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="absolute top-2 right-3 font-mono text-[8px] text-muted-foreground/50 tracking-wider">
        CONVERSION DESIGN SYSTEM
      </div>
      <div className="absolute bottom-2 left-3 flex items-center gap-1">
        <TrendingUp className="h-3 w-3 text-platinum/70" />
        <span className="font-mono text-[8px] text-muted-foreground/60 uppercase tracking-widest">Inquiry Funnel</span>
      </div>
    </div>
  );
}

function RealEstateSchematic() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-xl bg-[#090909] border border-border/40 select-none">
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 text-white/[0.04] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 160" fill="none">
          <circle cx="160" cy="80" r="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 9" />
          <circle cx="160" cy="80" r="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
          <line x1="0" y1="80" x2="320" y2="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" />
          <line x1="160" y1="0" x2="160" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-10/12 h-5/6" viewBox="0 0 280 130" fill="none">
          {/* Premium properties blueprint alignment lines */}
          <rect x="25" y="15" width="90" height="95" rx="3" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
          <line x1="25" y1="75" x2="115" y2="75" stroke="rgba(244,241,234,0.12)" strokeWidth="0.75" />
          <rect x="35" y="27" width="70" height="38" rx="1.5" fill="rgba(244,241,234,0.03)" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />
          
          <line x1="35" y1="83" x2="90" y2="83" stroke="rgba(244,241,234,0.25)" strokeWidth="0.75" />
          <line x1="35" y1="89" x2="70" y2="89" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" />

          {/* 3D structural perspective lines */}
          <line x1="135" y1="15" x2="255" y2="15" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
          <line x1="135" y1="110" x2="255" y2="110" stroke="rgba(244,241,234,0.15)" strokeWidth="0.75" />
          
          <g className="opacity-40">
            <line x1="140" y1="25" x2="250" y2="25" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="140" y1="45" x2="250" y2="45" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="140" y1="65" x2="250" y2="65" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="140" y1="85" x2="250" y2="85" stroke="rgba(244,241,234,0.1)" strokeWidth="0.5" strokeDasharray="2 2" />
          </g>

          {/* Dynamic interactive cursor wireframe */}
          <circle cx="180" cy="50" r="14" stroke="rgba(244,241,234,0.25)" strokeWidth="0.75" />
          <line x1="180" y1="30" x2="180" y2="70" stroke="rgba(244,241,234,0.15)" strokeWidth="0.5" />
          <line x1="160" y1="50" x2="200" y2="50" stroke="rgba(244,241,234,0.15)" strokeWidth="0.5" />
          
          {/* Label boxes */}
          <rect x="205" y="42" width="45" height="16" rx="2" fill="rgba(244,241,234,0.06)" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" />
        </svg>
      </div>

      <div className="absolute top-2 right-3 font-mono text-[8px] text-muted-foreground/50 tracking-wider">
        PERSPECTIVE GRAPHICS ENGINE
      </div>
      <div className="absolute bottom-2 left-3 flex items-center gap-1">
        <MapPin className="h-3 w-3 text-platinum/70" />
        <span className="font-mono text-[8px] text-muted-foreground/60 uppercase tracking-widest">Property Matrix</span>
      </div>
    </div>
  );
}

// =========================================================
// Main Component
// =========================================================

export const Portfolio: React.FC = () => {
  const { navigate } = useAppRouter();

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const processTimeline = [
    {
      stepNum: "01",
      title: "Business Analysis",
      description: "We audit how customers look for services, identify your true positioning bottlenecks, and locate hidden opportunity.",
      icon: Search
    },
    {
      stepNum: "02",
      title: "Strategy Planning",
      description: "We craft a complete layout architecture, information maps, and custom copy focused squarely on converting attention.",
      icon: Compass
    },
    {
      stepNum: "03",
      title: "Website Development",
      description: "We code custom solutions using React, Tailwind CSS, and lightweight architectures to ensure instant load times and pixel-perfect design.",
      icon: Code2
    },
    {
      stepNum: "04",
      title: "Feature Integration",
      description: "We integrate custom systems like live booking engines, client communications, and local databases to make operations seamless.",
      icon: Cpu
    },
    {
      stepNum: "05",
      title: "Launch",
      description: "We handle seamless domain integration, server-side configurations, and full performance scoring so things launch flawlessly.",
      icon: Rocket
    },
    {
      stepNum: "06",
      title: "Client Feedback",
      description: "We gather detailed, transparent reviews to evaluate real usability, design impression, and functional utility.",
      icon: MessageSquare
    },
    {
      stepNum: "07",
      title: "Case Study Publication",
      description: "We document the end-to-end transformation results with total transparency and outline future growth avenues.",
      icon: FileText
    }
  ];

  return (
    <div id="portfolio-page" className="w-full">
      
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32 lg:py-36">
        {/* Background Drawing Ring */}
        <div className="pointer-events-none absolute left-1/2 top-[55%] -z-10 -translate-x-1/2 -translate-y-1/2 opacity-90">
          <Ring size={700} progress={0.5} completeOnView={true} />
        </div>

        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-4 py-1.5 selection:bg-foreground selection:text-background">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-platinum opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-platinum"></span>
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-foreground/80 font-semibold leading-none">
                Ongoing Blueprint Series
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-display mt-8 text-balance text-[clamp(2.5rem,7.5vw,5.25rem)] leading-[0.98] text-foreground text-glow-strong">
              Portfolio In Progress
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-8 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              We are currently building and documenting business transformations that will soon become part of the CodeFuser portfolio.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <p className="font-display mx-auto mt-6 max-w-xl text-balance text-sm leading-snug text-foreground/75 sm:text-base">
              Every project will include detailed breakdowns, business goals, implementation decisions, and transformation outcomes.
            </p>
          </Reveal>

          <Reveal delay={350} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button onClick={() => handleScrollToSection("why-exists")}>
              Explore Upcoming Case Studies
            </Button>
            <Button 
              onClick={() => {
                navigate('/strategy-session');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              variant="ghost"
              className="cursor-pointer"
            >
              Start Strategic Session
            </Button>
          </Reveal>
        </div>
      </section>

      {/* SECTION 2: WHY THIS PAGE EXISTS */}
      <section id="why-exists" className="relative overflow-hidden px-5 py-24 sm:px-8 border-t border-border/40 bg-black/40">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
            
            <Reveal>
              <Eyebrow>01 — Our Philosophy</Eyebrow>
              <h2 className="font-display mt-6 text-balance text-3.5xl leading-[1.05] text-foreground text-glow sm:text-4.5xl">
                Building Proof Through Real Work
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Rather than filling this page with generic examples, CodeFuser is focused on creating real business transformations that can be documented with complete transparency.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                We believe premium agencies must prove their worth by demonstrating actual development steps, strategic choices, and clear, unfiltered outcomes.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div className="rounded-2xl border border-border bg-card/25 p-7 sm:p-8 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                  <Briefcase className="h-28 w-28 text-[#F4F1EA]" />
                </div>
                
                <h3 className="font-display text-lg text-foreground font-semibold mb-6">
                  Future Case Studies Will Showcase:
                </h3>
                
                <ul className="space-y-4">
                  {[
                    "Business Goals",
                    "Website Strategy",
                    "Before & After Comparisons",
                    "Feature Implementation",
                    "Growth Opportunities",
                    "Client Feedback",
                    "Final Outcomes"
                  ].map((item, index) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-platinum/10 text-platinum">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-sm font-medium tracking-wide text-foreground/90">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* SECTION 3: UPCOMING CASE STUDIES */}
      <section id="upcoming-case-studies" className="relative overflow-hidden px-5 py-28 lg:py-32 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader 
            eyebrow="02 — In Development" 
            title="Upcoming Concepts" 
            description="A preview of the responsive web solutions we are designing, crafting, and building from scratch right now."
          />

          <div className="mx-auto mt-14 sm:mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
            
            {/* Card 1 */}
            <Reveal delay={100}>
              <article className="group h-full flex flex-col justify-between rounded-2xl border border-border bg-card/30 p-6 sm:p-7 transition-all duration-300 hover:border-foreground/20 hover:bg-card/50">
                <div>
                  <ClinicSchematic />
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-platinum uppercase bg-platinum/10 px-2 py-0.5 rounded">
                      In Development
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/60">
                      Concept #01
                    </span>
                  </div>

                  <h3 className="font-display mt-4 text-xl text-foreground font-semibold">
                    Clinic Website Concept
                  </h3>
                  
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    A modern healthcare website concept focused on trust, appointment booking, mobile accessibility, and patient communication.
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-border/50">
                  <span className="inline-flex w-full items-center justify-center gap-1 bg-border/30 text-muted-foreground/80 font-medium text-xs py-2 px-4 rounded-full select-none cursor-not-allowed">
                    Preview Coming Soon
                  </span>
                </div>
              </article>
            </Reveal>

            {/* Card 2 */}
            <Reveal delay={180}>
              <article className="group h-full flex flex-col justify-between rounded-2xl border border-border bg-card/30 p-6 sm:p-7 transition-all duration-300 hover:border-foreground/20 hover:bg-card/50">
                <div>
                  <FitnessSchematic />

                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-platinum uppercase bg-platinum/10 px-2 py-0.5 rounded">
                      In Development
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/60">
                      Concept #02
                    </span>
                  </div>

                  <h3 className="font-display mt-4 text-xl text-foreground font-semibold">
                    Fitness Studio Concept
                  </h3>
                  
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    A conversion-focused fitness website designed to increase inquiries, showcase services, and improve online credibility.
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-border/50">
                  <span className="inline-flex w-full items-center justify-center gap-1 bg-border/30 text-muted-foreground/80 font-medium text-xs py-2 px-4 rounded-full select-none cursor-not-allowed">
                    Preview Coming Soon
                  </span>
                </div>
              </article>
            </Reveal>

            {/* Card 3 */}
            <Reveal delay={260}>
              <article className="group h-full flex flex-col justify-between rounded-2xl border border-border bg-card/30 p-6 sm:p-7 transition-all duration-300 hover:border-foreground/20 hover:bg-card/50">
                <div>
                  <RealEstateSchematic />

                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-platinum uppercase bg-platinum/10 px-2 py-0.5 rounded">
                      In Development
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/60">
                      Concept #03
                    </span>
                  </div>

                  <h3 className="font-display mt-4 text-xl text-foreground font-semibold">
                    Real Estate Concept
                  </h3>
                  
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    A premium real estate website concept focused on property presentation, lead generation, and customer trust.
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-border/50">
                  <span className="inline-flex w-full items-center justify-center gap-1 bg-border/30 text-muted-foreground/80 font-medium text-xs py-2 px-4 rounded-full select-none cursor-not-allowed">
                    Preview Coming Soon
                  </span>
                </div>
              </article>
            </Reveal>

          </div>
        </div>
      </section>

      {/* SECTION 4: FUTURE DOCUMENTATION PROCESS */}
      <section id="documentation-process" className="relative overflow-hidden px-5 py-24 sm:px-8 border-t border-border/40 bg-black/30">
        <div className="mx-auto max-w-5xl">
          <SectionHeader 
            eyebrow="03 — Our Methodology" 
            title="How Projects Will Be Documented" 
            description="We track every milestone from the first exploratory calls to final quantitative outcomes, showing exactly how value is fused."
          />

          <div className="mx-auto mt-16 max-w-3xl relative">
            {/* Elegant vertical wire timeline trace */}
            <div 
              aria-hidden="true" 
              className="absolute left-6 top-6 bottom-6 w-px"
              style={{ 
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.15) 10%, rgba(255,255,255,0.15) 90%, transparent)"
              }}
            />

            <ol className="space-y-12">
              {processTimeline.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Reveal key={step.stepNum} delay={index * 65} as="li" className="relative pl-14 sm:pl-16">
                    {/* Floating circular icon trace */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-background shadow-glow-soft">
                      <IconComponent className="h-5 w-5 text-platinum" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-border/40 pb-5">
                      <div>
                        <span className="font-mono text-xs text-muted-foreground/50 mr-2 uppercase tracking-widest font-semibold">
                          Step {step.stepNum}
                        </span>
                        <h3 className="font-display inline-block text-lg text-foreground font-semibold">
                          {step.title}
                        </h3>
                        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* SECTION 5: CODEFUSER COMMITMENT */}
      <section id="commitment" className="relative overflow-hidden px-5 py-24 sm:px-8 bg-black">
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <Shield className="h-96 w-96 text-[#F4F1EA]" />
        </div>

        <div className="mx-auto max-w-3xl text-center relative z-10">
          <Reveal>
            <Eyebrow>04 — The Commitment</Eyebrow>
            
            <h2 className="font-display mt-6 text-balance text-3xl font-semibold leading-[1.1] text-foreground sm:text-4xl">
              Quality Before Quantity
            </h2>
            
            <blockquote className="font-display mt-8 text-lg font-medium italic text-foreground/80 leading-relaxed max-w-2xl mx-auto selection:bg-foreground selection:text-background">
              “CodeFuser believes trust is earned through results, not promises.”
            </blockquote>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-xl mx-auto">
              Every future project published in this portfolio will be documented with transparency, clear objectives, and measurable outcomes whenever available. No hyperbole, no fabricated numbers. Just rigorous business engineering.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="relative overflow-hidden px-5 py-32 sm:py-36 sm:px-8 border-t border-border/40 bg-[#060606]">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
          <Ring size={680} progress={0.55} completeOnView={true} />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <Eyebrow>05 — Next Step</Eyebrow>
            
            <h1 className="font-display mt-8 text-balance text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.0] text-foreground text-glow-strong">
              Your Business Could Become<br />
              <span className="text-platinum">The Next Case Study.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Start a strategic session and discover how CodeFuser can help remove the barriers holding your business back.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button 
                onClick={() => {
                  navigate('/strategy-session');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cursor-pointer"
              >
                Start Strategic Session
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost">
                Return Home <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

export default Portfolio;
