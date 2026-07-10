import React, { useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  Users, 
  Briefcase, 
  ChevronRight, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText, 
  ArrowRight, 
  Shield, 
  Activity, 
  Download,
  Percent,
  Search,
  Filter
} from "lucide-react";

interface ProjectRecord {
  id: string;
  userId?: string;
  clientName: string;
  businessName: string;
  email: string;
  whatsapp: string;
  selectedPackage: string;
  ownershipChoice: string;
  industry: string;
  customIndustry: string;
  goal: string;
  customGoal: string;
  hasDomain: string;
  hasLogo: string;
  contentReady: string;
  timestamp: string;
  status: string;
  paymentStatus?: string;
  portalAccess?: boolean;
  paymentProvider?: string;
  paymentId?: string;
  orderId?: string;
  purchasedPlan?: string;
  purchaseDate?: string;
  portalAccessSource?: "automatic" | "manual";
  quote?: {
    packageName: string;
    price: number;
    discount: number;
    features: string[];
    summary: string;
    timestamp: string;
    expiryDate: string;
    status: "active" | "expiring" | "expired";
  } | null;
  assets?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    timestamp: string;
  }[];
}

interface BusinessIntelligenceCRMProps {
  projects: ProjectRecord[];
}

export const BusinessIntelligenceCRM: React.FC<BusinessIntelligenceCRMProps> = ({ projects }) => {
  const [selectedJourneyProjId, setSelectedJourneyProjId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const [crmSearchQuery, setCrmSearchQuery] = useState("");
  const [crmFilterPackage, setCrmFilterPackage] = useState("all");

  // Helper: Format currency in INR
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. CALCULATE CORE BI METRICS
  const totalLeads = projects.length;
  
  // Converted Customers (Paid Status)
  const paidProjects = projects.filter(p => p.paymentStatus === "paid");
  const totalConverted = paidProjects.length;

  // Conversion rate
  const conversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

  // Calculate actual earned revenue (cash received)
  const earnedRevenue = paidProjects.reduce((acc, p) => {
    // If quote is locked, use quote price
    if (p.quote && p.quote.price) {
      const basePrice = p.quote.price;
      const discount = p.quote.discount || 0;
      const discountedPrice = basePrice - discount;

      if (p.purchasedPlan?.toLowerCase().includes("upfront")) {
        return acc + Math.round(discountedPrice * 0.9); // 10% discount for upfront payments
      } else if (p.purchasedPlan?.toLowerCase().includes("milestone")) {
        return acc + Math.round(discountedPrice * 0.5); // 50% milestone
      }
      return acc + discountedPrice;
    }

    // Default package price fallbacks if no quote is set
    let basePkgPrice = 24999; // growth/Fusion default
    if (p.selectedPackage === "foundation") basePkgPrice = 9999;
    if (p.selectedPackage === "dominance") basePkgPrice = 49999;

    if (p.purchasedPlan?.toLowerCase().includes("upfront")) {
      return acc + Math.round(basePkgPrice * 0.9);
    } else if (p.purchasedPlan?.toLowerCase().includes("milestone")) {
      return acc + Math.round(basePkgPrice * 0.5);
    }
    return acc + basePkgPrice;
  }, 0);

  // Calculate total active pipeline value (unearned potential)
  const activePipelineValue = projects.reduce((acc, p) => {
    if (p.paymentStatus === "paid") return acc; // already earned

    // If quotation sent, add quote value
    if (p.quote && p.quote.price) {
      return acc + (p.quote.price - (p.quote.discount || 0));
    }

    // Else add prospective package value
    let basePkgPrice = 24999;
    if (p.selectedPackage === "foundation") basePkgPrice = 9999;
    if (p.selectedPackage === "dominance") basePkgPrice = 49999;
    return acc + basePkgPrice;
  }, 0);

  // Average customer value (ACV)
  const averageCustomerValue = totalConverted > 0 ? earnedRevenue / totalConverted : 0;

  // 2. CONVERSION FUNNEL METRICS
  const leadsWithQuotes = projects.filter(p => !!p.quote);
  const totalQuoted = leadsWithQuotes.length;

  // 3. PACKAGE POPULARITY DISTRIBUTION
  const pkgCounts = projects.reduce((acc, p) => {
    const pkg = p.selectedPackage || "growth";
    acc[pkg] = (acc[pkg] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const packagePopularity = [
    { id: "foundation", name: "Ignite (₹9,999)", count: pkgCounts["foundation"] || 0, color: "bg-amber-500" },
    { id: "growth", name: "Fusion (₹24,999)", count: pkgCounts["growth"] || 0, color: "bg-blue-500" },
    { id: "dominance", name: "Catalyst (₹49,999)", count: pkgCounts["dominance"] || 0, color: "bg-red-500" }
  ];

  // 4. PIPELINE STAGE CATEGORIZATION
  const pipelineStages = [
    {
      name: "1. Diagnostic Lead",
      description: "Inbound diagnostic packets logged",
      color: "border-t-zinc-600 bg-zinc-950/20",
      icon: <Activity size={14} className="text-zinc-400" />,
      projectsList: projects.filter(p => p.paymentStatus !== "paid" && !p.quote)
    },
    {
      name: "2. Quotation Sent",
      description: "Proposals formulated & pricing locked",
      color: "border-t-amber-500 bg-amber-500/[0.02]",
      icon: <FileText size={14} className="text-amber-400" />,
      projectsList: projects.filter(p => p.paymentStatus !== "paid" && p.quote && p.quote.status !== "expired")
    },
    {
      name: "3. Secured (Won)",
      description: "Financial milestone verified",
      color: "border-t-emerald-500 bg-emerald-500/[0.02]",
      icon: <DollarSign size={14} className="text-emerald-400" />,
      projectsList: projects.filter(p => p.paymentStatus === "paid" && p.status !== "Ready" && p.status !== "Completed")
    },
    {
      name: "4. Delivered & Ready",
      description: "Production assets & portals compiled",
      color: "border-t-blue-500 bg-blue-500/[0.02]",
      icon: <CheckCircle size={14} className="text-blue-400" />,
      projectsList: projects.filter(p => p.paymentStatus === "paid" && (p.status === "Ready" || p.status === "Completed" || p.status === "Deliverables Ready"))
    }
  ];

  // Selected project for detailed customer journey inspection
  const selectedJourneyProject = projects.find(p => p.id === selectedJourneyProjId) || projects[0];

  return (
    <div className="space-y-10 animate-fade-in" id="crm-dashboard">
      
      {/* SECTION 1: HIGH-DENSITY KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Earned Revenue */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">Earned Revenue (Won)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {formatINR(earnedRevenue)}
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
              <TrendingUp size={10} className="text-emerald-400" />
              From {totalConverted} paid accounts
            </p>
          </div>
        </div>

        {/* KPI 2: Pipeline Value */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">Pipeline Valuation</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {formatINR(activePipelineValue)}
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
              <Clock size={10} className="text-amber-500" />
              {totalLeads - totalConverted} active prospects in queue
            </p>
          </div>
        </div>

        {/* KPI 3: Sales Conversion Rate */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">Lead-To-Sale Conversion</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {conversionRate.toFixed(1)}%
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
              Conversion across {totalLeads} global leads
            </p>
          </div>
        </div>

        {/* KPI 4: Average Customer Value */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">Avg Contract Size (ACV)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {formatINR(averageCustomerValue)}
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
              LTV footprint per secured client
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 2: LEAD PIPELINE FLOW GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold uppercase text-white tracking-widest flex items-center gap-2">
            📂 Lead Pipeline Matrix
          </h2>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-[#0d0d0d] px-3 py-1.5 rounded-full border border-neutral-900">
            Real-time stage tracking
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineStages.map((stage, idx) => {
            const stagePotentialVal = stage.projectsList.reduce((acc, p) => {
              if (p.quote && p.quote.price) return acc + (p.quote.price - (p.quote.discount || 0));
              let fallbackPrice = 24999;
              if (p.selectedPackage === "foundation") fallbackPrice = 9999;
              if (p.selectedPackage === "dominance") fallbackPrice = 49999;
              return acc + fallbackPrice;
            }, 0);

            return (
              <div 
                key={idx} 
                className={`border border-border/80 border-t-3 rounded-2xl p-4 flex flex-col justify-between min-h-[160px] ${stage.color} hover:shadow-[0_0_20px_rgba(251,191,36,0.02)] transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      {stage.icon} {stage.name}
                    </span>
                    <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                      {stage.projectsList.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans mb-4">
                    {stage.description}
                  </p>
                </div>

                <div className="border-t border-neutral-900/60 pt-3 mt-3">
                  <span className="text-[9px] font-mono text-zinc-600 block uppercase tracking-widest">Weighted Stage Valuation</span>
                  <span className="text-sm font-mono font-bold text-zinc-300 block mt-0.5">{formatINR(stagePotentialVal)}</span>
                  
                  {/* Micro list of project thumbnails inside each column */}
                  <div className="mt-3.5 space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {stage.projectsList.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedJourneyProjId(p.id)}
                        className={`w-full text-left p-1.5 rounded-lg border text-[10px] font-sans flex items-center justify-between transition-all cursor-pointer ${
                          selectedJourneyProjId === p.id
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-[#050505] border-neutral-900 text-zinc-400 hover:text-white hover:bg-neutral-900"
                        }`}
                      >
                        <span className="truncate max-w-[110px] font-medium">{p.businessName || "Unnamed client"}</span>
                        <ChevronRight size={10} className="shrink-0" />
                      </button>
                    ))}
                    {stage.projectsList.length === 0 && (
                      <span className="text-[9px] font-mono text-zinc-700 italic block py-1">No active accounts</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: VISUAL INTELLIGENCE GRAPHICS (CONVERSION FUNNEL & TIER POPULARITY) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FUNNEL DISPLAY (Col span 7) */}
        <div className="lg:col-span-7 bg-card border border-border/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-500" />
              Dynamic Conversion Funnel
            </h3>
            <p className="text-xs text-zinc-500 max-w-md leading-relaxed font-sans mb-6">
              Track prospects progressing from basic digital packet formulation to official price quotes, and finally secure financial checkout confirmation.
            </p>
          </div>

          {/* SVG Custom Funnel Illustration */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase mb-1.5 px-1">
                <span>1. Inquiries Lodged (Diagnostic Packets)</span>
                <span className="font-bold text-zinc-300">{totalLeads} Leads (100%)</span>
              </div>
              <div className="h-9 bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden relative flex items-center px-4">
                <div className="absolute top-0 left-0 bottom-0 bg-amber-500/10 border-r border-amber-500/20 w-full" />
                <span className="text-xs font-semibold text-white relative z-10 font-mono">
                  100% Volume
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase mb-1.5 px-1">
                <span>2. Quoted Proposals Generated</span>
                <span className="font-bold text-amber-500">
                  {totalQuoted} Quotes ({totalLeads > 0 ? ((totalQuoted/totalLeads)*100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="h-9 bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden relative flex items-center px-4">
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-amber-500/25 border-r border-amber-500/40 transition-all duration-700"
                  style={{ width: `${totalLeads > 0 ? (totalQuoted / totalLeads) * 100 : 0}%` }}
                />
                <span className="text-xs font-semibold text-white relative z-10 font-mono">
                  {totalLeads > 0 ? ((totalQuoted / totalLeads) * 100).toFixed(1) : 0}% Strategy-Fit Reach
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase mb-1.5 px-1">
                <span>3. Financial Conversion (Secured Accounts)</span>
                <span className="font-bold text-emerald-400">
                  {totalConverted} Converted ({conversionRate.toFixed(0)}%)
                </span>
              </div>
              <div className="h-9 bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden relative flex items-center px-4">
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-emerald-500/20 border-r border-emerald-500/30 transition-all duration-700"
                  style={{ width: `${conversionRate}%` }}
                />
                <span className="text-xs font-semibold text-white relative z-10 font-mono">
                  {conversionRate.toFixed(1)}% Conversion Performance
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-900/60 pt-5 mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-600 block uppercase tracking-widest">Quote Form Rate</span>
              <span className="text-sm font-mono font-bold text-zinc-300 mt-1 block">
                {totalLeads > 0 ? ((totalQuoted/totalLeads)*100).toFixed(0) : 0}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-600 block uppercase tracking-widest">Proposal Close Rate</span>
              <span className="text-sm font-mono font-bold text-zinc-300 mt-1 block">
                {totalQuoted > 0 ? ((totalConverted/totalQuoted)*100).toFixed(0) : 0}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-600 block uppercase tracking-widest">Inquiry-To-Cash</span>
              <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">
                {conversionRate.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* PACKAGE DISTRIBUTION (Col span 5) */}
        <div className="lg:col-span-5 bg-card border border-border/80 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Briefcase size={14} className="text-amber-500" />
              Package Interest Spread
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans mb-6">
              Distribution of prospective tier choices submitted by business owners during self-diagnostic assessments.
            </p>
          </div>

          <div className="space-y-4">
            {packagePopularity.map((p, idx) => {
              const share = totalLeads > 0 ? (p.count / totalLeads) * 100 : 0;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase mb-1">
                    <span>{p.name}</span>
                    <span className="font-bold text-zinc-300">{p.count} inquiry ({share.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${p.color} rounded-full transition-all duration-700`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-900/60 pt-5 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block">Total Opportunities</span>
                <span className="text-lg font-mono font-black text-white mt-0.5 block">{totalLeads} Projects</span>
              </div>
              <span className="text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                Fusion Leads Dominant
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: INTEGRATED CUSTOMER JOURNEY TRACKER & DETAIL TIMELINE */}
      <div className="border border-border/80 rounded-3xl overflow-hidden bg-card">
        
        {/* HEADER & CONTROLS */}
        <div className="border-b border-neutral-900 bg-black/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={14} className="text-amber-500" />
              Customer Journey & Quotation Analytics
            </h3>
            <p className="text-[11px] text-zinc-500 font-sans mt-1">
              Select any client below to inspect their step-by-step business development milestones, locked pricing agreements, and fulfillment.
            </p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
              <Search size={12} />
            </span>
            <input
              type="text"
              value={crmSearchQuery}
              onChange={(e) => setCrmSearchQuery(e.target.value)}
              placeholder="Search client list..."
              className="pl-8 pr-3 border border-border bg-[#050505] rounded-xl py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-full"
            />
          </div>
        </div>

        {/* LIST AND TIMELINE PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-neutral-900">
          
          {/* CLIENT LIST COLUMN (Span 4) */}
          <div className="md:col-span-4 max-h-[480px] overflow-y-auto divide-y divide-neutral-900/60">
            {projects
              .filter(p => {
                const query = crmSearchQuery.toLowerCase();
                return (
                  p.clientName.toLowerCase().includes(query) ||
                  p.businessName.toLowerCase().includes(query) ||
                  p.email.toLowerCase().includes(query)
                );
              })
              .map(p => {
                const isSelected = selectedJourneyProjId === p.id;
                const hasQuote = !!p.quote;
                const isPaid = p.paymentStatus === "paid";

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedJourneyProjId(p.id)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected 
                        ? "bg-amber-500/[0.02] border-l-2 border-amber-500" 
                        : "hover:bg-white/[0.01]"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-mono font-black uppercase shrink-0 border ${
                      isPaid 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : hasQuote 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                        : "bg-neutral-900 border-neutral-800 text-zinc-500"
                    }`}>
                      {p.businessName ? p.businessName.substring(0, 2) : "CF"}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white truncate block">
                          {p.businessName || "Unnamed Business"}
                        </span>
                        <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isPaid 
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                            : "bg-zinc-900 border border-neutral-800 text-zinc-500"
                        }`}>
                          {isPaid ? "Paid" : "Lead"}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block truncate mt-0.5">{p.clientName}</span>
                      <span className="text-[9px] text-zinc-600 font-mono block mt-1">
                        {new Date(p.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </button>
                );
              })}
            {projects.length === 0 && (
              <p className="text-xs font-mono text-center text-zinc-500 py-10 uppercase">
                No opportunities filed.
              </p>
            )}
          </div>

          {/* ACTIVE TIMELINE COMPONENT (Span 8) */}
          <div className="md:col-span-8 p-6 sm:p-8 bg-neutral-950/20">
            {selectedJourneyProject ? (
              <div className="space-y-8">
                
                {/* TIMELINE TOP MINI HERO */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Client Journey</span>
                    <h4 className="text-base font-black font-display text-white mt-1">
                      {selectedJourneyProject.businessName}
                    </h4>
                    <span className="text-xs text-zinc-400 mt-1 block">
                      Rep: {selectedJourneyProject.clientName} | Contact: {selectedJourneyProject.email}
                    </span>
                  </div>
                  
                  <div className="text-left sm:text-right font-mono shrink-0">
                    <span className="text-[9px] text-zinc-500 uppercase block tracking-wider">Estimated Project Lifecycle</span>
                    <span className="text-xs font-bold text-amber-500 block mt-1 uppercase">
                      🚀 {selectedJourneyProject.status}
                    </span>
                  </div>
                </div>

                {/* TIMELINE STEPS GAUGE */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-900">
                  
                  {/* Step 1: Lead Submitted */}
                  <div className="relative">
                    <div className="absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-white">Diagnostic Blueprint Filed</span>
                        <span className="text-[9px] font-mono text-emerald-400">Step Complete</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                        Diagnostic packets compiled. Client selected prospective package: <strong>{selectedJourneyProject.selectedPackage.toUpperCase()}</strong>.
                      </p>
                      <div className="mt-2.5 bg-neutral-950 border border-neutral-900 p-2.5 rounded-xl text-[10px] font-sans text-zinc-500 flex flex-wrap gap-x-4 gap-y-1.5">
                        <span><strong>Industry:</strong> {selectedJourneyProject.industry || "N/A"}</span>
                        <span><strong>Goal:</strong> {selectedJourneyProject.goal || "N/A"}</span>
                        <span><strong>Logo:</strong> {selectedJourneyProject.hasLogo || "N/A"}</span>
                        <span><strong>Domain:</strong> {selectedJourneyProject.hasDomain || "N/A"}</span>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-mono mt-1.5 block">
                        Timestamp: {new Date(selectedJourneyProject.timestamp).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Quotation Sent */}
                  <div className="relative">
                    <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
                      selectedJourneyProject.quote 
                        ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                        : "bg-zinc-900 border-zinc-800"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-white">Quotation Agreement Sent</span>
                        <span className={`text-[9px] font-mono ${selectedJourneyProject.quote ? "text-emerald-400" : "text-zinc-600"}`}>
                          {selectedJourneyProject.quote ? "Step Complete" : "Pending Action"}
                        </span>
                      </div>
                      
                      {selectedJourneyProject.quote ? (
                        <div className="mt-2 space-y-2 bg-[#050505] border border-neutral-900 rounded-2xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">Locked Package Tier</span>
                              <strong className="text-xs text-white">{selectedJourneyProject.quote.packageName}</strong>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">Guaranteed Price</span>
                              <strong className="text-xs text-amber-500 font-mono">
                                {formatINR(selectedJourneyProject.quote.price - (selectedJourneyProject.quote.discount || 0))}
                              </strong>
                            </div>
                          </div>
                          
                          {selectedJourneyProject.quote.summary && (
                            <p className="text-[10px] text-zinc-400 italic bg-neutral-950 p-2.5 rounded-xl border border-neutral-900/60 leading-relaxed">
                              &ldquo;{selectedJourneyProject.quote.summary}&rdquo;
                            </p>
                          )}

                          <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-zinc-500 uppercase">Quotation Status:</span>
                            <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-[8px] font-bold ${
                              selectedJourneyProject.quote.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : selectedJourneyProject.quote.status === "expiring"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                              {selectedJourneyProject.quote.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1.5 p-3.5 bg-neutral-950 border border-dashed border-neutral-800 rounded-xl text-center">
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            No custom proposal generated yet. You can launch a dedicated strategic recommendation & price quote inside the project panel above.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Payment */}
                  <div className="relative">
                    <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
                      selectedJourneyProject.paymentStatus === "paid" 
                        ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                        : "bg-zinc-900 border-zinc-800"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-white">Financial Milestone Secured</span>
                        <span className={`text-[9px] font-mono ${selectedJourneyProject.paymentStatus === "paid" ? "text-emerald-400" : "text-zinc-600"}`}>
                          {selectedJourneyProject.paymentStatus === "paid" ? "Step Complete" : "Pending Action"}
                        </span>
                      </div>
                      
                      {selectedJourneyProject.paymentStatus === "paid" ? (
                        <div className="mt-2.5 bg-neutral-950 border border-neutral-900 p-3 rounded-xl text-[10px] font-mono space-y-1 text-zinc-400">
                          <div className="flex justify-between">
                            <span>Payment Provider:</span>
                            <span className="text-zinc-100 uppercase font-bold">{selectedJourneyProject.paymentProvider || "Razorpay"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Purchased Plan:</span>
                            <span className="text-zinc-100 font-bold">{selectedJourneyProject.purchasedPlan || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transaction Ref:</span>
                            <span className="text-zinc-500 text-[9px]">{selectedJourneyProject.paymentId || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-t border-neutral-900/80 pt-1.5 mt-1">
                            <span>Clearance Timestamp:</span>
                            <span className="text-zinc-500">
                              {selectedJourneyProject.purchaseDate ? new Date(selectedJourneyProject.purchaseDate).toLocaleString("en-IN") : "N/A"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                          Payment has not been registered yet. Client is currently reviewing quotes or formulating their upfront budget.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Asset exchanges */}
                  <div className="relative">
                    <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
                      selectedJourneyProject.assets && selectedJourneyProject.assets.length > 0
                        ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                        : "bg-zinc-900 border-zinc-800"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-white">Fulfillment & Files Exchange</span>
                        <span className={`text-[9px] font-mono ${selectedJourneyProject.assets && selectedJourneyProject.assets.length > 0 ? "text-emerald-400" : "text-zinc-600"}`}>
                          {(selectedJourneyProject.assets && selectedJourneyProject.assets.length > 0) ? "Step Complete" : "Pending Action"}
                        </span>
                      </div>

                      {selectedJourneyProject.assets && selectedJourneyProject.assets.length > 0 ? (
                        <div className="mt-2.5 space-y-1.5">
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                            Client or Admin uploaded <strong>{selectedJourneyProject.assets.length}</strong> active assets inside the workspace folder:
                          </p>
                          <div className="bg-[#050505] border border-neutral-900 rounded-xl overflow-hidden divide-y divide-neutral-900">
                            {selectedJourneyProject.assets.map(asset => (
                              <div key={asset.id} className="flex items-center justify-between p-2.5 text-[10px] font-sans">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText size={12} className="text-amber-500 shrink-0" />
                                  <span className="text-zinc-300 truncate font-semibold block">{asset.name}</span>
                                </div>
                                <span className="text-[9px] text-zinc-600 font-mono font-bold shrink-0">
                                  {(asset.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                          No deliverables or starting files uploaded yet. Files can be shared seamlessly once workspace portal credentials synchronize.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 5: Final Production Code */}
                  <div className="relative">
                    <div className={`absolute left-[-20px] top-1.5 h-3.5 w-3.5 rounded-full border ${
                      (selectedJourneyProject.status === "Ready" || selectedJourneyProject.status === "Completed" || selectedJourneyProject.status === "Deliverables Ready")
                        ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                        : "bg-zinc-900 border-zinc-800"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-white">Deploy & Completion Phase</span>
                        <span className={`text-[9px] font-mono ${
                          (selectedJourneyProject.status === "Ready" || selectedJourneyProject.status === "Completed" || selectedJourneyProject.status === "Deliverables Ready")
                            ? "text-emerald-400" 
                            : "text-zinc-600"
                        }`}>
                          {(selectedJourneyProject.status === "Ready" || selectedJourneyProject.status === "Completed" || selectedJourneyProject.status === "Deliverables Ready") ? "Step Complete" : "Development Phase"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-sans">
                        Current CodeFuser compilation state: <strong>{selectedJourneyProject.status}</strong>.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users size={24} className="text-zinc-600 mb-2" />
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">No customer record selected</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
