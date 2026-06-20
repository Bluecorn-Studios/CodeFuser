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
  Database
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
      if (!formData.businessName.trim() || !formData.ownerName.trim() || !formData.whatsapp.trim() || !formData.email.trim()) {
        alert('Please complete all contact identity details.');
        return;
      }
      if (!formData.email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
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
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required contact details
      if (!formData.businessName.trim() || !formData.ownerName.trim() || !formData.whatsapp.trim() || !formData.email.trim()) {
        throw new Error('Please complete all contact identity details.');
      }

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
    } catch (err: any) {
      console.error("Submission failed:", err);
      // Friendly retry message, and never lose the client's entered data.
      setSubmitError(err.message || "Failed to establish database transmission. Please check your network and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-filled custom mailto link after onboarding submission
  const getPrefilledComposeMail = () => {
    const activeIndustry = formData.industry === 'other' ? formData.customIndustry : formData.industry;
    const activeGoal = formData.goal === 'other' ? formData.customGoal : formData.goal;
    
    const subject = `New Project Request — ${formData.businessName}`;
    const body = encodeURIComponent(`Hi CodeFuser Team,

I have completed the Start Project onboarding on your platform! Here is a summary of my business request:

• Business Identity: ${formData.businessName} (Owner: ${formData.ownerName})
• Contact Details: ${formData.whatsapp} (WhatsApp) / ${formData.email}
• Industry Field: ${activeIndustry}
• Primary Objective: ${activeGoal}
• Package Capacity: ${selectedPlan.name} (${selectedPlan.price})
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

      <div className="mx-auto max-w-2xl">
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
                      <label htmlFor="businessName" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                        Business Name *
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
                          className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="ownerName" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                        Your Full Name *
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
                          className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="whatsapp" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                          WhatsApp Number *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/45 text-xs font-medium uppercase tracking-wider select-none">
                            💬
                          </span>
                          <input
                            id="whatsapp"
                            type="tel"
                            required
                            value={formData.whatsapp}
                            onChange={(e) => updateField('whatsapp', e.target.value)}
                            placeholder="Mobile with country code"
                            className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
                          We use WhatsApp to deliver instant prototypes and updates.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                          Business Email *
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
                            className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/30 h-12 w-full"
                          />
                        </div>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-emerald-500/20 bg-card p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] text-center relative overflow-hidden"
              id="start-project-success"
            >
              {/* Emerald shimmer decoration */}
              <div className="absolute inset-x-0 top-0 h-px bg-emerald-500/10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-emerald-500/[0.015] blur-[100px] pointer-events-none" />

              {/* Status Header */}
              <p className="text-[10px] font-mono font-bold tracking-[0.3em] text-emerald-400 uppercase mb-4">
                ✓ System initialized
              </p>

              {/* Large Check Circle Success Badge */}
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] mb-8">
                <Check className="h-10 w-10 text-emerald-400" strokeWidth={2.5} />
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Blueprint Lodged Successfully.
              </h2>
              <p className="text-sm text-muted-foreground/90 max-w-lg mx-auto mt-4 leading-relaxed font-sans">
                Excellent, <span className="text-[#FAF9F5] font-semibold">{formData.ownerName}</span>. 
                Your initial requirements are registered. We have mapped out a custom digital track for 
                <span className="text-white font-bold"> {formData.businessName}</span> using the 
                <span className="text-amber-400 font-bold"> {selectedPlan.name}</span> architecture.
              </p>

              {/* Visual Roadmap Card */}
              <div className="mt-8 rounded-2xl border border-neutral-900 bg-[#050505] p-5 text-left max-w-lg mx-auto">
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
                {/* Official Strategy Session compose/form click to Mail or Client book */}
                <a 
                  href={getPrefilledComposeMail()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white h-12 shadow-[0_12px_24px_rgba(255,255,255,0.06)] hover:-translate-y-0.5 pointer-events-auto"
                >
                  <Calendar size={14} /> Book Strategy Session (Email Draft)
                </a>

                <a 
                  href={getWhatsAppLink(`Hi CodeFuser, I just submitted the Start Project onboarding form for ${formData.businessName}! I'm ready to schedule our strategy session.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pressure inline-flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 px-6 py-3.5 rounded-full w-full text-xs font-bold uppercase tracking-wider h-12 select-none hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-1 focus:ring-emerald-500/20 active:scale-95"
                >
                  Message on WhatsApp
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/mission-control')}
                  className="text-xs text-amber-500 hover:text-amber-400 font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Database size={11} /> Track on Mission Control
                </button>
                <span className="text-muted-foreground/30">|</span>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-muted-foreground hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StartProjectPage;
