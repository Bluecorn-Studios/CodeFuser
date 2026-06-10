import React from 'react';
import { Faq } from '../components/Faq';
import { FinalCta } from '../components/FinalCta';

export const FAQPage: React.FC = () => {
  return (
    <div className="pt-12">
      <Faq />
      <FinalCta />
    </div>
  );
};

export default FAQPage;
