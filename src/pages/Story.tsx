import React from 'react';
import { R as Reveal, E as Eyebrow } from '../components/Reveal';
import { FinalCta } from '../components/FinalCta';

function FounderStoryDetail() {
  return (
    <section className="relative px-5 py-32 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <Eyebrow>Founder Story</Eyebrow>
          <h2 className="font-display mt-6 text-4xl text-foreground sm:text-5xl md:text-6xl font-semibold">
            Why I started CodeFuser.
          </h2>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
            David Jonathan
          </p>
        </Reveal>

        <Reveal className="mt-14 space-y-6 text-lg leading-relaxed text-foreground/85">
          <p>I became obsessed with one question.</p>
          <p>Why do great businesses remain small?</p>
          <p>The answer wasn't quality. The answer wasn't pricing. The answer wasn't effort.</p>
          <p>The answer was visibility.</p>
        </Reveal>

        {/* Big stylized quote block */}
        <Reveal className="my-20" delay={120}>
          <figure className="relative mx-auto max-w-2xl text-center">
            <span 
              aria-hidden="true" 
              className="font-display absolute -left-2 -top-10 select-none text-[8rem] leading-none text-foreground/15"
            >
              “
            </span>
            <blockquote className="font-display text-balance text-3xl leading-[1.15] text-foreground sm:text-4xl md:text-5xl font-medium">
              Potential isn't the problem.<br />
              <span className="text-platinum">Visibility is.</span>
            </blockquote>
            <span 
              aria-hidden="true" 
              className="font-display absolute -bottom-16 -right-2 select-none text-[8rem] leading-none text-foreground/15"
            >
              ”
            </span>
            <div className="mx-auto mt-10 h-px w-24 hairline" />
          </figure>
        </Reveal>

        <Reveal className="space-y-6 text-lg leading-relaxed text-foreground/85">
          <p>
            I realized businesses weren't losing because they lacked skill. They weren't losing because they lacked effort. They were losing because they lacked visibility.
          </p>
          <p>
            Every day, potential customers were making decisions before ever starting a conversation.
          </p>
          <p>
            That realization became the foundation of CodeFuser.
          </p>
        </Reveal>
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
