import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { PagePath } from '../types';

// Company Contact Coordinates
export const C = {
  email: "hello@codefuser.com",
  whatsapp: "919999999999",
  instagram: "https://instagram.com/codefuser",
  linkedin: "https://www.linkedin.com/company/codefuser",
  twitter: "https://twitter.com/codefuser"
};

// Mailto strategy session generator
export function b(subject = "Strategy Session — CodeFuser"): string {
  const body = encodeURIComponent(`Hi CodeFuser team,

I'd like to book a strategy session to discuss visibility and growth for my business.

— `);
  return `mailto:${C.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
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
    return (
      <a href={href} className={mergedClass} {...anchorProps}>
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
  { to: '/story' as PagePath, label: "Story" },
  { to: '/process' as PagePath, label: "Process" },
  { to: '/pricing' as PagePath, label: "Pricing" },
  { to: '/faq' as PagePath, label: "FAQ" },
  { to: '/contact' as PagePath, label: "Contact" }
];

// Primary Navigation Header
export const Eo: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath } = useAppRouter();

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

        <G as="a" href={b()} className="hidden md:inline-flex text-xs px-5 py-2.5">
          Book Strategy Session
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
            <G as="a" href={b()} className="w-full text-center py-3.5">
              Book Strategy Session
            </G>
          </div>
        </div>
      )}
    </header>
  );
};

// Global Page Footer
export const Oo: React.FC = () => {
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
            <li className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Terms & Conditions</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Refund Policy</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Cookie Policy</li>
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
        <main className="pt-16 pb-20 w-full">
          {children}
        </main>
      </div>
      <Oo />
    </div>
  );
};
