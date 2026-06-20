import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Building, 
  Target, 
  Shield, 
  Globe, 
  Palette, 
  FileText, 
  Send, 
  MessageSquare, 
  Lock, 
  User, 
  Mail,
  Calendar,
  Layers,
  HelpCircle,
  Database,
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { useAppRouter, b as getMailtoLink, w as getWhatsAppLink } from '../components/Reveal';
import { PagePath, PricingPlan } from '../types';
import { pricingPlans } from '../components/Pricing';

interface StartProjectData {
  businessName: string;
  ownerName: string;
  whatsapp: string;
  email: string;
  industry: string;
  customIndustry: string;
  goal: string;
  customGoal: string;
  packageId: string;
  ownership: 'full' | 'managed';
  hasDomain: 'yes' | 'no' | 'help';
  hasLogo: 'yes' | 'no' | 'help';
  contentReady: 'yes' | 'no_help' | 'progress';
}

interface Country {
  name: string;
  code: string;
  flag: string;
  example: string;
  validationRule: {
    pattern: RegExp;
    desc: string;
    maxLength: number;
  };
}

const COUNTRIES: Country[] = [
  {
    name: "India",
    code: "+91",
    flag: "🇮🇳",
    example: "98765 43210",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "United States",
    code: "+1",
    flag: "🇺🇸",
    example: "201 555 0123",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "United Kingdom",
    code: "+44",
    flag: "🇬🇧",
    example: "7911 123456",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "United Arab Emirates",
    code: "+971",
    flag: "🇦🇪",
    example: "50 123 4567",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Singapore",
    code: "+65",
    flag: "🇸🇬",
    example: "8123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Saudi Arabia",
    code: "+966",
    flag: "🇸🇦",
    example: "50 123 4567",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Qatar",
    code: "+974",
    flag: "🇶🇦",
    example: "5555 1234",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Oman",
    code: "+968",
    flag: "🇴🇲",
    example: "9123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Kuwait",
    code: "+965",
    flag: "🇰🇼",
    example: "5123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Bahrain",
    code: "+973",
    flag: "🇧🇭",
    example: "3123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Australia",
    code: "+61",
    flag: "🇦🇺",
    example: "412 345 678",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Canada",
    code: "+1",
    flag: "🇨🇦",
    example: "613 555 0192",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "Germany",
    code: "+49",
    flag: "🇩🇪",
    example: "170 1234567",
    validationRule: { pattern: /^\d{10,11}$/, desc: "must be 10 to 11 digits", maxLength: 11 }
  },
  {
    name: "France",
    code: "+33",
    flag: "🇫🇷",
    example: "612 34 56 78",
    validationRule: { pattern: /^\d{9,10}$/, desc: "must be 9 to 10 digits", maxLength: 10 }
  },
  {
    name: "Malaysia",
    code: "+60",
    flag: "🇲🇾",
    example: "12 345 6789",
    validationRule: { pattern: /^\d{9,10}$/, desc: "must be 9 to 10 digits", maxLength: 10 }
  },
  {
    name: "New Zealand",
    code: "+64",
    flag: "🇳🇿",
    example: "21 123 4567",
    validationRule: { pattern: /^\d{8,10}$/, desc: "must be 8 to 10 digits", maxLength: 10 }
  },
  {
    name: "South Africa",
    code: "+27",
    flag: "🇿🇦",
    example: "82 123 4567",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Philippines",
    code: "+63",
    flag: "🇵🇭",
    example: "912 345 6789",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  }
];

const INDUSTRIES = [
  { id: 'retail', label: 'Retail / Store', icon: Building },
  { id: 'services', label: 'Local Services', icon: Shield },
  { id: 'food', label: 'Restaurant / Cafe', icon: Sparkles },
  { id: 'professional', label: 'Professional / Agency', icon: Layers },
  { id: 'medical', label: 'Wellness / Clinic', icon: HeartLink },
  { id: 'other', label: 'Other Business Type', icon: HelpCircle },
];

// Fallback HeartLink icon
function HeartLink({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

const GOALS = [
  { id: 'leads', label: 'Get Sales Leads / Phone Calls' },
  { id: 'portfolio', label: 'Display My Work & Projects' },
  { id: 'products', label: 'Sell My Products Directly' },
  { id: 'bookings', label: 'Accept Online Bookings' },
  { id: 'profile', label: 'Just a Trusted Profile Page' },
];

export const StartProjectPage: React.FC = () => {
  const { navigate } = useAppRouter();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Intelligent Package Recommendation states
  const [recommendationCards, setRecommendationCards] = useState<any[] | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>('current');

  useEffect(() => {
    setMaxStep(prev => Math.max(prev, step));
  }, [step]);

  // Form State
  const [formData, setFormData] = useState<StartProjectData>({
    businessName: '',
    ownerName: '',
    whatsapp: '',
    email: '',
    industry: '',
    customIndustry: '',
    goal: '',
    customGoal: '',
    packageId: 'growth', // default package: Fusion
    ownership: 'managed',
    hasDomain: 'help',
    hasLogo: 'help',
    contentReady: 'no_help'
  });

  const [isPlanLocked, setIsPlanLocked] = useState(false);
  const [triggerValidation, setTriggerValidation] = useState(false);

  // International Country phone selection states
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [localPhone, setLocalPhone] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Sync state cleanly into the overarching formData.whatsapp field (which preserving API boundary)
  useEffect(() => {
    const cleanNum = localPhone.trim();
    if (cleanNum) {
      setFormData(prev => ({
        ...prev,
        whatsapp: `${selectedCountry.code} ${cleanNum}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        whatsapp: ''
      }));
    }
  }, [localPhone, selectedCountry]);

  // Restore state cleanly on component mount if a pre-existing value is there
  useEffect(() => {
    if (formData.whatsapp) {
      const parts = formData.whatsapp.trim().split(' ');
      if (parts.length >= 2) {
        const potentialCode = parts[0];
        const match = COUNTRIES.find(c => c.code === potentialCode);
        if (match) {
          setSelectedCountry(match);
          setLocalPhone(parts.slice(1).join(''));
          return;
        }
      }
      const matchStart = COUNTRIES.find(c => formData.whatsapp.startsWith(c.code));
      if (matchStart) {
        setSelectedCountry(matchStart);
        setLocalPhone(formData.whatsapp.slice(matchStart.code.length).replace(/\s+/g, ''));
        return;
      }
      setLocalPhone(formData.whatsapp);
    }
  }, []);

  // Dynamic Validation Error Helper
  const getValidationErrors = () => {
    const errs: Record<string, string> = {};
    
    // Business Name
    if (!formData.businessName.trim()) {
      errs.businessName = "Business Name is required.";
    } else if (formData.businessName.trim().length < 3) {
      errs.businessName = "Business Name must be at least 3 characters.";
    }

    // Representative Name
    const cleanOwnerName = formData.ownerName.trim();
    if (!cleanOwnerName) {
      errs.ownerName = "Representative Name is required.";
    } else if (cleanOwnerName.length < 2) {
      errs.ownerName = "Representative Name must be at least 2 characters.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(cleanOwnerName)) {
      errs.ownerName = "Name can only contain alphabetic letters, spaces, hyphens, and apostrophes.";
    }

    // WhatsApp: Required, digits only, country expected digit count
    const cleanWhatsapp = localPhone.trim();
    if (!cleanWhatsapp) {
      errs.whatsapp = "WhatsApp number is required.";
    } else if (!/^\d+$/.test(cleanWhatsapp)) {
      errs.whatsapp = "WhatsApp number must contain digits only.";
    } else if (!selectedCountry.validationRule.pattern.test(cleanWhatsapp)) {
      errs.whatsapp = `WhatsApp number ${selectedCountry.validationRule.desc}.`;
    }

    // Email: Must be a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      errs.email = "Business Email is required.";
    } else if (!emailRegex.test(cleanEmail)) {
      errs.email = "Please enter a valid email format (e.g. name@domain.com).";
    }

    return errs;
  };

  const validationErrors = getValidationErrors();

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  // Reset scroll layout to top on mount to ensure every onboarding session begins at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle Query Param for Pre-filled Package
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      const match = pricingPlans.find(p => p.id === planParam || p.name.toLowerCase() === planParam.toLowerCase());
      if (match) {
        setFormData(prev => ({ ...prev, packageId: match.id }));
        setIsPlanLocked(true);
      }
    }
  }, []);

  const selectedPlan = pricingPlans.find(p => p.id === formData.packageId) || pricingPlans[1];

  const updateField = (field: keyof StartProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Basic validation
    if (step === 1) {
      setTriggerValidation(true);
      if (Object.keys(validationErrors).length > 0) {
        return; // Prevent progression
      }
    }
    if (step === 2) {
      if (!formData.industry) {
        alert('Please select a business category.');
        return;
      }
      if (formData.industry === 'other' && !formData.customIndustry.trim()) {
        alert('Please specify your business type.');
        return;
      }
      if (!formData.goal) {
        alert('Please select your business outcome goal.');
        return;
      }
    }

    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate request clicks

    // Validate required contact details dynamically
    const errors = getValidationErrors();
    if (Object.keys(errors).length > 0) {
      setStep(1);
      setTriggerValidation(true);
      setSubmitError("Please correct the validation errors on Step 1 before submitting the blueprint.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("Transmitting proposal packet to database system...");
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const resJson = await response.json();
      const savedProject = resJson.data;

      // Save submission locally for future dashboard lookup & offline redundancy
      const savedRequests = JSON.parse(localStorage.getItem('codefuser_requests') || '[]');
      const newRequest = {
        ...formData,
        id: savedProject?.id || `REQ-${Date.now()}`,
        timestamp: savedProject?.timestamp || new Date().toISOString(),
        status: savedProject?.status || 'Assets Pending'
      };
      savedRequests.push(newRequest);
      localStorage.setItem('codefuser_requests', JSON.stringify(savedRequests));
      localStorage.setItem('codefuser_current_project', JSON.stringify(newRequest));

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Load intelligent package recommendations
      setLoadingRecommendations(true);
      setRecommendationError(null);
      try {
        const recResponse = await fetch("/api/start-project/package-upgrade-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: formData.packageId,
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            industry: formData.industry === 'other' ? formData.customIndustry : formData.industry,
            goal: formData.goal === 'other' ? formData.customGoal : formData.goal,
          })
        });
        if (recResponse.ok) {
          const recData = await recResponse.json();
          if (recData && recData.options && recData.options.length === 3) {
            setRecommendationCards(recData.options);
          } else {
            throw new Error("Incorrect cards count");
          }
        } else {
          throw new Error("HTTP failure loading recommendations");
        }
      } catch (recErr) {
        console.error("Local fallback used due to recommendation fetch issue:", recErr);
        // Direct local frontend fallback in case backend is down or errors
        const fallbackOptions = getOnboardingFallbackUpgrades(
          formData.packageId, 
          formData.businessName, 
          formData.ownerName, 
          formData.industry === 'other' ? formData.customIndustry : formData.industry, 
          formData.goal === 'other' ? formData.customGoal : formData.goal
        );
        setRecommendationCards(fallbackOptions);
      } finally {
        setLoadingRecommendations(false);
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      // Friendly retry message, and never lose the client's entered data.
      setSubmitError(err.message || "Failed to establish database transmission. Please check your network and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-filled custom mailto link after onboarding submission
  const getPrefilledComposeMail = (cardName?: string, cardPrice?: string) => {
    const activeIndustry = formData.industry === 'other' ? formData.customIndustry : formData.industry;
    const activeGoal = formData.goal === 'other' ? formData.customGoal : formData.goal;
    
    const chosenPackageText = cardName ? `${cardName} (${cardPrice})` : `${selectedPlan.name} (${selectedPlan.price})`;
    const subject = `New Project Request — ${formData.businessName}`;
    const body = encodeURIComponent(`Hi CodeFuser Team,

I have completed the Start Project onboarding on your platform! Here is a summary of my business request:

• Business Identity: ${formData.businessName} (Owner: ${formData.ownerName})
• Contact Details: ${formData.whatsapp} (WhatsApp) / ${formData.email}
• Industry Field: ${activeIndustry}
• Primary Objective: ${activeGoal}
• Configuration Package: ${chosenPackageText}
• Selected Model: ${formData.ownership === 'full' ? 'Full Control (Files Transferred)' : 'Managed Partnership (Host & Secure)'}
• Asset Readiness:
  - Domain Registry: ${formData.hasDomain === 'yes' ? 'Registered' : formData.hasDomain === 'no' ? 'Not registered' : 'Need select assistance'}    
  - Logo & Brand Assets: ${formData.hasLogo === 'yes' ? 'Provided' : formData.hasLogo === 'no' ? 'Not ready' : 'Need brand designs'}
  - Text & Media: ${formData.contentReady === 'yes' ? 'I have copywriting ready' : formData.contentReady === 'progress' ? 'In progress' : 'Need CodeFuser to write'}

I'd like to proceed with the Strategy Session to finalize details and map out the growth tracks.

Warm regards,
${formData.ownerName}
`);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(subject)}&body=${body}`;
  };

  // Custom Step Progress Bar Component
  const renderProgress = () => {
    const totalSteps = 5;
    const pct = ((maxStep - 1) / (totalSteps - 1)) * 100;
    return (
      <div className="mb-10 sm:mb-12">
        <div className="flex justify-between items-center text-xs text-muted-foreground/60 font-mono tracking-widest mb-3 uppercase">
          <span>PROGRESS: STAGE 0{maxStep} OF 05</span>
          <span className="text-glow text-amber-500 font-bold">{Math.round(pct)}% COMPLETE</span>
        </div>
        <div className="relative h-[2px] w-full bg-neutral-900 rounded-full overflow-hidden">
          <motion.div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 via-platinum to-white shadow-[0_0_8px_rgba(251,191,36,0.5)]" 
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[85vh] py-14 sm:py-20 px-4 sm:px-6 md:px-8 text-foreground font-sans">
      {/* Background ambient decorative spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-white/[0.01] blur-[100px] pointer-events-none" />

      <div className={`mx-auto transition-all duration-500 ${isSubmitted ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden"
              id="start-project-card"
            >
              {/* Hairline glass light reflection decoration */}
              <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

              {/* Onboarding Form Header */}
              <div className="mb-8">
                <p className="text-eyebrow mb-2">01 — Initiate Track</p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                  Start Your Project Setup
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete these details in 2 minutes to customize your digital partnership blueprint.
                </p>
              </div>

              {renderProgress()}

              {/* Step 1: Contact Identity */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-lg text-white font-semibold tracking-wide border-b border-neutral-900 pb-2">
                    1. Who are we partnering with?
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <label htmlFor="businessName" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold flex justify-between">
                        <span>Business Name *</span>
                        {triggerValidation && validationErrors.businessName && (
                          <span className="text-red-400 normal-case font-mono font-medium tracking-normal">⚠️ Required (Min 3 chars)</span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                          <Building size={16} />
                        </span>
                        <input
                          id="businessName"
                          type="text"
                          required
                          value={formData.businessName}
                          onChange={(e) => updateField('businessName', e.target.value)}
                          placeholder="e.g. Blue Horizon Dental"
                          className={`pl-11 border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full ${
                            triggerValidation && validationErrors.businessName
                              ? 'border-red-500/40 focus:ring-red-500/30 focus:border-red-500/40'
                              : 'border-border focus:ring-amber-500/50 focus:border-amber-500/40'
                          }`}
                        />
                      </div>
                      {triggerValidation && validationErrors.businessName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-[11px] mt-1.5 font-sans"
                        >
                          {validationErrors.businessName}
                        </motion.p>
                      )}
                    </div>

                    <div className="group">
                      <label htmlFor="ownerName" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold flex justify-between">
                        <span>Your Full Name *</span>
                        {triggerValidation && validationErrors.ownerName && (
                          <span className="text-red-400 normal-case font-mono font-medium tracking-normal">
                            {formData.ownerName.trim() ? "⚠️ Invalid Format" : "⚠️ Required"}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                          <User size={16} />
                        </span>
                        <input
                          id="ownerName"
                          type="text"
                          required
                          value={formData.ownerName}
                          onChange={(e) => updateField('ownerName', e.target.value)}
                          placeholder="First and last name"
                          className={`pl-11 border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full ${
                            triggerValidation && validationErrors.ownerName
                              ? 'border-red-500/40 focus:ring-red-500/30 focus:border-red-500/40'
                              : 'border-border focus:ring-amber-500/50 focus:border-amber-500/40'
                          }`}
                        />
                      </div>
                      {triggerValidation && validationErrors.ownerName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-[11px] mt-1.5 font-sans"
                        >
                          {validationErrors.ownerName}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="whatsapp" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold flex justify-between select-none">
                          <span>WhatsApp Number *</span>
                          {triggerValidation && validationErrors.whatsapp && (
                            <span className="text-red-400 normal-case font-mono font-medium tracking-normal">
                              {localPhone.trim() ? `⚠️ ${selectedCountry.validationRule.desc}` : '⚠️ Required'}
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <div className={`relative flex items-stretch h-12 w-full rounded-xl border bg-[#050505] transition-all focus-within:ring-1 ${
                            triggerValidation && validationErrors.whatsapp
                              ? 'border-red-500/40 focus-within:ring-red-500/30 focus-within:border-red-500/40'
                              : 'border-border focus-within:ring-amber-500/50 focus-within:border-amber-500/40'
                          }`}>
                            {/* Trigger Button with Flag and Code */}
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="flex items-center gap-1.5 px-3 rounded-l-xl bg-neutral-900/10 hover:bg-neutral-900/30 border-r border-border transition-colors text-sm font-sans text-foreground select-none h-full shrink-0 outline-none"
                            >
                              <span className="text-base select-none">{selectedCountry.flag}</span>
                              <span className="font-mono text-xs text-muted-foreground/90 font-semibold">{selectedCountry.code}</span>
                              <ChevronDown size={14} className="text-muted-foreground/50 shrink-0" />
                            </button>

                            {/* Local telephone input */}
                            <input
                              id="whatsapp"
                              type="tel"
                              inputMode="tel"
                              pattern="[0-9]*"
                              required
                              value={localPhone}
                              onChange={(e) => {
                                const sanitized = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.validationRule.maxLength);
                                setLocalPhone(sanitized);
                              }}
                              placeholder={`e.g. ${selectedCountry.example}`}
                              className="flex-1 bg-transparent px-4 text-sm text-foreground focus:outline-none focus:ring-0 font-sans placeholder-muted-foreground/30 h-full w-full"
                            />
                          </div>

                          {/* Searchable Dropdown Overlay Card */}
                          {isDropdownOpen && (
                            <>
                              {/* Backdrop guard */}
                              <div className="fixed inset-0 z-40" onClick={() => {
                                setIsDropdownOpen(false);
                                setCountrySearch('');
                              }} />
                              
                              {/* Floating Dropdown Frame */}
                              <div className="absolute left-0 right-0 mt-2 top-full z-50 rounded-xl border border-neutral-800 bg-[#0c0c0c]/95 backdrop-blur-xl p-2 shadow-2xl max-h-[280px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                
                                {/* Search box */}
                                <div className="relative mb-2 shrink-0">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                                    <Search size={14} />
                                  </span>
                                  <input
                                    type="text"
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    placeholder="Search country..."
                                    className="w-full bg-[#121212] border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/40 placeholder-muted-foreground/30 font-sans"
                                    autoFocus
                                  />
                                  {countrySearch && (
                                    <button
                                      type="button"
                                      onClick={() => setCountrySearch('')}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/45 hover:text-foreground/80"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>

                                {/* Menu scroll list */}
                                <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-border">
                                  {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                      <button
                                        key={country.name}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCountry(country);
                                          setLocalPhone('');
                                          setIsDropdownOpen(false);
                                          setCountrySearch('');
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                                          selectedCountry.name === country.name
                                            ? 'bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20'
                                            : 'text-neutral-300 hover:bg-neutral-800/50 border border-transparent'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-base select-none">{country.flag}</span>
                                          <span className="text-xs font-sans tracking-wide truncate max-w-[124px]">{country.name}</span>
                                        </div>
                                        <span className="text-xs font-mono font-medium text-muted-foreground">{country.code}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="py-6 text-center text-[11px] text-muted-foreground font-mono">
                                      No matches found
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {triggerValidation && validationErrors.whatsapp ? (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-[11px] mt-1.5 font-sans"
                          >
                            {validationErrors.whatsapp}
                          </motion.p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
                            We use WhatsApp to deliver instant prototypes and updates.
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold flex justify-between">
                          <span>Business Email *</span>
                          {triggerValidation && validationErrors.email && (
                            <span className="text-red-400 normal-case font-mono font-medium tracking-normal">⚠️ Invalid format</span>
                          )}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                            <Mail size={16} />
                          </span>
                          <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="you@company.com"
                            className={`pl-11 border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full ${
                              triggerValidation && validationErrors.email
                                ? 'border-red-500/40 focus:ring-red-500/30 focus:border-red-500/40'
                                : 'border-border focus:ring-amber-500/50 focus:border-amber-500/40'
                            }`}
                          />
                        </div>
                        {triggerValidation && validationErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-[11px] mt-1.5 font-sans"
                          >
                            {validationErrors.email}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Industry & Objectives */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-lg text-white font-semibold tracking-wide border-b border-neutral-900 pb-2">
                    2. Describe your domain of operation
                  </h3>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-3 font-bold">
                      Business Type / Industry Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {INDUSTRIES.map(ind => {
                        const Icon = ind.icon;
                        const isSelected = formData.industry === ind.id;
                        return (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => updateField('industry', ind.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all h-[100px] gap-2 select-none active:scale-95 ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                                : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800 hover:text-foreground'
                            }`}
                          >
                            <Icon size={20} className={isSelected ? 'text-amber-400' : 'text-muted-foreground/60'} />
                            <span className="text-[11px] font-medium tracking-wide leading-tight">{ind.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {formData.industry === 'other' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          required
                          value={formData.customIndustry}
                          onChange={(e) => updateField('customIndustry', e.target.value)}
                          placeholder="What is your business type?"
                          className="border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-3 font-bold">
                      Your Primary Goal / Target *
                    </label>
                    <div className="space-y-2.5">
                      {GOALS.map(goal => {
                        const isSelected = formData.goal === goal.id;
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => updateField('goal', goal.id)}
                            className={`flex items-center gap-3 w-full p-3.5 rounded-xl border text-left transition-all select-none active:scale-[0.99] ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-[inset_0_1px_2px_rgba(251,191,36,0.1)]' 
                                : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800 hover:text-foreground'
                            }`}
                          >
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-amber-500 bg-amber-500/20' : 'border-neutral-800'
                            }`}>
                              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                            </div>
                            <span className="text-sm font-medium tracking-wide">{goal.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Package Choice & Ownership */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-lg text-white font-semibold tracking-wide border-b border-neutral-900 pb-2">
                    3. Select Plan Capacity & File Control
                  </h3>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-3 font-bold">
                      {isPlanLocked ? 'PRE-SELECTED PACKAGE CAPACITY (LOCKED)' : 'Select Package Capacity'}
                    </label>
                    {isPlanLocked ? (
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] shadow-[0_4px_22px_rgba(245,158,11,0.06)]">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Lock size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest">Active Plan Registered</span>
                            <h4 className="font-display text-sm sm:text-base font-bold text-white leading-normal mt-0.5">{selectedPlan.name} Tier</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-glow text-sm sm:text-base font-bold text-amber-400 block">{selectedPlan.price}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/60 block mt-0.5 uppercase tracking-wide">Locked for Onboarding</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-3 font-sans">
                        {pricingPlans.map(plan => {
                          const isSelected = formData.packageId === plan.id;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => updateField('packageId', plan.id)}
                              className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all select-none active:scale-95 ${
                                isSelected 
                                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-[0_4px_16px_rgba(245,158,11,0.15)]' 
                                  : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800 hover:text-foreground'
                              }`}
                            >
                              {plan.highlight && (
                                <span className="absolute -top-2.5 right-3 bg-amber-500/20 border border-amber-500/30 text-[8px] font-mono font-bold tracking-wider text-amber-400 px-2 py-0.5 rounded-full uppercase">
                                  Popular
                                </span>
                              )}
                              <span className="text-xs font-mono text-muted-foreground/60 tracking-wider truncate">{plan.tagline}</span>
                              <span className="font-display text-lg font-bold text-white mt-1 leading-none">{plan.name}</span>
                              <span className="text-sm font-semibold mt-3 text-glow text-amber-400/90">{plan.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
                      * You can scale or adapt plan features later if needed. Included elements will refine during the virtual design session.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-3 font-bold">
                      Ownership & Operations Model
                    </label>
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => updateField('ownership', 'managed')}
                        className={`flex flex-col p-4 sm:p-5 rounded-2xl border text-left transition-all select-none active:scale-[0.98] ${
                          formData.ownership === 'managed' 
                            ? 'bg-amber-500/10 border-amber-500 text-white' 
                            : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800'
                        }`}
                      >
                        <span className="font-display font-bold text-sm text-white">Managed Partnership</span>
                        <p className="text-xs text-muted-foreground/85 mt-2 leading-relaxed">
                          We handle all secure hosting, weekly backups, maintenance, SSL assistance, and tech supports to keep your site fast and optimized automatically.
                        </p>
                        <span className="mt-4 text-[10px] font-mono tracking-wider font-bold text-amber-400/90 uppercase self-start bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                          ⭐ Hassle Free
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateField('ownership', 'full')}
                        className={`flex flex-col p-4 sm:p-5 rounded-2xl border text-left transition-all select-none active:scale-[0.98] ${
                          formData.ownership === 'full' 
                            ? 'bg-[#EAE5D9]/5 border-[#EAE5D9]/40 text-white' 
                            : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800'
                        }`}
                      >
                        <span className="font-display font-bold text-sm text-white">Full Control Ownership</span>
                        <p className="text-xs text-muted-foreground/85 mt-2 leading-relaxed">
                          Get absolute code ownership transferred directly to you. Received raw static web files, components assets, code bundles, and launch packages to host yourself.
                        </p>
                        <span className="mt-4 text-[10px] font-mono tracking-wider text-neutral-400 uppercase self-start bg-neutral-800/60 px-2.5 py-0.5 rounded-full">
                          All Files Transferred
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Asset Center Readiness */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-lg text-white font-semibold tracking-wide border-b border-neutral-900 pb-2">
                    4. Outline Assets & Materials Readiness
                  </h3>

                  {/* Domain Registration */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-amber-500/80" />
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">
                        Website Address (Domain Name)
                      </label>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {[
                        { id: 'yes', label: 'Registered' },
                        { id: 'no', label: 'Not Yet' },
                        { id: 'help', label: 'Need help choosing' }
                      ].map(opt => {
                        const isSelected = formData.hasDomain === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField('hasDomain', opt.id)}
                            className={`px-4 py-3 rounded-xl border text-xs font-medium tracking-wide text-center uppercase select-none transition-all active:scale-95 ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-white' 
                                : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Brand Logo & Design */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-amber-500/80" />
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">
                        Company Logo & Brand Colors
                      </label>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {[
                        { id: 'yes', label: 'I have one' },
                        { id: 'no', label: 'Not yet' },
                        { id: 'help', label: 'Need brand design' }
                      ].map(opt => {
                        const isSelected = formData.hasLogo === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField('hasLogo', opt.id)}
                            className={`px-4 py-3 rounded-xl border text-xs font-medium tracking-wide text-center uppercase select-none transition-all active:scale-95 ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-white' 
                                : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Copywriting & Images */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-amber-500/80" />
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">
                        Website Text & Images (Content)
                      </label>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'yes', label: 'Yes, fully structured and ready' },
                        { id: 'progress', label: 'In progress — building materials now' },
                        { id: 'no_help', label: 'None yet — I want CodeFuser to write copywriting for me' }
                      ].map(opt => {
                        const isSelected = formData.contentReady === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField('contentReady', opt.id)}
                            className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold select-none transition-all active:scale-[0.99] leading-relaxed ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-white' 
                                : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Final Review */}
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-lg text-white font-semibold tracking-wide border-b border-neutral-900 pb-2">
                    5. Review Blueprint Specifications
                  </h3>

                  <div className="rounded-2xl border border-neutral-900 bg-[#050505] p-5 space-y-4 text-xs tracking-wide">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-b border-neutral-900 pb-4">
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Company / Business</span>
                        <span className="text-white font-semibold text-sm mt-1 block">{formData.businessName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Representative</span>
                        <span className="text-white font-semibold text-sm mt-1 block">{formData.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">WhatsApp Text Reach</span>
                        <span className="text-white font-mono text-sm mt-1 block">💬 {formData.whatsapp}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Business Email Address</span>
                        <span className="text-white font-mono text-sm mt-1 block">{formData.email}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-b border-neutral-900 pb-4">
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Operating Domain</span>
                        <span className="text-white font-semibold text-sm mt-1 block capitalize">
                          {formData.industry === 'other' ? formData.customIndustry : formData.industry}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Target Business Core</span>
                        <span className="text-white font-semibold text-sm mt-1 block">
                          {GOALS.find(g => g.id === formData.goal)?.label || formData.goal}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Plan Capacity tier</span>
                        <span className="text-white font-semibold text-sm mt-1 block">
                          {selectedPlan.name} Tier ({selectedPlan.price})
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Operational Style</span>
                        <span className="text-white font-semibold text-sm mt-1 block">
                          {formData.ownership === 'full' ? 'Full Ownership (Direct Transfer)' : 'Managed Services (CodeFuser Partnership)'}
                        </span>
                      </div>
                      <div className="col-span-2 mt-2">
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest mb-1.5">Assets Center Status</span>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold tracking-wider uppercase">
                          <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                            🌐 Domain: {formData.hasDomain === 'yes' ? 'Registered' : formData.hasDomain === 'no' ? 'Not Ready' : 'Need Select assistance'}
                          </span>
                          <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                            🎨 Logo: {formData.hasLogo === 'yes' ? 'Provided' : formData.hasLogo === 'no' ? 'Not Ready' : 'Need Brand Design'}
                          </span>
                          <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                            📝 Media: {formData.contentReady === 'yes' ? 'Yes, structured' : formData.contentReady === 'progress' ? 'In progress' : 'Need write support'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Clearance line */}
                  <div className="flex items-center gap-3 bg-neutral-950/40 border border-neutral-900/60 p-3.5 rounded-xl">
                    <div className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400">
                        Secure Connection Guaranteed
                      </div>
                      <p className="text-[10px] text-muted-foreground/75 leading-relaxed mt-0.5 font-sans">
                        Submitting establishes an encrypted proposal packet inside client databases.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Back-Next Buttons */}
              {submitError && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs leading-relaxed flex items-start gap-2.5">
                  <span className="text-red-400 font-bold block shrink-0">⚠️ Error:</span>
                  <div>
                    <span className="font-semibold block">{submitError}</span>
                    <span className="text-red-400/80 block mt-1 font-mono">Your entered details are completely safe. Please review and click Submit to retry.</span>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-neutral-900 flex justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-pressure flex items-center justify-center gap-2 border border-border/40 text-muted-foreground hover:border-border hover:text-white px-5 sm:px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider select-none active:scale-95"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn-pressure flex items-center justify-center gap-2 border border-border/20 text-muted-foreground/60 hover:text-foreground hover:border-border/60 px-5 sm:px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider select-none active:scale-95"
                  >
                    Cancel
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-pressure flex items-center justify-center gap-2 bg-white text-black hover:shadow-glow-soft hover:-translate-y-0.5 px-6 sm:px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider select-none ml-auto active:scale-95 cursor-pointer"
                  >
                    Next Step <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-pressure flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest select-none ml-auto active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3 w-3 rounded-full border-2 border-black/35 border-t-black animate-spin" />
                        Establishing Track...
                      </>
                    ) : (
                      <>
                        Submit Blueprint <Send size={13} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden"
              id="start-project-success"
            >
              {/* Decorative glows */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/[0.015] blur-[150px] pointer-events-none" />

              <div className="text-center mb-8">
                {/* Status Indicator */}
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Check size={10} strokeWidth={3} /> System Initialized
                </span>
                
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Blueprint Filed Successfully.
                </h2>
                <p className="text-sm text-muted-foreground/90 max-w-2xl mx-auto mt-3 leading-relaxed font-sans">
                  Excellent, <span className="text-[#FAF9F5] font-semibold">{formData.ownerName}</span>. 
                  Your blueprint has been logged in our queue. We mapped out a custom digital track for 
                  <span className="text-white font-bold"> {formData.businessName}</span>.
                </p>
              </div>

              {/* Package Upgrades suite block */}
              <div className="mt-8 mb-10 border-t border-neutral-900 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Strategic Package Blueprint Evaluation
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                      Consultant pricing tier comparison: Pick from our optimized upgrades staying within psychological reach of your target budget.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-[10px] font-mono px-2 py-1 rounded border border-neutral-800 bg-[#0c0c0c] text-muted-foreground">
                      3 Close Budgets Compared
                    </span>
                  </div>
                </div>

                {loadingRecommendations && (
                  <motion.div
                    key="rec-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-neutral-900 bg-black/40 p-12 text-center"
                  >
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border border-neutral-800 animate-pulse" />
                      <div className="absolute inset-1.5 rounded-full border border-amber-500/20 border-t-amber-500 animate-spin" />
                    </div>
                    <p className="text-xs font-mono text-amber-500 uppercase tracking-widest animate-pulse">
                      INTELLIGENT ANALYSIS ACTIVE
                    </p>
                    <h4 className="font-display text-sm font-bold text-white mt-3">
                      Strategizing package pathways...
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                      Calculating psychological value tiers, pricing lists, and tailoring outcome-oriented outcomes based on your business objective.
                    </p>
                  </motion.div>
                )}

                {!loadingRecommendations && recommendationCards && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {recommendationCards.map((card, idx) => {
                      const isSelected = selectedCardId === card.id;
                      let badge = "CURRENT SELECTION";
                      let badgeStyle = "bg-neutral-800 text-[#a0a0a0] border-neutral-700";
                      
                      if (card.id === 'upgrade_1') {
                        badge = "+ BETTER VALUE";
                        badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/25";
                      } else if (card.id === 'upgrade_2') {
                        badge = "+ MOST OPTIMAL CHOICE";
                        badgeStyle = "bg-gradient-to-r from-amber-500/15 to-amber-600/15 text-[#FAF9F5] border-amber-500/35";
                      }

                      return (
                        <motion.div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          whileHover={{ y: -4 }}
                          className={`relative select-none cursor-pointer p-5 sm:p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                            isSelected 
                              ? 'border-amber-500 bg-neutral-900/80 shadow-[0_15px_30px_rgba(245,158,11,0.06)]' 
                              : 'border-neutral-900 bg-[#0a0a0a] hover:border-neutral-800 hover:bg-neutral-900/20'
                          }`}
                        >
                          {/* Selected highlighting border */}
                          {isSelected && (
                            <div className="absolute -inset-px rounded-2xl border border-amber-500 pointer-events-none" />
                          )}

                          <div>
                            {/* Card badge & Selection Indicator wrapper */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border inline-block tracking-wider uppercase ${badgeStyle}`}>
                                {badge}
                              </span>
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'border-amber-500 bg-amber-500 text-black' 
                                  : 'border-neutral-800 bg-transparent'
                              }`}>
                                {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                              </div>
                            </div>

                            <div className="mb-3">
                              {card.id === 'current' && (
                                <p className="text-[10px] font-mono font-bold tracking-[0.14em] text-neutral-400 mb-0.5 uppercase">
                                  Your Selected Package
                                </p>
                              )}
                              <h4 className="font-display text-base font-black text-white">
                                {card.name}
                              </h4>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className={`font-display text-xl font-black ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                                  {card.price}
                                </span>
                                <span className="text-[10px] text-muted-foreground">one-time</span>
                              </div>
                            </div>

                            <p className="text-[11px] font-sans font-medium text-neutral-300 leading-snug min-h-[32px] mb-4">
                              {card.headline}
                            </p>

                            <div className="border-t border-neutral-900/60 my-3.5" />

                            {/* Bullet points mapping */}
                            <ul className="space-y-2.5 text-[11px] mb-6">
                              {card.benefits && card.benefits.map((benefit: string, bIdx: number) => {
                                // Remove prefix "✓ " if model attached it, since we'll render a custom themed checkmark
                                const trimmedBenefit = benefit.replace(/^✓\s*/, "");
                                return (
                                  <li key={bIdx} className="flex items-start gap-2 leading-relaxed text-neutral-400">
                                    <Check className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                                    <span>{trimmedBenefit}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Strategist Note Rationale */}
                          <div className="mt-auto border-t border-neutral-900/60 pt-3">
                            <p className="text-[10px] italic leading-normal text-muted-foreground/80">
                              <span className="font-bold uppercase tracking-wider text-[#FAF9F5]/70 not-italic block mb-0.5 text-[8px]">STRATEGIST'S OPTIMIZATION:</span>
                              {card.rationale}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Visual Roadmap Card */}
              <div className="rounded-2xl border border-neutral-900 bg-[#050505] p-5 text-left max-w-lg mx-auto">
                <div className="text-[10px] font-mono tracking-widest text-[#64748B] uppercase font-bold mb-3">
                  IMMEDIATE NEXT STEPS
                </div>
                <ul className="space-y-4 text-xs">
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">1</span>
                    <div>
                      <p className="font-bold text-white leading-normal font-sans">Book Strategy Session (cal.com)</p>
                      <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">
                        Reserve a direct 1-on-1 virtual strategy session with a CodeFuser consultant to solidify your design guidelines and technical parameters.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-muted-foreground font-mono text-[10px]">2</span>
                    <div>
                      <p className="font-bold text-neutral-300 leading-normal font-sans">Review Technical Blueprint</p>
                      <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">
                        During our call, we will load your assets checklist, evaluate domain targets, and authorize prototype construction live.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                {/* Official Strategy Call */}
                <a 
                  href={getPrefilledComposeMail(
                    recommendationCards?.find(c => c.id === selectedCardId)?.name,
                    recommendationCards?.find(c => c.id === selectedCardId)?.price
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white h-12 shadow-[0_12px_24px_rgba(255,255,255,0.06)] hover:-translate-y-0.5 pointer-events-auto cursor-pointer"
                >
                  <Calendar size={14} /> Schedule Your Strategy Call
                </a>

                {/* WhatsApp Chat pre-filled link */}
                <a 
                  href={getWhatsAppLink(
                    `Hi CodeFuser, I just submitted the Start Project onboarding form for ${formData.businessName}! I selected the customized ${
                      recommendationCards?.find(c => c.id === selectedCardId)?.name || selectedPlan.name
                    } (${
                      recommendationCards?.find(c => c.id === selectedCardId)?.price || selectedPlan.price
                    }) package configuration. I'm ready to schedule our strategy session!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pressure inline-flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 px-6 py-3.5 rounded-full w-full text-xs font-bold uppercase tracking-wider h-12 select-none hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-1 focus:ring-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  Discuss on WhatsApp
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-muted-foreground hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function getOnboardingFallbackUpgrades(
  packageId: string,
  businessName: string = "Your Business",
  ownerName: string = "",
  industry: string = "",
  goal: string = ""
) {
  const bName = businessName || "Your Business";
  
  if (packageId === "foundation") {
    return [
      {
        id: "current",
        name: "⚡ Ignite",
        price: "₹9,999",
        headline: "High-impact digital hub to secure your online presence.",
        benefits: [
          "✓ Set up a professional, modern landing page for your brand.",
          "✓ Create a direct and convenient WhatsApp channel for clients.",
          "✓ Easily display essential details, location, and services.",
          "✓ Fast speed optimization to maximize user retention."
        ],
        rationale: "This package maps perfectly to your starting budget and secures all operational foundations with zero ongoing maintenance friction."
      },
      {
        id: "upgrade_1",
        name: "⚡ Ignite+",
        price: "₹12,999",
        headline: "Maximize first impressions and increase customer action.",
        benefits: [
          "✓ Showcase your premium past projects in an elegant interactive gallery.",
          "✓ Capture high-intent customers with tailored custom enquiry forms.",
          "✓ Build unique interactive layouts with responsive micro-animations."
        ],
        rationale: "Investing just a little more allows you to showcase physical proof of your work, making it significantly easier to convert cold visitors into inquiries."
      },
      {
        id: "upgrade_2",
        name: "⚡ Ignite Pro",
        price: "₹14,999",
        headline: "The ultimate marketing launchpad for high-performing lead generation.",
        benefits: [
          "✓ Build stronger customer trust by displaying local Google Reviews live.",
          "✓ Acquire repeat visitors effortlessly with a clean newsletter setup.",
          "✓ Rank higher on Google Search for prospective local customers looking for your help."
        ],
        rationale: "This provides the absolute strongest balance between your initial investment and long-term search visibility, laying a rock-solid foundation for future marketing efforts without a heavy price jump."
      }
    ];
  }

  if (packageId === "dominance") {
    return [
      {
        id: "current",
        name: "⬢ Catalyst",
        price: "₹49,999",
        headline: "Complete enterprise capability featuring deep automated solutions.",
        benefits: [
          "✓ Launch full-scale multi-section customized layouts highlighting your brand.",
          "✓ Automate initial response flows to minimize manual client management.",
          "✓ Complete lead capturing system with robust customer storage setups."
        ],
        rationale: "Our elite tier delivers ultimate code autonomy, advanced layout configurations, and high-velocity workflow automation optimized for high-ticket acquisition."
      },
      {
        id: "upgrade_1",
        name: "⬢ Catalyst+",
        price: "₹54,999",
        headline: "Empower your customer journeys with interactive AI automation.",
        benefits: [
          "✓ Answer queries 24/7 with a conversational smart AI assistant customized for your services.",
          "✓ Organize and track your incoming prospects with a centralized lead repository.",
          "✓ Map interactive customer routing to simplify on-site booking visits."
        ],
        rationale: "By making a modest incremental investment, your website transforms into an active virtual employee that autonomously handles introductory chats and organizes customer records."
      },
      {
        id: "upgrade_2",
        name: "⬢ Catalyst Pro",
        price: "₹59,999",
        headline: "The complete self-contained digital business ecosystem.",
        benefits: [
          "✓ Give clients safe, dedicated portal accounts to manage their own requirements.",
          "✓ Seamlessly synchronize your scheduling and inquiry records with all native productivity tools.",
          "✓ Spot new growth opportunities using customized strategic data charts."
        ],
        rationale: "This provides the ultimate configuration for high-velocity operations, merging customized client interfaces with full automated tools so that your digital setup scales seamlessly handles complex operations."
      }
    ];
  }

  // Default / "growth" / Fusion
  return [
    {
      id: "current",
      name: "✦ Fusion",
      price: "₹24,999",
      headline: "Scalable growth platform to scale local visibility.",
      benefits: [
        "✓ Capture higher-quality leads with clean multi-page user journeys.",
        "✓ Direct client scheduler synchronization to bypass calendar gridlocks.",
        "✓ Overcome local bottlenecks with optimized FAQ tables and testimonial displays."
      ],
      rationale: "Our most popular core plan equips you with extensive conversion tools, interactive sections, and high-velocity responsiveness to build immediate online authority."
    },
    {
      id: "upgrade_1",
      name: "✦ Fusion+",
      price: "₹27,999",
      headline: "Accelerate user trust and elevate operational conversion.",
      benefits: [
        "✓ Build rock-solid immediate trust by syncing live Google Reviews directly on your pages.",
        "✓ Retain premium look with high-fidelity customized transition layout patterns.",
        "✓ Help more site visitors take immediate action with custom conversion hooks."
      ],
      rationale: "A modest improvement lets you leverage existing brand reviews and visual delight, translating directly into a higher booking volume for the exact same ad spend."
    },
    {
      id: "upgrade_2",
      name: "✦ Fusion Pro",
      price: "₹29,999",
      headline: "Full-scale marketing engine optimized to nurture target traffic.",
      benefits: [
        "✓ Keep prospects warm automatically using a tailored newsletter campaign channel.",
        "✓ Win local search results over competitors with enhanced semantic search optimization (SEO).",
        "✓ Simplify operational inquiries with automated confirmation alerts to WhatsApp."
      ],
      rationale: "This package provides the optimal balance of initial investment and high-octane growth capabilities, adding active engagement systems that keep your clients hooked and turning back to your services."
    }
  ];
}

export default StartProjectPage;
