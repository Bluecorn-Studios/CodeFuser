import React, { useState } from 'react';
import { R as Reveal, E as Eyebrow } from './Reveal';
import { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    question: "Why do I need a website if I already have social media?",
    answer: "A website owns your audience. Serious buyers research your website first to confirm you are real, professional, and credible."
  },
  {
    question: "Why isn't Google Reviews enough?",
    answer: "Reviews help customers find you; your website convinces them to buy. Without a website, you miss out on ready buyers."
  },
  {
    question: "How long does it take?",
    answer: "Most projects are completed in 5-14 days. We start immediately once we receive your assets."
  },
  {
    question: "Can AI help my business?",
    answer: "Yes. We use AI surgically for lead capture, automated responses, and content management."
  },
  {
    question: "Do I own my website?",
    answer: "Yes. Choose full ownership with files transferred, or a fully managed plan where we handle everything."
  },
  {
    question: "Why CodeFuser?",
    answer: "We focus on real outcomes: greater visibility, higher trust, and business growth."
  },
  {
    question: "Why should I choose CodeFuser?",
    answer: "We approach every project with a strategy-first mindset to build sites that actively drive leads and growth."
  },
  {
    question: "How does payment work?",
    answer: "We require a 50% upfront deposit. The final 50% is due prior to launch. Full upfront payment is also available."
  },
  {
    question: "How long does development take?",
    answer: "Our standard delivery is within 5-12 days once brand files and inputs are received."
  },
  {
    question: "What if I need changes?",
    answer: "We offer unlimited revisions during development to ensure your layout matches your absolute vision."
  },
  {
    question: "Do I own the website?",
    answer: "Yes. Choose full ownership with all files, or a managed plan where we handle hosting and support."
  },
  {
    question: "What happens after launch?",
    answer: "After launch, take full ownership of files or stay on a managed plan with maintenance included."
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
        className="flex w-full items-center justify-between py-5 text-left focus:outline-none focus-visible:text-platinum group"
        aria-expanded={isOpen}
      >
        <span className="font-display text-base text-foreground/90 transition-colors group-hover:text-foreground sm:text-lg">
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
          isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
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
    <section id="faq" className="relative overflow-hidden px-5 py-28 lg:py-32 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <Eyebrow>10 — FAQ</Eyebrow>
            <h2 className="font-display mt-8 text-balance text-3.5xl leading-[1.05] text-foreground text-glow sm:text-4.5xl md:text-5.5xl">
              Quiet Answers<br />
              <span className="text-platinum">To Loud Questions.</span>
            </h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
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
