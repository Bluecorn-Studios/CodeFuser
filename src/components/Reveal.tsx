import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { PagePath } from '../types';

// Company Contact Coordinates
export const C = {
  email: "aicodefuser@gmail.com",
  whatsapp: "917449100307",
  instagram: "https://instagram.com/codefuser",
  linkedin: "https://www.linkedin.com/company/codefuser",
  twitter: "https://twitter.com/codefuser"
};

// Mailto strategy session generator (redirected directly to Gmail web compose as requested)
export function b(subject = "Strategy Session — CodeFuser"): string {
  const body = encodeURIComponent(`Hi CodeFuser team,

I'd like to book a strategy session to discuss visibility and growth for my business.

— `);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${C.email}&su=${encodeURIComponent(subject)}&body=${body}`;
}

// WhatsApp session generator
export function w(text = "Hi CodeFuser, I'd like to book a strategy session."): string {
  return `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;
}

// Simple smooth scroll utility
export function s(id: string): void {
  if (typeof document === 'undefined') return;
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // If we are on another page, navigate home first and scroll
    window.location.href = `/#${id}`;
  }
}

// Simple Router Context for smooth SPA navigation
interface RouterContextType {
  currentPath: PagePath;
  navigate: (to: PagePath) => void;
}

export const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {}
});

export function useAppRouter() {
  return useContext(RouterContext);
}

// Link helper component to prevent page reload
interface LinkProps {
  to: PagePath;
  children: React.ReactNode;
  className?: string;
  activeProps?: { className?: string };
}

export const Link: React.FC<LinkProps> = ({ to, children, className = '', activeProps }) => {
  const { currentPath, navigate } = useAppRouter();
  const isActive = currentPath === to;
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalClass = isActive && activeProps?.className 
    ? `${className} ${activeProps.className}`.trim() 
    : className;

  return (
    <a href={to} onClick={handleClick} className={finalClass}>
      {children}
    </a>
  );
};

// Clean Classname Merger
export function cn(...classes: any[]): string {
  return classes.filter(Boolean).map(c => {
    if (typeof c === 'object' && c !== null) {
      return Object.entries(c)
        .filter(([_, val]) => !!val)
        .map(([key]) => key)
        .join(' ');
    }
    return c;
  }).join(' ');
}

// Section Eyebrow component
interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export const E: React.FC<EyebrowProps> = ({ children, className }) => {
  return (
    <p className={cn("text-eyebrow", className)}>
      {children}
    </p>
  );
};

// Generic Button helper component supporting primary pressure and ghost styles
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  as?: 'button' | 'a';
  href?: string;
  children: React.ReactNode;
}

export const G: React.FC<ButtonProps> = ({ variant = 'primary', className = '', as = 'button', href, children, ...props }) => {
  const baseClass = "btn-pressure inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40";
  
  const variantClass = variant === 'primary'
    ? "bg-foreground text-background hover:shadow-glow hover:-translate-y-0.5"
    : "border border-border bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/[0.04] hover:shadow-glow-soft";

  const mergedClass = cn(baseClass, variantClass, className);

  if (as === 'a' || href) {
    const { ...anchorProps } = props as any;
    const isExternal = href?.startsWith('http') || href?.startsWith('https');
    return (
      <a 
        href={href} 
        className={mergedClass} 
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={mergedClass} {...props}>
      {children}
    </button>
  );
};

// Scroll Reveal Hook
export function useReveal(options: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}

// Scroll Reveal Container component
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}

export const R: React.FC<RevealProps> = ({ children, className = '', delay = 0, as: Component = 'div' }) => {
  const ref = useReveal() as React.RefObject<any>;
  return (
    <Component
      ref={ref}
      className={cn("reveal", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
};

const Fo = [
  { to: '/' as PagePath, label: "Home" },
  { to: '/story' as PagePath, label: "Story" },
  { to: '/process' as PagePath, label: "Process" },
  { to: '/portfolio' as PagePath, label: "Portfolio" },
  { to: '/pricing' as PagePath, label: "Pricing" },
  { to: '/faq' as PagePath, label: "FAQ" },
  { to: '/contact' as PagePath, label: "Contact" }
];

// Primary Navigation Header
export const Eo: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath, navigate } = useAppRouter();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center transition-opacity hover:opacity-85">
          <img 
            src="/logo.svg" 
            alt="CodeFuser" 
            className="h-[21px] w-auto sm:h-[23px] block select-none" 
            referrerPolicy="no-referrer" 
          />
        </Link>
        
        {/* Desktop Navbar */}
        <div className="hidden items-center gap-8 md:flex">
          {Fo.map(nav => (
            <Link 
              key={nav.to} 
              to={nav.to} 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {nav.label}
            </Link>
          ))}
        </div>

        <G 
          onClick={() => {
            if (currentPath === '/') {
              s('pricing');
            } else {
              navigate('/');
              setTimeout(() => s('pricing'), 300);
            }
          }} 
          className="hidden md:inline-flex text-xs px-5 py-2.5 cursor-pointer"
        >
          Start Project
        </G>

        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-border/40 text-foreground md:hidden hover:border-foreground/45 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className={cn("h-0.5 w-5 bg-foreground transition-transform duration-300", mobileMenuOpen ? "rotate-45 translate-y-2" : "")} />
          <span className={cn("h-0.5 w-5 bg-foreground transition-opacity duration-300", mobileMenuOpen ? "opacity-0" : "")} />
          <span className={cn("h-0.5 w-5 bg-foreground transition-transform duration-300", mobileMenuOpen ? "-rotate-45 -translate-y-2" : "")} />
        </button>
      </nav>

      {/* Mobile Navbar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-background/95 backdrop-blur-2xl px-6 py-8 md:hidden">
          <div className="flex flex-col gap-6 text-xl">
            {Fo.map((nav, index) => (
              <Link
                key={nav.to}
                to={nav.to}
                className="text-muted-foreground hover:text-foreground transition-colors py-1"
                activeProps={{ className: "text-foreground font-semibold" }}
              >
                {nav.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-border/60 pt-6">
            <G 
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentPath === '/') {
                  s('pricing');
                } else {
                  navigate('/');
                  setTimeout(() => s('pricing'), 300);
                }
              }} 
              className="w-full text-center py-3.5 cursor-pointer"
            >
              Start Project
            </G>
          </div>
        </div>
      )}
    </header>
  );
};

// Global Page Footer
export const Oo: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'refund' | 'cookie' | null>(null);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <footer className="relative border-t border-border/60 px-5 py-16 sm:px-8 bg-black">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="font-display text-3xl text-foreground">
            CodeFuser
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            We Fuse Potential With Scale.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground/80 font-medium">
            Visibility · Trust · Growth
          </p>
        </div>
        
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-semibold">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/story" className="text-foreground/80 hover:text-foreground transition-colors">
                Founder Story
              </Link>
            </li>
            <li>
              <Link to="/process" className="text-foreground/80 hover:text-foreground transition-colors">
                Process
              </Link>
            </li>
            <li>
              <Link to="/portfolio" className="text-foreground/80 hover:text-foreground transition-colors">
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-semibold">Legal</p>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li onClick={() => setActiveModal('privacy')} className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</li>
            <li onClick={() => setActiveModal('terms')} className="hover:text-foreground transition-colors cursor-pointer">Terms & Conditions</li>
            <li onClick={() => setActiveModal('refund')} className="hover:text-foreground transition-colors cursor-pointer">Refund Policy</li>
            <li onClick={() => setActiveModal('cookie')} className="hover:text-foreground transition-colors cursor-pointer">Cookie Policy</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} CodeFuser. All rights reserved.</p>
        <div className="flex gap-5">
          <a href={C.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a>
          <a href={C.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a>
          <a href={C.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a>
        </div>
      </div>

      {activeModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border/60 bg-neutral-950 p-6 md:p-8 shadow-2xl text-foreground font-sans outline-none scrollbar-thin scrollbar-thumb-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button on top right */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Last Updated Label */}
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-2">
              Last Updated: June 15, 2026
            </div>

            {activeModal === 'privacy' && (
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-6 text-glow-soft">Privacy Policy</h3>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    At CodeFuser, we respect your online privacy and are committed to protecting any personal information you share with us. This policy outlines our procedures for collecting, processing, and storing personal details provided through our contact channels, forms, or consultation systems. We are dedicated to ensuring absolute transparency in our data protection standards.
                  </p>
                  
                  <h4 className="font-semibold text-foreground mt-4">1. Information We Collect</h4>
                  <p>
                    We may collect personal information that you voluntarily provide to us, including your name, email address, phone number (WhatsApp), and any message or files you submit through our contact systems.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">2. How We Use Your Information</h4>
                  <p>
                    We use this information to respond to inquiries, schedule strategy sessions, deliver website development services, send updates, and communicate about projects.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">3. Security & Storage</h4>
                  <p>
                    We implement robust technical and organizational measures to safeguard your personal data against unauthorized access, loss, or disclosure.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">4. Third-Party Storage & Processing</h4>
                  <p className="text-foreground">
                    Information may be stored and processed using trusted third-party tools, platforms, and service providers necessary to operate and deliver CodeFuser services. Reasonable efforts are taken to ensure such providers maintain appropriate security standards.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">5. Contact Information</h4>
                  <p>
                    If you have any questions about this Privacy Policy or your personal data, please contact us at <a href="mailto:aicodefuser@gmail.com" className="text-foreground underline">aicodefuser@gmail.com</a> or via phone at <a href="tel:+917449100307" className="text-foreground underline">+91 7449100307</a>.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-6 text-glow-soft">Terms & Conditions</h3>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Welcome to CodeFuser. By accessing our platform, contacting us, or engaging our services, you agree to comply with and be bound by the following terms of service.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">1. Service Disclaimer</h4>
                  <p className="text-foreground">
                    CodeFuser provides website development and digital consulting services. While websites may improve visibility, trust, customer acquisition opportunities, and online presence, specific business results, revenue growth, customer growth, lead generation, or sales outcomes cannot be guaranteed.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">2. Ownership</h4>
                  <p className="text-foreground">
                    Ownership of website files, source code, and related assets depends on the ownership option selected during the project process. Owners may choose their direct model context depending on their deployment.
                  </p>
                  <p className="text-foreground">
                    Clients selecting Full Ownership receive ownership of the delivered project assets only after all outstanding invoices and final payments have been completed.
                  </p>
                  <p className="text-foreground">
                    Clients selecting Managed Services receive website management, hosting, and maintenance services according to their selected plan.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">3. Managed Services</h4>
                  <p className="text-foreground">
                    Clients who choose a managed service plan may receive:
                  </p>
                  <ul className="list-disc pl-5 text-foreground space-y-1">
                    <li>Hosting</li>
                    <li>Security Updates</li>
                    <li>Backups</li>
                    <li>Technical Maintenance</li>
                    <li>Technical Support</li>
                  </ul>
                  <p className="text-foreground font-medium">
                    according to their selected service plan.
                  </p>
                  <p className="text-foreground">
                    Managed services remain active only while subscription payments remain current. Failure to maintain a managed service subscription may affect ongoing support, maintenance, updates, and hosting services.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">4. Unlimited Revisions</h4>
                  <p className="text-foreground">
                    Unlimited revisions apply during the active development phase of the project. Requests that significantly alter the approved project scope may require additional discussion, revised timelines, or additional pricing.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">5. Delivery Timelines</h4>
                  <p className="text-foreground">
                    Project timelines are estimates and may vary depending on project complexity, client responsiveness, revision requests, content availability, and third-party service dependencies. Client delays in providing required information, approvals, content, or assets may affect project timelines.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">6. Third-Party Services</h4>
                  <p className="text-foreground">
                    CodeFuser may integrate or recommend third-party services including payment processors, hosting providers, scheduling tools, analytics platforms, and communication platforms. CodeFuser is not responsible for interruptions, outages, pricing changes, or policy changes made by third-party providers.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">7. Portfolio Rights</h4>
                  <p className="text-foreground">
                    Unless otherwise agreed in writing, CodeFuser may showcase completed projects, screenshots, design work, and publicly available project outcomes within its portfolio and marketing materials.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">8. Cancellation</h4>
                  <p className="text-foreground">
                    Either party may request project cancellation. Work completed up to the cancellation date remains billable. Any completed deliverables, consultation work, strategy work, development work, or design work performed before cancellation may be deducted from any eligible refund amount.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'refund' && (
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-6 text-glow-soft">Refund Policy</h3>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    We want you to be completely satisfied with CodeFuser. However, because our work involves custom planning, developer scheduling, and individual creative resources, we maintain clear guidelines on refunds.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">1. Project Development Setup</h4>
                  <p>
                    The CodeFuser process represents a dedicated, strategic design, planning, and development ecosystem. Every timeline slot reserved is an isolated slot for active engagement.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">2. Policy Terms</h4>
                  <p className="text-foreground font-medium">
                    Project deposits reserve development time, planning, and resources. Refund requests are reviewed individually. A change of mind does not automatically qualify for a refund. Completed work, delivered assets, consultations, development services, strategy sessions, and time already invested in a project are not eligible for refunds. Work already completed remains billable.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">3. Inquiries</h4>
                  <p>
                    For billing questions, please reach our services team at <a href="mailto:aicodefuser@gmail.com" className="text-foreground underline">aicodefuser@gmail.com</a>.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'cookie' && (
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-6 text-glow-soft">Cookie Policy</h3>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    CodeFuser uses cookie states and similar session tracking mechanisms to improve your exploration performance, capture analytics, and support modern UX functions.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">1. Cookie Operations</h4>
                  <p>
                    Cookies are standard tracking elements stored on your browser to keep path routing fast, active, and configured to your custom display parameters.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">2. Analytics Tracking</h4>
                  <p className="text-foreground font-medium">
                    The website may use analytics tools to better understand visitor behavior and improve services. Cookies may be used for analytics, performance monitoring, functionality improvements, and user experience enhancements.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">3. Custom Preference Limits</h4>
                  <p>
                    You can inspect and block cookie collection via standard preferences configs under your browser security settings. Disabling specific features may restrict visual animations.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-border/40 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="bg-foreground text-background font-medium text-xs px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

// Global Page Container layout controller
interface PageContainerProps {
  children: React.ReactNode;
}

export const P: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div className="flex flex-col w-full">
        <Eo />
        <main className="pt-14 pb-16 w-full">
          {children}
        </main>
      </div>
      <Oo />
    </div>
  );
};
