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
import { getAuthUser, clearAuthSession, getAuthToken } from "../utils/auth";
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
  paymentStatus?: string;
  portalAccess?: boolean;
  paymentProvider?: string;
  paymentId?: string;
  orderId?: string;
  purchasedPlan?: string;
  purchaseDate?: string;
  portalAccessSource?: "automatic" | "manual";
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
  proposal?: {
    content: string;
    status: "draft" | "sent";
    timestamp: string;
  } | null;
  checklist?: {
    id: string;
    task: string;
    completed: boolean;
  }[] | null;
  deliverables?: {
    id: string;
    name: string;
    category: string;
    size: number;
    url: string;
    timestamp: string;
  }[] | null;
}

interface ExtraProjectData {
  projectId: string;
  quote: OfficialQuoteRecord | null;
  assets: AssetFileRecord[];
}

function parseMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return <h4 key={idx} className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider mt-4 mb-2">{trimmed.replace("### ", "")}</h4>;
    }
    if (trimmed.startsWith("## ")) {
      return <h3 key={idx} className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest border-b border-neutral-900 pb-1.5 mt-5 mb-2">{trimmed.replace("## ", "")}</h3>;
    }
    if (trimmed.startsWith("# ")) {
      return <h2 key={idx} className="text-sm font-black text-white uppercase tracking-tight mt-6 mb-3">{trimmed.replace("# ", "")}</h2>;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <div key={idx} className="flex gap-2 text-xs text-neutral-300 leading-relaxed mt-1 pl-2">
          <span className="text-amber-500">•</span>
          <span>{trimmed.replace(/^[-*]\s+/, "")}</span>
        </div>
      );
    }
    if (trimmed === "") {
      return <div key={idx} className="h-2" />;
    }
    return <p key={idx} className="text-xs text-neutral-400 leading-relaxed mt-1">{trimmed}</p>;
  });
}

export default function CustomerDashboard() {
  const { navigate } = useAppRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const handleDownloadAsset = async (assetId: string, fallbackUrl: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}/download-url`, {
        headers: {
          "Authorization": `Bearer ${token || ""}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          window.open(result.url, "_blank");
          return;
        }
      }
      window.open(fallbackUrl, "_blank");
    } catch (err) {
      console.error("Failed to fetch secure download link:", err);
      window.open(fallbackUrl, "_blank");
    }
  };

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

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [activeWorkspaceModal, setActiveWorkspaceModal] = useState<"settings" | "billing" | "support" | null>(null);

  const [settingsName, setSettingsName] = useState<string>("");
  const [settingsBusiness, setSettingsBusiness] = useState<string>("");
  const [settingsWhatsapp, setSettingsWhatsapp] = useState<string>("");
  const [settingsIndustry, setSettingsIndustry] = useState<string>("");
  const [settingsGoal, setSettingsGoal] = useState<string>("");
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  useEffect(() => {
    if (project) {
      setSettingsName(project.clientName || "");
      setSettingsBusiness(project.businessName || "");
      setSettingsWhatsapp(project.whatsapp || "");
      setSettingsIndustry(project.industry || "");
      setSettingsGoal(project.goal || "");
    }
  }, [project]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsSavingSettings(true);
    setSuccessIndicator(null);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify({
          clientName: settingsName,
          businessName: settingsBusiness,
          whatsapp: settingsWhatsapp,
          industry: settingsIndustry,
          goal: settingsGoal
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProject(result.data);
          setSuccessIndicator("Workspace settings saved live!");
          safeLocalStorage.setItem("codefuser_current_project", JSON.stringify(result.data));
          setActiveWorkspaceModal(null);
        }
      }
    } catch (err) {
      console.error("Failed to save workspace settings:", err);
    } finally {
      setIsSavingSettings(false);
      setTimeout(() => setSuccessIndicator(null), 3000);
    }
  };

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
      const response = await fetch(`/api/projects?userId=${user.id}&email=${user.email}`, {
        headers: {
          "Authorization": `Bearer ${getAuthToken() || ""}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const found = data.projects && data.projects[0];
        if (found) {
          setProject(found);
          setProjectId(found.id);
          activeId = found.id;
          safeLocalStorage.setItem("fuser_client_project_id", found.id);
          setDomainInput(getDisplayValue(found.hasDomain || ""));
          setLogoInput(getDisplayValue(found.hasLogo || ""));
          setCopyInput(getDisplayValue(found.contentReady || ""));
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
              setDomainInput(getDisplayValue(parsed.hasDomain || ""));
              setLogoInput(getDisplayValue(parsed.hasLogo || ""));
              setCopyInput(getDisplayValue(parsed.contentReady || ""));
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
      const res = await fetch(`/api/projects/${projId}/extra`, {
        headers: {
          "Authorization": `Bearer ${getAuthToken() || ""}`
        }
      });
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
  
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
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
  };

  const handleFinalMilestonePayment = async () => {
    if (!project || !projectId) return;
    setPaymentLoading(true);
    setPaymentError(null);
    
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load the Razorpay checkout SDK. Please check your internet connection.");
      }
      
      const orderRes = await fetch(`/api/projects/${projectId}/razorpay-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify({ term: "final" })
      });
      
      const orderData = await orderRes.json();
      if (!orderData || !orderData.success) {
        throw new Error(orderData?.error || "Failed to create final milestone payment order.");
      }
      
      const { order } = orderData;
      
      let keyId = "";
      try {
        const configRes = await fetch("/api/config/razorpay");
        const configData = await configRes.json();
        keyId = configData.keyId;
      } catch (err) {
        console.warn("Could not load public key configuration.");
      }
      
      const options = {
        key: keyId || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "CodeFuser",
        description: `${extraStore.quote?.packageName || "Custom Package"} (Final 50% Milestone)`,
        order_id: order.id,
        prefill: {
          name: project.clientName || "",
          email: project.email || "",
          contact: project.whatsapp || ""
        },
        theme: {
          color: "#F59E0B"
        },
        handler: async function (response: any) {
          setPaymentLoading(true);
          try {
            const verifyRes = await fetch(`/api/projects/${projectId}/verify-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getAuthToken() || ""}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                term: "final"
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const authUser = getAuthUser();
              if (authUser) {
                await fetchUserProject(authUser);
              }
              setSuccessIndicator("Milestone payment successful! Thank you.");
              setTimeout(() => setSuccessIndicator(null), 5000);
            } else {
              setPaymentError("Payment verification failed: " + (verifyData.error || "Please contact support."));
            }
          } catch (err) {
            setPaymentError("Could not verify transaction signature.");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            setPaymentError("Payment cancelled by customer.");
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setPaymentError(`Transaction failed: ${resp.error.description || "Action rejected"}`);
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || "Failed to initiate payment. Please try again.");
      setPaymentLoading(false);
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
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken() || ""}`
          },
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
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
  };  const getCleanPackageName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("foundation") || n.includes("ignite")) {
      return "Ignite Package";
    }
    if (n.includes("growth") || n.includes("fusion")) {
      return "Fusion Package";
    }
    if (n.includes("dominance") || n.includes("catalyst")) {
      return "Catalyst Package";
    }
    return name;
  };

  const getPlanDetails = (packageId: string) => {
    const p = packageId?.toLowerCase() || "";
    if (p.includes("ignite") || p.includes("foundation")) {
      return { name: "Ignite Package", price: 7999, originalPrice: 7999, timeline: "5-7 days after asset submission" };
    }
    if (p.includes("growth") || p.includes("fusion")) {
      return { name: "Fusion Package", price: 14999, originalPrice: 14999, timeline: "10-14 days after asset submission" };
    }
    if (p.includes("dominance") || p.includes("catalyst")) {
      return { name: "Catalyst Package", price: 34999, originalPrice: 34999, timeline: "21-30 days after asset submission" };
    }
    return { name: `${packageId || "Fusion"} Package`, price: 14999, originalPrice: 14999, timeline: "10-14 days after asset submission" };
  };

  const getAssetCategory = (val: string | undefined): "provided" | "help" | "not_required" | "pending" => {
    if (!val || val === "" || val === "no") return "pending";
    if (val === "help" || val === "no_help") return "help";
    if (val === "not_required" || val.toLowerCase().includes("not_required") || val.toLowerCase().includes("not required")) return "not_required";
    return "provided";
  };

  const getDisplayValue = (val: string) => {
    if (!val || val === "yes" || val === "no" || val === "help" || val === "no_help" || val === "not_required") return "";
    if (val.startsWith("Provided: ")) return val.replace("Provided: ", "");
    return val;
  };

  const customerTimelineStages = [
    { label: "Payment Received" },
    { label: "Project Created" },
    { label: "Asset Collection" },
    { label: "Design Started" },
    { label: "Development" },
    { label: "Client Review" },
    { label: "Revisions (if required)" },
    { label: "Testing" },
    { label: "Launch" },
    { label: "Delivery" }
  ];

  const getCustomerStageIndex = (statusStr: string, hasEmptyAssets: boolean): number => {
    const s = statusStr?.toLowerCase() || "";
    if (s.includes("completed") || s.includes("delivery") || s.includes("delivered")) return 9; // Delivery
    if (s.includes("launch") || s.includes("live") || s.includes("launched")) return 8; // Launch
    if (s.includes("testing") || s.includes("qa")) return 7; // Testing
    if (s.includes("revision") || s.includes("revisions")) return 6; // Revisions (if required)
    if (s.includes("review") || s.includes("checklist ready") || s.includes("client review")) return 5; // Client Review
    if (s.includes("dev") || s.includes("development") || s.includes("core development")) return 4; // Development
    if (s.includes("design") || s.includes("wireframe") || s.includes("designing") || s.includes("specs audited")) return 3; // Design Started
    
    // Onboarding fallback stage
    if (hasEmptyAssets) {
      return 2; // Asset Collection
    } else {
      return 3; // Transition immediately to Design Started when assets are complete
    }
  };

  const getCustomerStatusLabel = (stageIndex: number): string => {
    switch (stageIndex) {
      case 0: return "Payment Received";
      case 1: return "Project Created";
      case 2: return "Asset Collection";
      case 3: return "Design Started";
      case 4: return "Development";
      case 5: return "Client Review";
      case 6: return "Revisions (if required)";
      case 7: return "Testing";
      case 8: return "Launch";
      case 9: return "Delivery";
      default: return "Onboarding";
    }
  };

  const getStageExpectations = (stageIndex: number) => {
    switch (stageIndex) {
      case 0: // Payment Received
        return {
          status: "Payment Received & Confirmed",
          happening: "Your premium onboarding fee has been fully processed and confirmed.",
          waitingFor: "Setting up your custom high-speed cloud project workspace.",
          doing: "Provisioning your secure developer sandbox environment and template repository.",
          next: "Creating your custom website project specifications draft.",
        };
      case 1: // Project Created
        return {
          status: "Project Created",
          happening: "Your secure project environment is fully initialized and active.",
          waitingFor: "Your preference selections and business information assets.",
          doing: "Analyzing your selected package specs and aligning our design specialists.",
          next: "Onboarding and digital assets collection session.",
        };
      case 2: // Asset Collection
        return {
          status: "Asset Collection",
          happening: "We're waiting for your business details or help selections before starting design.",
          waitingFor: "Providing your assets (logo, domain, copywriting) OR selecting 'Need Help' below.",
          doing: "Preparing visual style placeholders and copywriting guides where assistance is selected.",
          next: "Initiating custom visual interface design and mock wireframes.",
        };
      case 3: // Design Started
        return {
          status: "Design Started",
          happening: "Our creative design team is drafting your custom visual mockups and layouts.",
          waitingFor: "Our professional designers to finalize high-fidelity responsive page layouts.",
          doing: "Fine-tuning colors, typography schemes, layout structures, and visual page stylings.",
          next: "Handing over the approved layout specs to our frontend engineering team.",
        };
      case 4: // Development
        return {
          status: "Development",
          happening: "Our engineers are actively coding your high-performance responsive website.",
          waitingFor: "Our dev team to complete full component codes and search optimization.",
          doing: "Writing semantic React components, setting up clean motion animations, and programming route codes.",
          next: "Opening the interactive draft link for your official client review and approval.",
        };
      case 5: // Client Review
        return {
          status: "Client Review",
          happening: "Your custom interactive website draft is complete and ready for your official review.",
          waitingFor: "Your critical feedback on layouts, page visual appeal, text copywriting, and animations.",
          doing: "Preparing our engineers to address any feedback or refinement requests you submit.",
          next: "Applying necessary revision updates or moving directly into final quality assurance.",
        };
      case 6: // Revisions (if required)
        return {
          status: "Revisions (if required)",
          happening: "We are actively implementing your revision requests and fine-tuning specified details.",
          waitingFor: "Our visual engineers and content copywriters to complete your requested edits.",
          doing: "Polishing interface details, updating text assets, and updating layout components.",
          next: "Publishing the updated layout and moving to final testing.",
        };
      case 7: // Testing
        return {
          status: "Testing",
          happening: "We are performing comprehensive quality assurance and device testing checks.",
          waitingFor: "Our specialists to verify all responsive, speed, and security check criteria.",
          doing: "Auditing page load speeds, testing mobile responsiveness, verifying contact forms, and security.",
          next: "Publishing to your production domain for the official live public release.",
        };
      case 8: // Launch
        return {
          status: "Launch",
          happening: "Your website is fully optimized, verified, and ready to go live to the world.",
          waitingFor: "Your green-light confirmation to trigger DNS propagation and publish.",
          doing: "Preparing live server routing, cache optimization, and search engine registrations.",
          next: "Official project handover and population of your deliverables vault.",
        };
      case 9: // Delivery
        return {
          status: "Delivery",
          happening: "Congratulations! Your premium website project is successfully completed and live.",
          waitingFor: "Nothing! Your website is fully active and driving brand authority.",
          doing: "Actively monitoring live page metrics, secure backups, and platform stability.",
          next: "Explore your deliverables archive folder and celebrate your beautiful new website!",
        };
      default:
        return {
          status: "Onboarding In Progress",
          happening: "Welcome to CodeFuser! We are setting up your website project space.",
          waitingFor: "Your assets to be configured.",
          doing: "Pre-allocating space in our cloud architecture.",
          next: "Unlocking your asset collection workspace.",
        };
    }
  };

  const getWhatsAppLink = (textStr: string) => {
    return `https://wa.me/917449100307?text=${encodeURIComponent(textStr)}`;
  };

  const getComposeEmailLink = (pkgName: string) => {
    const subject = `Website Assets: Project onboarding for ${project?.businessName || "My Business"}`;
    const body = `Hi CodeFuser Team,\n\nI have prepared my business details for ${project?.businessName || "My Business"}! Ready to start our website journey.\n\nProject ID: ${project?.id}\nPlan: ${pkgName}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getQuoteTimeRemaining = (expiryStr?: string) => {
    if (!expiryStr) return "Expired";
    const diff = new Date(expiryStr).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h ${minutes}m remaining`;
  };

  const handleResetQuote = async () => {
    if (!project) return;
    if (!confirm("Are you sure you want to reset your quotation? Standard packages will resume.")) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/quote/reset`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getAuthToken() || ""}`
        }
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setExtraStore(body.data);
          alert("Quotation has been reset successfully.");
        } else {
          alert(body.error || "Failed to reset quote.");
        }
      } else {
        alert("Failed to reset standard quotation.");
      }
    } catch(err) {
      console.error("Failed to reset standard quotation:", err);
      alert("Error resetting standard quotation.");
    }
  };

  const isApprovedClient = (() => {
    if (!project) return false;
    const source = project.portalAccessSource || "automatic";
    if (source === "manual") {
      return project.portalAccess === true;
    } else {
      return project.paymentStatus === "paid";
    }
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="h-9 w-9 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isApprovedClient) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#050505] border border-neutral-900 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
          
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-100 font-sans">
            Access Denied
          </h2>
          <p className="text-sm text-neutral-300 mt-4 leading-relaxed font-sans">
            This account is not linked to an active website project.
          </p>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-sans">
            Please make sure you are signed in with your registered email, or contact us to authorize your workspace.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white hover:bg-neutral-100 text-black py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs font-sans cursor-pointer transition-all"
            >
              Return Home
            </button>
            
            <button
              onClick={() => window.open(`https://wa.me/917449100307?text=${encodeURIComponent("Hi, I am trying to access my client dashboard and need help.")}`, "_blank")}
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

  // Pre-calculate financial details
  const planInfo = getPlanDetails(project.selectedPackage);
  const quoteData = extraStore.quote;
  
  const rawPackageName = quoteData ? quoteData.packageName : planInfo.name;
  const selectedPackageName = getCleanPackageName(rawPackageName);
  const finalPrice = quoteData ? quoteData.price : planInfo.price;
  const isFullySettled = project.ownershipChoice === "full";
  
  const paidFunds = isFullySettled ? finalPrice * 0.9 : finalPrice / 2;
  const unpaidFunds = isFullySettled ? 0 : finalPrice / 2;

  const isDomainComplete = getAssetCategory(project.hasDomain) !== "pending";
  const isLogoComplete = getAssetCategory(project.hasLogo) !== "pending";
  const isCopyComplete = getAssetCategory(project.contentReady) !== "pending";

  const domainState = getAssetCategory(project.hasDomain);
  const logoState = getAssetCategory(project.hasLogo);
  const copyState = getAssetCategory(project.contentReady);

  const btnClass = (isActive: boolean) => 
    `flex-1 py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded-lg border text-center transition-all cursor-pointer ${
      isActive 
        ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)] font-extrabold" 
        : "bg-[#050505] text-neutral-400 border-neutral-900 hover:text-white hover:border-neutral-850"
    }`;

  const hasEmptyAssets = !isDomainComplete || !isLogoComplete || !isCopyComplete;

  const currentStageIndex = getCustomerStageIndex(project.status, hasEmptyAssets);

  // Formulate exactly ONE primary action details
  const getPrimaryAction = () => {
    if (currentStageIndex === 0) {
      return {
        title: "Payment Received & Confirmed",
        description: "Thank you! We've successfully received and verified your payment. We are setting up your project space.",
        btnText: "Configure Onboarding Assets",
        action: () => {
          setActiveQuickAction("assets");
          setTimeout(() => {
            assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      };
    }
    if (currentStageIndex === 1) {
      return {
        title: "Your Project Sandbox is Active",
        description: "Your secure workspace has been initialized. Let's configure your branding assets and copywriting preferences.",
        btnText: "Configure Onboarding Assets Now",
        action: () => {
          setActiveQuickAction("assets");
          setTimeout(() => {
            assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      };
    }
    if (currentStageIndex === 2) {
      return {
        title: "Waiting for Onboarding Assets",
        description: "Please complete your asset selections (logo, domain, and copy) or request our professional help below.",
        btnText: "Provide Onboarding Assets",
        action: () => {
          setActiveQuickAction("assets");
          setTimeout(() => {
            assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      };
    }
    if (currentStageIndex === 3) {
      return {
        title: "Your Website Design is in Progress",
        description: "Our professional design specialists are drafting custom high-fidelity visuals, mock layouts, and typography grids.",
        btnText: "Discuss Styling on WhatsApp",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I'd like to check on the design layouts for my website project: ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 4) {
      return {
        title: "Your Website is in Active Development",
        description: "Our software engineers are writing clean React code and adding fluid motion animations. No actions are required.",
        btnText: "Request Progress Update",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, let's sync on the website development progress for ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 5) {
      return {
        title: "Review Your Website Draft Link",
        description: "Your interactive draft website is ready! Please review the layout and either submit revision requests or approve it.",
        btnText: "Review Interactive Website Draft",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I am ready to review my website draft and live sandbox for ${project.businessName}!`), "_blank");
        }
      };
    }
    if (currentStageIndex === 6) {
      return {
        title: "Revisions in Progress",
        description: "We are actively implementing your revision feedback, polishing layouts, and updating content assets.",
        btnText: "Submit Additional Feedback",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I have some additional feedback/revisions for ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 7) {
      return {
        title: "Performing Quality Testing Audits",
        description: "Our QA team is conducting cross-device audits, page speed metrics checks, SSL activations, and contact form tests.",
        btnText: "Chat with QA Coordinator",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I'd like to sync on the final QA testing status of my website ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 8) {
      return {
        title: "Your Website is Ready to Go Live!",
        description: "All audits passed! We are ready to launch your live website and map it to your custom production domain address.",
        btnText: "Authorize Live Launch",
        action: () => {
          window.open(getWhatsAppLink(`Hi CodeFuser, I'm ready to take my website live! Please propagate the DNS routing for ${project.businessName}.`), "_blank");
        }
      };
    }
    if (currentStageIndex === 9) {
      return {
        title: "Congratulations! Your Project is Delivered",
        description: "Your premium website is fully live, secure, and completed. You can access your final delivered assets below.",
        btnText: "Visit Live Production Website",
        action: () => {
          const domain = project.hasDomain && project.hasDomain !== "no" ? project.hasDomain.replace("Provided: ", "").trim() : "";
          if (domain && domain !== "help" && domain !== "not_required") {
            window.open(domain.startsWith("http") ? domain : `https://${domain}`, "_blank");
          } else {
            window.open(getWhatsAppLink(`Hi CodeFuser, my website is launched! Can you send me the final live link?`), "_blank");
          }
        }
      };
    }
    return {
      title: "Onboarding In Progress",
      description: "Welcome to CodeFuser! We are setting up your website project space.",
      btnText: "Configure Your Assets",
      action: () => {
        setActiveQuickAction("assets");
        setTimeout(() => {
          assetCenterRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    };
  };

  const primaryActionDetails = getPrimaryAction();

  // Simple, welcoming, conversational notifications
  const getNotificationsList = () => {
    const list = [];
    
    list.push({
      id: "onboard-act",
      title: "Onboarding Active",
      text: "Your payment has been received successfully. Your project onboarding is now active.",
      type: "success"
    });

    if (hasEmptyAssets) {
      list.push({
        id: "assets-pend",
        title: "Waiting for Assets",
        text: "We are waiting for your logo, images and business details before starting development.",
        type: "warning"
      });
    } else {
      list.push({
        id: "assets-confirmed",
        title: "Assets Configured",
        text: "All required assets are completed (provided, requested from CodeFuser, or not required).",
        type: "success"
      });
    }

    if (currentStageIndex === 3) {
      list.push({
        id: "stage-notice",
        title: "Design Phase Active",
        text: "Our designers are crafting your custom page layouts and visuals.",
        type: "info"
      });
    } else if (currentStageIndex === 4) {
      list.push({
        id: "stage-notice",
        title: "Development Phase Active",
        text: "We are actively coding your responsive full-stack web pages.",
        type: "info"
      });
    } else if (currentStageIndex === 5) {
      list.push({
        id: "stage-notice",
        title: "Review Phase Active",
        text: "Your website interactive draft is ready for review and feedback.",
        type: "info"
      });
    } else if (currentStageIndex === 6) {
      list.push({
        id: "stage-notice",
        title: "Revisions Phase Active",
        text: "We are fine-tuning layouts based on your feedback notes.",
        type: "info"
      });
    } else if (currentStageIndex === 7) {
      list.push({
        id: "stage-notice",
        title: "Testing Phase Active",
        text: "We are conducting final device responsiveness, security, and speed audits.",
        type: "info"
      });
    }

    return list;
  };

  const notificationList = getNotificationsList();

  return (
    <div className="min-h-screen bg-black text-white font-sans select-none relative overflow-x-hidden pb-12">
      {/* Decorative premium ambient gradients */}
      <div className="absolute top-0 inset-x-0 h-[380px] bg-gradient-to-b from-amber-500/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-12 right-0 w-[240px] h-[240px] bg-amber-500/[0.012] rounded-full blur-[90px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-900 bg-black/85 backdrop-blur-md px-5 py-4 flex items-center justify-between">
        {/* Left Section: Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-black tracking-widest text-white uppercase select-none">
              CODEFUSER
            </span>
            <span className="text-[10px] font-bold text-neutral-400 font-mono tracking-tight select-none">x</span>
            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 max-w-[140px] truncate sm:max-w-none">
              {project?.businessName || project?.clientName || "Workspace"}
            </span>
          </div>
        </div>

        {/* Center Section: Current Stage Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-neutral-300">
              Phase: {getCustomerStatusLabel(currentStageIndex)}
            </span>
          </div>
        </div>

        {/* Right Section: Profile / Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700 transition-all cursor-pointer focus:outline-none"
          >
            <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono text-xs font-black">
              {project?.clientName?.charAt(0).toUpperCase() || <User size={12} />}
            </div>
            <span className="text-xs font-sans font-medium text-neutral-300 hidden sm:inline max-w-[100px] truncate">
              {project?.clientName || "Client"}
            </span>
            <ChevronDown size={12} className={`text-neutral-500 transition-transform duration-300 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isProfileDropdownOpen && (
              <>
                {/* Click-away backdrop overlay */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl z-50 text-left overflow-hidden"
                >
                  <div className="px-3.5 py-2 border-b border-neutral-900">
                    <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Signed in as</p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">{project?.email || "Client"}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveWorkspaceModal("settings");
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                    >
                      <User size={13} className="text-amber-500/80" />
                      Workspace Settings
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveWorkspaceModal("billing");
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                    >
                      <Coins size={13} className="text-amber-500/80" />
                      Billing & Payments
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveWorkspaceModal("support");
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                    >
                      <MessageSquare size={13} className="text-amber-500/80" />
                      Support & Concierge
                    </button>
                  </div>

                  <div className="h-px bg-neutral-900 my-1" />

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logoutClient();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left focus:outline-none uppercase font-mono"
                    >
                      <LogOut size={13} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-5 pt-6 space-y-6 sm:max-w-lg md:max-w-3xl">

        {/* Global Feedback Action Banner */}
        {successIndicator && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-2xl flex items-center justify-center gap-2 text-xs"
          >
            <Check size={14} className="shrink-0 text-emerald-400 animate-bounce" />
            <span className="font-semibold">{successIndicator}</span>
          </motion.div>
        )}

        {/* 1. WELCOME HERO SECTION (IMMEDIATELY ANSWERS 5 CORE QUESTIONS) */}
        <section id="welcome-hero-card" className="bg-gradient-to-br from-[#0c0c0c] to-[#040404] border border-neutral-900 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-amber-500/[0.04] to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Client Dashboard</span>
              <h1 className="text-xl font-black tracking-tight text-white uppercase font-sans">
                Welcome Jonathan!
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[8.5px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase border border-emerald-500/20">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" /> Project Active
            </span>
          </div>

          <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
            Your website project has officially started! Let's work together to launch a beautiful online experience for <strong className="text-white">{project.businessName}</strong>.
          </p>

          {/* Quick Summary Bar for Instant Clarity within 5 Seconds */}
          <div className="grid grid-cols-3 gap-3 border-t border-b border-neutral-900/80 my-5 py-4">
            <div className="text-center md:text-left">
              <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Package Purchased</span>
              <span className="text-xs font-black text-amber-500 font-sans block mt-1 uppercase">
                {selectedPackageName.replace(" Package", "")}
              </span>
            </div>
            <div className="text-center border-l border-r border-neutral-900/80 px-2">
              <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Current Status</span>
              <span className="text-xs font-black text-white block mt-1 uppercase leading-tight">
                {getCustomerStatusLabel(currentStageIndex)}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Estimated Delivery</span>
              <span className="text-xs font-bold text-white block mt-1 leading-tight">
                {hasEmptyAssets ? (
                  "Waiting for asset submission"
                ) : (
                  planInfo.timeline.replace(" after asset submission", "").replace("days", "Business Days")
                )}
              </span>
            </div>
          </div>

          {/* NEXT ACTION: Featured Primary Call to Action */}
          <div className="bg-amber-500/[0.02] border border-amber-500/20 rounded-2xl p-4.5 mt-2">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold tracking-widest text-amber-500 uppercase block">RECOMMENDED NEXT STEP</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
              {primaryActionDetails.title}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {primaryActionDetails.description}
            </p>
            
            <button
              onClick={primaryActionDetails.action}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-xl font-bold uppercase tracking-wider text-xs font-sans mt-4 cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
            >
              <span>{primaryActionDetails.btnText}</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* ACTIVE STAGE STATUS GUIDANCE (Premium Concierge Experience) */}
          {(() => {
            const expectations = getStageExpectations(currentStageIndex);
            return (
              <div className="bg-[#050505]/45 border border-neutral-900/60 rounded-2xl p-4.5 mt-4 space-y-4 font-sans text-xs">
                <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-900/60">
                  <Sparkles size={13} className="text-amber-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-300 uppercase">Concierge Project Guide</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-amber-500/80 tracking-wider block">1. What is happening?</span>
                    <p className="text-neutral-300 leading-relaxed font-sans font-medium">{expectations.happening}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-amber-500/80 tracking-wider block">2. What am I waiting for?</span>
                    <p className="text-neutral-300 leading-relaxed font-sans font-medium">{expectations.waitingFor}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-amber-500/80 tracking-wider block">3. What is CodeFuser doing?</span>
                    <p className="text-neutral-300 leading-relaxed font-sans font-medium">{expectations.doing}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-amber-500/80 tracking-wider block">4. What happens next?</span>
                    <p className="text-neutral-300 leading-relaxed font-sans font-medium">{expectations.next}</p>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 font-mono text-center pt-1 block border-t border-neutral-900/30">
                  📋 Premium Launch Policy: You will review & approve all draft stages before final live launch.
                </div>
              </div>
            );
          })()}
        </section>

        {/* Dynamic Multi-Column Grid Layout for Desktop & Single Column for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* LEFT COLUMN: Customer Journey Progress */}
          <div className="space-y-6">

            {/* 2. PROJECT TIMELINE */}
            <section ref={timelineRef} id="project-timeline-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5 border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 font-bold">
                  <Layers size={13} className="text-neutral-400" /> Project Progress
                </h3>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Live Status</span>
              </div>

              {/* Customer Friendly Timeline */}
              <div className="relative pl-6 space-y-5 font-sans">
                {/* Vertical line connector */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-neutral-900" />

                {customerTimelineStages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Indicator dot */}
                      <div className={`absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                          : isActive 
                            ? "bg-amber-500 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-110" 
                            : "bg-[#030303] border-neutral-800"
                      }`} />

                      <div className="flex-1">
                        <span className={`text-[12.5px] font-bold tracking-wide block ${
                          isActive ? "text-amber-400 font-black" : isCompleted ? "text-neutral-300" : "text-neutral-600"
                        }`}>
                          {stage.label}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-mono text-amber-500 uppercase font-black block mt-0.5 animate-pulse">
                            Active Stage
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. AI STRATEGIC PROPOSAL & BLUEPRINT */}
            {extraStore.quote?.proposal && extraStore.quote.proposal.status === "sent" && (
              <section id="ai-proposal-blueprint" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 font-bold">
                    📑 Website Blueprint
                  </h3>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Approved</span>
                </div>

                <div className="bg-[#020202] border border-neutral-900 rounded-2xl p-4 max-h-[250px] overflow-y-auto font-sans text-neutral-300">
                  {parseMarkdown(extraStore.quote.proposal.content)}
                </div>

                <div className="flex justify-between items-center bg-[#090909] border border-neutral-900 px-3 py-2 rounded-2xl text-[9px] font-mono uppercase text-neutral-500">
                  <span>Blueprint Status: <span className="text-emerald-400 font-bold">APPROVED</span></span>
                  <span>Released: {new Date(extraStore.quote.proposal.timestamp).toLocaleDateString()}</span>
                </div>
              </section>
            )}

            {/* 4. CONFIGURABLE LAUNCH CHECKLIST */}
            {extraStore.quote?.checklist && extraStore.quote.checklist.length > 0 && (
              <section id="launch-checklist" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 font-bold">
                    📋 Launch Checklist
                  </h3>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Live Synced</span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                  Milestones and setups to complete for your website release. Toggle items as we finalise setups.
                </p>

                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-3 space-y-2">
                  {extraStore.quote.checklist.map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={async () => {
                        const updatedChecklist = extraStore.quote!.checklist!.map((c: any) => 
                          c.id === item.id ? { ...c, completed: !c.completed } : c
                        );
                        const updatedQuote = {
                          ...extraStore.quote,
                          checklist: updatedChecklist
                        };
                        setExtraStore((prev: any) => ({ ...prev, quote: updatedQuote as any }));

                        try {
                          await fetch(`/api/projects/${project.id}/checklist/save`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${getAuthToken() || ""}`
                            },
                            body: JSON.stringify({ checklist: updatedChecklist })
                          });
                        } catch (err) {
                          console.error("Failed to sync checklist:", err);
                        }
                      }}
                      className="flex items-center gap-3 bg-[#050505] border border-neutral-900/60 p-2.5 rounded-xl hover:border-neutral-800 transition-all cursor-pointer group"
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        item.completed 
                          ? "bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                          : "border-neutral-800 group-hover:border-neutral-600"
                      }`}>
                        {item.completed && <Check size={11} className="text-black font-extrabold stroke-[3]" />}
                      </div>
                      <span className={`text-[11.5px] font-sans font-medium leading-relaxed transition-all ${
                        item.completed ? "line-through text-zinc-600" : "text-zinc-200"
                      }`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. DELIVERABLES VAULT */}
            {extraStore.quote?.deliverables && extraStore.quote.deliverables.length > 0 && (
              <section id="deliverables-vault" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 font-bold">
                    🔒 Website Files & Deliverables
                  </h3>
                  <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Encrypted</span>
                </div>

                <div className="space-y-4 font-sans">
                  {(() => {
                    const categories = ["Brand Assets", "Code Bundle", "Database Blueprint", "UI Layouts"];
                    return categories.map((cat) => {
                      const items = extraStore.quote!.deliverables!.filter((item: any) => item.category === cat);
                      if (items.length === 0) return null;

                      return (
                        <div key={cat} className="space-y-1.5">
                          <span className="block text-[8.5px] font-mono text-amber-500 uppercase tracking-wide font-extrabold">
                            🏷️ {cat}
                          </span>
                          <div className="space-y-2">
                            {items.map((item: any) => (
                              <div key={item.id} className="p-3 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-zinc-200 block truncate">{item.name}</span>
                                  <span className="text-[8.5px] font-mono text-zinc-500 mt-0.5 block">
                                    {(item.size / 1024).toFixed(1)} KB • Verified Deliverable
                                  </span>
                                </div>
                                <button
                                  onClick={async () => {
                                    const matchingAsset = extraStore.assets?.find((a: any) => a.url === item.url);
                                    if (matchingAsset) {
                                      handleDownloadAsset(matchingAsset.id, item.url);
                                    } else {
                                      window.open(item.url, "_blank");
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl text-amber-500 hover:text-white transition-all cursor-pointer"
                                >
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: Payments, Assets, Notifications */}
          <div className="space-y-6">

            {/* 1. PROJECT PACKAGE / QUOTATION STATUS CARD */}
            {project.paymentStatus === "paid" || project.paymentStatus === "partially_paid" ? (
              <section id="project-package-confirmed-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#cbd5e1] flex items-center gap-1.5 font-bold">
                    <Lock size={13} className="text-emerald-400" /> Project Package Confirmed
                  </h3>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Verified client</span>
                </div>
                <div className="space-y-3 font-sans text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                    <span className="text-neutral-400 font-medium">Selected Package:</span>
                    <span className="font-bold text-white uppercase">{selectedPackageName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                    <span className="text-neutral-400 font-medium">Purchase Date:</span>
                    <span className="font-bold text-neutral-300">
                      {project.purchaseDate ? new Date(project.purchaseDate).toLocaleDateString() : (project.timestamp ? new Date(project.timestamp).toLocaleDateString() : "Verified")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                    <span className="text-neutral-400 font-medium">Payment Status:</span>
                    <span className="font-extrabold text-emerald-400 uppercase flex items-center gap-1">
                      {project.paymentStatus === "partially_paid" ? (
                        <span className="text-amber-500 flex items-center gap-1">PARTIALLY PAID (50%)</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> VERIFIED (100%)</span>
                      )}
                    </span>
                  </div>
                  
                  {project.paymentStatus === "partially_paid" && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                        <span className="text-neutral-400 font-medium">Remaining Due:</span>
                        <span className="font-bold text-amber-500 font-mono">₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")}</span>
                      </div>
                      
                      {paymentError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-sans flex items-start gap-2">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <span>{paymentError}</span>
                        </div>
                      )}
                      
                      <button
                        onClick={handleFinalMilestonePayment}
                        disabled={paymentLoading}
                        className="w-full btn-pressure bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="h-4.5 w-4.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Coins size={14} />
                            <span>Pay Final 50% Milestone (₹{Math.round(finalPrice * 0.5).toLocaleString("en-IN")})</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-1">
                    <span className="text-neutral-400 font-medium">Project Status:</span>
                    <span className="font-bold text-amber-500 uppercase">{getCustomerStatusLabel(currentStageIndex)}</span>
                  </div>
                </div>
              </section>
            ) : (
              extraStore.quote && (
                <section id="official-quotation-secured-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                    <h3 className="text-xs font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5 font-bold">
                      <Sparkles size={13} className="text-amber-500 animate-pulse" /> Official Quotation Secured
                    </h3>
                    <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Action Required</span>
                  </div>
                  <div className="space-y-3 font-sans text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                      <span className="text-neutral-400 font-medium">Package Quoted:</span>
                      <span className="font-bold text-white uppercase">{selectedPackageName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                      <span className="text-neutral-400 font-medium">Price Rate:</span>
                      <span className="font-bold text-neutral-300 font-mono">₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
                    </div>
                    {extraStore.quote.expiryDate && (
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                        <span className="text-neutral-400 font-medium">Quote Expiry Timer:</span>
                        <span className="font-bold text-amber-500 font-mono text-xs uppercase animate-pulse flex items-center gap-1">
                          <Clock size={12} /> {getQuoteTimeRemaining(extraStore.quote.expiryDate)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2">
                      <button
                        onClick={handleResetQuote}
                        className="w-full py-2 bg-neutral-900 hover:bg-red-950/40 hover:text-red-300 hover:border-red-950/60 text-[10px] font-mono font-bold text-neutral-400 uppercase rounded-xl border border-neutral-850 transition-all cursor-pointer"
                      >
                        Reset Quote
                      </button>
                    </div>
                  </div>
                </section>
              )
            )}

            {/* COLLAPSIBLE DIGITAL ASSET WORKSPACE (Controlled gracefully by Next Action / Quick Action) */}
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
                      <h3 className="text-xs font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5 font-bold">
                        <UploadCloud size={14} className="text-amber-500 animate-pulse" /> Upload Your Business Assets
                      </h3>
                      <button 
                        onClick={() => setActiveQuickAction(null)}
                        className="text-[10px] font-mono font-bold text-neutral-500 hover:text-white uppercase transition-colors focus:outline-none bg-transparent border-none cursor-pointer font-bold"
                      >
                        Close [×]
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Field 1: Domain Setup */}
                      <div className="space-y-2 border-b border-neutral-900 pb-4">
                        <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-neutral-300">
                          Preferred Web Address (Domain)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("domain", "no");
                              setDomainInput("");
                            }}
                            className={btnClass(domainState === "pending")}
                          >
                            Incomplete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("domain", "help");
                            }}
                            className={btnClass(domainState === "help")}
                          >
                            Need Help
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("domain", "not_required");
                            }}
                            className={btnClass(domainState === "not_required")}
                          >
                            Not Required
                          </button>
                        </div>
                        
                        {/* If provided or we want to provide it */}
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={domainInput}
                              onChange={(e) => setDomainInput(e.target.value)}
                              placeholder="e.g. mybusiness.com"
                              className="flex-1 bg-[#030303] border border-neutral-900 focus:border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!domainInput.trim()) {
                                  alert("Please enter your domain first, or select 'Need Help' or 'Not Required'.");
                                  return;
                                }
                                handleUpdateAssetField("domain", domainInput.startsWith("Provided") ? domainInput : `Provided: ${domainInput}`);
                              }}
                              disabled={isUpdatingField === "domain"}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              {isUpdatingField === "domain" ? "..." : "Settle"}
                            </button>
                          </div>
                        </div>

                        {domainState === "help" && (
                          <div className="text-[11px] text-amber-500 font-sans font-medium flex items-center gap-1.5 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 mt-1 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Service requested: Our team will search, acquire, and configure your web domain.
                          </div>
                        )}
                        {domainState === "not_required" && (
                          <div className="text-[11px] text-zinc-400 font-sans font-medium flex items-center gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-900 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                            Not required for this project lifecycle stage.
                          </div>
                        )}
                        {domainState === "provided" && (
                          <div className="text-[11px] text-emerald-400 font-sans font-medium flex items-center gap-1.5 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Provided by client: "{getDisplayValue(project.hasDomain)}"
                          </div>
                        )}
                      </div>

                      {/* Field 2: Logo link */}
                      <div className="space-y-2 border-b border-neutral-900 pb-4">
                        <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-neutral-300">
                          Logo Folder Link (Drive / Dropbox)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("logo", "no");
                              setLogoInput("");
                            }}
                            className={btnClass(logoState === "pending")}
                          >
                            Incomplete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("logo", "help");
                            }}
                            className={btnClass(logoState === "help")}
                          >
                            Need Help
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("logo", "not_required");
                            }}
                            className={btnClass(logoState === "not_required")}
                          >
                            Not Required
                          </button>
                        </div>
                        
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={logoInput}
                              onChange={(e) => setLogoInput(e.target.value)}
                              placeholder="e.g. https://drive.google.com/..."
                              className="flex-1 bg-[#030303] border border-neutral-900 focus:border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!logoInput.trim()) {
                                  alert("Please enter your logo link first, or select 'Need Help' or 'Not Required'.");
                                  return;
                                }
                                handleUpdateAssetField("logo", logoInput.startsWith("Provided") ? logoInput : `Provided: ${logoInput}`);
                              }}
                              disabled={isUpdatingField === "logo"}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              {isUpdatingField === "logo" ? "..." : "Settle"}
                            </button>
                          </div>
                        </div>

                        {logoState === "help" && (
                          <div className="text-[11px] text-amber-500 font-sans font-medium flex items-center gap-1.5 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 mt-1 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Service requested: Our custom visual brand designers will design a premium logo for you.
                          </div>
                        )}
                        {logoState === "not_required" && (
                          <div className="text-[11px] text-zinc-400 font-sans font-medium flex items-center gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-900 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                            Not required for this project lifecycle stage.
                          </div>
                        )}
                        {logoState === "provided" && (
                          <div className="text-[11px] text-emerald-400 font-sans font-medium flex items-center gap-1.5 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Provided by client: Link submitted successfully
                          </div>
                        )}
                      </div>

                      {/* Field 3: Copy documents file */}
                      <div className="space-y-2 pb-2">
                        <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-neutral-300">
                          Business Details & Text Link
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("copy", "no");
                              setCopyInput("");
                            }}
                            className={btnClass(copyState === "pending")}
                          >
                            Incomplete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("copy", "no_help");
                            }}
                            className={btnClass(copyState === "help")}
                          >
                            Need Help
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAssetField("copy", "not_required");
                            }}
                            className={btnClass(copyState === "not_required")}
                          >
                            Not Required
                          </button>
                        </div>
                        
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={copyInput}
                              onChange={(e) => setCopyInput(e.target.value)}
                              placeholder="e.g. https://docs.google.com/..."
                              className="flex-1 bg-[#030303] border border-neutral-900 focus:border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!copyInput.trim()) {
                                  alert("Please enter your copy details/link first, or select 'Need Help' or 'Not Required'.");
                                  return;
                                }
                                handleUpdateAssetField("copy", copyInput.startsWith("Provided") ? copyInput : `Provided: ${copyInput}`);
                              }}
                              disabled={isUpdatingField === "copy"}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 text-[10px] font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              {isUpdatingField === "copy" ? "..." : "Settle"}
                            </button>
                          </div>
                        </div>

                        {copyState === "help" && (
                          <div className="text-[11px] text-amber-500 font-sans font-medium flex items-center gap-1.5 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 mt-1 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Service requested: CodeFuser copywriters will write complete custom texts and content.
                          </div>
                        )}
                        {copyState === "not_required" && (
                          <div className="text-[11px] text-zinc-400 font-sans font-medium flex items-center gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-900 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                            Not required for this project lifecycle stage.
                          </div>
                        )}
                        {copyState === "provided" && (
                          <div className="text-[11px] text-emerald-400 font-sans font-medium flex items-center gap-1.5 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Provided by client: Link submitted successfully
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Drag and Drop / Binary Uploader */}
                    <div className="border border-dashed border-neutral-800 rounded-2xl p-5 bg-[#030303] text-center space-y-3">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <UploadCloud size={24} className="text-amber-500/40 animate-pulse mb-1" />
                        <span className="text-xs text-white font-bold block">Upload Files Directly</span>
                        <span className="text-[10px] text-neutral-400 block max-w-[220px] mx-auto text-center leading-normal">
                          Provide your logo, images, photos, or business descriptions (Max 50MB)
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
                        Browse Files
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

                    {/* Archive of Uploaded Files */}
                    {extraStore.assets && extraStore.assets.length > 0 && (
                      <div className="border-t border-neutral-900 pt-4">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold mb-3">
                          UPLOADED ARCHIVE ({extraStore.assets.length})
                        </span>
                        <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-1">
                          {extraStore.assets.map((asset) => (
                            <div key={asset.id} className="p-3 bg-[#030303] border border-neutral-900 rounded-xl flex items-center justify-between gap-3">
                              <div className="truncate shrink min-w-0">
                                <span className="text-xs font-semibold text-white block truncate">{asset.name}</span>
                                <span className="text-[8px] font-mono text-neutral-500 block uppercase tracking-wide">
                                  {Math.round(asset.size / 1024)} KB • {asset.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                              </div>
                              <button 
                                onClick={() => handleDownloadAsset(asset.id, asset.url)}
                                className="p-1.5 px-3 bg-neutral-900 border border-neutral-800 text-[9px] font-mono font-bold uppercase text-amber-500 tracking-wider hover:bg-neutral-850 hover:text-white rounded-lg shrink-0 transition-colors cursor-pointer"
                              >
                                View File
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* 6. PAYMENTS & BILLING */}
            <section id="payment-summary-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 font-bold">
                  <Coins size={13} className="text-neutral-400" /> Payments & Billing
                </h3>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Secure Gateway</span>
              </div>

              <div className="space-y-3.5 font-sans text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                  <span className="text-neutral-400">Project Price:</span>
                  <span className="font-bold text-neutral-300">₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-neutral-900/45">
                  <span className="text-emerald-400 font-semibold">Amount Paid:</span>
                  <span className="text-emerald-400 font-extrabold text-base">₹{Math.round(paidFunds).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                  <span className="text-neutral-400">Remaining Amount:</span>
                  <span className="font-black text-amber-500 text-base">
                    {Math.round(unpaidFunds) === 0 ? "₹0 (Fully Paid)" : `₹${Math.round(unpaidFunds).toLocaleString("en-IN")}`}
                  </span>
                </div>

                {/* Secure Lock Badge representing permanently locked quote & paid verification */}
                <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl mt-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Payment Verified & Package Locked</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {Math.round(unpaidFunds) === 0 
                      ? "Thank you! Your package rate and full payment is secured and locked on our servers." 
                      : "Onboarding deposit verified. The final payment is collected before website launch."}
                  </p>
                </div>

                {/* Receipt history */}
                <div className="pt-3">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-2 font-bold">Payment Statement</span>
                  <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">Receipt #{project.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[9px] font-mono text-neutral-500">Razorpay Secure Transaction</span>
                    </div>
                    <button 
                      onClick={() => alert("Your dynamic receipt is secured. You can request a PDF copy from support at any time.")}
                      className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded-xl text-neutral-400 hover:text-white transition-all focus:outline-none border border-neutral-800 cursor-pointer flex items-center justify-center"
                    >
                      <FileText size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. ACTIONABLE NOTIFICATIONS */}
            <section id="actionable-notifications-card" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 font-bold">
                  🔔 Notifications
                </h3>
                <span className="text-[8px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded uppercase font-bold">Latest</span>
              </div>

              <div className="space-y-3 font-sans">
                {notificationList.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border flex gap-3 ${
                      notif.type === "warning" 
                        ? "bg-amber-500/[0.02] border-amber-500/20" 
                        : notif.type === "success" 
                          ? "bg-emerald-500/[0.02] border-emerald-500/20"
                          : "bg-neutral-900/30 border-neutral-850"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                      notif.type === "warning" 
                        ? "bg-amber-500 animate-pulse" 
                        : notif.type === "success" 
                          ? "bg-emerald-500"
                          : "bg-neutral-400"
                    }`} />
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-tight ${
                        notif.type === "warning" 
                          ? "text-amber-400" 
                          : notif.type === "success" 
                            ? "text-emerald-400"
                            : "text-neutral-300"
                      }`}>
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                        {notif.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. QUICK ACTIONS BAR */}
            <section id="quick-actions-bar" className="bg-[#050505] border border-neutral-900 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5 font-bold">
                  ⚡ Quick Support & Tools
                </h3>
                <span className="text-[8px] font-mono text-neutral-500 uppercase font-bold">Menu</span>
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
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">Upload Assets</span>
                </button>

                <button
                  onClick={() => alert("Your receipts are securely logged inside your payments panel above.")}
                  className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer focus:outline-none"
                >
                  <FileText size={16} className="text-neutral-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">View Receipt</span>
                </button>

                <button
                  onClick={() => window.open(getWhatsAppLink(`Hi CodeFuser, I'd like to ask a quick question about my website project: ${project.businessName}.`), "_blank")}
                  className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer focus:outline-none col-span-2"
                >
                  <MessageSquare size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">Contact Concierge Concierge</span>
                </button>
              </div>
            </section>

          </div>

        </div>

      </div>

      {/* Workspace Settings Modal */}
      <AnimatePresence>
        {activeWorkspaceModal === "settings" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setActiveWorkspaceModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-5">
                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <User size={15} /> Workspace Settings
                </h3>
                <button 
                  onClick={() => setActiveWorkspaceModal(null)}
                  className="text-neutral-500 hover:text-white transition-colors text-sm font-mono focus:outline-none bg-transparent border-none cursor-pointer"
                >
                  [Close]
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Client Full Name</label>
                  <input 
                    type="text" 
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Business Name</label>
                  <input 
                    type="text" 
                    value={settingsBusiness}
                    onChange={(e) => setSettingsBusiness(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">WhatsApp Contact No</label>
                  <input 
                    type="text" 
                    value={settingsWhatsapp}
                    onChange={(e) => setSettingsWhatsapp(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="+91..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Industry Profile</label>
                    <input 
                      type="text" 
                      value={settingsIndustry}
                      onChange={(e) => setSettingsIndustry(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Growth Goal</label>
                    <input 
                      type="text" 
                      value={settingsGoal}
                      onChange={(e) => setSettingsGoal(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal(null)}
                    className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-neutral-850/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
                  >
                    {isSavingSettings ? "Saving Changes..." : "Save Workspace"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Billing & Payments Modal */}
      <AnimatePresence>
        {activeWorkspaceModal === "billing" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setActiveWorkspaceModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-5">
                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <Coins size={15} /> Billing & Payments
                </h3>
                <button 
                  onClick={() => setActiveWorkspaceModal(null)}
                  className="text-neutral-500 hover:text-white transition-colors text-sm font-mono focus:outline-none bg-transparent border-none cursor-pointer"
                >
                  [Close]
                </button>
              </div>

              <div className="space-y-4 text-left font-sans">
                <div className="p-4 bg-[#050505] border border-neutral-900 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-neutral-900/60 pb-2">
                    <span className="text-neutral-400">Selected Package</span>
                    <span className="font-bold text-white uppercase">{selectedPackageName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-neutral-900/60 pb-2">
                    <span className="text-neutral-400">Total Price</span>
                    <span className="font-bold text-white font-mono">₹{Math.round(finalPrice).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Settlement Choice</span>
                    <span className="font-bold text-amber-400 uppercase">
                      {project?.ownershipChoice === "full" ? "Full Ownership (10% Off)" : "Managed / Milestone Split"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Milestone Summary</h4>
                  <div className="space-y-2">
                    {/* Milestone 1 */}
                    <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Milestone 1: Project Initiation</span>
                        <span className="text-[10px] font-mono text-emerald-400 mt-0.5 block">₹{Math.round(project?.paymentStatus === "partially_paid" ? finalPrice * 0.5 : (project?.ownershipChoice === "full" ? finalPrice : finalPrice * 0.5)).toLocaleString("en-IN")} • Confirmed</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">PAID</span>
                    </div>

                    {/* Milestone 2 */}
                    <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Milestone 2: Final Handover</span>
                        <span className="text-[10px] font-mono mt-0.5 block text-neutral-400">
                          ₹{Math.round(project?.paymentStatus === "partially_paid" ? finalPrice * 0.5 : (project?.ownershipChoice === "full" ? 0 : finalPrice * 0.5)).toLocaleString("en-IN")} 
                          {project?.paymentStatus === "partially_paid" ? " • Outstanding" : " • Settled"}
                        </span>
                      </div>
                      {project?.paymentStatus === "partially_paid" ? (
                        <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">DUE</span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">PAID</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setActiveWorkspaceModal(null)}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-neutral-850/60"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support & Concierge Modal */}
      <AnimatePresence>
        {activeWorkspaceModal === "support" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setActiveWorkspaceModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-5">
                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <MessageSquare size={15} /> Support & Concierge
                </h3>
                <button 
                  onClick={() => setActiveWorkspaceModal(null)}
                  className="text-neutral-500 hover:text-white transition-colors text-sm font-mono focus:outline-none bg-transparent border-none cursor-pointer"
                >
                  [Close]
                </button>
              </div>

              <div className="space-y-4 text-left font-sans text-xs">
                <p className="text-neutral-400 leading-relaxed font-medium">
                  As a premium CodeFuser client, you have direct, prioritized access to our creative team and engineering leads.
                </p>

                <div className="space-y-2.5 pt-2">
                  <a
                    href={`https://wa.me/917449100307?text=${encodeURIComponent(`Hi CodeFuser, I am logged in to my workspace for ${project?.businessName || "My Business"} and would like to speak to a project concierge.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/35 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <MessageSquare size={15} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Immediate WhatsApp Chat</span>
                        <span className="block text-[10px] text-neutral-500 mt-0.5">Average response time: &lt; 15 minutes</span>
                      </div>
                    </div>
                  </a>

                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(`Priority Support Request: ${project?.businessName || "My Business"}`)}&body=${encodeURIComponent(`Hi CodeFuser Concierge Team,\n\nI need priority support for my active website project.\n\nProject ID: ${project?.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/35 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <FileText size={15} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Direct Support Email</span>
                        <span className="block text-[10px] text-neutral-500 mt-0.5">aicodefuser@gmail.com</span>
                      </div>
                    </div>
                  </a>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setActiveWorkspaceModal(null)}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-neutral-850/60"
                  >
                    Close Support
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
