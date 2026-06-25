import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Check, 
  AlertCircle, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  UploadCloud, 
  Clock, 
  Globe, 
  LogOut, 
  Layers, 
  Coins, 
  User,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  FileText,
  BadgeAlert,
  BadgeCheck,
  BadgeHelp,
  ArrowUpRight
} from "lucide-react";
import { useAppRouter } from "../components/Reveal";
import { getAuthUser, clearAuthSession } from "../utils/auth";
import { supabase } from "../lib/supabase";
import { safeLocalStorage } from "../utils/safeStorage";

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

interface AssetFileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: string;
}

interface OfficialQuoteRecord {
  packageName: string;
  price: number;
  discount: number;
  features: string[];
  summary: string;
  timestamp: string;
  expiryDate: string;
  status: "active" | "expiring" | "expired";
}

interface ExtraProjectData {
  projectId: string;
  quote: OfficialQuoteRecord | null;
  assets: AssetFileRecord[];
}

export default function CustomerDashboard() {
  const { navigate } = useAppRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Extra metadata (assets & quotes) state hooks
  const [extraStore, setExtraStore] = useState<ExtraProjectData>({ projectId: "", quote: null, assets: [] });
  const [extraLoading, setExtraLoading] = useState<boolean>(false);
  const [extraError, setExtraError] = useState<string | null>(null);

  // Upload micro-interaction states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Interactive Modal/Sections State
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState<string>("");
  const [logoInput, setLogoInput] = useState<string>("");
  const [copyInput, setCopyInput] = useState<string>("");
  const [isUpdatingField, setIsUpdatingField] = useState<string | null>(null);
  const [successIndicator, setSuccessIndicator] = useState<string | null>(null);

  const assetCenterRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Auto-fetch project on mount
  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser) {
      navigate("/login");
      return;
    }
    fetchUserProject(authUser);
  }, []);

  const fetchUserProject = async (user: { id: string; email: string }) => {
    setIsLoading(true);
    let activeId: string | null = null;
    try {
      const response = await fetch(`/api/projects?userId=${user.id}&email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        const found = data.projects && data.projects[0];
        if (found) {
          setProject(found);
          setProjectId(found.id);
          activeId = found.id;
          safeLocalStorage.setItem("fuser_client_project_id", found.id);
          setDomainInput(found.hasDomain || "");
          setLogoInput(found.hasLogo || "");
          setCopyInput(found.contentReady || "");
        } else {
          // Fallback to local backup standard
          const localBackup = safeLocalStorage.getItem("codefuser_current_project");
          if (localBackup) {
            const parsed = JSON.parse(localBackup);
            if (parsed.email?.trim().toLowerCase() === user.email?.trim().toLowerCase()) {
              setProject(parsed);
              setProjectId(parsed.id);
              activeId = parsed.id;
              safeLocalStorage.setItem("fuser_client_project_id", parsed.id);
              setDomainInput(parsed.hasDomain || "");
              setLogoInput(parsed.hasLogo || "");
              setCopyInput(parsed.contentReady || "");
            }
          }
        }
      }
    } catch (err) {
      console.error("Retrieve authenticated project failed:", err);
      setExtraError("Couldn't load dashboard. Please verify connection.");
    } finally {
      setIsLoading(false);
      if (activeId) {
        fetchExtraData(activeId);
      }
    }
  };

  const fetchExtraData = async (projId: string) => {
    setExtraLoading(true);
    setExtraError(null);
    try {
      const res = await fetch(`/api/projects/${projId}/extra`);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          setExtraStore(body.data);
        }
      } else {
        setExtraError("Couldn't load dashboard updates. Standalone offline mode activated.");
      }
    } catch (err) {
      console.error("Fetch extra project data failed:", err);
      setExtraError("Connection lost. Synchronization paused.");
    } finally {
      setExtraLoading(false);
    }
  };

  const logoutClient = async () => {
    try {
      await Promise.all([
        fetch("/api/auth/logout", { method: "POST" }),
        supabase.auth.signOut()
      ]);
    } catch (e) {
      console.warn("Logout endpoint unreachable", e);
    }
    clearAuthSession();
    setProjectId(null);
    setProject(null);
    navigate("/");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !project) return;
    const file = files[0];
    await uploadSingleFile(file);
  };

  const uploadSingleFile = async (file: File) => {
    if (!project) return;
    setUploadProgress(10);
    setUploadStatus("Reading file binary stream...");
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadstart = () => {
      setUploadProgress(20);
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 55);
        setUploadProgress(20 + percent); // Up to 75%
      }
    };
    reader.onload = async () => {
      try {
        setUploadProgress(80);
        setUploadStatus("Transmitting raw bytes to workspace...");
        
        const rawContent = reader.result as string;
        // Strip out the data:mimetype;base64, segment
        const base64Data = rawContent.split(',')[1] || rawContent;
        
        const response = await fetch(`/api/projects/${project.id}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
            content: base64Data
          })
        });

        if (!response.ok) throw new Error("Upload chunk was refused.");
        
        const body = await response.json();
        if (body.success && body.data) {
          setUploadProgress(100);
          setUploadStatus("Asset registered successfully!");
          setExtraStore(body.data);
          
          // Clear progressive overlay after short pause
          setTimeout(() => {
            setUploadProgress(null);
            setUploadStatus(null);
          }, 2000);
        } else {
          throw new Error(body.error || "Upload failed on cloud repository.");
        }
      } catch (err: any) {
        setUploadError(err.message || "Upload failed. Server unavailable.");
        setUploadProgress(null);
        setUploadStatus(null);
      }
    };
    
    reader.onerror = () => {
      setUploadError("Failed to parse local file stream.");
      setUploadProgress(null);
      setUploadStatus(null);
    };

    reader.readAsDataURL(file);
  };

  const handleUpdateAssetField = async (field: "domain" | "logo" | "copy", value: string) => {
    if (!project) return;
    setIsUpdatingField(field);
    setSuccessIndicator(null);

    const payload: Partial<ProjectRecord> = {};
    if (field === "domain") payload.hasDomain = value;
    if (field === "logo") payload.hasLogo = value;
    if (field === "copy") payload.contentReady = value;

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Sync failure.");

      const result = await response.json();
      if (result.success) {
        setProject(result.data);
        setSuccessIndicator(`${field === "domain" ? "Domain address" : field === "logo" ? "Brand logo" : "Copywriting docs"} updated live!`);
        safeLocalStorage.setItem("codefuser_current_project", JSON.stringify(result.data));
      }
    } catch (err) {
      console.warn("Server unavailable, updating local client state gracefully.", err);
      const mockUpdated = {
        ...project,
        hasDomain: field === "domain" ? value : project.hasDomain,
        hasLogo: field === "logo" ? value : project.hasLogo,
        contentReady: field === "copy" ? value : project.contentReady
      };
      setProject(mockUpdated);
      safeLocalStorage.setItem("codefuser_current_project", JSON.stringify(mockUpdated));
      setSuccessIndicator(`Offline fallback state updated successfully.`);
    } finally {
      setIsUpdatingField(null);
      setTimeout(() => setSuccessIndicator(null), 3500);
    }
  };

  const getPlanDetails = (packageId: string) => {
    const p = packageId?.toLowerCase() || "";
    if (p.includes("ignite") || p.includes("foundation")) {
      return { name: "Ignite Package", price: 9999, originalPrice: 9999, timeline: "5-7 Days" };
    }
    if (p.includes("growth") || p.includes("fusion")) {
      return { name: "Fusion Package", price: 24999, originalPrice: 24999, timeline: "10-14 Days" };
    }
    if (p.includes("dominance") || p.includes("catalyst")) {
      return { name: "Catalyst Package", price: 49999, originalPrice: 49999, timeline: "21-30 Days" };
    }
    return { name: `${packageId || "Fusion"} Package`, price: 24999, originalPrice: 24999, timeline: "12 Days" };
  };

  const getTimelineStageIndex = (statusStr: string) => {
    const s = statusStr?.toLowerCase() || "";
    if (s.includes("review") || s.includes("specs audited")) return 1;
    if (s.includes("assets requested")) return 2;
    if (s.includes("assets received") || s.includes("assets pending") || s.includes("gathering")) return 3;
    if (s.includes("design") || s.includes("wireframe")) return 4;
    if (s.includes("dev") || s.includes("development") || s.includes("core development")) return 5;
    if (s.includes("testing") || s.includes("qa")) return 6;
    if (s.includes("launch") || s.includes("live") || s.includes("completed")) return 7;
    return 0; // Project Submitted is standard
  };

  const timelineStages = [
    { label: "Project Submitted", key: "submitted" },
    { label: "Requirements Reviewed", key: "reviewed" },
    { label: "Assets Requested", key: "requested" },
    { label: "Assets Received", key: "received" },
    { label: "Design", key: "design" },
    { label: "Development", key: "development" },
    { label: "Testing", key: "testing" },
    { label: "Launch", key: "launch" }
  ];

  const getEstimatedNextStep = (statusStr: string) => {
    const s = statusStr?.toLowerCase() || "";
    if (s.includes("launched") || s.includes("live") || s.includes("completed")) {
      return "Platform is live and fully deployed!";
    }
    if (s.includes("testing") || s.includes("qa")) {
      return "Deploying security setup and running speed tests.";
    }
    if (s.includes("dev") || s.includes("development") || s.includes("core development")) {
      return "Core pages development in progress.";
    }
    if (s.includes("design") || s.includes("wireframe")) {
      return "Designing website layout and brand colors.";
    }
    return "Provide your brand logo and target domain.";
  };

  const getWhatsAppLink = (textStr: string) => {
    return `https://wa.me/917449100307?text=${encodeURIComponent(textStr)}`;
  };

  const getComposeEmailLink = (pkgName: string) => {
    const subject = `Asset Settle: Workspace specifications client request for ${project?.businessName || "My Business"}`;
    const body = `Hi CodeFuser Team,\n\nI have structured my workspace requirements for ${project?.businessName || "My Business"}! Ready for visual sprint alignments.\n\nProject ID: ${project?.id}\nPlan: ${pkgName}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Safe checks if user is logged out or loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="h-9 w-9 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Decrypting Workspace Credentials...</p>
        </div>
      </div>
    );
  }

  // Auth Protection Fallback screen
  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#050505] border border-neutral-900 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          
          <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-6">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-100">
            Client Workspace Not Available
          </h2>
          <p className="text-xs text-neutral-450 mt-4 leading-relaxed font-sans">
            This account is not currently linked to an active CodeFuser client workspace.
          </p>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-sans">
            If you've recently completed your payment, your workspace may still be under preparation. Otherwise, begin by choosing one of our services.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => {
                navigate("/");
                setTimeout(() => {
                  const el = document.getElementById("pricing");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 300);
              }}
              className="w-full bg-white text-black py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs font-sans cursor-pointer hover:bg-neutral-100 transition-all"
            >
              Choose Your Journey
            </button>
            
            <button
              onClick={() => window.open(getWhatsAppLink("Hi CodeFuser, I would like to inquire about my secure client workspace setup status."), "_blank")}
              className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs border border-neutral-800 font-sans cursor-pointer transition-all"
            >
              Contact Support
            </button>
          </div>

          <button 
            onClick={logoutClient}
            className="text-xs text-neutral-500 hover:text-red-400 transition-colors uppercase font-mono tracking-widest mt-6 block mx-auto cursor-pointer"
          >
            Switch Accounts
          </button>
        </motion.div>
      </div>
    );
  }

  // Helper to compute remaining days / hours to display validation
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

  // Pre-calculate financial details
  const planInfo = getPlanDetails(project.selectedPackage);
  
  // SUPPORT FOR LOCKED OFFICIAL QUOTES (Part 7 - Single Source of Truth Pricing Freezer)
  const isQuoteLocked = !!extraStore.quote;
  const quoteData = extraStore.quote;
  
  const selectedPackageName = quoteData ? quoteData.packageName : planInfo.name;
  const finalPrice = quoteData ? quoteData.price : planInfo.price;
  const isFullySettled = project.ownershipChoice === "full";
  
  const paidFunds = isFullySettled ? finalPrice * 0.9 : finalPrice / 2;
  const unpaidFunds = isFullySettled ? 0 : finalPrice / 2;

  // Determine current active stage
  const activeStageIndex = getTimelineStageIndex(project.status);

  // Formulate exactly ONE primary action card message
  const hasEmptyAssets = !project.hasDomain || !project.hasLogo || !project.contentReady;
  const getPrimaryActionDetails = () => {
    if (!project.hasDomain || project.hasDomain === "" || project.hasDomain === "no") {
      return {
        title: "Set Your Domain",
        description: "Specify your preferred web address (e.g. brand.com).",
        btn: "Configure Domain Location",
        type: "domain"
      };
    }
    if (!project.hasLogo || project.hasLogo === "" || project.hasLogo === "no") {
      return {
        title: "Provide Brand Logo",
        description: "Upload your brand logo files or share a design link.",
        btn: "Configure Logo Link",
        type: "logo"
      };
    }
    if (!project.contentReady || project.contentReady === "" || project.contentReady === "no") {
      return {
        title: "Provide Brand Copy",
        description: "Upload website text or request our team to write it.",
        btn: "Verify Copywriting Strategy",
        type: "copy"
      };
    }
    if (activeStageIndex < 3) {
      return {
        title: "Align on Website Specs",
        description: "Initial setup done. Schedule a quick chat to map out features.",
        btn: "Open Support Messenger",
        type: "chat"
      };
    }
    return {
      title: "Review Design Specifications",
      description: "Our design team is building custom page layouts. Check back soon.",
      btn: "View Active Project Timeline",
      type: "timeline"
    };
  };

  const primaryAction = getPrimaryActionDetails();

  return (
    <div className="min-h-screen bg-black text-white font-sans select-none relative overflow-x-hidden pb-12">
      {/* Decorative premium radial mesh */}
      <div className="absolute top-0 inset-x-0 h-[380px] bg-gradient-to-b from-amber-500/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-12 right-0 w-[240px] h-[240px] bg-amber-500/[0.012] rounded-full blur-[90px] pointer-events-none" />

      {/* Embedded Mobile Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-neutral-900 bg-black/80 backdrop-blur-md px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 focus:outline-none">
          <span className="font-display text-lg font-black tracking-widest text-neutral-100 uppercase sm:text-xl">
            CODEFUSER
          </span>
          <span className="text-[8px] font-mono font-bold bg-[#111] border border-neutral-800 text-amber-500 px-1.5 py-0.5 rounded">HQ</span>
        </button>
        <button 
          onClick={logoutClient}
          className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-red-500 hover:text-red-400 bg-neutral-900/50 px-2.5 py-1.5 rounded-full border border-neutral-800/80 cursor-pointer focus:outline-none transition-colors"
        >
          <LogOut size={12} /> EXIT
        </button>
      </header>

      {/* Main Single-Column Stack Content Container */}
      <div className="max-w-md mx-auto px-5 pt-6 space-y-6 sm:max-w-lg md:max-w-xl">

        {/* Global Action Banner */}
        {successIndicator && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-2xl flex items-center justify-center gap-2 text-xs font-mono"
          >
            <Check size={14} className="shrink-0 text-emerald-400 animate-bounce" />
            <span>{successIndicator}</span>
          </motion.div>
        )}

        {/* LOCKED OFFICIAL QUOTATION (Part 7: Single Source of Truth Price Freezer) */}
        {isQuoteLocked && quoteData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-3xl p-5 space-y-3 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-20 h-20 bg-amber-500/[0.02] pointer-events-none" />
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 pb-2.5">
              <span className="inline-flex items-center gap-1.5 text-[8.5px] font-mono text-amber-400 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                🔒 Official Quotation Secured
              </span>
              <span className="text-[9.5px] font-mono text-neutral-400 font-medium">
                Validity Locks: <span className="text-amber-500 font-bold">{getQuoteTimeRemaining(quoteData.expiryDate)}</span>
              </span>
            </div>

            <div>
              <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-wider">Locked Package Tier</span>
              <h4 className="text-sm font-black text-white uppercase">{quoteData.packageName}</h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                {quoteData.summary || "Your custom AI recommendation specification is locked into a fixed-index rate on the server backend."}
              </p>
            </div>

            <div className="flex items-end justify-between pt-1">
              <div>
                <span className="text-[8px] font-mono text-neutral-500 uppercase block">Frozen Price Rate</span>
                <span className="text-lg font-black text-amber-500 font-mono">₹{quoteData.price.toLocaleString("en-IN")}</span>
              </div>
              <button
                onClick={async () => {
                  if (!confirm("Are you sure you want to release your locked price quote? Standard dynamic packages will resume.")) return;
                  try {
                    const res = await fetch(`/api/projects/${project.id}/quote/reset`, { method: "POST" });
                    if (res.ok) {
                      const b = await res.json();
                      if (b.success) {
                        setExtraStore(b.data);
                        setSuccessIndicator("Rate freeze unlocked. Standard dynamic plans restored.");
                        setTimeout(() => setSuccessIndicator(null), 3000);
                      }
                    }
                  } catch(err) {
                    console.error("Unlock quote failed:", err);
                  }
                }}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-red-950/40 hover:text-red-400 border border-neutral-850 hover:border-red-900/30 text-[9px] font-mono font-bold text-neutral-400 uppercase rounded-xl transition-all cursor-pointer"
              >
                Reset Quote
              </button>
            </div>
          </motion.div>
        )}

        {/* 1. WELCOME HERO SECTION */}
        <section id="welcome-hero-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">Welcome Back</span>
            <span className="inline-flex items-center gap-1 text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" /> Connection Active
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mt-1.5 uppercase font-sans">
            {project.clientName}
          </h1>

          <div className="border-t border-neutral-900 mt-4 pt-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Business Unit:</span>
              <span className="font-bold text-white tracking-tight">{project.businessName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Selected Package:</span>
              <span className="font-mono text-amber-500 text-[11px] font-bold uppercase">{selectedPackageName.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Current Status:</span>
              <span className="font-bold text-white bg-neutral-900 px-2 py-0.5 rounded text-[11px] border border-neutral-800">{project.status}</span>
            </div>
          </div>

          <div className="bg-[#090909] border border-neutral-900 rounded-2xl p-3.5 mt-4 text-[11.5px] leading-relaxed text-neutral-300">
            <span className="block text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest mb-1">Expected Next Steps</span>
            {getEstimatedNextStep(project.status)}
          </div>
        </section>


        {/* 2. PRIMARY ACTION CARD */}
        <section id="primary-action-card">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-r from-amber-500/5 to-amber-600/[0.02] border-2 border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-[0_12px_24px_rgba(245,158,11,0.06)]"
          >
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3">
              <span className="h-5 w-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Sparkles size={11} className="text-amber-500" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase block">RECOMMENDED NEXT ACTION</span>
            </div>

            <h3 className="text-base font-black uppercase text-white tracking-tight leading-snug">
              {primaryAction.title}
            </h3>
            
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              {primaryAction.description}
            </p>

            <button
              onClick={() => {
                if (primaryAction.type === "domain" || primaryAction.type === "logo" || primaryAction.type === "copy") {
                  setActiveQuickAction("assets");
                  setTimeout(() => {
                    assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                } else if (primaryAction.type === "chat") {
                  window.open(getWhatsAppLink(`Hi CodeFuser support! Settle request setup details for ID ${project.id}.`), "_blank");
                } else {
                  timelineRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs font-sans mt-5 cursor-pointer flex items-center justify-center gap-2 pointer-events-auto shadow-md"
            >
              <span>{primaryAction.btn}</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </motion.div>
        </section>


        {/* 3. PROJECT TIMELINE */}
        <section ref={timelineRef} id="project-timeline-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5 border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
              <Layers size={13} className="text-amber-500" /> Project Timeline
            </h3>
            <span className="text-[8px] font-mono text-neutral-500 uppercase font-black">2.0 Sync Live</span>
          </div>

          {/* Clean Vertical Stack Timeline */}
          <div className="relative pl-6 space-y-5 font-sans">
            {/* The vertical connector line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-neutral-900" />

            {timelineStages.map((stage, idx) => {
              const isCompleted = idx < activeStageIndex;
              const isActive = idx === activeStageIndex;
              
              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Circle Indicator on vertical line */}
                  <div className={`absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                      : isActive 
                        ? "bg-amber-500 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110" 
                        : "bg-[#030303] border-neutral-800"
                  }`} />

                  {/* Stage Label details styling */}
                  <div className="flex-1">
                    <span className={`text-[12.5px] font-bold uppercase tracking-wide block ${
                      isActive ? "text-amber-400 font-black" : isCompleted ? "text-white" : "text-neutral-600"
                    }`}>
                      {stage.label}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-mono text-amber-500 uppercase font-black block mt-0.5">
                        ● CURRENT SPRINT ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* 4. PROJECT OVERVIEW */}
        <section id="project-overview-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5">
              📋 Platform Overview
            </h3>
            <span className="text-[8px] font-mono text-neutral-500 uppercase font-bold">Metadata</span>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Selected Package:</span>
              <span className="font-bold text-white uppercase text-[11px] font-mono">{selectedPackageName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Project Status:</span>
              <span className="font-bold font-mono text-white bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded text-[11px] uppercase">
                {project.status.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Estimated Delivery:</span>
              <span className="font-semibold text-white">{planInfo.timeline}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Payment Status:</span>
              <span className={`font-semibold ${isFullySettled ? "text-emerald-450" : "text-amber-400"}`}>
                {isFullySettled ? "Completed (Upfront)" : "Deposit Paid (50%)"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Project Manager:</span>
              <span className="font-mono text-[11px] text-neutral-300">CodeFuser Team</span>
            </div>
          </div>
        </section>


        {/* 5. ACTIONABLE NOTIFICATIONS */}
        <section id="actionable-notifications-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5">
              🔔 Notifications
            </h3>
            <span className="text-[8px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded uppercase font-bold">Latest</span>
          </div>

          <div className="space-y-3 font-sans">
            {/* Action REQUIRED: Settle logo assets info */}
            {hasEmptyAssets && (
              <div className="p-3.5 rounded-2xl bg-red-500/[0.02] border border-red-500/20 flex gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping mt-1.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-tight">🔴 Upload Missing Assets</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                    Please provide your design files and requirements below.
                  </p>
                </div>
              </div>
            )}

            {/* Stage-based active notifications */}
            <div className="p-3.5 rounded-2xl bg-amber-500/[0.02] border border-amber-500/20 flex gap-3">
              <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-tight">🟡 Status Updated — {project.status}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                  Our system matched current records. Progress tracking has been updated.
                </p>
              </div>
            </div>

            {/* Completed Setup transaction notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 flex gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-tight font-sans">🟢 Payment Verified Successfully</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                  Onboarding deposit transaction successfully verified on the security network.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* 6. PAYMENT SUMMARY */}
        <section id="payment-summary-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5">
              🪙 Payments
            </h3>
            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Secure</span>
          </div>

          <div className="space-y-3.5 font-sans text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900/40">
              <span className="text-neutral-500">Plan Original Value:</span>
              <span className="font-bold font-mono text-neutral-300">₹{finalPrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-900/40">
              <span className="text-emerald-400 font-semibold">Processed Payment:</span>
              <span className="font-mono text-emerald-400 font-extrabold text-[12.5px]">₹{paidFunds.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <span className="text-neutral-500">Remaining Balance:</span>
              <span className="font-mono font-black text-amber-500 text-[12.5px]">
                {unpaidFunds === 0 ? "₹0 (Fully Cleared)" : `₹${unpaidFunds.toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-2xl mt-4">
              <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Billing Terms</span>
              <p className="text-[11px] font-medium text-neutral-300 leading-relaxed font-sans">
                {isFullySettled 
                  ? "Upfront payment discount applied with a savings of 10%." 
                  : "Standard milestone billing. The final 50% remainder is due upon website launch evaluation."}
              </p>
            </div>

            {/* Receipts histories with download button */}
            <div className="pt-3">
              <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Invoice Logs</span>
              <div className="p-3 bg-[#030303] border border-neutral-900 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-white block">RETAINER_INVOICE_{project.id.toUpperCase()}</span>
                  <span className="text-[8px] font-mono text-neutral-500">Type: Razorpay Secure Receipt</span>
                </div>
                <button 
                  onClick={() => alert("Digital receipt PDF placeholder. Download authorized post launch alignment.")}
                  className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none border-none cursor-pointer"
                >
                  <FileText size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* INTERACTIVE COMPRESSED ASSET CENTER (Triggered by Action) */}
        <AnimatePresence>
          {activeQuickAction === "assets" && (
            <motion.section 
              ref={assetCenterRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#050505] border-2 border-neutral-850 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                    <UploadCloud size={14} className="text-amber-500 animate-pulse" /> Digital Asset Workspace
                  </h3>
                  <button 
                    onClick={() => setActiveQuickAction(null)}
                    className="text-[10px] font-mono font-bold text-neutral-500 hover:text-white uppercase transition-colors focus:outline-none bg-transparent border-none cursor-pointer"
                  >
                    Hide [×]
                  </button>
                </div>

                {/* Left and Right Partition: External Links vs Binary Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Settle Resource URIs */}
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider block border-b border-neutral-900 pb-1.5">
                      🌐 External Target Resources
                    </span>

                    {/* Field 1: Domain Setup */}
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#94a3b8]">Target Web Domain Name</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                          placeholder="e.g. customizedbrand.com"
                          className="flex-1 bg-[#030303] border border-neutral-900 focus:border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateAssetField("domain", domainInput.startsWith("Provided") ? domainInput : `Provided: ${domainInput}`)}
                          disabled={isUpdatingField === "domain"}
                          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer"
                        >
                          {isUpdatingField === "domain" ? "..." : "Settle"}
                        </button>
                      </div>
                    </div>

                    {/* Field 2: Logo link */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#94a3b8]">Logo Folder Link</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={logoInput}
                          onChange={(e) => setLogoInput(e.target.value)}
                          placeholder="e.g. https://drive.google.com/..."
                          className="flex-1 bg-[#030303] border border-neutral-900 focus:border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                        />
                        <button
                          onClick={() => handleUpdateAssetField("logo", logoInput.startsWith("Provided") ? logoInput : `Provided: ${logoInput}`)}
                          disabled={isUpdatingField === "logo"}
                          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer"
                        >
                          {isUpdatingField === "logo" ? "..." : "Settle"}
                        </button>
                      </div>
                    </div>

                    {/* Field 3: Copy documents file */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#94a3b8]">Copywriting Docs Files Link</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={copyInput}
                          onChange={(e) => setCopyInput(e.target.value)}
                          placeholder="e.g. https://docs.google.com/..."
                          className="flex-1 bg-[#030303] border border-neutral-900 focus:border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateAssetField("copy", copyInput.startsWith("Provided") ? copyInput : `Provided: ${copyInput}`)}
                          disabled={isUpdatingField === "copy"}
                          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer"
                        >
                          {isUpdatingField === "copy" ? "..." : "Settle"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Binary File Uploads */}
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider block border-b border-neutral-900 pb-1.5">
                      📁 Binary File Repository
                    </span>

                    <div className="border border-dashed border-neutral-800 rounded-2xl p-5 bg-[#030303] text-center space-y-3">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <UploadCloud size={24} className="text-amber-500/40 animate-pulse mb-1" />
                        <span className="text-xs text-white font-bold block">Upload Digital Assets</span>
                        <span className="text-[10px] text-neutral-400 block max-w-[220px] mx-auto text-center leading-normal">
                          Provide Logo, Brand guidelines, Photos, Copy Docs, or guidelines (Max 50MB)
                        </span>
                      </div>
                      
                      <input 
                        type="file" 
                        id="local-file-uploader" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                      <label 
                        htmlFor="local-file-uploader"
                        className="inline-block px-4 py-2 bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-widest text-[#cbd5e1] rounded-xl hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
                      >
                        Browse System Files
                      </label>

                      {uploadStatus && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] font-mono text-amber-500 block uppercase tracking-wider animate-pulse">{uploadStatus}</span>
                          {uploadProgress !== null && (
                            <div className="w-full bg-[#050505] rounded-full h-1 overflow-hidden border border-neutral-900">
                              <div className="bg-amber-500 h-1 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          )}
                        </div>
                      )}

                      {uploadError && (
                        <span className="text-[9px] font-mono text-red-400 block pt-1">⚠️ {uploadError}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Extra Section: Uploaded items stream list */}
                {extraStore.assets && extraStore.assets.length > 0 && (
                  <div className="border-t border-neutral-900 pt-4">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold mb-3">
                      WORKSPACE ATTACHMENTS ARCHIVE ({extraStore.assets.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
                      {extraStore.assets.map((asset) => (
                        <div key={asset.id} className="p-3 bg-[#030303] border border-neutral-900 rounded-xl flex items-center justify-between gap-3">
                          <div className="truncate shrink min-w-0">
                            <span className="text-xs font-semibold text-white block truncate">{asset.name}</span>
                            <span className="text-[8px] font-mono text-neutral-500 block uppercase tracking-wide">
                              {Math.round(asset.size / 1024)} KB • {asset.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                          <a 
                            href={asset.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 px-3 bg-neutral-900 border border-neutral-800 text-[9px] font-mono font-bold uppercase text-amber-500 tracking-wider hover:bg-neutral-850 hover:text-white rounded-lg shrink-0 transition-colors"
                          >
                            View Raw
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>


        {/* 7. QUICK ACTIONS SECTION */}
        <section id="quick-actions-bar" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5">
              ⚡ Quick Actions
            </h3>
            <span className="text-[8px] font-mono text-neutral-500 uppercase font-bold">Fast link</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-sans">
            <button
              onClick={() => {
                setActiveQuickAction(activeQuickAction === "assets" ? null : "assets");
                setTimeout(() => {
                  assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 150);
              }}
              className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer focus:outline-none"
            >
              <UploadCloud size={16} className="text-amber-500" />
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">Manage Assets</span>
            </button>

            <button
              onClick={() => alert("Your dynamic payment statement standard invoice is synced in real-time with Razorpay secure gateways.")}
              className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer focus:outline-none"
            >
              <FileText size={16} className="text-neutral-400" />
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">View Receipt</span>
            </button>

            <button
              onClick={() => window.open(getWhatsAppLink(`Hi CodeFuser distributed PM, let's sync on project id: ${project.id}.`), "_blank")}
              className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer focus:outline-none"
            >
              <MessageSquare size={16} className="text-emerald-450" />
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">Contact Support</span>
            </button>

            <button
              onClick={() => {
                timelineRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer focus:outline-none"
            >
              <Layers size={16} className="text-neutral-400" />
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">View Timeline Sprints</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
