import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  User, 
  Mail, 
  MessageSquare, 
  Clock, 
  Layers, 
  Globe, 
  Palette, 
  FileText, 
  Shield, 
  CheckCircle, 
  Database,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
  Inbox
} from "lucide-react";
import { useAppRouter, w as getWhatsAppLink } from "../components/Reveal";

interface ProjectRecord {
  id: string;
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
}

export const MissionControl: React.FC = () => {
  const { navigate } = useAppRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("fuser_admin_authed") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorValue, setErrorValue] = useState<string | null>(null);
  const [dbSource, setDbSource] = useState<string>("Supabase");
  
  // Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("all");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Extra project maps (Part 3 requirement)
  const [extraProjectMap, setExtraProjectMap] = useState<Record<string, any>>({});
  const [extraLoadingMap, setExtraLoadingMap] = useState<Record<string, boolean>>({});

  const fetchProjectExtra = async (id: string) => {
    if (extraProjectMap[id] || extraLoadingMap[id]) return;
    setExtraLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/projects/${id}/extra`);
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setExtraProjectMap(prev => ({ ...prev, [id]: payload.data }));
        }
      }
    } catch (err) {
      console.warn("Retrieve project details error:", err);
    } finally {
      setExtraLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleModifyProject = async (id: string, updates: Partial<ProjectRecord>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
        },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        await fetchProjects(); // Refresh lists live
      }
    } catch (err) {
      console.error("Failed to update project configurations inside admin console:", err);
    }
  };

  const getQuoteTimeRemaining = (expiryStr?: string) => {
    if (!expiryStr) return "Expired";
    const diff = new Date(expiryStr).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h ${mins}m left`;
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchProjectExtra(activeProjectId);
    }
  }, [activeProjectId]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setErrorValue(null);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }
      const data = await response.json();
      if (data.projects) {
        setProjects(data.projects);
        setDbSource("Supabase Synced");
      }
    } catch (err: any) {
      console.error("Failed to query central Supabase tracking systems:", err);
      setErrorValue(err.message || "Failed to establish a cloud connection with the Supabase database instance.");
      setProjects([]);
      setDbSource("Offline");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": sessionStorage.getItem("fuser_admin_password") || ""
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        await fetchProjects();
      }
    } catch (err) {
      console.error("Failed to update status inside admin console:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[90vh] flex items-center justify-center py-16 px-4">
        {/* Background ambient decorative spotlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.02] blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-white/[0.01] blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-foreground font-sans outline-none"
        >
          {/* Logo/Shield Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Shield size={20} />
            </div>
            
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-amber-500">
              Administrative Gateway
            </span>
            <h1 className="font-display text-2xl font-black text-white mt-1.5 tracking-tight">
              Mission Control Log-in
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
              This terminal is reserved for internal administrators. Unauthorized entry is strictly logged.
            </p>
          </div>

          {/* Form */}
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginError(null);
              try {
                const response = await fetch("/api/admin/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password: passwordInput })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                  sessionStorage.setItem("fuser_admin_authed", "true");
                  sessionStorage.setItem("fuser_admin_password", passwordInput);
                  setIsAuthenticated(true);
                } else {
                  setLoginError(data.error || "Access Key is incorrect. Please contact system administrators.");
                }
              } catch (err) {
                console.error("Authentication request failed:", err);
                setLoginError("Failed to communicate with authentication servers.");
              }
            }}
            className="mt-8 space-y-4"
          >
            <div>
              <label htmlFor="admin-passcode" className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/80 mb-2">
                ACCESS KEY
              </label>
              <div className="relative">
                <input
                  id="admin-passcode"
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••••••"
                  className={`w-full bg-[#050505] border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 transition-all font-mono placeholder-muted-foreground/20 h-11 ${
                    loginError 
                      ? 'border-red-500/40 focus:ring-red-500/30' 
                      : 'border-border/80 focus:ring-amber-500/40'
                  }`}
                  autoFocus
                />
              </div>
              
              <AnimatePresence mode="wait">
                {loginError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] text-red-400 font-mono mt-2"
                  >
                    ⚠️ {loginError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="w-full btn-pressure h-11 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
            >
              Sign In to Dashboard <ArrowRight size={13} />
            </button>
          </form>

          {/* Escape path */}
          <div className="mt-6 pt-5 border-t border-neutral-900 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-muted-foreground hover:text-white transition-colors underline underline-offset-4 font-sans tracking-wide cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const formatPlanName = (id: string) => {
    switch (id) {
      case "foundation": return "⚡ Ignite (₹9,999)";
      case "growth": return "✦ Fusion (₹24,999)";
      case "dominance": return "⬢ Catalyst (₹49,999)";
      default: return id;
    }
  };

  const getFilteredProjects = () => {
    return projects.filter(proj => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        proj.businessName.toLowerCase().includes(query) ||
        proj.clientName.toLowerCase().includes(query) ||
        proj.email.toLowerCase().includes(query) ||
        proj.whatsapp.toLowerCase().includes(query);

      const matchesPlan = selectedPlanFilter === "all" || proj.selectedPackage === selectedPlanFilter;
      return matchesSearch && matchesPlan;
    });
  };

  const filtered = getFilteredProjects();

  return (
    <div className="relative min-h-[90vh] py-14 sm:py-20 px-4 sm:px-6 md:px-8 text-foreground font-sans">
      {/* Background ambient decorative spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.015] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-white/[0.01] blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-10 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-eyebrow text-amber-500">CodeFuser Admin</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
                <Database size={10} className="text-amber-500" />
                <span>{dbSource}</span>
              </div>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-snug mt-2">
              Mission Control
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
              Real-time synchronization grid monitoring incoming business diagnostic packets and starting CodeFuser Core client compilers.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchProjects}
              className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/40 text-xs font-semibold rounded-xl text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> Refresh Grid
            </button>
            <button
              onClick={() => navigate("/start-project")}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              Submit Test <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Filters and Searches Panel */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full sm:flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/45">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, brand, or contact details..."
              className="pl-9 pr-4 border border-border bg-[#050505] rounded-xl py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-full"
            />
          </div>

          {/* Filter by package */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <span className="text-xs font-mono text-muted-foreground/60 flex items-center gap-1">
              <Filter size={11} /> PLAN:
            </span>
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="border border-border bg-[#050505] rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 min-w-[140px]"
            >
              <option value="all">All Packages</option>
              <option value="foundation">⚡ Ignite (₹9,999)</option>
              <option value="growth">✦ Fusion (₹24,999)</option>
              <option value="dominance">⬢ Catalyst (₹49,999)</option>
            </select>
          </div>
        </div>

        {errorValue && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs leading-relaxed flex items-start gap-2.5">
            <span className="text-red-400 font-bold block shrink-0">⚠️ Connection Failure:</span>
            <div>
              <span className="font-semibold block">{errorValue}</span>
              <span className="text-red-400/80 block mt-1 font-mono">Mission Control retrieves real-time records strictly from your cloud Supabase account.</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="h-8 w-8 rounded-full border-2 border-amber-500/25 border-t-amber-500 animate-spin" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
              Syncing client databases...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-14 sm:p-20 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="h-14 w-14 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 text-muted-foreground/70 mb-5">
              <Inbox size={22} className="stroke-[1.5]" />
            </div>
            <h3 className="font-display text-lg text-white font-semibold">
              No Client Projects Found
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {searchQuery || selectedPlanFilter !== "all" 
                ? "No client records correspond to your active filter or search query constraints."
                : "Submit the Start Project onboarding flow to create a real production-bound client project."
              }
            </p>
            {!searchQuery && selectedPlanFilter === "all" && (
              <button
                onClick={() => navigate("/start-project")}
                className="mt-6 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 text-xs font-bold text-white tracking-wide transition-all active:scale-95 cursor-pointer"
              >
                Launch Onboarding Setup
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 text-glow">
                Clients Waiting ({filtered.length})
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                PACKETS ENCRYPTED AND COMPILED
              </span>
            </div>

            <div className="grid gap-4">
              {filtered.map((proj) => {
                const isExpanded = activeProjectId === proj.id;
                const formattedDate = new Date(proj.timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={proj.id}
                    className="relative rounded-2xl border border-border/80 bg-card overflow-hidden hover:border-amber-500/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
                  >
                    {/* Top status bar edge glow for pending clients */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />

                    {/* Main Row Info */}
                    <div
                      onClick={() => setActiveProjectId(isExpanded ? null : proj.id)}
                      className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-neutral-950 border border-border/60 flex items-center justify-center text-amber-500 font-bold text-xs shadow-inner">
                          {proj.businessName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-display font-semibold text-white text-base">
                              {proj.businessName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 text-glow">
                              {proj.status}
                            </span>
                          </div>
                          
                          {/* Client details summary line */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground/80">
                            <span className="flex items-center gap-1">
                              <User size={11} className="text-muted-foreground/45" /> {proj.clientName}
                            </span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="font-mono text-[10px] uppercase text-platinum/90">
                              {proj.ownershipChoice === "full" ? "Direct Ownership" : "Managed Service"}
                            </span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="font-mono text-[10px] font-bold text-amber-500">
                              {proj.selectedPackage.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right metadata information block */}
                      <div className="flex md:flex-col items-end md:items-end justify-between border-t border-neutral-900/60 pt-4 md:pt-0 md:border-none gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1 bg-neutral-950/40 px-2 py-1 rounded">
                          <Clock size={10} /> {formattedDate}
                        </span>
                        <span className="text-[11px] text-amber-500 font-semibold font-mono tracking-wider flex items-center gap-1">
                          Specs Details <ChevronRight size={12} className={`transition-all ${isExpanded ? "rotate-3d rotate-90" : ""}`} />
                        </span>
                      </div>
                    </div>

                    {/* Expanded Spec Details Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-neutral-900/80 bg-neutral-950/40 p-5 sm:p-6"
                        >
                          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 text-xs leading-relaxed">
                            {/* Contact Card details */}
                            <div className="space-y-3">
                              <h4 className="font-mono text-[10px] uppercase text-amber-500 font-semibold tracking-wider flex items-center gap-1.5">
                                <Shield size={11} /> Contact Identities
                              </h4>
                              <div className="space-y-2 text-muted-foreground">
                                <p className="flex items-center gap-2">
                                  <User size={13} className="text-muted-foreground/30 shrink-0" />
                                  <span className="text-foreground font-medium">{proj.clientName}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Mail size={13} className="text-muted-foreground/30 shrink-0" />
                                  <a href={`mailto:${proj.email}`} className="hover:text-amber-500 hover:underline">{proj.email}</a>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-muted-foreground/30 shrink-0 text-xs">💬</span>
                                  <span className="text-foreground font-mono font-bold">{proj.whatsapp}</span>
                                  <a
                                    href={getWhatsAppLink(`Hi ${proj.clientName}, I am reviewing your completed Start Project onboarding details for ${proj.businessName}!`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[9px] font-mono text-amber-400 font-bold uppercase transition-all inline-block hover:-translate-y-0.5 active:translate-y-0"
                                  >
                                    Chat Prototyper
                                  </a>
                                </p>
                              </div>
                            </div>

                            {/* Diagnostic Specifics */}
                            <div className="space-y-3">
                              <h4 className="font-mono text-[10px] uppercase text-amber-500 font-semibold tracking-wider flex items-center gap-1.5">
                                <Layers size={11} /> Business Diagnostics
                              </h4>
                              <div className="space-y-2 text-muted-foreground">
                                <p>
                                  <span className="text-muted-foreground/45 block uppercase font-mono text-[9px]">Classification Segment</span>
                                  <span className="text-foreground font-semibold">
                                    {proj.industry === "other" ? proj.customIndustry : proj.industry}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-muted-foreground/45 block uppercase font-mono text-[9px]">Designated Outcome Goal</span>
                                  <span className="text-foreground font-medium">
                                    {proj.goal === "other" ? proj.customGoal : proj.goal}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Digital Asset Readiness states */}
                            <div className="space-y-3">
                              <h4 className="font-mono text-[10px] uppercase text-amber-500 font-semibold tracking-wider flex items-center gap-1.5">
                                <Globe size={11} /> Digital Asset Readiness
                              </h4>
                              <div className="space-y-2 text-muted-foreground">
                                <p className="flex justify-between border-b border-border/20 pb-1.5">
                                  <span>Domain Registry:</span>
                                  <span className="font-bold text-foreground">
                                    {proj.hasDomain === "yes" ? "Registered ✓" : proj.hasDomain === "no" ? "Not Ready" : "Help Select"}
                                  </span>
                                </p>
                                <p className="flex justify-between border-b border-border/20 pb-1.5">
                                  <span>Logo & Design Assets:</span>
                                  <span className="font-bold text-foreground">
                                    {proj.hasLogo === "yes" ? "Provided ✓" : proj.hasLogo === "no" ? "Not Ready" : "Needs Custom Brand"}
                                  </span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Text & Media Assets:</span>
                                  <span className="font-bold text-foreground">
                                    {proj.contentReady === "yes" ? "Copywriting Ready ✓" : proj.contentReady === "progress" ? "In Progress" : "CodeFuser to Write"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* NEW: Admin Override & Extended Workspace Modules (Part 3 & Part 7 Requirements) */}
                          <div className="mt-6 pt-5 border-t border-neutral-900/60 grid gap-6 md:grid-cols-2">
                            
                            {/* Override Settings Box */}
                            <div className="border border-neutral-900 rounded-2xl p-4 bg-black/35 space-y-4">
                              <span className="text-[9px] font-mono uppercase text-amber-500 font-extrabold tracking-widest block border-b border-neutral-900 pb-2">
                                ⚙️ Admin Override Configuration
                              </span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] text-zinc-400">Core Package Tier</label>
                                  <select
                                    value={proj.selectedPackage}
                                    onChange={(e) => handleModifyProject(proj.id, { selectedPackage: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer"
                                  >
                                    <option value="ignite">Ignite Package</option>
                                    <option value="fusion">Fusion Package</option>
                                    <option value="catalyst">Catalyst Package</option>
                                  </select>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-[10px] text-zinc-400">Ownership framework Type</label>
                                  <select
                                    value={proj.ownershipChoice}
                                    onChange={(e) => handleModifyProject(proj.id, { ownershipChoice: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer"
                                  >
                                    <option value="full">Direct Full License Ownership</option>
                                    <option value="subscription">Managed Service Agreement</option>
                                  </select>
                                </div>

                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-900">
                                  {/* Payment Source Section */}
                                  <div className="space-y-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-900">
                                    <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5">
                                      <span className="text-[10px] font-mono uppercase text-amber-500 font-bold">💳 Razorpay Source Verification</span>
                                      <span className="text-[9px] font-mono text-neutral-500 uppercase">Primary Source</span>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                      <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-400">Payment Status</label>
                                      <select
                                        value={proj.paymentStatus || "unpaid"}
                                        onChange={(e) => handleModifyProject(proj.id, { paymentStatus: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer font-bold text-amber-500"
                                      >
                                        <option value="unpaid">Unpaid / Inactive</option>
                                        <option value="paid">Paid / Active</option>
                                      </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Provider</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.paymentProvider || ""}
                                          placeholder="e.g. razorpay"
                                          onBlur={(e) => handleModifyProject(proj.id, { paymentProvider: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Purchased Plan</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.purchasedPlan || ""}
                                          placeholder="e.g. Ignite Package"
                                          onBlur={(e) => handleModifyProject(proj.id, { purchasedPlan: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Payment ID</label>
                                      <input
                                        type="text"
                                        defaultValue={proj.paymentId || ""}
                                        placeholder="e.g. pay_O1kH78X"
                                        onBlur={(e) => handleModifyProject(proj.id, { paymentId: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Order ID</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.orderId || ""}
                                          placeholder="e.g. order_O1jS23B"
                                          onBlur={(e) => handleModifyProject(proj.id, { orderId: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-500">Purchase Date</label>
                                        <input
                                          type="text"
                                          defaultValue={proj.purchaseDate || ""}
                                          placeholder="YYYY-MM-DD"
                                          onBlur={(e) => handleModifyProject(proj.id, { purchaseDate: e.target.value })}
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/40"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Portal Access Mode & Override Section */}
                                  <div className="space-y-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-900 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5 mb-3">
                                        <span className="text-[10px] font-mono uppercase text-amber-500 font-bold">🛡️ Portal Access & Override</span>
                                        <span className="text-[9px] font-mono text-neutral-500 uppercase">Override Panel</span>
                                      </div>

                                      <div className="space-y-3">
                                        <div className="space-y-1.5">
                                          <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-400">Portal Access Source Mode</label>
                                          <select
                                            value={proj.portalAccessSource || "automatic"}
                                            onChange={(e) => handleModifyProject(proj.id, { portalAccessSource: e.target.value as any })}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer font-bold"
                                          >
                                            <option value="automatic">Automatic (Follows Payment)</option>
                                            <option value="manual">Manual Override (Force Set)</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className="block text-[9px] uppercase font-mono tracking-wider text-zinc-400">Manual Override Value</label>
                                          <select
                                            value={proj.portalAccess ? "granted" : "denied"}
                                            onChange={(e) => handleModifyProject(proj.id, { portalAccess: e.target.value === "granted" })}
                                            className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono cursor-pointer font-bold ${
                                              proj.portalAccessSource === "manual" ? "opacity-100" : "opacity-40"
                                            }`}
                                          >
                                            <option value="denied">Force Suspended (Block Access)</option>
                                            <option value="granted">Force Granted (Approve Access)</option>
                                          </select>
                                          {proj.portalAccessSource !== "manual" && (
                                            <span className="text-[8px] font-mono text-zinc-500 italic mt-1 block">
                                              * Only active when Source Mode is set to Manual Override.
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Live Effective Status indicator */}
                                    {(() => {
                                      const isManual = proj.portalAccessSource === "manual";
                                      const effectiveAccess = isManual ? proj.portalAccess === true : proj.paymentStatus === "paid";
                                      return (
                                        <div className={`p-2.5 rounded-lg border ${
                                          effectiveAccess 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                        } font-sans mt-3`}>
                                          <div className="flex items-center justify-between">
                                            <span className="text-[9px] uppercase font-mono tracking-wider opacity-60">Live Effective Access:</span>
                                            <span className="text-[9px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded">
                                              {isManual ? "Manual Override" : "Automated Flow"}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold uppercase tracking-tight mt-1">
                                            {effectiveAccess ? "✓ AUTHORIZED & LIVE" : "✗ SUSPENDED / BLOCKED"}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <p className="text-[10px] text-zinc-500 leading-normal">
                                Modifying these client settings syncs to their workspace instantaneously. Keeps pricing plans aligned standardly.
                              </p>
                            </div>

                            {/* Client Registered Attachments Repository */}
                            <div className="border border-neutral-900 rounded-2xl p-4 bg-black/35 space-y-3">
                              <span className="text-[9px] font-mono uppercase text-[#cbd5e1] font-bold tracking-widest block border-b border-neutral-900 pb-2">
                                📁 Client Registered Attachments
                              </span>

                              {extraProjectMap[proj.id]?.assets && extraProjectMap[proj.id]?.assets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1">
                                  {extraProjectMap[proj.id].assets.map((as: any) => (
                                    <div key={as.id} className="p-2.5 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between gap-1.5">
                                      <div className="truncate shrink min-w-0">
                                        <span className="text-[11px] font-semibold text-white block truncate">{as.name}</span>
                                        <span className="text-[8px] font-mono text-neutral-500 block">
                                          Size: {Math.round(as.size / 1024)} KB • {as.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                        </span>
                                      </div>
                                      <a
                                        href={as.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-[8.5px] font-mono font-bold text-amber-500 hover:text-white rounded-md transition-colors shrink-0"
                                      >
                                        Open
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 bg-neutral-950/20 rounded-xl flex flex-col justify-center items-center h-[90px]">
                                  <span className="text-[10px] font-mono text-neutral-500 block">Zero uploaded workspace files.</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Official Standards quotation Lock Engine (Part 7: Single Source of Truth Pricing Freezer) */}
                          <div className="mt-5 pt-5 border-t border-neutral-900/60">
                            <div className="border border-neutral-900 rounded-2xl p-5 bg-black/35 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 pb-2">
                                <span className="text-[9px] font-mono uppercase text-amber-500 font-extrabold tracking-widest block">
                                  🔒 SECURE STANDARDS QUOTE LOCK FORM ENGINE
                                </span>
                                {extraProjectMap[proj.id]?.quote && (
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                                    Frozen Standard Rate Secure
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form 
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const data = new FormData(form);
                                    const pkg = String(data.get("packageName") || "Fusion Enterprise Spec");
                                    const pPrice = Number(data.get("price") || 24999);
                                    const pDisc = Number(data.get("discount") || 0);
                                    const desc = String(data.get("summary") || "Guaranteed custom specs package.");
                                    
                                    try {
                                      const response = await fetch(`/api/projects/${proj.id}/quote`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          packageName: pkg,
                                          price: pPrice,
                                          discount: pDisc,
                                          features: ["Premium Integrated UI Layout", "Custom Code Engine Map", "Unified DB Architecture"],
                                          summary: desc
                                        })
                                      });
                                      if (response.ok) {
                                        const body = await response.json();
                                        if (body.success && body.data) {
                                          setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                          alert("Official standards quotation locked standardly. Frozen rate locks in client dashboard for 7 days.");
                                        }
                                      }
                                    } catch (err) {
                                      console.error("Encountered standard quotation locks failure:", err);
                                    }
                                  }}
                                  className="space-y-3"
                                >
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Rate spec plan Name</label>
                                      <input 
                                        type="text" 
                                        name="packageName" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.packageName || proj.selectedPackage.toUpperCase()} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Lock price Rate (₹ INR)</label>
                                      <input 
                                        type="number" 
                                        name="price" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.price || (proj.selectedPackage.includes("ignite") ? 14999 : proj.selectedPackage.includes("catalyst") ? 49999 : 24999)} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white font-mono"
                                        required
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Lock discount Rate (₹ INR)</label>
                                      <input 
                                        type="number" 
                                        name="discount" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.discount || 0} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white font-mono"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-mono text-zinc-400 uppercase">Terms Lock Description</label>
                                      <input 
                                        type="text" 
                                        name="summary" 
                                        defaultValue={extraProjectMap[proj.id]?.quote?.summary || "AI Recommended specifications locked."} 
                                        className="w-full bg-neutral-900 border border-neutral-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 text-white"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="submit"
                                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-amber-500 hover:text-white border border-neutral-800 hover:border-amber-500/40 text-[9px] font-mono font-bold uppercase rounded-lg transition-all tracking-wider h-9 flex items-center justify-center cursor-pointer"
                                  >
                                    🔒 Create / Update Frozen Price Quote lock
                                  </button>
                                </form>

                                {/* Right Side: Current Frozen Quoting Diagnostics */}
                                <div className="bg-[#030303] border border-neutral-900 p-4 rounded-xl flex flex-col justify-between">
                                  {extraProjectMap[proj.id]?.quote ? (
                                    <div className="space-y-3 font-sans">
                                      <span className="block text-[8px] font-mono text-amber-500 uppercase tracking-wider font-extrabold">Active Fixed-Rate Specifications Record</span>
                                      
                                      <div className="space-y-2 text-xs">
                                        <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                                          <span className="text-neutral-500">Fixed Tier Name:</span>
                                          <span className="font-bold text-white uppercase font-mono text-[10.5px]">{extraProjectMap[proj.id].quote.packageName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                                          <span className="text-neutral-500">Guaranteed Amount Rate:</span>
                                          <span className="font-extrabold text-amber-500 font-mono">₹{extraProjectMap[proj.id].quote.price.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                                          <span className="text-neutral-500">Secure locks validity:</span>
                                          <span className="font-extrabold text-neutral-300 font-mono">{getQuoteTimeRemaining(extraProjectMap[proj.id].quote.expiryDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-500">Discount Segment:</span>
                                          <span className="font-medium text-emerald-400 font-mono">₹{(extraProjectMap[proj.id].quote.discount || 0).toLocaleString("en-IN")}</span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={async () => {
                                          if (!confirm("Are you sure you want to release this secure quotation lock? standard packages will resume.")) return;
                                          try {
                                            const res = await fetch(`/api/projects/${proj.id}/quote/reset`, { method: "POST" });
                                            if (res.ok) {
                                              const body = await res.json();
                                              if (body.success) {
                                                setExtraProjectMap(prev => ({ ...prev, [proj.id]: body.data }));
                                                alert("Quotation lock has been reset successfully.");
                                              }
                                            }
                                          } catch(err) {
                                            console.error("Failed to reset standard quotation:", err);
                                          }
                                        }}
                                        className="w-full py-1.5 bg-neutral-900 hover:bg-red-950/40 hover:text-red-300 hover:border-red-950 text-[9px] font-mono font-bold text-neutral-400 uppercase rounded-lg border border-neutral-850 h-8 transition-colors cursor-pointer"
                                      >
                                        Unlock Price quote
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-4 text-center space-y-2">
                                      <span className="text-amber-500 text-lg">⚠️</span>
                                      <span className="text-[11px] font-semibold text-zinc-300 block">No Active Price Quote Frozen</span>
                                      <span className="text-[9.5px] text-zinc-500 max-w-[200px] leading-normal">
                                        Client dashboard is displaying dynamic prices based on standard packages. Enter details on the left to lock.
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Technical Core Action block */}
                          <div className="mt-5 pt-4 border-t border-neutral-900 flex justify-between items-center bg-card/60 rounded-xl p-3.5 border border-border/40">
                            <div>
                              <p className="text-[10px] font-mono text-muted-foreground/75 uppercase tracking-wide">
                                Compiled under Track ID CodeFuser Core:
                              </p>
                              <p className="font-mono text-zinc-300 font-semibold mt-0.5 text-[11px]">
                                {proj.id?.toUpperCase()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                              {/* Real-time Status Dropdown */}
                              <select
                                value={proj.status}
                                onChange={(e) => handleUpdateStatus(proj.id, e.target.value)}
                                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase text-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer h-8"
                              >
                                <option value="Project Filed">Project Filed</option>
                                <option value="Specs Audited">Specs Audited</option>
                                <option value="Assets Pending">Assets Pending</option>
                                <option value="Designing">Designing</option>
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                                <option value="Checklist Ready">Checklist Ready</option>
                                <option value="Launched">Launched</option>
                              </select>

                              <button
                                onClick={() => {
                                  alert(`Successfully initiated development compiler for project ${proj.id}. CodeFuser systems are mapping the custom database schema layouts...`);
                                }}
                                className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-lg text-amber-500 hover:bg-neutral-800 tracking-wider transition-all h-8 flex items-center"
                              >
                                🚀 Start Compiler
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionControl;
