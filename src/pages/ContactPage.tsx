import React from 'react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink, w as getWhatsAppLink, C as contactInfo } from '../components/Reveal';

export const ContactPage: React.FC = () => {
  return (
    <section className="relative px-5 py-32 sm:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow>Contact</Eyebrow>
        
        <h1 className="font-display mt-6 text-balance text-4xl leading-[1.05] text-foreground sm:text-6xl font-semibold">
          Start the conversation. <br />
          <span className="text-platinum">Remove the ceiling.</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
          Tell us about your business. We'll respond with a clear, honest assessment of where the opportunity is.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button as="a" href={getMailtoLink()}>
            Email Us
          </Button>
          <Button as="a" href={getWhatsAppLink()} variant="ghost">
            WhatsApp
          </Button>
        </div>

        {/* Contact details grid */}
        <div className="mt-16 grid gap-6 border-t border-border pt-10 text-left sm:grid-cols-2">
          <div>
            <p className="text-eyebrow">Email</p>
            <p className="mt-2 text-foreground font-medium selection:bg-foreground selection:text-background text-glow">
              {contactInfo.email}
            </p>
          </div>
          
          <div>
            <p className="text-eyebrow">WhatsApp</p>
            <p className="mt-2 text-foreground font-medium selection:bg-foreground selection:text-background text-glow">
              +{contactInfo.whatsapp}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default ContactPage;
