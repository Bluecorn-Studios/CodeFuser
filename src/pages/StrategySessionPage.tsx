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
  Mail, 
  User, 
  FileText, 
  Calendar, 
  HelpCircle, 
  Layers, 
  Palette, 
  MousePointerClick, 
  Clock, 
  Smartphone, 
  Compass, 
  Heart,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAppRouter, b as getMailtoLink, w as getWhatsAppLink } from '../components/Reveal';
import { PagePath } from '../types';
import { safeLocalStorage } from '../utils/safeStorage';

interface StrategySessionData {
  ownerName: string;
  businessName: string;
  whatsapp: string;
  email: string;
  
  // Strategy Context
  targetAudience: string;
  businessPainPoint: string;
  uniqueAdvantage: string;
  
  // Brand Feel
  brandTone: 'modern' | 'classic' | 'minimalist' | 'bold_tech' | 'warm_craft';
  brandColors: string;
  referenceSites: string;

  // Features Needed
  needsBooking: boolean;
  needsContactForm: boolean;
  needsPortfolioGrid: boolean;
  needsReviews: boolean;
  needsProducts: boolean;
  needsFaq: boolean;

  // Booking detail
  selectedDate: string;
  selectedTimeSlot: string;
}

const TIME_SLOTS = [
  '09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'
];

export const StrategySessionPage: React.FC = () => {
  const { navigate } = useAppRouter();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setMaxStep(prev => Math.max(prev, step));
  }, [step]);

  // Recommendations State Core
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  // Fetch recommendations once submitted
  useEffect(() => {
    if (isSubmitted) {
      setIsLoadingRecs(true);
      setRecsError(null);
      fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then(res => {
          if (!res.ok) throw new Error(`API request failed with status: ${res.status}`);
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          } else {
            throw new Error("Received non-JSON content from recommendation API");
          }
        })
        .then(data => {
          if (data && data.recommendations) {
            setRecommendations(data.recommendations);
          } else {
            throw new Error('Recommendations empty');
          }
        })
        .catch(err => {
          console.error("Failed to fetch recommendation blueprints:", err);
          setRecsError('Unable to generate dynamic recommendation.');
        })
        .finally(() => {
          setIsLoadingRecs(false);
        });
    }
  }, [isSubmitted]);

  // Core Form State
  const [formData, setFormData] = useState<StrategySessionData>({
    ownerName: '',
    businessName: '',
    whatsapp: '',
    email: '',
    targetAudience: '',
    businessPainPoint: '',
    uniqueAdvantage: '',
    brandTone: 'modern',
    brandColors: 'Amber & Charcoal Black',
    referenceSites: '',
    needsBooking: false,
    needsContactForm: true,
    needsPortfolioGrid: false,
    needsReviews: false,
    needsProducts: false,
    needsFaq: true,
    selectedDate: '',
    selectedTimeSlot: ''
  });

  const updateField = (field: keyof StrategySessionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (field: 'needsBooking' | 'needsContactForm' | 'needsPortfolioGrid' | 'needsReviews' | 'needsProducts' | 'needsFaq') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleNext = () => {
    // Validate Step 1
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
    // Validate Step 2
    if (step === 2) {
      if (!formData.targetAudience.trim() || !formData.businessPainPoint.trim() || !formData.uniqueAdvantage.trim()) {
        alert('Please describe your target customers, primary challenge, and market advantages.');
        return;
      }
    }
    // Validate Step 4 (Date selection before finalized)
    if (step === 4) {
      if (!formData.selectedDate || !formData.selectedTimeSlot) {
        alert('Please select a preferred date and time slot for your Strategy Call.');
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
    setIsSubmitting(true);

    // Simulated network payload latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Persist locally for next step lookup (AI recommendation engine in step 3)
    const savedConsultations = JSON.parse(safeLocalStorage.getItem('codefuser_consultations') || '[]');
    const newConsultation = {
      id: `STRAT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...formData,
      status: 'scheduled'
    };
    savedConsultations.push(newConsultation);
    safeLocalStorage.setItem('codefuser_consultations', JSON.stringify(savedConsultations));
    safeLocalStorage.setItem('codefuser_active_consultation', JSON.stringify(newConsultation));

    setIsSubmitting(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate Mail Link with comprehensive audit results
  const getPrefilledComposeMail = () => {
    const featureList = [];
    if (formData.needsBooking) featureList.push('Online Cal/Appointment Booking');
    if (formData.needsContactForm) featureList.push('Contact Portal / Inquiry Forms');
    if (formData.needsPortfolioGrid) featureList.push('Premium Works Grid / Portfolio Gallery');
    if (formData.needsReviews) featureList.push('Customer Reviews & Social Proof Panel');
    if (formData.needsProducts) featureList.push('Products Display / Pricing Grid');
    if (formData.needsFaq) featureList.push('Interactive Accordion FAQ Module');

    const subject = `Session Booked: ${formData.businessName} — Strategy Consultation Request`;
    const body = encodeURIComponent(`Hi CodeFuser Consultants,

I have scheduled my live 1-on-1 Strategy Session! Here is the completed business audit summary we can review together:

• Business Hub: ${formData.businessName} (Representative: ${formData.ownerName})
• Contact Rails: ${formData.whatsapp} (WhatsApp) / ${formData.email}

1. Target Customers / Audience Profile:
"${formData.targetAudience}"

2. Current major roadblocks & existing limitations:
"${formData.businessPainPoint}"

3. Unique advantages / Competitive edges:
"${formData.uniqueAdvantage}"

4. Design Spectrum & Vibe:
• Brand Personality Category: ${formData.brandTone.toUpperCase()}
• Color Spectrum Directions: ${formData.brandColors}
• Inspiration References: ${formData.referenceSites || 'None stated'}

5. Requested Feature Elements:
${featureList.map(f => `  - ${f}`).join('\n')}

6. Preferred Virtual Schedule:
• Registered Date: ${formData.selectedDate}
• Preferred Time Window: ${formData.selectedTimeSlot} PST

I look forward to our strategy session to run through these requirements and review the AI recommendations blueprint.

Sincerely,
${formData.ownerName}
`);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(subject)}&body=${body}`;
  };

  const renderProgress = () => {
    const totalSteps = 5;
    const pct = ((maxStep - 1) / (totalSteps - 1)) * 100;
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center text-[10px] text-muted-foreground/60 font-mono tracking-widest mb-3 uppercase font-bold">
          <span>CONSULTATION PHASE: {maxStep} OF 5</span>
          <span className="text-glow text-amber-500">{Math.round(pct)}% AUDITED</span>
        </div>
        <div className="relative h-[2px] w-full bg-neutral-900 rounded-full overflow-hidden">
          <motion.div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 to-white" 
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[85vh] py-12 sm:py-20 px-4 sm:px-6 md:px-8 text-foreground font-sans">
      {/* Background spotlights */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/[0.01] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-white/[0.015] blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="strat-container-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="relative rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] max-w-2xl mx-auto overflow-hidden"
              id="strategy-form-card"
            >
              {/* Hairline sheen border */}
              <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

              <div className="mb-6">
                <p className="text-eyebrow mb-1.5 text-amber-500">Track B — Strategy Session</p>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Business Diagnostics Consultation
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Provide your business details. We'll map your custom growth plan.
                </p>
              </div>

              {renderProgress()}

              {/* Step 1: Client Bio */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-wide border-b border-neutral-900 pb-2">
                    1. Identity & Contact Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <label htmlFor="companyName" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                        Business Name *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                          <Building size={15} />
                        </span>
                        <input
                          id="companyName"
                          type="text"
                          required
                          value={formData.businessName}
                          onChange={(e) => updateField('businessName', e.target.value)}
                          placeholder="e.g. Apex Chiropractic Clinic"
                          className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/25 h-12 w-full"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="repName" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                          <User size={15} />
                        </span>
                        <input
                          id="repName"
                          type="text"
                          required
                          value={formData.ownerName}
                          onChange={(e) => updateField('ownerName', e.target.value)}
                          placeholder="First and last name"
                          className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/25 h-12 w-full"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="repWhatsapp" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                          WhatsApp Mobile Number *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold leading-none select-none text-muted-foreground/45">
                            💬
                          </span>
                          <input
                            id="repWhatsapp"
                            type="tel"
                            required
                            value={formData.whatsapp}
                            onChange={(e) => updateField('whatsapp', e.target.value)}
                            placeholder="e.g. +1 555-0199"
                            className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/25 h-12 w-full"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-mono">
                          Used to send quick design layouts.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="repEmail" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-2 font-bold">
                          Primary Contact Email *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/45">
                            <Mail size={15} />
                          </span>
                          <input
                            id="repEmail"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="rep@yourcompany.com"
                            className="pl-11 border border-border bg-[#050505] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/25 h-12 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Strategic Drivers */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-wide border-b border-neutral-900 pb-2">
                    2. Target Customers, Roadblocks & Key Edge
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-amber-400" />
                        <label htmlFor="targetAudience" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/90 font-bold">
                          Who are your ideal customers? *
                        </label>
                      </div>
                      <textarea
                        id="targetAudience"
                        required
                        rows={3}
                        value={formData.targetAudience}
                        onChange={(e) => updateField('targetAudience', e.target.value)}
                        placeholder="e.g. Local families, busy working professionals seeking pain relief, or health-conscious adults in the West End district..."
                        className="border border-border bg-[#050505] rounded-xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/25 w-full resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={14} className="text-amber-400" />
                        <label htmlFor="businessPainPoint" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/90 font-bold">
                          What is your primary sales or marketing roadblock? *
                        </label>
                      </div>
                      <textarea
                        id="businessPainPoint"
                        required
                        rows={3}
                        value={formData.businessPainPoint}
                        onChange={(e) => updateField('businessPainPoint', e.target.value)}
                        placeholder="e.g. Most new clients have trouble booking appointments easily, we have low Google visibility, or our existing site looks outdated..."
                        className="border border-border bg-[#050505] rounded-xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/25 w-full resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={14} className="text-amber-400" />
                        <label htmlFor="uniqueAdvantage" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/90 font-bold">
                          Why do clients choose your business over competitors? *
                        </label>
                      </div>
                      <textarea
                        id="uniqueAdvantage"
                        required
                        rows={3}
                        value={formData.uniqueAdvantage}
                        onChange={(e) => updateField('uniqueAdvantage', e.target.value)}
                        placeholder="e.g. Over 15 years certified expertise, same-day relief walk-ins, premium hospitality environment, or five-star local reputation..."
                        className="border border-border bg-[#050505] rounded-xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all font-sans placeholder-muted-foreground/25 w-full resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Aesthetic art-direction & features */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-wide border-b border-neutral-900 pb-2">
                    3. Visual Direction & Interface Features
                  </h3>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-3 font-bold">
                      Aesthetic personality & Tone Selection
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {[
                        { id: 'modern', title: 'Modern Clean', desc: 'Sleek, high contrast, minimalist typography layout.' },
                        { id: 'classic', title: 'Editorial / Classic', desc: 'Refined serif accent, warm palettes, trusted legacy.' },
                        { id: 'minimalist', title: 'Pure Minimalist', desc: 'Extreme clean aesthetics, luxurious space grids.' },
                        { id: 'bold_tech', title: 'Tech Bold', desc: 'Dark dark neon spectrum accents, futuristic accents.' }
                      ].map(tone => {
                        const isSelected = formData.brandTone === tone.id;
                        return (
                          <button
                            key={tone.id}
                            type="button"
                            onClick={() => updateField('brandTone', tone.id)}
                            className={`p-4 rounded-xl border text-left flex flex-col transition-all h-[110px] select-none active:scale-[0.98] ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
                                : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800'
                            }`}
                          >
                            <span className="font-display text-sm font-extrabold text-white">{tone.title}</span>
                            <span className="text-[11px] text-muted-foreground/80 mt-1.5 leading-relaxed">{tone.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground/80 mb-3 font-bold">
                      Functional Capabilities Required
                    </label>
                    
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {[
                        { key: 'needsBooking', label: 'Online Scheduler (Cal.com / Appointments)' },
                        { key: 'needsContactForm', label: 'Inquiry forms & leads collection' },
                        { key: 'needsPortfolioGrid', label: 'Work galleries & high-res showcases' },
                        { key: 'needsReviews', label: 'Live Yelp/Google review displays' },
                        { key: 'needsProducts', label: 'Products menu card or packages pricing' },
                        { key: 'needsFaq', label: 'Accordion Questions Panel' }
                      ].map(feat => {
                        const isChecked = formData[feat.key as keyof StrategySessionData];
                        return (
                          <button
                            key={feat.key}
                            type="button"
                            onClick={() => toggleFeature(feat.key as any)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-xs font-semibold select-none active:scale-95 ${
                              isChecked 
                                ? 'bg-amber-500/10 border-amber-500 text-white' 
                                : 'bg-[#050505] border-neutral-900 text-muted-foreground hover:border-neutral-800'
                            }`}
                          >
                            <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isChecked ? 'bg-amber-500 border-amber-500 text-black' : 'border-neutral-800'
                            }`}>
                              {isChecked && <Check size={11} strokeWidth={4} />}
                            </div>
                            <span className="leading-tight">{feat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Virtual Calendar Scheduler (Cal.com integration mockup) */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-wide border-b border-neutral-900 pb-2">
                    4. Virtual Cal.com Strategy Session Scheduler
                  </h3>

                  <div className="rounded-2xl border border-neutral-900 bg-[#050505] p-5">
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Book a 30-minute workspace review with our solutions consultant.
                    </p>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Calendar Date Picker container */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 font-bold">
                          Select Available Date
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.selectedDate}
                          onChange={(e) => updateField('selectedDate', e.target.value)}
                          className="border border-border bg-[#0a0a0a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40 transition-all w-full h-11 pointer-events-auto cursor-pointer"
                        />
                      </div>

                      {/* Time Slots Selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#64748B] font-bold">
                          Available Time Windows
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_SLOTS.map(slot => {
                            const isSelected = formData.selectedTimeSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => updateField('selectedTimeSlot', slot)}
                                className={`py-2 px-1 rounded-lg border text-[11px] font-semibold text-center select-none tracking-wide transition-all active:scale-95 ${
                                  isSelected 
                                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_2px_10px_rgba(245,158,11,0.1)]' 
                                    : 'bg-[#0a0a0a] border-neutral-900 text-muted-foreground hover:border-neutral-800 hover:text-foreground'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-amber-500/[0.02] border border-amber-500/10 p-4 rounded-xl">
                    <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">Session Notice</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        Calls take place on Google Meet or WhatsApp. We will email you the calendar invite link.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Final Review & Submission */}
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-wide border-b border-neutral-900 pb-2">
                    5. Verify Audit & Set Active Sync Link
                  </h3>

                  <div className="rounded-2xl border border-neutral-900 bg-[#050505] p-5 space-y-4 text-xs tracking-wide font-sans">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-b border-neutral-900 pb-4">
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Company / Hub</span>
                        <span className="text-white font-bold text-sm mt-1 block">{formData.businessName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Owner / Rep</span>
                        <span className="text-white font-bold text-sm mt-1 block">{formData.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">WhatsApp Text</span>
                        <span className="text-white font-mono text-sm mt-1 block">💬 {formData.whatsapp}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Business Email</span>
                        <span className="text-white font-mono text-sm mt-1 block">{formData.email}</span>
                      </div>
                    </div>

                    <div className="space-y-3.5 border-b border-neutral-900 pb-4">
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest mb-1">Target Market</span>
                        <p className="text-neutral-200 text-xs leading-relaxed italic">"{formData.targetAudience}"</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest mb-1">Bottleneck challenge</span>
                        <p className="text-neutral-200 text-xs leading-relaxed italic">"{formData.businessPainPoint}"</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Visual Tone Choice</span>
                        <span className="text-white font-bold mt-1 block uppercase text-xs tracking-wider">{formData.brandTone} Style</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block uppercase text-[10px] font-mono font-semibold tracking-widest">Preferred Session Schedule</span>
                        <span className="text-amber-400 font-extrabold mt-1 block text-glow">
                          {formData.selectedDate} @ {formData.selectedTimeSlot} PST
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step Buttons bar */}
              <div className="mt-8 pt-6 border-t border-neutral-900 flex justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-pressure flex items-center justify-center gap-2 border border-border/40 text-muted-foreground hover:border-border hover:text-white px-5 sm:px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider select-none active:scale-95 cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn-pressure flex items-center justify-center gap-2 border border-border/20 text-muted-foreground/60 hover:text-foreground hover:border-border/60 px-5 sm:px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider select-none active:scale-95 cursor-pointer"
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
                    className="btn-pressure flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest select-none ml-auto active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3 w-3 rounded-full border-2 border-black/35 border-t-black animate-spin" />
                        Booking Session...
                      </>
                    ) : (
                      <>
                        Book Strategy Session <Check size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="strat-container-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-emerald-500/20 bg-card p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] text-center relative overflow-hidden"
              id="strategy-success-card"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-emerald-500/10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-emerald-500/[0.015] blur-[100px] pointer-events-none" />

              <p className="text-[10px] font-mono font-bold tracking-[0.3em] text-emerald-400 uppercase mb-4">
                ✓ Booking authorized
              </p>

              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] mb-8">
                <Calendar className="h-10 w-10 text-emerald-400 animate-pulse" strokeWidth={1.8} />
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug font-sans">
                Strategy Session Booked.
              </h2>
              <p className="text-sm text-muted-foreground/90 max-w-lg mx-auto mt-4 leading-relaxed font-sans">
                Session reserved for <span className="text-white font-extrabold">{formData.selectedDate} at {formData.selectedTimeSlot} PST</span>. 
                We are excited to help grow <span className="text-white font-bold">{formData.businessName}</span>.
              </p>

              {/* AI Strategic Recommendations Section */}
              <div className="mt-12 text-left max-w-lg mx-auto space-y-6">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-amber-500 font-bold mb-1">
                    ✦ AI Recommendation Engine
                  </h3>
                  <h4 className="font-display text-lg text-white font-extrabold tracking-tight">
                    Audited Website Package Blueprints
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Recommended packages matching your target audience and goals:
                  </p>
                </div>

                {isLoadingRecs ? (
                  <div className="rounded-2xl border border-neutral-900 bg-[#050505]/40 p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="relative h-9 w-9">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/10 border-t-amber-500 animate-spin" />
                        <Sparkles className="absolute inset-1.5 h-6 w-6 text-amber-500 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono tracking-wider animate-pulse uppercase">
                      Engineering tailored growth recommendations...
                    </p>
                  </div>
                ) : recommendations && recommendations.length > 0 ? (
                  <div className="space-y-6">
                    {recommendations.map((rec, idx) => {
                      const isBestMatch = rec.tag.includes('Best Match');
                      const borderStyle = isBestMatch 
                        ? 'border-amber-500 bg-[#080705]/90 shadow-[0_15px_30px_rgba(245,158,11,0.06),inset_0_1px_0_rgba(255,255,255,0.03)]' 
                        : 'border-neutral-900 bg-[#050505]/80 shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.02)]';
                      
                      const badgeStyle = rec.tag.includes('Best Match')
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : rec.tag.includes('Best Value')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30';

                      return (
                        <div 
                          key={idx}
                          className={`relative p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:border-neutral-800 ${borderStyle}`}
                        >
                          <div className="flex flex-wrap justify-between items-start gap-2.5 mb-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold ${badgeStyle}`}>
                              {rec.tag}
                            </span>
                            <div className="text-right">
                              <span className="text-[9px] font-mono text-muted-foreground/45 block">INVESTMENT</span>
                              <span className="text-white font-extrabold text-xs">{rec.price}</span>
                            </div>
                          </div>

                          <div className="mb-3.5">
                            <h5 className="font-display text-sm sm:text-base text-white font-bold leading-tight">
                              {rec.planName} Platform Package
                            </h5>
                            <p className="text-[11px] text-muted-foreground italic mt-1.5 leading-relaxed">
                              "{rec.tagline}"
                            </p>
                          </div>

                          <div className="border-t border-neutral-950 pt-3.5 mb-5">
                            <ul className="space-y-2">
                              {rec.bullets.map((bullet: string, bIdx: number) => (
                                <li key={bIdx} className="flex items-start gap-2 text-[11px] text-neutral-300 leading-relaxed font-sans">
                                  <span className="text-amber-500 font-extrabold shrink-0 mt-0.5">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                const targetPlan = rec.planId === 'foundation' ? 'foundation' : rec.planId === 'growth' ? 'growth' : 'dominance';
                                navigate(`/start-project?plan=${targetPlan}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`btn-pressure px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider select-none active:scale-[0.97] transition-all cursor-pointer ${
                                isBestMatch 
                                  ? 'bg-amber-500 text-black hover:shadow-glow-soft hover:-translate-y-0.5 font-extrabold' 
                                  : 'border border-border/40 text-muted-foreground hover:border-border hover:text-white'
                              }`}
                            >
                              Initialize {rec.planName} Production →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground/80 text-left p-4 border border-neutral-900 rounded-2xl bg-[#050505]/60">
                    Unable to load personalized recommendations at this instant. Proceed with booking verification below to lock in requirements live.
                  </div>
                )}
              </div>

              {/* Direct call to Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                <a 
                  href={getPrefilledComposeMail()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full w-full h-12 shadow-[0_12px_24px_rgba(255,255,255,0.06)] hover:-translate-y-0.5 pointer-events-auto cursor-pointer"
                >
                  <Mail size={14} /> Send Audit & Confirm (Email)
                </a>

                <a 
                  href={getWhatsAppLink(`Hi CodeFuser, I just booked our Strategy Session for ${formData.businessName} on ${formData.selectedDate} at ${formData.selectedTimeSlot}! I'm ready to review the blueprint.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pressure inline-flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 px-6 py-3.5 rounded-full w-full text-xs font-bold uppercase tracking-wider h-12 select-none hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:outline-none focus:ring-1 focus:ring-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  Message on WhatsApp
                </a>
              </div>

              <div className="mt-8">
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

export default StrategySessionPage;
