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
import { getAuthUser } from '../utils/auth';
import { supabase } from '../lib/supabase';
import { safeLocalStorage } from '../utils/safeStorage';

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
  aiPrompt?: string;
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

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const StartProjectPage: React.FC = () => {
  const { navigate } = useAppRouter();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Intelligent Package Recommendation states
  const [recommendationCards, setRecommendationCards] = useState<any[] | null>(null);
  const [tempFetchedCards, setTempFetchedCards] = useState<any[] | null>(null);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [preferredContactTime, setPreferredContactTime] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>('current');

  // Stages: 'form' | 'ai_loading' | 'recommendations' | 'payment' | 'calendly' | 'asset_center' | 'success'
  const [onboardingStage, setOnboardingStage] = useState<'form' | 'ai_loading' | 'recommendations' | 'payment' | 'calendly' | 'asset_center' | 'success'>('form');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<'milestone' | 'upfront'>('milestone');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null);
  const [showSandboxFallback, setShowSandboxFallback] = useState(false);

  const finalSelCardForPayment = (recommendationCards)
    ? (recommendationCards.find(c => c.id === selectedCardId) || { name: 'Ignite Baseline', price: '₹14,999' })
    : { name: 'Ignite Baseline', price: '₹14,999' };
  const numericPriceForPayment = parseInt((finalSelCardForPayment.price || "").replace(/[^\d]/g, ""), 10) || 14999;
  const partPayment = Math.round(numericPriceForPayment * 0.5);
  const discountVal = Math.round(numericPriceForPayment * 0.1);
  const upfrontTotal = Math.round(numericPriceForPayment * 0.9);

  useEffect(() => {
    setMaxStep(prev => Math.max(prev, step));
  }, [step]);

  // Premium Progressive AI Analysis state coordinator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (onboardingStage === 'ai_loading') {
      setActiveStepIndex(0);
      setLoadingFinished(false);

      interval = setInterval(() => {
        setActiveStepIndex(prev => {
          const nextIndex = prev + 1;
          const stepsCount = 8; // We have 8 steps (0 to 7)
          
          if (nextIndex < stepsCount) {
            return nextIndex;
          } else {
            clearInterval(interval);
            return prev; // stays on step index 7 ("Preparing recommendations") until loaded
          }
        });
      }, 1000); // 1s transition per step representation
    }
    return () => clearInterval(interval);
  }, [onboardingStage]);

  // Once steps have reached completion AND cards are loaded, complete the loader and transition
  useEffect(() => {
    if (onboardingStage === 'ai_loading' && activeStepIndex === 7 && tempFetchedCards) {
      setLoadingFinished(true);
      const timer = setTimeout(() => {
        setRecommendationCards(tempFetchedCards);
        setOnboardingStage('recommendations');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500); // show elegant Analysis Complete card for 1.5s
      return () => clearTimeout(timer);
    }
  }, [onboardingStage, activeStepIndex, tempFetchedCards]);

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
    contentReady: 'no_help',
    aiPrompt: ''
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

  // Pre-fill fields from logged-in session on mount & Restore saved draft automatically (Part 1)
  const [draftSavedMessage, setDraftSavedMessage] = useState<boolean>(false);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        email: authUser.email || prev.email,
        ownerName: authUser.user_metadata?.full_name || authUser.fullName || prev.ownerName || "",
        businessName: authUser.user_metadata?.business_name || authUser.businessName || prev.businessName || ""
      }));
    }

    // Restore saved draft
    const savedDraft = safeLocalStorage.getItem("codefuser_start_project_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) {
          setFormData(prev => ({ ...prev, ...parsed.formData }));
        }
        if (parsed.step) {
          setStep(parsed.step);
        }
        if (parsed.localPhone) {
          setLocalPhone(parsed.localPhone);
        }
        if (parsed.selectedCountryCode) {
          const match = COUNTRIES.find(c => c.code === parsed.selectedCountryCode);
          if (match) {
            setSelectedCountry(match);
          }
        }
      } catch (err) {
        console.warn("Fuser draft restoration failed:", err);
      }
    }
  }, []);

  // Save changes automatically
  useEffect(() => {
    if (!isSubmitted && !isSubmitting && (formData.businessName || formData.ownerName || localPhone || step > 1)) {
      const draftData = {
        formData,
        step,
        localPhone,
        selectedCountryCode: selectedCountry.code
      };
      safeLocalStorage.setItem("codefuser_start_project_draft", JSON.stringify(draftData));
      
      setDraftSavedMessage(true);
      const timer = setTimeout(() => {
        setDraftSavedMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, step, localPhone, selectedCountry, isSubmitted, isSubmitting]);

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

  const handleChipClick = (category: string) => {
    let template = '';
    switch (category) {
      case 'Design Style':
        template = '### Design Style:\n- [e.g. Minimalist, bold, luxury black theme, generous white margins...]\n\n';
        break;
      case 'Competitors':
        template = '### Competitors:\n- [e.g. competitor-brand.com, what they lack vs. what you want...]\n\n';
        break;
      case 'Target Audience':
        template = '### Target Audience:\n- [e.g. High-net-worth clients, young families, local community...]\n\n';
        break;
      case 'Colors':
        template = '### Preferred Colors:\n- [e.g. Gold & Matte Black, Charcoal & White, Emerald & Sand...]\n\n';
        break;
      case 'Features':
        template = '### Key Features Wishlist:\n- [e.g. Live booking calendar, seamless WhatsApp floating contact...]\n\n';
        break;
      case 'References':
        template = '### Reference Sites We Like:\n- [e.g. Apple.com, Stripe.com clean aesthetics...]\n\n';
        break;
      default:
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      aiPrompt: (prev.aiPrompt || '') + template
    }));
  };

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
      const authUser = getAuthUser();
      const payload = {
        ...formData,
        userId: authUser?.id || ""
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const resJson = await response.json();
      const savedProject = resJson.data;
      if (savedProject && savedProject.id) {
        setCreatedProjectId(savedProject.id);
      }

      // Clear automatic draft persistence (Part 1 requirement)
      safeLocalStorage.removeItem("codefuser_start_project_draft");

      // Save submission locally for future dashboard lookup & offline redundancy
      const savedRequests = JSON.parse(safeLocalStorage.getItem('codefuser_requests') || '[]');
      const newRequest = {
        ...formData,
        id: savedProject?.id || `REQ-${Date.now()}`,
        timestamp: savedProject?.timestamp || new Date().toISOString(),
        status: savedProject?.status || 'Assets Pending'
      };
      savedRequests.push(newRequest);
      safeLocalStorage.setItem('codefuser_requests', JSON.stringify(savedRequests));
      safeLocalStorage.setItem('codefuser_current_project', JSON.stringify(newRequest));
      safeLocalStorage.setItem('fuser_client_project_id', newRequest.id);

      // Reset loading progressive states
      setActiveStepIndex(0);
      setLoadingFinished(false);
      setTempFetchedCards(null);

      // 1. Transition into full AI Loading screen immediately
      setOnboardingStage('ai_loading');
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 2. Load intelligent package recommendations
      setLoadingRecommendations(true);
      setRecommendationError(null);
      
      let fetchedCards = null;

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
            aiPrompt: formData.aiPrompt
          })
        });
        if (recResponse.ok) {
          const recData = await recResponse.json();
          if (recData && recData.options && recData.options.length === 3) {
            fetchedCards = recData.options;
            if (recData.summary) {
              setAiSummary(recData.summary);
            }
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
        fetchedCards = fallbackOptions;

        const fallbackSummary = getOnboardingFallbackSummary(
          formData.packageId,
          formData.businessName,
          formData.industry === 'other' ? formData.customIndustry : formData.industry,
          formData.goal === 'other' ? formData.customGoal : formData.goal,
          formData.aiPrompt
        );
        setAiSummary(fallbackSummary);
      }

      if (fetchedCards) {
        setTempFetchedCards(fetchedCards);
      }
      setLoadingRecommendations(false);

    } catch (err: any) {
      console.error("Submission failed:", err);
      // Friendly retry message, and never lose the client's entered data.
      setSubmitError(err.message || "Failed to establish database transmission. Please check your network and retry.");
      setIsSubmitting(false);
      setOnboardingStage('form');
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
    const totalSteps = 6;
    const pct = ((step - 1) / (totalSteps - 1)) * 100;
    return (
      <div className="mb-10 sm:mb-12">
        <div className="flex justify-between items-center text-xs text-muted-foreground/60 font-mono tracking-widest mb-3 uppercase">
          <span>PROGRESS: STAGE 0{step} OF 06</span>
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

      <div className={`mx-auto transition-all duration-500 ${onboardingStage !== 'form' && onboardingStage !== 'ai_loading' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <AnimatePresence mode="wait">
          {onboardingStage === 'form' ? (
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

              {/* Draft auto save indicator */}
              <AnimatePresence>
                {draftSavedMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2 text-[10px] font-mono text-emerald-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Draft saved automatically.
                  </motion.div>
                )}
              </AnimatePresence>

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

              {/* Step 5: Help CodeFuser AI Understand Your Vision */}
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="font-display text-xl text-white font-black tracking-tight flex items-center gap-2">
                      🧠 Help CodeFuser AI Understand Your Vision
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Our AI can create much better recommendations when it understands your business goals, preferences, and ideas. Everything here is optional. This information will improve your personalized recommendations.
                    </p>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                      Quick templates (click to tap-add)
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {[
                        { label: '🎨 Design Style', cat: 'Design Style' },
                        { label: '🏆 Competitors', cat: 'Competitors' },
                        { label: '🎯 Target Audience', cat: 'Target Audience' },
                        { label: '✨ Colors & Palette', cat: 'Colors' },
                        { label: '⚙️ Key Features', cat: 'Features' },
                        { label: '🔗 Reference Sites', cat: 'References' }
                      ].map((chip) => (
                        <button
                          key={chip.cat}
                          type="button"
                          onClick={() => handleChipClick(chip.cat)}
                          className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High Quality Textarea Box */}
                  <div className="relative">
                    <textarea
                      value={formData.aiPrompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                      rows={9}
                      placeholder="• I want a premium black luxury website.&#10;• My customers mainly contact me on WhatsApp.&#10;• I like Apple's clean design.&#10;• I want lots of animations.&#10;• I already have branding.&#10;• My competitors' websites are outdated.&#10;• I want to rank on Google.&#10;• I like this website: __________&#10;• Anything else you'd like our AI to know..."
                      className="w-full text-xs font-sans rounded-2xl border border-neutral-900 bg-black/60 p-5 text-white placeholder-neutral-500/70 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none leading-relaxed resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                    />
                    <div className="absolute right-4 bottom-4 flex items-center gap-1.5 text-[9px] font-mono text-neutral-500">
                      <Sparkles size={10} className="text-amber-500/70" /> CodeFuser Client Assist
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Final Review */}
              {step === 6 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-lg text-white font-semibold tracking-wide border-b border-neutral-900 pb-2">
                    6. Review Blueprint Specifications
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
                      {formData.aiPrompt && (
                        <div className="col-span-2 mt-2 pt-2 border-t border-neutral-900">
                          <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Custom Design/Business Vision</span>
                          <p className="text-neutral-300 italic mt-1 block max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed text-[11px]">{formData.aiPrompt}</p>
                        </div>
                      )}
                      <div className="col-span-2 mt-2 pt-2 border-t border-neutral-900">
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

                {step < 6 ? (
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
          ) : onboardingStage === 'ai_loading' ? (
            <motion.div
              key="ai-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto"
            >
              <div className="absolute inset-0 bg-[#020202]/40" />
              <div className="absolute top-1/4 left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-amber-500/[0.04] blur-[150px] pointer-events-none animate-pulse" />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-lg rounded-3xl border border-neutral-900/80 bg-[#080808]/90 p-8 sm:p-10 text-center shadow-[0_45px_100px_rgba(0,0,0,1.0),0_0_50px_rgba(245,158,11,0.03)] overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                
                {/* Loader Wheel */}
                <div className="relative mx-auto w-20 h-20 mb-8">
                  <div className="absolute inset-0 rounded-full border border-neutral-900" />
                  <div className="absolute inset-x-0 top-0 bottom-0 rounded-full border-t-2 border-r-2 border-amber-500 animate-spin" style={{ animationDuration: '0.8s' }} />
                  <div className="absolute inset-2.5 rounded-full border border-neutral-900 bg-neutral-950 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                  </div>
                </div>

                {/* Subtitle Accent */}
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase mb-4 animate-pulse">
                  ⚡ Intelligent Consultant Engine Active
                </span>

                {/* Title */}
                <h2 className="font-display text-2xl font-black text-white tracking-tight">
                  {loadingFinished ? "📦 Formulation Complete!" : "🧠 Strategizing Upgrade Blueprints"}
                </h2>
                <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                  {loadingFinished 
                    ? "Opening your personalized recommendation dashboard..." 
                    : `Formulating custom outcomes for ${formData.businessName} based on industry benchmarks & goals.`
                  }
                </p>

                {/* Progressive Checklist Area */}
                <div className="mt-8 border-t border-neutral-900/60 pt-6 max-w-md mx-auto text-left space-y-3 font-sans">
                  {[
                    "Analyzing your core brand parameters...",
                    "Integrating provided customer vision goals...",
                    "Synthesizing industry competitor frameworks...",
                    "Formulating tailored business growth pillars...",
                    "Evaluating modern conversion layout patterns...",
                    "Calibrating strategic pricing advantages...",
                    "Structuring flexible partner funding plans...",
                    "Compiling personalized package blueprint..."
                  ].map((stepLabel, idx) => {
                    const isDone = idx < activeStepIndex;
                    const isActive = idx === activeStepIndex;
                    const isUpcoming = idx > activeStepIndex;

                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-3 transition-opacity duration-300 text-xs ${
                          isDone 
                            ? 'text-neutral-300' 
                            : isActive 
                            ? 'text-amber-400 font-semibold' 
                            : 'text-neutral-700 font-light'
                        }`}
                      >
                        {isDone ? (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold">
                            ✓
                          </span>
                        ) : isActive ? (
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                            <div className="h-2 w-2 bg-amber-500 rounded-full animate-ping" />
                          </div>
                        ) : (
                          <div className="h-1.5 w-1.5 bg-neutral-900 rounded-full ml-1.5 shrink-0" />
                        )}
                        <span className="leading-none">{stepLabel}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Complete Notification */}
                {loadingFinished && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-[#060606]/95 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                      <Check className="h-6 w-6" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black mb-1">Analysis Complete</span>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight">Your Strategy is Formulated</h3>
                    <p className="text-xs text-neutral-400 mt-2 max-w-xs leading-relaxed">
                      Launching your upgrade choices tailored explicitly to premium business growth.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ) : onboardingStage === 'recommendations' ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/[0.015] blur-[150px] pointer-events-none" />

              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase mb-4">
                  <Sparkles size={10} /> AI Tailored Packaging
                </span>
                
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Recommended Plan Comparison
                </h2>
                <p className="text-sm text-neutral-400 max-w-2xl mx-auto mt-3 leading-relaxed">
                  We've evaluated your plan and matched it with the best options for your business. Let's find your optimal path forward.
                </p>
              </div>

              {/* Dynamic AI Executive Summary diagnostic card */}
              {aiSummary && (
                <div className="mb-10 rounded-2xl border border-neutral-900 bg-[#080808]/40 p-5 sm:p-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] relative overflow-hidden font-sans">
                  <div className="absolute inset-y-0 right-0 w-32 bg-amber-500/[0.015] blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-2 mb-4 border-b border-neutral-950 pb-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">🧠 AI Summary</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Core Attributes */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/60 border border-neutral-950 p-3 rounded-xl">
                          <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest mb-1">BUSINESS CATEGORY</span>
                          <span className="text-xs font-semibold text-white block">{aiSummary.businessCategory || "Professional services"}</span>
                        </div>
                        <div className="bg-black/60 border border-neutral-950 p-3 rounded-xl">
                          <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest mb-1">SPECIFIC WORKTYPE</span>
                          <span className="text-xs font-semibold text-white block truncate">{aiSummary.specificBusinessType || "Custom Outlet"}</span>
                        </div>
                      </div>
                      
                      <div className="bg-black/60 border border-neutral-950 p-3 rounded-xl">
                        <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest mb-1">PRIMARY GOAL & OBJECTIVE</span>
                        <span className="text-xs font-semibold text-white block">{aiSummary.primaryBusinessGoal || "Scale local conversion channels"}</span>
                      </div>

                      {aiSummary.customerVision && aiSummary.customerVision !== "Setup premium design systems with swift micro-animations." && (
                        <div className="bg-black/60 border border-neutral-950 p-3 rounded-xl">
                          <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest mb-1">CUSTOMER VISION SUMMARY</span>
                          <p className="text-[11px] font-medium text-neutral-300 leading-relaxed italic">
                            "{aiSummary.customerVision}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Strategic Catalyst */}
                    <div className="flex flex-col justify-between gap-3">
                      <div className="bg-amber-500/[0.02] border border-amber-500/10 p-3 sm:p-4 rounded-xl flex-1 flex flex-col justify-center">
                        <span className="block text-[8px] font-mono text-amber-500/80 uppercase tracking-widest mb-1 font-bold">💡 BIGGEST OPPORTUNITY</span>
                        <p className="text-xs font-semibold text-amber-100 leading-relaxed font-sans">
                          {aiSummary.biggestOpportunity || "Deploying automated customer routing with live synchronization tools."}
                        </p>
                      </div>

                      <div className="bg-neutral-900/40 border border-neutral-900 p-3 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest">RECOMMENDED STARTING PATH</span>
                          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{aiSummary.recommendedStartingPackage || "✦ Fusion+"}</span>
                        </div>
                        <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase font-bold">Best Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Why selected logic */}
                  <div className="mt-4 border-t border-neutral-950/40 pt-4 bg-neutral-950/20 -mx-5 -mb-5 p-5">
                    <span className="block text-[8px] font-mono text-amber-500/80 uppercase tracking-widest mb-1 font-extrabold">Why we recommend this:</span>
                    <p className="text-[11px] font-normal leading-relaxed text-neutral-300 font-sans">
                      {aiSummary.recommendationReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid of Recommendation Cards */}
              <div className="mt-8 mb-10">
                {recommendationCards && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {recommendationCards.map((card) => {
                      const isSelected = selectedCardId === card.id;
                      const currentCard = recommendationCards.find(c => c.id === 'current');
                      
                      const getDiffText = (item: any) => {
                        if (item.id === 'current') return null;
                        const currPriceStr = currentCard?.price || "";
                        const thisPriceStr = item.price || "";
                        const currVal = parseInt(currPriceStr.replace(/[^\d]/g, ""), 10);
                        const thisVal = parseInt(thisPriceStr.replace(/[^\d]/g, ""), 10);
                        if (!isNaN(currVal) && !isNaN(thisVal)) {
                          const diff = thisVal - currVal;
                          return `Only +₹${diff.toLocaleString('en-IN')}`;
                        }
                        return null;
                      };

                      let badge = "CURRENT PLAN";
                      let badgeStyle = "bg-neutral-800 text-[#a0a0a0] border-neutral-700";
                      
                      if (card.id === 'upgrade_1') {
                        badge = "🔥 Better Value Upgrade";
                        badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                      } else if (card.id === 'upgrade_2') {
                        badge = "👑 Most Optimal Growth Choice";
                        badgeStyle = "bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 text-amber-200 border-amber-500/35";
                      }

                      return (
                        <motion.div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          whileHover={{ y: -4 }}
                          className={`relative select-none cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                            isSelected 
                              ? 'border-amber-500 bg-neutral-900/90 shadow-[0_20px_45px_rgba(245,158,11,0.08)]' 
                              : 'border-neutral-900 bg-[#070707] hover:border-neutral-800 hover:bg-neutral-900/10'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute -inset-px rounded-2xl border border-amber-500 pointer-events-none" />
                          )}

                          <div>
                            {/* Badging & Checkbox */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded inline-block tracking-wider uppercase ${badgeStyle}`}>
                                {badge}
                              </span>
                              <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'border-amber-500 bg-amber-500 text-black' 
                                  : 'border-neutral-800 bg-transparent'
                              }`}>
                                {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                              </div>
                            </div>

                            {/* Package Details */}
                            <div className="mb-4">
                              {card.id === 'current' && (
                                <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-neutral-500 mb-0.5 uppercase">
                                  Your Selected Baseline
                                </p>
                              )}
                              <h4 className="font-display text-xl font-black text-white">
                                {card.name}
                              </h4>
                              
                              <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
                                <span className={`font-display text-2xl font-black ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                                  {card.price}
                                </span>
                                {card.id !== 'current' && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                                    {getDiffText(card) || "Best Value"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[11.5px] font-sans font-medium text-neutral-350 leading-snug min-h-[34px] mb-4">
                              {card.headline}
                            </p>

                            <div className="border-t border-neutral-900/80 my-4" />

                            {/* Section Checklist */}
                            <p className="text-[9px] font-mono text-neutral-500/85 uppercase tracking-widest block mb-3 font-semibold">
                              {card.id === 'current' ? '✓ Included Core Capabilities' : '⚡ Additional Benefits Unlocked'}
                            </p>
                            
                            <ul className="space-y-3 text-xs mb-6 font-sans">
                              {card.benefits && card.benefits.map((benefit: string, bIdx: number) => {
                                const trimmedBenefit = benefit.replace(/^✓\s*/, "");
                                return (
                                  <li key={bIdx} className="flex items-start gap-2.5 leading-relaxed text-neutral-200">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                    </span>
                                    <span className="font-medium mt-0.5">{trimmedBenefit}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Rationale Bottom Block */}
                          <div className="mt-auto border-t border-neutral-900/80 pt-3">
                            <p className="text-[10.5px] italic leading-relaxed text-neutral-400">
                              <span className="font-bold uppercase tracking-wider text-amber-400/85 not-italic block mb-0.5 text-[8.5px] font-mono">STRATEGIST RATIONALE:</span>
                              {card.rationale}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Progress CTA */}
              <div className="mt-10 flex flex-col items-center justify-center border-t border-neutral-900 pt-8 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStage('payment');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-[#eae5d9] font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full w-full h-12 shadow-[0_12px_24px_rgba(255,255,255,0.06)] hover:-translate-y-0.5 cursor-pointer leading-none active:scale-95 transition-all"
                >
                  Configure Selection & Proceed <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ) : onboardingStage === 'payment' ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-w-2xl mx-auto"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.015] blur-[120px] pointer-events-none" />

              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase mb-4">
                  💰 Exclusive Funding Structure
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Choose Your Project Terms
                </h2>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed font-sans">
                  Settle on your preferred milestone structure for <span className="font-semibold text-white">{finalSelCardForPayment.name} ({finalSelCardForPayment.price})</span>.
                </p>
              </div>

              {/* Dynamic Savings Highlight Panel */}
              <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wider">Upfront Promotion Active</h4>
                    <p className="text-[11px] text-neutral-400 leading-none mt-0.5">Opt for 100% full-settlement to save an immediate 10% on your build.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block leading-none mb-1">TOTAL CASH BONUS</span>
                  <span className="text-sm font-black font-mono text-emerald-400 leading-none">SAVE ₹{discountVal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Milestone Plan Option */}
                <div 
                  onClick={() => setSelectedPaymentTerm('milestone')}
                  className={`relative select-none cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                    selectedPaymentTerm === 'milestone' 
                      ? 'border-neutral-500 bg-neutral-900/60' 
                      : 'border-neutral-905 bg-[#080808]/80 hover:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white font-sans flex items-center gap-2">
                      50/50 Milestones Partner Plan (Standard)
                    </span>
                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                      selectedPaymentTerm === 'milestone' 
                        ? 'border-amber-500 bg-amber-500 text-black' 
                        : 'border-neutral-800 bg-transparent'
                    }`}>
                      {selectedPaymentTerm === 'milestone' && <Check className="h-3 w-3" strokeWidth={3} />}
                    </div>
                  </div>
                  
                  <p className="text-[11.5px] text-neutral-400 leading-relaxed font-sans mb-3">
                    Initiate setup with a 50% retainer. The remaining 50% activates only upon final, approved project sign-off.
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-black/60 p-3.5 rounded-xl border border-neutral-950 font-mono text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase tracking-wider mb-0.5">Due Today (50%)</span>
                      <span className="text-white font-bold text-sm">₹{partPayment.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px] uppercase tracking-wider mb-0.5">Due Pre-Launch (50%)</span>
                      <span className="text-neutral-400 font-bold text-sm">₹{partPayment.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Upfront Discount Option */}
                <div 
                  onClick={() => setSelectedPaymentTerm('upfront')}
                  className={`relative select-none cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                    selectedPaymentTerm === 'upfront' 
                      ? 'border-amber-500 bg-neutral-900 shadow-[0_15px_30px_rgba(245,158,11,0.06)]' 
                      : 'border-neutral-905 bg-[#080808]/80 hover:border-neutral-800'
                  }`}
                >
                  {/* Huge savings banner decoration */}
                  <div className="absolute right-4 top-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-black tracking-widest px-2.5 py-1 rounded">
                    PROMO: SAVE ₹{discountVal.toLocaleString('en-IN')}
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-2 pr-28">
                    <span className="text-xs font-bold text-white font-sans flex items-center gap-2">
                      🚀 100% Upfront Acceleration (VIP Priority)
                    </span>
                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                      selectedPaymentTerm === 'upfront' 
                        ? 'border-amber-500 bg-amber-500 text-black' 
                        : 'border-neutral-800 bg-transparent'
                    }`}>
                      {selectedPaymentTerm === 'upfront' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </div>
                  </div>

                  <p className="text-[11.5px] text-neutral-400 leading-relaxed font-sans mb-3">
                    Fast-track your setup in our development queue. Bypasses intermediate stages with VIP kickoff and includes cash-upfront savings.
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-black/60 p-3.5 rounded-xl border border-neutral-950 font-mono text-xs mb-4">
                    <div>
                      <span className="text-emerald-400 block text-[9px] uppercase tracking-widest font-bold mb-0.5">Instant Savings (10% Off)</span>
                      <span className="text-emerald-400 font-bold text-sm">-₹{discountVal.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 block text-[9px] uppercase tracking-widest font-bold mb-0.5">Special Acceleration Total</span>
                      <span className="text-amber-400 font-bold text-sm">₹{upfrontTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Priority benefits checkboxes */}
                  <div className="border-t border-neutral-950 pt-3 mt-3">
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block mb-2 font-bold select-none">
                      UPFRONT ACCELERATION INCLUSIONS:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400 select-none">
                      <div className="flex items-center gap-1.5">
                        <Check size={11} className="text-amber-400" /> Priority Queue
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check size={11} className="text-amber-400" /> Faster Code Start
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check size={11} className="text-amber-400" /> No Remaining Balance
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Loading or Error / Sandbox Fallback Panel */}
              {(paymentLoading || paymentErrorMsg) && (
                <div className="mt-6 p-5 rounded-2xl border border-neutral-900 bg-[#080808]/80 font-sans text-xs space-y-4">
                  {paymentLoading && (
                    <div className="flex items-center gap-3 text-neutral-300 animate-pulse">
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-amber-500 animate-spin" />
                      <span className="font-mono tracking-wide uppercase text-[10px]">Processing Secure Order Request...</span>
                    </div>
                  )}

                  {paymentErrorMsg && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400">
                        <div className="font-bold flex items-center gap-2">
                          <X size={14} className="cursor-pointer" onClick={() => setPaymentErrorMsg(null)} /> Payment Initialization Alert
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed opacity-90">{paymentErrorMsg}</p>
                      </div>

                      {showSandboxFallback && (
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 space-y-3">
                          <div className="font-bold flex items-center gap-2">
                            <Sparkles size={14} /> Developer Sandbox Option
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90">
                            The Razorpay backend keys are not configured yet. You can bypass this screen with a fully-simulated success response to test client accounts, portals, and dashboards.
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              setPaymentLoading(true);
                              setPaymentErrorMsg(null);
                              try {
                                const projId = createdProjectId || safeLocalStorage.getItem('fuser_client_project_id');
                                if (!projId) {
                                  alert("Client project session has expired. Please restart registration.");
                                  setPaymentLoading(false);
                                  return;
                                }

                                const finalPrice = selectedPaymentTerm === 'upfront' ? upfrontTotal : numericPriceForPayment;
                                const discount = selectedPaymentTerm === 'upfront' ? discountVal : 0;
                                
                                // Lock quote
                                await fetch(`/api/projects/${projId}/quote`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    packageName: finalSelCardForPayment.name || "Selected Package",
                                    price: finalPrice,
                                    discount: discount,
                                    features: finalSelCardForPayment.features || [],
                                    summary: aiSummary?.recommendationReason || "Custom engineered web application."
                                  })
                                });

                                // Bypass verification with simulated payload
                                const verifyRes = await fetch(`/api/projects/${projId}/verify-payment`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    razorpay_order_id: "order_mock_" + Math.random().toString(36).substring(2, 9),
                                    razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(2, 9),
                                    razorpay_signature: "signature_mock_bypass",
                                    term: selectedPaymentTerm
                                  })
                                });
                                
                                const verifyData = await verifyRes.json();
                                if (verifyData.success) {
                                  setOnboardingStage('calendly');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                  setPaymentErrorMsg("Simulated bypass failed: " + verifyData.error);
                                }
                              } catch (err: any) {
                                setPaymentErrorMsg("Simulated bypass request failed: " + err.message);
                              } finally {
                                setPaymentLoading(false);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            Simulate Sandbox Success <Check size={12} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-neutral-900/70 pt-6">
                <button
                  type="button"
                  onClick={() => setOnboardingStage('recommendations')}
                  className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                  disabled={paymentLoading}
                >
                  ← Back to Recommendations
                </button>
                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={async () => {
                    const projId = createdProjectId || safeLocalStorage.getItem('fuser_client_project_id');
                    if (!projId) {
                      alert("Registration session has expired. Please restart the form.");
                      return;
                    }

                    setPaymentLoading(true);
                    setPaymentErrorMsg(null);
                    setShowSandboxFallback(false);

                    // 1. Lock/freeze quote price on backend
                    const finalPrice = selectedPaymentTerm === 'upfront' ? upfrontTotal : numericPriceForPayment;
                    const discount = selectedPaymentTerm === 'upfront' ? discountVal : 0;
                    
                    try {
                      const quoteRes = await fetch(`/api/projects/${projId}/quote`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          packageName: finalSelCardForPayment.name || "Selected Package",
                          price: finalPrice,
                          discount: discount,
                          features: finalSelCardForPayment.features || [],
                          summary: aiSummary?.recommendationReason || "Custom engineered web application."
                        })
                      });
                      if (!quoteRes.ok) {
                        throw new Error("Failed to lock quotation on server.");
                      }
                    } catch (err: any) {
                      console.warn("Quotation lock error:", err);
                      setPaymentErrorMsg("Failed to lock project details on backend server.");
                      setPaymentLoading(false);
                      return;
                    }

                    // 2. Load Razorpay Checkout Script
                    try {
                      const scriptLoaded = await loadRazorpayScript();
                      if (!scriptLoaded) {
                        throw new Error("Razorpay SDK script failed to load. Check internet connectivity.");
                      }
                    } catch (err: any) {
                      setPaymentErrorMsg(err.message || "Failed to load payment gateways.");
                      setPaymentLoading(false);
                      return;
                    }

                    // 3. Request Razorpay Order from Backend
                    let orderData: any;
                    try {
                      const orderRes = await fetch(`/api/projects/${projId}/razorpay-order`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ term: selectedPaymentTerm })
                      });
                      orderData = await orderRes.json();
                    } catch (err: any) {
                      setPaymentErrorMsg("Network failure connecting to payment servers.");
                      setPaymentLoading(false);
                      return;
                    }

                    if (!orderData || !orderData.success) {
                      const errMsg = orderData?.error || "Payment order creation failed.";
                      setPaymentErrorMsg(errMsg);
                      // If keys are not set, enable sandbox fallback option
                      if (errMsg.includes("API Key ID") || errMsg.includes("Secret") || errMsg.includes("configured") || errMsg.includes("missing")) {
                        setShowSandboxFallback(true);
                      }
                      setPaymentLoading(false);
                      return;
                    }

                    const { order, term } = orderData;

                    // 4. Fetch Razorpay Public Config ID
                    let keyId = "";
                    try {
                      const configRes = await fetch("/api/config/razorpay");
                      const configData = await configRes.json();
                      keyId = configData.keyId;
                    } catch (err) {
                      console.warn("Could not load public key configuration.");
                    }

                    // 5. Open Checkout Modal
                    try {
                      const options = {
                        key: keyId || "rzp_test_placeholder",
                        amount: order.amount,
                        currency: order.currency,
                        name: "CodeFuser",
                        description: `${finalSelCardForPayment.name} (${selectedPaymentTerm === 'upfront' ? '100% Upfront' : '50% Milestone'})`,
                        order_id: order.id,
                        prefill: {
                          name: formData.ownerName || "",
                          email: formData.email || "",
                          contact: formData.whatsapp || ""
                        },
                        theme: {
                          color: "#F59E0B"
                        },
                        handler: async function (response: any) {
                          setPaymentLoading(true);
                          try {
                            const verifyRes = await fetch(`/api/projects/${projId}/verify-payment`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                term: selectedPaymentTerm
                              })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                              setOnboardingStage('calendly');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                              setPaymentErrorMsg("Payment verification failed: " + (verifyData.error || "Please contact support."));
                            }
                          } catch (err) {
                            setPaymentErrorMsg("Could not verify transaction signature.");
                          } finally {
                            setPaymentLoading(false);
                          }
                        },
                        modal: {
                          ondismiss: function () {
                            setPaymentLoading(false);
                            setPaymentErrorMsg("Payment cancelled by customer.");
                          }
                        }
                      };

                      const rzp = new (window as any).Razorpay(options);
                      rzp.on("payment.failed", function (resp: any) {
                        setPaymentErrorMsg(`Transaction failed: ${resp.error.description || "Action rejected"}`);
                        setPaymentLoading(false);
                      });
                      rzp.open();
                    } catch (err: any) {
                      setPaymentErrorMsg("Failed to open payment sheet modal: " + err.message);
                      setPaymentLoading(false);
                    }
                  }}
                  className="btn-pressure flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer leading-none disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <div className="h-3 w-3 rounded-full border border-t-transparent border-black animate-spin" />
                      Processing Checkout...
                    </>
                  ) : (
                    <>
                      Initiate Safe Checkout <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : onboardingStage === 'calendly' ? (
            <motion.div
              key="calendly"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-w-xl mx-auto text-center font-sans"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.015] blur-[120px] pointer-events-none" />

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/25 text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase mb-4">
                🚀 NEXT PHASE PREPARATION
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                What Happens Next
              </h2>
              <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                Your specifications are fully locked. Our consulting and engineering builders will begin evaluating your brand materials.
              </p>

              {/* Status Roadmap Steps */}
              <div className="my-8 rounded-2xl border border-neutral-900 bg-[#0a0a0a]/60 p-5 text-left text-xs space-y-4 font-sans">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono text-[10px] font-black">1</div>
                  <div>
                    <h4 className="font-bold text-white leading-normal">Deep Specification Audit</h4>
                    <p className="text-neutral-400 mt-0.5 leading-normal">Our engineering team reviews your selected package terms, design preferences, and vision inputs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono text-[10px] font-black">2</div>
                  <div>
                    <h4 className="font-bold text-white leading-normal">Communication Sprints</h4>
                    <p className="text-neutral-400 mt-0.5 leading-relaxed">
                      We will contact you directly to confirm setup schedules. Please keep a close eye on your channels:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase font-mono font-bold tracking-wider">
                      <span className="px-2.5 py-1 rounded bg-[#020202] border border-neutral-900 text-amber-400">📧 Email Messages</span>
                      <span className="px-2.5 py-1 rounded bg-[#020202] border border-neutral-900 text-amber-400">📱 WhatsApp Chat</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Contact Selector */}
              <div className="mb-8 text-left bg-[#050505] border border-neutral-900 p-4 rounded-2xl">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-extrabold mb-3">
                  ⏰ PREFERRED CONTACT TIME WINDOW (OPTIONAL):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'morning', label: 'Morning', time: '9 AM - 12 PM' },
                    { id: 'afternoon', label: 'Afternoon', time: '12 PM - 5 PM' },
                    { id: 'evening', label: 'Evening', time: '5 PM - 8 PM' },
                    { id: 'anytime', label: 'Anytime', time: 'Standard Hours' }
                  ].map(slot => {
                    const isSelected = preferredContactTime === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreferredContactTime(slot.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-95 ${
                          isSelected 
                            ? 'bg-amber-500/10 border-amber-500 text-white' 
                            : 'bg-black border-neutral-900 text-neutral-400 hover:border-neutral-800'
                        }`}
                      >
                        <span className="block text-xs font-bold leading-none">{slot.label}</span>
                        <span className="block text-[9px] font-mono text-neutral-500 leading-none mt-1">{slot.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scheduling Actions */}
              <div className="space-y-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStage('asset_center');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black font-extrabold text-xs uppercase tracking-wider px-6 py-4 rounded-full w-full h-12 shadow-[0_12px_24px_rgba(255,255,255,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer select-none leading-none"
                >
                  Confirm Window & Continue <ArrowRight size={13} />
                </button>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setOnboardingStage('payment')}
                  className="text-xs text-neutral-500 hover:text-white underline"
                >
                  ← Back to Payment Setup
                </button>
              </div>
            </motion.div>
          ) : onboardingStage === 'asset_center' ? (
            <motion.div
              key="asset_center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-w-2xl mx-auto"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.015] blur-[150px] pointer-events-none" />

              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase mb-4 animate-pulse">
                  📁 Digital Asset Center Ready
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Queue Your Onboarding Assets
                </h2>
                <p className="text-sm text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed font-sans">
                  Pre-arrange your digital resources to enable our senior builders to launch early layout stages.
                </p>
              </div>

              <div className="space-y-4 mb-8 font-sans">
                {/* Domain choice */}
                <div className="p-4 rounded-xl border border-neutral-900 bg-black/40 text-left text-xs">
                  <span className="text-neutral-500 font-mono block text-[9px] font-bold tracking-wider uppercase mb-1">Website Address (Domain Setup)</span>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Check size={12} className="text-amber-500" />
                    {formData.hasDomain === 'yes' ? "Registered Domain identified" : formData.hasDomain === 'no' ? "Not set — assisted registration chosen" : "Assisted domain brainstorm chosen"}
                  </p>
                  <p className="text-neutral-400 mt-1 leading-normal text-[11px]">
                    {formData.hasDomain === 'yes' ? "We will configure cloud DNS pointers directly to your registrar settings on our sync video conference." : "We will brainstorm clean, high-conformance branding domains and complete registration directly on our call."}
                  </p>
                </div>

                {/* Brand Visual Logo */}
                <div className="p-4 rounded-xl border border-neutral-900 bg-black/40 text-left text-xs">
                  <span className="text-neutral-500 font-mono block text-[9px] font-bold tracking-wider uppercase mb-1">Brand Identity Assets</span>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Check size={12} className="text-amber-500" />
                    {formData.hasLogo === 'yes' ? "Branding assets ready" : formData.hasLogo === 'no' ? "Not set — design drafts requested" : "Branding vectors requested"}
                  </p>
                  <p className="text-neutral-400 mt-1 leading-normal text-[11px]">
                    {formData.hasLogo === 'yes' ? "Excellent. Please pre-compile transparent layers (.png .svg vector formats) to streamline page layout integrations." : "Our visual layout directors are pre-scheduled to help design palette definitions and alignment during strategy sync."}
                  </p>
                </div>

                {/* Media and texts content */}
                <div className="p-4 rounded-xl border border-neutral-900 bg-black/40 text-left text-xs">
                  <span className="text-neutral-500 font-mono block text-[9px] font-bold tracking-wider uppercase mb-1">Media, Copywriting & Content</span>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Check size={12} className="text-amber-500" />
                    {formData.contentReady === 'yes' ? "Structured copy packages prepared" : formData.contentReady === 'progress' ? "Onboarding copy packages in progress" : "Integrated copywriting services requested"}
                  </p>
                  <p className="text-neutral-400 mt-1 leading-normal text-[11px]">
                    {formData.contentReady === 'yes' ? "We will match your copy layout and text files to speed up delivery timelines." : "No worries. CodeFuser's copywriting directors are scheduled to draft headers, benefit structures, and descriptions with you on video."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-neutral-900 pt-6">
                <button
                  type="button"
                  onClick={() => setOnboardingStage('calendly')}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  ← Back to Calendly
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStage('success');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-pressure flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer leading-none"
                >
                  Complete Blueprint Setup <Check size={14} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden text-center max-w-xl mx-auto"
              id="start-project-success"
            >
              {/* Decorative glows */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.015] blur-[150px] pointer-events-none" />

              <div className="text-center mb-8 font-sans">
                {/* Status Indicator */}
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase mb-5 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-sans">
                  🎉 Payment Successful
                </span>
                
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Thank you for choosing CodeFuser.
                </h2>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-3 leading-relaxed font-sans">
                  Your payment has been received successfully. Your secure client workspace is now ready. 
                  Choose an option below to secure your client credentials and access your premium Client Portal.
                </p>
              </div>

              {/* Locked details spec block */}
              <div className="rounded-2xl border border-neutral-900 bg-[#070707] p-5 space-y-4 text-xs tracking-wide text-left mb-8 max-w-sm mx-auto">
                <span className="text-neutral-500 block font-mono text-[9px] font-bold uppercase tracking-wider border-b border-neutral-950 pb-2 mb-2">Workspace Configuration</span>
                <div className="grid grid-cols-2 gap-y-3 font-sans">
                  <div>
                    <span className="text-neutral-500 block text-[9px] font-mono uppercase">BUSINESS MODEL</span>
                    <span className="text-white font-bold text-xs mt-1 block">
                      {formData.businessName || "Your Brand"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] font-mono uppercase">BUILD PACKAGE</span>
                    <span className="text-amber-400 font-bold text-xs mt-1 block">
                      {recommendationCards?.find(c => c.id === selectedCardId)?.name || selectedPlan.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3.5 max-w-md mx-auto font-sans">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate('/login?signup=true');
                  }}
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl w-full shadow-lg active:scale-95 transition-all cursor-pointer leading-none h-12"
                >
                  Create Client Account <ArrowRight size={14} />
                </button>

                <div className="relative flex py-1 w-full items-center">
                  <div className="flex-grow border-t border-neutral-900/65"></div>
                  <span className="flex-shrink mx-3 text-[9px] text-neutral-600 uppercase font-mono tracking-widest">or</span>
                  <div className="flex-grow border-t border-neutral-900/65"></div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const rUri = `${window.location.origin}/login`;
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: rUri,
                        },
                      });
                      if (error) throw error;
                    } catch (e: any) {
                      console.warn("OAuth sign in failed:", e);
                      navigate('/login');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 text-white font-semibold text-xs border border-neutral-800 py-3.5 rounded-xl w-full transition-all h-12 cursor-pointer"
                >
                  <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                    <path
                      fill="white"
                      d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.27.61 4.5 1.643l2.425-2.424C17.275 1.682 14.89 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.915 0 9.83-4.16 9.83-10 0-.673-.06-1.196-.184-1.196h-9.646z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-neutral-500 hover:text-white underline underline-offset-4 cursor-pointer transition-all"
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

function getOnboardingFallbackSummary(
  packageId: string,
  businessName: string,
  industry: string,
  goal: string,
  aiPrompt: string
) {
  let recommendedPkg = "✦ Fusion+";
  if (packageId === "foundation") {
    recommendedPkg = "⚡ Ignite+";
  } else if (packageId === "dominance") {
    recommendedPkg = "⬢ Catalyst+";
  }

  const normalized = (industry || "").toLowerCase();
  
  let specificType = "Strategic Business Outlet";
  let opportunity = "Establishing a modern conversion layout customized for digital inquiry traffic.";
  let businessCat = "Professional Services";

  if (normalized.includes("food") || normalized.includes("restaurant") || normalized.includes("cafe")) {
    specificType = "Exclusive Dine-In/Cafe Space";
    opportunity = "Establishing immediate visual cravings with a live digital menu and an online table booking system.";
    businessCat = "Food & Beverage";
  } else if (normalized.includes("medical") || normalized.includes("clinic") || normalized.includes("dental") || normalized.includes("doctor")) {
    specificType = "High-Quality Dental/Medical Practice";
    opportunity = "Building absolute patient confidence and booking predictability with online appointment slots.";
    businessCat = "Health & Wellness";
  } else if (normalized.includes("tyre") || normalized.includes("tire") || normalized.includes("car") || normalized.includes("automotive") || normalized.includes("garage")) {
    specificType = "Specialized Tyre & Service Shop";
    opportunity = "Automating emergency service calls and Google Maps routing to secure roadside breakdown leads.";
    businessCat = "Automotive & Local Services";
  } else if (normalized.includes("estate") || normalized.includes("real") || normalized.includes("property")) {
    specificType = "Modern Real Estate Agency";
    opportunity = "Filtering prime home queries instantly and routing ready buyers directly to agent chat threads.";
    businessCat = "Real Estate Services";
  }

  let goalLabel = "Elevate digital authority and direct client scheduling";
  if (goal === "leads") goalLabel = "Accelerate hot sales leads and calls";
  else if (goal === "portfolio") goalLabel = "Display pristine project portfolios";
  else if (goal === "products") goalLabel = "Initiate instant digital catalog purchases";

  return {
    businessCategory: businessCat,
    specificBusinessType: specificType,
    primaryBusinessGoal: goalLabel,
    customerVision: aiPrompt || "Setup premium design systems with swift micro-animations.",
    biggestOpportunity: opportunity,
    recommendedStartingPackage: recommendedPkg,
    recommendationReason: `For ${businessName || "your brand"}, our analytics indicate that ${recommendedPkg} is the ideal launching platform. It bypasses basic layouts to integrate custom high-converting features, allowing you to establish immediate authority in the ${businessCat} sector while keeping your initial milestone commitments perfectly balanced.`
  };
}

export default StartProjectPage;
