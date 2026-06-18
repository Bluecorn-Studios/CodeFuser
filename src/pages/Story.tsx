import React from 'react';
import { R as Reveal, E as Eyebrow } from '../components/Reveal';
import { FinalCta } from '../components/FinalCta';
import { ArrowUp, Star, Lock, Activity, ShieldCheck } from 'lucide-react';

// =========================================================
// Custom Visual Motif: The Invisible Ceiling Technical Blueprint
// =========================================================
function InvisibleCeilingMotif() {
  return (
    <div className="relative mx-auto w-full max-w-2xl h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-[#090909]/85 border border-border/40 select-none backdrop-blur-md shadow-2xl">
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 text-white/[0.03] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 160" fill="none">
          <line x1="0" y1="40" x2="320" y2="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="0" y1="80" x2="320" y2="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="0" y1="120" x2="320" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="160" y1="0" x2="160" y2="160" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-11/12 h-5/6" viewBox="0 0 280 140" fill="none">
          {/* Ceiling line (solid, sharp, horizontal) representing the ceiling barrier */}
          <line x1="20" y1="52" x2="260" y2="52" stroke="rgba(244,241,234,0.45)" strokeWidth="1" />
          <line x1="20" y1="52" x2="260" y2="52" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="5 15" className="opacity-90" />
          
          {/* Label indicating 'The Ceiling (Visibility Boundary)' */}
          <text x="140" y="42" fill="rgba(244,241,234,0.55)" fontSize="6.5" fontFamily="monospace" letterSpacing="0.25em" textAnchor="middle" className="uppercase font-bold">
            The Invisible Ceiling (Visibility Boundary)
          </text>
          
          {/* Vertical Rising lines representing potential trying to break through */}
          <g>
            {/* Standard potential: blocked path */}
            <line x1="55" y1="115" x2="55" y2="52" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" strokeDasharray="1 3" />
            <circle cx="55" cy="52" r="3" fill="#6E6D66" className="opacity-80" />
            <text x="55" y="125" fill="rgba(244,241,234,0.3)" fontSize="6" fontFamily="monospace" textAnchor="middle" letterSpacing="0.05em">STANDARD CAPACITY</text>

            {/* Fused growth: breaks through with CodeFuser */}
            {/* The rising golden beam */}
            <line x1="140" y1="115" x2="140" y2="52" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="140" y1="52" x2="140" y2="20" stroke="#FFFFFF" strokeWidth="1.25" strokeDasharray="2 3" className="animate-pulse" />
            
            {/* Interactive Fused Node */}
            <circle cx="140" cy="52" r="5" fill="#0A0A09" stroke="#E6E5DE" strokeWidth="0.75" />
            <circle cx="140" cy="20" r="3" fill="#E6E5DE" />
            <path d="M 137,20 L 143,20 M 140,17 L 140,23" stroke="#FFFFFF" strokeWidth="0.5" />
            
            <text x="140" y="125" fill="#FFFFFF" fontSize="6.5" fontFamily="monospace" textAnchor="middle" className="tracking-widest font-bold">FUSED ESCAPE VECTOR</text>

            {/* Limited potential path */}
            <line x1="225" y1="115" x2="225" y2="52" stroke="rgba(244,241,234,0.2)" strokeWidth="0.75" strokeDasharray="1 3" />
            <circle cx="225" cy="52" r="3" fill="#6E6D66" className="opacity-80" />
            <text x="225" y="125" fill="rgba(244,241,234,0.3)" fontSize="6" fontFamily="monospace" textAnchor="middle" letterSpacing="0.05em">UNSEEN VALUATION</text>
          </g>
        </svg>
      </div>

      <div className="absolute top-2.5 left-3 font-mono text-[8px] text-muted-foreground/40 tracking-widest font-bold">
        MODEL — SYSTEMIC BREAKTHROUGH ESCAPEMENT
      </div>
      <div className="absolute bottom-2.5 right-3 flex items-center gap-1 bg-[#1C1C1B]/60 px-2 py-0.5 rounded border border-white/[0.05]">
        <span className="inline-block h-1 w-1 rounded-full bg-platinum animate-pulse" />
        <span className="font-mono text-[7.5px] text-[#E6E5DE] uppercase tracking-widest font-semibold">Active State</span>
      </div>
    </div>
  );
}

function FounderStoryDetail() {
  return (
    <section className="relative px-5 py-24 sm:px-8 sm:py-32 overflow-hidden">
      {/* Subtle outer geometric vertical line markers to integrate empty space beautifully */}
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border/15 to-transparent pointer-events-none hidden xl:block" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border/15 to-transparent pointer-events-none hidden xl:block" />

      <div className="mx-auto max-w-7xl">
        
        {/* =========================================================
            TOP LAYER: Intro Dual-Column editorial Grid
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Eyebrow + Redesigned Display Header (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <Reveal>
              <Eyebrow>Founder Story</Eyebrow>
              <h1 className="font-display mt-6 text-4xl text-foreground sm:text-5xl lg:text-5.5xl font-semibold leading-[1.05] tracking-tight text-glow">
                Why I Started<br />
                <span className="text-platinum">CodeFuser</span>
              </h1>
              <div className="mt-8 h-px w-20 bg-platinum/30" />
            </Reveal>
            
            <Reveal delay={120} className="hidden lg:block">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/50 font-bold font-mono">
                A personal commentary on growth, visibility thresholds, and removing systemic barriers.
              </p>
            </Reveal>
          </div>

          {/* Right Column: Narrative Paragraphs (Spacious Reading Column) */}
          <div className="lg:col-span-7 space-y-8 text-base sm:text-lg leading-relaxed text-foreground/80 font-sans selection:bg-foreground selection:text-background">
            <Reveal delay={50}>
              <p className="font-medium text-foreground text-glow-soft text-xl sm:text-2xl leading-snug tracking-tight">
                I became obsessed with a simple question.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <p>
                Why do some businesses with skill, experience, loyal customers, and years of hard work remain the same size year after year?
              </p>
            </Reveal>

            <Reveal delay={150}>
              <p>
                The answer wasn't quality. The answer wasn't pricing. The answer wasn't effort. Most local businesses already have those things. They know their craft, serve their customers, and work hard every day.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <p className="font-medium text-foreground">
                Yet something was still holding them back.
              </p>
            </Reveal>

            <Reveal delay={250}>
              <p>
                I started noticing a pattern. Businesses weren't struggling because they lacked potential. They were struggling because people couldn't discover them, trust them, or choose them easily online. Every day, potential customers were making decisions before ever starting a conversation. They searched, compared, judged, and chose. Most of those decisions happened silently, long before a phone call, long before a visit, and long before an opportunity even existed.
              </p>
            </Reveal>
          </div>
        </div>

        {/* =========================================================
            MIDDLE LAYER: Immersive Full-Width Visual Banner Section
            ========================================================= */}
        <div className="my-20 py-12 border-y border-border/30 bg-card/15 rounded-3xl relative overflow-hidden px-6 lg:px-12 backdrop-blur-sm">
          {/* Warm background gradient glow bubble */}
          <div className="absolute -left-36 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-platinum/5 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Quotes/The concept */}
            <div className="lg:col-span-6 space-y-4">
              <Reveal delay={300}>
                <figure className="relative py-4 pr-4">
                  <span 
                    aria-hidden="true" 
                    className="font-display absolute -left-4 -top-6 select-none text-[8rem] leading-none text-foreground/5 pointer-events-none"
                  >
                    “
                  </span>
                  <blockquote className="font-display text-balance text-2.5xl leading-[1.25] text-foreground sm:text-3.5xl font-semibold tracking-tight">
                    That was the<br />
                    <span className="text-glow-strong text-platinum">invisible ceiling.</span>
                  </blockquote>
                  <p className="text-muted-foreground font-normal text-base sm:text-lg mt-4 max-w-md leading-relaxed">
                    Not a lack of skill. Not a lack of hard work. Not a lack of ambition.
                  </p>
                  <div className="flex items-center gap-2 mt-4 font-mono text-xs uppercase tracking-widest text-[#E6E5DE] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-platinum animate-pulse" />
                    A lack of visibility.
                  </div>
                </figure>
              </Reveal>
            </div>

            {/* Symmetrical technical motif on the right side of the banner */}
            <div className="lg:col-span-6 w-full">
              <Reveal delay={350}>
                <InvisibleCeilingMotif />
              </Reveal>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM LAYER: Dynamic Resolution Split layout
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Refined, Unified Signature Card Wrapper */}
          <div className="lg:col-span-5 lg:sticky lg:top-[420px] space-y-6">
            <Reveal delay={600} className="w-full">
              <div className="rounded-2xl border border-border/40 bg-card/25 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden group hover:border-[#F4F1EA]/25 transition-all duration-300 shadow-xl">
                {/* Visual solid left accent line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-platinum/40" />
                
                <h4 className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 font-bold mb-6 block">
                  AUTHORIZATION RECORD
                </h4>
                
                <div className="flex items-center gap-5">
                  {/* Rounded initials container */}
                  <div className="h-14 w-14 shrink-0 rounded-full border border-border/80 bg-card/60 flex items-center justify-center shadow-inner group-hover:border-[#E6E5DE]/40 transition-colors duration-300">
                    <span className="font-display font-bold text-base tracking-widest text-[#E6E5DE] uppercase">DJ</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground tracking-wide text-glow-soft">
                      David Jonathan
                    </h3>
                    <p className="font-mono text-[11px] text-[#E6E5DE] uppercase tracking-widest font-semibold mt-1">
                      Founder, CodeFuser
                    </p>
                  </div>
                </div>

                {/* Elegant Full Span internal divider inside the card */}
                <div className="mt-6 pt-5 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-muted-foreground/40">
                  <span>FUSE COSYSTEM v1.02</span>
                  <span className="flex items-center gap-1.5 text-platinum">
                    <span className="h-1 w-1 bg-platinum rounded-full animate-pulse" />
                    VERIFIED
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Resolution Paragraphs */}
          <div className="lg:col-span-7 space-y-8 text-base sm:text-lg leading-relaxed text-foreground/80 font-sans selection:bg-foreground selection:text-background">
            <Reveal delay={400}>
              <p>
                Many businesses reach a point where growth becomes predictable. The same customers. The same inquiries. The same monthly revenue. Not because they have reached their true potential, but because they have reached the limits of their visibility.
              </p>
            </Reveal>

            <Reveal delay={450}>
              <p>
                I realized that a website doesn't magically create success. What it does is remove barriers. It helps businesses become easier to discover, easier to trust, and easier to choose when customers are making decisions.
              </p>
            </Reveal>

            <Reveal delay={500}>
              <p className="font-medium text-foreground text-glow-soft">
                That realization became the foundation of CodeFuser.
              </p>
            </Reveal>

            <Reveal delay={550}>
              <p>
                CodeFuser exists to help businesses break through that invisible ceiling, strengthen their online presence, build trust, and create opportunities for growth. Because great businesses deserve more than simply maintaining their position. They deserve the opportunity to reach the next level.
              </p>
            </Reveal>
          </div>

        </div>

      </div>
    </section>
  );
}

export const Story: React.FC = () => {
  return (
    <div className="pt-12">
      <FounderStoryDetail />
      <FinalCta />
    </div>
  );
};

export default Story;
