import React from 'react';
import { Pricing } from '../components/Pricing';
import { FinalCta } from '../components/FinalCta';

export const PricingPage: React.FC = () => {
  return (
    <div className="pt-12">
      <Pricing />
      <FinalCta />
    </div>
  );
};

export default PricingPage;
