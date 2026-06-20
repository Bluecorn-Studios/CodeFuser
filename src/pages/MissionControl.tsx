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
}

export const MissionControl: React.FC = () => {
  const { navigate } = useAppRouter();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorValue, setErrorValue] = useState<string | null>(null);
  const [dbSource, setDbSource] = useState<string>("Supabase");
  
  // Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("all");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatPlanName = (id: string) => {
    switch (id) {
      case "foundation": return "Ignite (₹9,999)";
      case "growth": return "Fusion (₹24,999)";
      case "dominance": return "Catalyst (₹49,999)";
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
              <option value="foundation">Ignite (₹9,999)</option>
              <option value="growth">Fusion (₹24,999)</option>
              <option value="dominance">Catalyst (₹49,999)</option>
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
                            <button
                              onClick={() => {
                                alert(`Successfully initiated development compiler for project ${proj.id}. CodeFuser systems are mapping the custom database schema layouts...`);
                              }}
                              className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-lg text-amber-500 hover:bg-neutral-800 tracking-wider transition-all"
                            >
                              🚀 Start Compiler
                            </button>
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
