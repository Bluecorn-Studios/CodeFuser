import React, { useRef, useEffect, useState } from 'react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink, w as getWhatsAppLink, cn } from './Reveal';

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
  return (
    <section className="relative overflow-hidden px-5 py-44 sm:px-8">
      {/* Centered drawing ring */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
        <Ring size={760} progress={0.55} completeOnView={true} />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <Eyebrow>11 — Final Step</Eyebrow>
          
          <h2 className="font-display mt-8 text-balance text-[clamp(2.5rem,6vw,5rem)] leading-[1.0] text-foreground text-glow-strong">
            Ready To Break<br />
            <span className="text-platinum">The Invisible Ceiling?</span>
          </h2>

          <div className="mx-auto mt-10 max-w-xl space-y-3 text-lg text-muted-foreground leading-relaxed">
            <p>The opportunity already exists.</p>
            <p>The question is whether people can see it.</p>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button as="a" href={getMailtoLink()}>
              Book A Strategy Session
            </Button>
            <Button as="a" href={getWhatsAppLink()} variant="ghost">
              Message on WhatsApp
            </Button>
          </div>
        </Reveal>

        {/* Closing philosophical quote */}
        <Reveal delay={250} className="mt-24">
          <p className="font-display text-balance text-xl leading-snug text-foreground/85 sm:text-2xl">
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
