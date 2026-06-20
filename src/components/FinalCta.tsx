import React, { useRef, useEffect, useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink, w as getWhatsAppLink, cn, useAppRouter, s as scrollToSection } from './Reveal';

interface RingProps {
  size?: number;
  stroke?: number;
  progress?: number;
  completeOnView?: boolean;
  className?: string;
}

export const Ring: React.FC<RingProps> = ({
  size = 520,
  stroke = 1,
  progress = 0.62,
  completeOnView = false,
  className
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!completeOnView || !ref.current) {
      setComplete(true);
      return;
    }

    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setComplete(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [completeOnView]);

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("block", className)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ring-soft" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="rgba(255,255,255,0.0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
        </radialGradient>
        <linearGradient id="ring-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(244,241,234,0.9)" />
          <stop offset="50%" stopColor="rgba(244,241,234,0.4)" />
          <stop offset="100%" stopColor="rgba(244,241,234,0.05)" />
        </linearGradient>
      </defs>
      
      {/* Ambient background glow ring */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="url(#ring-soft)" />
      
      {/* Animated stroke-drawing ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ring-stroke)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={complete ? 0 : dashOffset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          transition: "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
          filter: "drop-shadow(0 0 8px rgba(255,255,255,0.15))"
        }}
      />
    </svg>
  );
};

export const FinalCta: React.FC = () => {
  const { currentPath, navigate } = useAppRouter();
  return (
    <section className="relative overflow-hidden px-5 py-32 sm:py-36 sm:px-8">
      {/* Centered drawing ring */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
        <Ring size={680} progress={0.55} completeOnView={true} />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <Eyebrow>11 — Final Step</Eyebrow>
          
          <h2 className="font-display mt-8 text-balance text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.0] text-foreground text-glow-strong">
            Ready To Break<br />
            <span className="text-platinum">The Invisible Ceiling?</span>
          </h2>

          <div className="mx-auto mt-8 max-w-xl space-y-2 text-base text-muted-foreground leading-relaxed">
            <p>The opportunity already exists.</p>
            <p>The question is whether people can see it.</p>
          </div>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-2 max-w-3xl mx-auto">
            {/* Card 1: Strategy Session */}
            <div className="relative group p-6 rounded-2xl bg-[#050505]/60 border border-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-neutral-800/80 hover:bg-[#070707] transition-all duration-300 flex flex-col justify-between">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-600 group-hover:text-neutral-400 transition-colors uppercase tracking-wider select-none">
                Path 01 — Discovery
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-neutral-950 border border-neutral-900 text-neutral-500 mb-4 group-hover:text-foreground group-hover:border-neutral-800 transition-colors">
                  <HelpCircle size={18} />
                </span>
                <h3 className="font-display text-lg text-white font-medium text-glow-soft">
                  Strategy Session
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Not sure what your business needs? We'll understand your goals and recommend the best path.
                </p>
              </div>
              <div className="mt-6">
                <Button 
                  onClick={() => {
                    navigate('/strategy-session');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  variant="ghost"
                  className="w-full justify-center text-xs py-2.5 hover:border-white hover:text-white cursor-pointer"
                >
                  Book Strategy Session
                </Button>
              </div>
            </div>

            {/* Card 2: Start Project */}
            <div className="relative group p-6 rounded-2xl bg-[#050505]/60 border border-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-neutral-800/80 hover:bg-[#070707] transition-all duration-300 flex flex-col justify-between">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-600 group-hover:text-neutral-400 transition-colors uppercase tracking-wider select-none">
                Path 02 — Build
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-neutral-950 border border-neutral-900 text-neutral-500 mb-4 group-hover:text-foreground group-hover:border-neutral-800 transition-colors">
                  <Sparkles size={18} />
                </span>
                <h3 className="font-display text-lg text-white font-medium text-glow-soft">
                  Start Project
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Already know what you want or have chosen a package? Let's begin building your project.
                </p>
              </div>
              <div className="mt-6">
                <Button 
                  onClick={() => {
                    if (currentPath === '/') {
                      scrollToSection('pricing');
                    } else {
                      navigate('/');
                      setTimeout(() => scrollToSection('pricing'), 300);
                    }
                  }}
                  className="w-full justify-center text-xs py-2.5 cursor-pointer"
                >
                  Start Project
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-muted-foreground hover:text-foreground font-semibold tracking-wide transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              Have quick questions? Message us on WhatsApp →
            </a>
          </div>
        </Reveal>

        {/* Closing philosophical quote */}
        <Reveal delay={250} className="mt-16 sm:mt-20">
          <p className="font-display text-balance text-lg leading-snug text-foreground/85 sm:text-xl">
            Visibility changes attention.<br />
            Attention changes decisions.<br />
            <span className="text-platinum">Decisions change businesses.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCta;
