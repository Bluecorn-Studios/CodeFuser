export type PagePath = '/' | '/story' | '/process' | '/pricing' | '/faq' | '/contact';

export interface PostContactData {
  email: string;
  whatsapp: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  tagline: string;
  level: number;
  capacity: string;
  features: string[];
  bestFor: string;
  highlight?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface IndustryItem {
  title: string;
  outcome: string;
}

export interface ProcessStep {
  n: string;
  title: string;
  body: string;
}
