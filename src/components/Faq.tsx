import React, { useState } from 'react';
import { R as Reveal, E as Eyebrow } from './Reveal';
import { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    question: "Why do I need a website if I already have social media?",
    answer: "Social media rents your audience. A website owns it. Serious buyers research before contacting you — and they almost always end up on a website to confirm you are real, professional, and credible."
  },
  {
    question: "Why isn't Google Reviews enough?",
    answer: "Reviews validate. A website convinces. Customers use reviews to decide who to consider, then your website to decide who to choose. Without one, you stay in consideration but rarely in conversion."
  },
  {
    question: "How long does it take?",
    answer: "Foundation typically delivers in 5–7 days. Growth in 10–14 days. Dominance in 3–4 weeks. Timelines start once we have your content and brand assets."
  },
  {
    question: "Can AI help my business?",
    answer: "Yes — when applied surgically. We use AI for lead capture, response automation, and content systems that genuinely save time. We don't bolt AI on for the sake of it."
  },
  {
    question: "Do I own my website?",
    answer: "Yes. You can choose to have us manage everything, or take full ownership with all files and deployment assets transferred at project completion."
  },
  {
    question: "Why CodeFuser?",
    answer: "Because we don't build websites — we remove invisible ceilings. Every decision is made to expand your visibility, your trust, and your growth."
  }
];

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-border/80">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left focus:outline-none focus-visible:text-platinum group"
        aria-expanded={isOpen}
      >
        <span className="font-display text-lg text-foreground/90 transition-colors group-hover:text-foreground sm:text-xl">
          {item.question}
        </span>
        <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 transition-colors group-hover:border-foreground/30">
          <svg
            className={`h-3 w-3 text-foreground/60 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
            )}
          </svg>
        </span>
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative overflow-hidden px-5 py-40 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <Eyebrow>10 — FAQ</Eyebrow>
            <h2 className="font-display mt-8 text-balance text-4xl leading-[1.05] text-foreground text-glow sm:text-5xl md:text-6xl">
              Quiet Answers<br />
              <span className="text-platinum">To Loud Questions.</span>
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              Answers to the basic questions every founder asks before starting.
            </p>
          </Reveal>

          <Reveal delay={120} className="space-y-1">
            {faqItems.map((item, index) => (
              <FAQAccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Faq;
