import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  ChevronLeft,
  User,
  Briefcase
} from "lucide-react";
import { useAppRouter } from "../components/Reveal";
import { setAuthSession, getAuthUser } from "../utils/auth";
import { supabase } from "../lib/supabase";
import { logAndMapAuthError } from "../utils/authErrors";
import { safeLocalStorage } from "../utils/safeStorage";

export default function LoginPage() {
  const { navigate } = useAppRouter();
  
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Read ?signup=true URL parameter to pre-toggle sign-up mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, []);

  // Check if they are already logged in when visiting this page
  // Also check if there's an access token in the URL hash (from Google OAuth redirect)
  useEffect(() => {
    const handleInitialSession = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          let userObj = {
            id: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name || "",
            businessName: session.user.user_metadata?.business_name || "",
            role: "client" as any,
            user_metadata: session.user.user_metadata || {}
          };

          // Synchronize role and profile details from secure backend
          try {
            const meResp = await fetch("/api/auth/me", {
              headers: {
                "Authorization": `Bearer ${session.access_token}`
              }
            });
            if (meResp.ok) {
              const meData = await meResp.json();
              if (meData.success && meData.user) {
                userObj = {
                  id: session.user.id,
                  email: session.user.email || "",
                  fullName: meData.user.fullName || userObj.fullName,
                  businessName: meData.user.businessName || userObj.businessName,
                  role: meData.user.role || "client",
                  user_metadata: session.user.user_metadata || {}
                };
              }
            }
          } catch (err) {
            console.error("Profile synchronization failed:", err);
          }
          
          setAuthSession(userObj, session.access_token);
          setSuccessMsg("Welcome! Redirecting and setting up workspace...");
          
          // Clear current hash from URL safely
          if (window.location.hash && window.location.hash.includes("access_token")) {
            window.history.replaceState(null, "", window.location.pathname);
          }
          
          const projResp = await fetch(`/api/projects?userId=${userObj.id}&email=${userObj.email}`, {
            headers: {
              "Authorization": `Bearer ${session.access_token}`
            }
          });
          if (projResp.ok) {
            const projData = await projResp.json();
            if (projData.projects && projData.projects.length > 0) {
              safeLocalStorage.setItem("fuser_client_project_id", projData.projects[0].id);
            }
          }
          navigate("/dashboard");
        } else {
          // If no active Supabase session is detected, check if we have standard non-Google user already stored locally
          const user = getAuthUser();
          if (user) {
            navigate("/dashboard");
          }
        }
      } catch (err: any) {
        const friendlyError = logAndMapAuthError(err, "OAuth Callback / Initial Session Load");
        setErrorMsg(friendlyError);
      } finally {
        setIsLoading(false);
      }
    };

    handleInitialSession();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill in all requested fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        setErrorMsg("Full Name is required.");
        return;
      }
      if (!businessName) {
        setErrorMsg("Business Name is required.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const payload: any = { email, password };
      
      if (isSignUp) {
        payload.fullName = fullName;
        payload.businessName = businessName;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Authentication aborted. Please check details.");
      }

      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName || fullName || data.user.user_metadata?.full_name,
        businessName: data.user.businessName || businessName || data.user.user_metadata?.business_name,
        role: data.user.role || "client",
        user_metadata: data.user.user_metadata || {
          full_name: fullName,
          business_name: businessName
        }
      };
      
      const sessionToken = data.session?.access_token;
      if (!sessionToken) {
        throw new Error("Authentication succeeded but no active session was returned. Please try signing in.");
      }
      setAuthSession(userObj, sessionToken);

      if (isSignUp) {
        setSuccessMsg("Account created successfully! Redirecting...");
      } else {
        setSuccessMsg("Welcome back! Loading your dashboard...");
      }

      setTimeout(async () => {
        try {
          const projResp = await fetch(`/api/projects?userId=${userObj.id}&email=${userObj.email}`, {
            headers: {
              "Authorization": `Bearer ${sessionToken}`
            }
          });
          if (projResp.ok) {
            const projData = await projResp.json();
            if (projData.projects && projData.projects.length > 0) {
              safeLocalStorage.setItem("fuser_client_project_id", projData.projects[0].id);
            }
          }
        } catch {
          // ignore error
        } finally {
          navigate("/dashboard");
          setIsLoading(false);
        }
      }, 1000);

    } catch (err: any) {
      const friendlyError = logAndMapAuthError(err, "Manual Credentials Submit");
      setErrorMsg(friendlyError);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      const redirectUri = `${window.location.origin}/login`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
        }
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      const friendlyError = logAndMapAuthError(err, "Google OAuth Sign-In Client Initiation");
      setErrorMsg(friendlyError);
      setIsLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-amber-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 sm:left-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-all cursor-pointer bg-neutral-900/40 px-3.5 py-2 rounded-full border border-neutral-800/60"
        >
          <ChevronLeft size={14} className="text-amber-500" /> Back to Home
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-mono uppercase tracking-widest mb-4"
          >
            <Shield size={10} className="animate-pulse" /> Client Portal
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-neutral-100 font-sans">
            {isSignUp ? "Create Your Account" : "Client Portal"}
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-2 tracking-wide font-sans leading-relaxed">
            {isSignUp ? (
              "Sign up to start and track your project."
            ) : (
              <>
                This portal is reserved for approved CodeFuser clients.
                <br />
                <span className="text-neutral-400">Already working with CodeFuser? Sign in below.</span>
              </>
            )}
          </p>
        </div>

        {/* Auth card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-950/60 backdrop-blur-md border border-neutral-800/80 p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
        >
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Status alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 font-sans"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  {errorMsg}
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-sans"
                >
                  <CheckCircle size={14} className="text-emerald-450 shrink-0" />
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-sans placeholder:text-neutral-600"
                      disabled={isLoading}
                    />
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1.5">Business Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Wellness Clinic"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-sans placeholder:text-neutral-600"
                      disabled={isLoading}
                    />
                    <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-sans placeholder:text-neutral-600"
                  disabled={isLoading}
                  required
                />
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-sans placeholder:text-neutral-600"
                  disabled={isLoading}
                  required
                />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0d0d0d] border border-neutral-850 focus:border-amber-500/50 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-sans placeholder:text-neutral-600"
                    disabled={isLoading}
                    required={isSignUp}
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-[0_12px_24px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer mt-5"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-black" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Login"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Google Authentication Divider & Button (As requested explicitly) */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-800/60"></div>
              <span className="flex-shrink mx-4 text-[10px] text-neutral-600 uppercase font-mono tracking-widest">or</span>
              <div className="flex-grow border-t border-neutral-800/60"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-semibold text-xs border border-neutral-800 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                <path
                  fill="white"
                  d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.27.61 4.5 1.643l2.425-2.424C17.275 1.682 14.89 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.915 0 9.83-4.16 9.83-10 0-.673-.06-1.196-.184-1.196h-9.646z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Toggle Block: Only show toggle to login if currently in signup mode */}
          {isSignUp && (
            <div className="mt-6 pt-6 border-t border-neutral-800/60 text-center">
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-neutral-400 hover:text-amber-500 transition-colors bg-transparent border-none cursor-pointer"
                disabled={isLoading}
              >
                Already have a client account? Login
              </button>
            </div>
          )}
        </motion.div>

        {/* Footer info line */}
        <p className="text-[10px] text-neutral-600 text-center mt-6 font-mono tracking-widest uppercase">
          ✦ Secure SSL Encrypted Transport ✦
        </p>
      </div>
    </div>
  );
}
