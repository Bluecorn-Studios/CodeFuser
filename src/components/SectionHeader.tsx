import React from 'react';
import { R as Reveal, E as Eyebrow, cn } from './Reveal';

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const S: React.FC<SectionHeaderProps> = ({ eyebrow, title, description, align = 'center', className }) => {
  return (
    <Reveal className={cn("mx-auto max-w-3xl", align === 'center' ? "text-center" : "text-left", className)}>
      {eyebrow ? (
        <Eyebrow className="mb-5">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2 className="font-display text-balance text-3.5xl leading-[1.05] text-foreground sm:text-4.5xl md:text-5.5xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
};
export default S;
