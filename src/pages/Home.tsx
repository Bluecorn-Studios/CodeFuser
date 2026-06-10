import React from 'react';
import { R as Reveal, E as Eyebrow, G as Button, s as scrollToSection, b as getMailtoLink, cn } from '../components/Reveal';
import { Ring } from '../components/FinalCta';
import { Pricing } from '../components/Pricing';
import { Faq } from '../components/Faq';
import { FinalCta } from '../components/FinalCta';
import { FAQItem, IndustryItem, ProcessStep } from '../types';

// ==========================================
// SECTION 01: HERO SECTION
// ==========================================
function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-40 pt-32 sm:px-8 sm:pt-40 lg:pt-48">
      {/* Background Drawing Ring */}
      <div className="pointer-events-none absolute left-1/2 top-[58%] -z-10 -translate-x-1/2 -translate-y-1/2 opacity-90">
        <Ring size={780} progress={0.55} />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <Reveal>
          <Eyebrow>The Invisible Ceiling</Eyebrow>
        </Reveal>
        
        <Reveal delay={100}>
          <h1 className="font-display mt-10 text-balance text-[clamp(2.75rem,8.5vw,5.75rem)] leading-[0.98] text-foreground text-glow-strong">
            Your Business Isn't Small.<br />
            <span className="text-platinum">Its Visibility Is.</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-10 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The businesses getting chosen are not always the best.<br className="hidden sm:inline" />
            They're often the easiest to notice.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <p className="font-display mt-16 max-w-xl text-balance text-xl leading-snug text-foreground/75 sm:text-2xl">
            The ceiling you can't see<br />
            is the one limiting your growth.
          </p>
        </Reveal>

        <Reveal delay={400} className="mt-14 flex flex-col items-center gap-3 sm:flex-row">
          <Button onClick={() => scrollToSection("pricing")}>
            See Growth Capacity
          </Button>
          <Button as="a" href={getMailtoLink()} variant="ghost">
            Book Strategy Session
          </Button>
        </Reveal>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}

// ==========================================
// SECTION 02: THE INVISIBLE CEILING
// ==========================================
function CeilingSection() {
  return (
    <section className="relative overflow-hidden px-5 py-40 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-20 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <Eyebrow>02 — The Invisible Ceiling</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow">
            The Ceiling You Can't See<br />
            <span className="text-platinum">Is The One Limiting Your Growth.</span>
          </h2>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Most businesses do not lose because they lack skill.
          </p>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
            They lose because potential customers never see the value that already exists.
          </p>
        </Reveal>

        <Reveal delay={150} className="flex justify-center">
          <div className="relative">
            <Ring size={460} progress={0.42} completeOnView={true} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-eyebrow opacity-60">Unseen Opportunity</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ==========================================
// SECTION 03: THE SILENT DECISION
// ==========================================
const Slogans = ["Compared.", "Researched.", "Considered.", "Chosen."];

function SilentDecisionSection() {
  return (
    <section className="relative overflow-hidden px-5 py-40 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Eyebrow>03 — The Silent Decision</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow">
            While You're Serving Customers,<br />
            <span className="text-platinum">Someone Else Is Being Chosen.</span>
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>Every day, potential customers compare businesses online.</p>
          <p>Most never tell you why they chose someone else.</p>
          <p>They simply disappear.</p>
        </Reveal>

        <div className="mt-24 space-y-2 sm:space-y-4">
          {Slogans.map((term, i) => (
            <Reveal key={term} delay={i * 180}>
              <p 
                className="font-display text-[clamp(2.5rem,10.5vw,7.5rem)] leading-[0.95] text-foreground/85 text-glow-strong"
                style={{ paddingLeft: `${i * 6}%`, opacity: 1 - i * 0.08 }}
              >
                {term}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300} className="mt-24">
          <p className="font-display max-w-2xl text-balance text-2xl leading-snug text-foreground/80 sm:text-3xl">
            The decision is often made<br />
            <span className="text-platinum">before the first conversation begins.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ==========================================
// SECTION 04: THE GROWTH ENGINE
// ==========================================
const engineSteps = [
  { label: "Visibility", angle: -90 },
  { label: "Attention", angle: -30 },
  { label: "Trust", angle: 30 },
  { label: "Leads", angle: 90 },
  { label: "Growth", angle: 210 }
];

function GrowthEngineSection() {
  return (
    <section className="relative overflow-hidden px-5 py-40 sm:px-8 bg-black">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <Eyebrow>04 — The Growth Engine</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow">
            Growth Doesn't Start With Sales.<br />
            <span className="text-platinum">It Starts With Attention.</span>
          </h2>
        </Reveal>

        <Reveal delay={120} className="mx-auto mt-8 max-w-2xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Visibility creates attention. Attention creates trust. Trust creates leads. Leads create growth. Growth creates more visibility.
            <span className="text-foreground/85"> The system compounds.</span>
          </p>
        </Reveal>
      </div>

      <Reveal delay={200} className="mx-auto mt-20 flex justify-center">
        <div className="relative" style={{ width: 560, height: 560, maxWidth: "92vw" }}>
          <svg viewBox="0 0 560 560" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id="engine-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <linearGradient id="engine-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(244,241,234,0.5)" />
                <stop offset="100%" stopColor="rgba(244,241,234,0.15)" />
              </linearGradient>
            </defs>

            {/* Inner background glow */}
            <circle cx={280} cy={280} r={240} fill="url(#engine-glow)" />

            {/* Main connecting circular boundary */}
            <circle 
              cx={280} 
              cy={280} 
              r={220} 
              fill="none" 
              stroke="url(#engine-stroke)" 
              strokeWidth={1} 
              style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.15))" }}
            />

            {/* Animated revolving micro dot */}
            <circle r="3" fill="#F4F1EA">
              <animateMotion
                dur="9s"
                repeatCount="indefinite"
                path="M 500,280 A 220,220 0 1 1 60,280 A 220,220 0 1 1 500,280"
              />
            </circle>

            {/* Ring milestone indicators */}
            {engineSteps.map(step => {
              const rad = (step.angle * Math.PI) / 180;
              const cx = 280 + 220 * Math.cos(rad);
              const cy = 280 + 220 * Math.sin(rad);

              return (
                <g key={step.label}>
                  <circle cx={cx} cy={cy} r={4} fill="#F4F1EA" />
                  <circle cx={cx} cy={cy} r={10} fill="none" stroke="rgba(244,241,234,0.25)" strokeWidth={1} />
                </g>
              );
            })}
          </svg>

          {/* Positioning HTML labels on the circle boundary */}
          {engineSteps.map(step => {
            const rad = (step.angle * Math.PI) / 180;
            // Map labels at slightly larger radius (262px) from circle center (50%, 50%)
            const left = 50 + (262 / 560) * 100 * Math.cos(rad);
            const top = 50 + (262 / 560) * 100 * Math.sin(rad);

            return (
              <span
                key={step.label}
                className="font-display absolute -translate-x-1/2 -translate-y-1/2 text-sm tracking-wide text-foreground/85 sm:text-base font-medium"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {step.label}
              </span>
            );
          })}

          {/* Center Title Card */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-eyebrow">CodeFuser</p>
            <p className="font-display mt-2 text-xl text-foreground text-glow sm:text-2xl font-semibold">
              Growth Engine
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={300} className="mx-auto mt-24 max-w-2xl text-center">
        <p className="font-display text-balance text-2xl leading-snug text-foreground/80 sm:text-3xl">
          The fastest-growing businesses don't rely on luck.<br />
          <span className="text-platinum">They rely on systems.</span>
        </p>
      </Reveal>
    </section>
  );
}

// ==========================================
// SECTION 06: THE FUSION METHOD™
// ==========================================
const fusionMethodSteps: ProcessStep[] = [
  { n: "01", title: "Discover", body: "Understand business, audience and positioning." },
  { n: "02", title: "Build", body: "Create a website engineered for trust." },
  { n: "03", title: "Connect", body: "Fuse messaging, systems and lead flow." },
  { n: "04", title: "Activate", body: "Launch and optimize." },
  { n: "05", title: "Compound", body: "Turn visibility into long-term growth." }
];

function FusionMethodSection() {
  return (
    <section className="relative overflow-hidden px-5 py-40 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Eyebrow>06 — The Fusion Method™</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow">
            Growth Becomes Predictable<br />
            <span className="text-platinum">When The System Is Connected.</span>
          </h2>
        </Reveal>

        <ol className="relative mt-20">
          {/* Vertical Track gold wire */}
          <span 
            aria-hidden="true" 
            className="absolute left-[2.75rem] top-2 h-[calc(100%-4rem)] w-px sm:left-[3.5rem]" 
            style={{ 
              background: "linear-gradient(to bottom, transparent, rgba(244,241,234,0.3) 15%, rgba(244,241,234,0.3) 85%, transparent)", 
              boxShadow: "0 0 12px rgba(255,255,255,0.12)" 
            }} 
          />

          {fusionMethodSteps.map((step, index) => (
            <Reveal 
              key={step.n} 
              delay={index * 100}
              as="li"
              className="relative grid grid-cols-[5rem_1fr] gap-6 pb-14 sm:grid-cols-[6.5rem_1fr] sm:gap-10"
            >
              <div className="relative flex justify-center">
                <span className="font-display text-4xl text-foreground/85 text-glow sm:text-5xl font-bold">
                  {step.n}
                </span>
              </div>
              <div className="pt-2">
                <h3 className="font-display text-2xl text-foreground sm:text-3xl font-medium">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={200} className="mt-8 max-w-2xl">
          <p className="text-lg leading-relaxed text-foreground/80">
            Disconnected tools create friction.<br />
            <span className="text-platinum">Connected systems create momentum.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ==========================================
// SECTION 07: WHY CODEFUSER CONNECTIVITY
// ==========================================
const networkNodes = [
  { x: 12, y: 22 },
  { x: 80, y: 18 },
  { x: 38, y: 52 },
  { x: 70, y: 62 },
  { x: 22, y: 78 },
  { x: 88, y: 80 }
];
const networkEdges = [
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
  [1, 3]
];

function WhyCodeFuserSection() {
  return (
    <section className="relative overflow-hidden px-5 py-40 sm:px-8 bg-black">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>07 — Why CodeFuser</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow/90">
            Most Agencies Build Websites.<br />
            <span className="text-platinum">We Build Growth Infrastructure.</span>
          </h2>
          <div className="mt-10 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>A website alone is not a system.</p>
            <p>Traffic alone is not a strategy.</p>
            <p>Leads alone are not growth.</p>
            <p className="text-foreground/85">Everything must work together.</p>
          </div>
          <p className="font-display mt-12 max-w-md text-balance text-xl leading-snug text-foreground/80 sm:text-2xl">
            The strongest businesses aren't built from more effort.<br />
            <span className="text-platinum">They're built from better connections.</span>
          </p>
        </Reveal>

        <Reveal delay={150} className="relative aspect-square w-full">
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <linearGradient id="fuse-line" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(244,241,234,0.55)" />
                <stop offset="100%" stopColor="rgba(244,241,234,0.05)" />
              </linearGradient>
            </defs>

            {/* Connecting lines edges with stroke animations */}
            {networkEdges.map(([i, x], lIndex) => {
              const nodeA = networkNodes[i];
              const nodeB = networkNodes[x];

              return (
                <line 
                  key={lIndex}
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke="url(#fuse-line)"
                  strokeWidth={0.2}
                  strokeDasharray={60}
                  strokeDashoffset={60}
                  style={{
                    animation: `ring-draw 1.4s cubic-bezier(0.22,1,0.36,1) ${0.4 + lIndex * 0.18}s forwards`,
                    "--ring-final": "0"
                  } as React.CSSProperties}
                />
              );
            })}

            {/* Node indicators with pulsing effects */}
            {networkNodes.map((node, iIndex) => (
              <g key={iIndex}>
                <circle cx={node.x} cy={node.y} r={2.4} fill="rgba(244,241,234,0.15)" />
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={1} 
                  fill="#F4F1EA" 
                  className="animate-pulse-soft"
                  style={{ animationDelay: `${iIndex * 0.4}s` }}
                />
              </g>
            ))}
          </svg>
        </Reveal>
      </div>
    </section>
  );
}

// ==========================================
// SECTION 08: TARGET INDUSTRIES
// ==========================================
const targetIndustries: IndustryItem[] = [
  { title: "Photography Studios", outcome: "Turn portfolios into bookings before the first conversation begins." },
  { title: "Coaching Centers", outcome: "Become the obvious choice for parents researching their options." },
  { title: "Clinics", outcome: "Earn trust online so patients arrive already confident in your care." },
  { title: "Real Estate", outcome: "Capture serious buyers who decide long before they ever call you." },
  { title: "Gyms", outcome: "Convert hesitant first-time visitors into committed long-term members." },
  { title: "Local Brands", outcome: "Look bigger than your competitors without behaving like one of them." }
];

function IndustriesSection() {
  return (
    <section className="relative overflow-hidden px-5 py-40 sm:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <Eyebrow>08 — Industries</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow">
            Built For Businesses<br />
            <span className="text-platinum">That Deserve To Be Seen.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Great businesses stay invisible every day. Not because they're bad. Because they're overlooked.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {targetIndustries.map((item, i) => (
          <Reveal key={item.title} delay={i * 60}>
            <article className="group relative h-full bg-background p-8 transition-colors duration-500 hover:bg-card/40">
              <p className="text-eyebrow">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display mt-6 text-2xl text-foreground sm:text-3xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {item.outcome}
              </p>
              <span 
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 origin-left hairline transition-transform duration-700 group-hover:scale-x-100" 
                aria-hidden="true" 
              />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// SECTION 09: PROCESS STAGES / RESULTS
// ==========================================
const stages = ["Invisible", "Trusted", "Chosen", "Growing"];

function ResultsSection() {
  return (
    <section className="relative overflow-hidden px-5 py-40 sm:px-8 bg-black">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Eyebrow>09 — Results</Eyebrow>
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-foreground text-glow">
            Before Visibility,<br />
            There Is Friction.<br />
            <span className="text-platinum">After Visibility, There Is Momentum.</span>
          </h2>
        </Reveal>

        <Reveal delay={150} className="mt-20">
          <div className="relative">
            {/* Horizontal timeline segment */}
            <span 
              aria-hidden="true" 
              className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 sm:block" 
              style={{ 
                background: "linear-gradient(to right, transparent, rgba(244,241,234,0.4), rgba(244,241,234,0.4), transparent)", 
                boxShadow: "0 0 10px rgba(255,255,255,0.12)" 
              }} 
            />

            <ol className="grid gap-8 sm:grid-cols-4">
              {stages.map((stage, i) => (
                <li key={stage} className="relative flex flex-col items-center text-center">
                  <span className="relative z-10 mb-6 inline-flex h-3 w-3 items-center justify-center rounded-full bg-foreground shadow-glow">
                    <span className="absolute h-7 w-7 rounded-full border border-foreground/20" />
                  </span>
                  
                  <p className="text-eyebrow">
                    Stage {String(i + 1).padStart(2, "0")}
                  </p>
                  
                  <p className="font-display mt-3 text-3xl text-foreground sm:text-4xl text-glow font-bold">
                    {stage}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={250} className="mx-auto mt-24 max-w-2xl text-center">
          <p className="font-display text-balance text-xl leading-snug text-foreground/80 sm:text-2xl font-semibold">
            The difference between being ignored<br />
            <span className="text-platinum">and being chosen is often smaller than people think.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ==========================================
// EXPOSED COMPONENT BUNDLING HOMEPAGE
// ==========================================
export const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <CeilingSection />
      <SilentDecisionSection />
      <GrowthEngineSection />
      <Pricing />
      <FusionMethodSection />
      <WhyCodeFuserSection />
      <IndustriesSection />
      <ResultsSection />
      <Faq />
      <FinalCta />
    </>
  );
};

export default Home;
