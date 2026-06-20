import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { addProject, getProjects } from "./server/db";

dotenv.config();

const app = express();
const PORT = 3000;

// Request body parser
app.use(express.json());

// API: Create new project
app.post("/api/projects", async (req, res) => {
  try {
    const {
      ownerName,
      businessName,
      email,
      whatsapp,
      packageId,
      ownership,
      industry,
      customIndustry,
      goal,
      customGoal,
      hasDomain,
      hasLogo,
      contentReady
    } = req.body;

    // Validate required fields
    if (!ownerName || !businessName || !email || !whatsapp) {
      return res.status(400).json({ error: "Required fields (ownerName, businessName, email, whatsapp) are missing." });
    }

    const payload = {
      clientName: ownerName,
      businessName,
      email,
      whatsapp,
      selectedPackage: packageId,
      ownershipChoice: ownership,
      industry: industry || "",
      customIndustry: customIndustry || "",
      goal: goal || "",
      customGoal: customGoal || "",
      hasDomain: hasDomain || "",
      hasLogo: hasLogo || "",
      contentReady: contentReady || ""
    };

    console.log("Compiling and initializing project in CodeFuser Core architecture style...");
    const savedProject = await addProject(payload);
    
    return res.status(201).json({
      success: true,
      data: savedProject,
      message: "Project compiled and registered successfully under Core flow."
    });
  } catch (error: any) {
    console.error("Failed to compile project submission in core backend:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Get all active projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await getProjects();
    return res.json({ projects });
  } catch (error: any) {
    console.error("Failed to load project database items:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Verify Admin Password
app.post("/api/admin/verify", (req, res) => {
  try {
    const { password } = req.body;
    const actualPassword = process.env.ADMIN_PASSWORD;
    
    if (!actualPassword) {
      return res.status(500).json({ 
        success: false, 
        error: "System Configuration Error: The administrative access key is not configured in the host environment." 
      });
    }

    if (password === actualPassword) {
      return res.json({ success: true, message: "Authentication successful." });
    } else {
      return res.status(401).json({ success: false, error: "Access Key is incorrect. Please contact system administrators." });
    }
  } catch (error: any) {
    console.error("Admin verification failed:", error);
    return res.status(500).json({ success: false, error: "Internal server error occurred." });
  }
});

// API: AI Recommendation Engine
app.post("/api/recommendation", async (req, res) => {
  try {
    const formData = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic recommendation generator.");
      const fallbackRecommendations = getDeterministicRecommendation(formData);
      return res.json({ 
        recommendations: fallbackRecommendations,
        recommendation_source: "fallback"
      });
    }

    // Initialize the official Google Gen AI Client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are CodeFuser's expert IT and Business Growth Advisor.
Analyze the user's business diagnostics audit and generate personalized website package recommendations.
CodeFuser offers three precise and distinct tiered packages:
1. Ignite (id: "foundation", Price: "₹9,999", level: 1): Premium visual one-page identity hub. Best for micro-businesses, SaaS validate-tests, simple services, and direct local landing pages.
2. Fusion (id: "growth", Price: "₹24,999", level: 2): Full-scale multi-section business growth core. Best for local businesses desiring advanced lead forms, review showcases, interactive FAQs, and automated scheduler booking grids.
3. Catalyst (id: "dominance", Price: "₹49,999", level: 3): Immersive automated custom application. Ideal for complex digital agencies, CRM lead-pipelines, dynamic showcases, client accounts, or customized logic flows.

Analyze the user inputs:
- Company/Clinic Name: "${formData.businessName || 'Your Business'}"
- Rep/Owner Name: "${formData.ownerName || 'Representative'}"
- Intended Core Audience Profile: "${formData.targetAudience || 'General Audience'}"
- Primary Marketing/Sales Pain Point: "${formData.businessPainPoint || 'Low inquiries / Outdated look'}"
- Unique Market Edge: "${formData.uniqueAdvantage || 'Exceptional personal care'}"
- Choose Visual Tone Class: "${formData.brandTone || 'modern'}"
- Primary Tone Description: "${formData.brandColors || 'Amber & Carbon Grey'}"
- Requested scheduler: ${formData.needsBooking ? 'YES' : 'NO'}
- Requested reviews: ${formData.needsReviews ? 'YES' : 'NO'}
- Requested portfolio/gallery: ${formData.needsPortfolioGrid ? 'YES' : 'NO'}
- Requested custom products/pricing: ${formData.needsProducts ? 'YES' : 'NO'}

Generate exactly 3 recommendation structures:
- One and only one entry must have visual tag: "⭐ Best Match For Your Business" - select whichever of the three tiers (foundation, growth, or dominance) fits their requirements most logically and strategically.
- One and only one entry must have tag: "💰 Best Value" - map this to either "foundation" (Ignite) or "growth" (Fusion) as the most cost-effective path to resolve their pain point.
- One and only one entry must have tag: "📈 Built For Growth" - map this to either "growth" (Fusion) or "dominance" (Catalyst) as the path that equips them with future-proof capabilities like booking widgets, integrations, or databases.

Provide exactly 3 to 4 customized, strategic, friendly, human-written bullet points for each recommendation explaining HOW that specific package directly answers their listed audience profile, addresses their specific primary pain point, and incorporates their chosen design vibes.
Ensure absolutely ZERO developer-jargon, confidence scores, technical metrics, AI logs, or prompts are returned. Keep response completely polished and client-ready.`;

    let response: any = null;
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting recommendation generation with model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: "Generate the customized package blueprints based on the parameters.",
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendations: {
                  type: Type.ARRAY,
                  description: "Must contain exactly 3 recommendation cards mapping to 'foundation', 'growth', and 'dominance' plan IDs.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      planId: { 
                        type: Type.STRING, 
                        description: "Must be exactly 'foundation', 'growth', or 'dominance'" 
                      },
                      planName: { 
                        type: Type.STRING, 
                        description: "Must be 'Ignite', 'Fusion', or 'Catalyst'" 
                      },
                      tag: { 
                        type: Type.STRING, 
                        description: "Must be exactly '⭐ Best Match For Your Business', '💰 Best Value', or '📈 Built For Growth'" 
                      },
                      tagline: { 
                        type: Type.STRING, 
                        description: "A business-focused tagline explaining why this plan maps to their state" 
                      },
                      price: { 
                        type: Type.STRING, 
                        description: "List the correct price: ₹9,999 for foundation, ₹24,999 for growth, and ₹49,999 for dominance" 
                      },
                      bullets: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 to 4 concrete bullet points specifically matching their company goals, audience, and bottleneck solution"
                      }
                    },
                    required: ["planId", "planName", "tag", "tagline", "price", "bullets"]
                  }
                }
              },
              required: ["recommendations"]
            }
          }
        });

        if (response && response.text) {
          const recommendationData = JSON.parse(response.text);
          if (recommendationData.recommendations && recommendationData.recommendations.length > 0) {
            console.log(`Successfully generated recommendations using model: ${modelName}`);
            return res.json({
              ...recommendationData,
              recommendation_source: "ai"
            });
          }
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} call failed or was overloaded:`, err.message || err);
        lastError = err;
        // Proceed to next model in loop
      }
    }

    if (lastError) {
      throw lastError;
    } else {
      throw new Error("All reservation models returned empty responses.");
    }

  } catch (error) {
    console.error("Gemini AI Recommendation Pipeline failed:", error);
    const fallbackRecommendations = getDeterministicRecommendation(req.body);
    return res.json({ 
      recommendations: fallbackRecommendations,
      recommendation_source: "fallback"
    });
  }
});

// API: Start Project Package Upgrade Options (Strategic Pricing Consultant Engine)
app.post("/api/start-project/package-upgrade-options", async (req, res) => {
  try {
    const { packageId, businessName, ownerName, industry, goal } = req.body;
    
    // Choose base, upgrade 1, and upgrade 2 prices and names realistically
    let baseName = "✦ Fusion";
    let basePrice = "₹24,999";
    let baseFeatures = [
      "Portfolio / Gallery",
      "Testimonials Section",
      "FAQ Section",
      "Booking Integration",
      "Enhanced SEO Structure",
      "Premium Design System",
      "Advanced Animations",
      "Conversion Focused Layout"
    ];

    let upgrade1Name = "✦ Fusion+";
    let upgrade1Price = "₹27,999";
    let upgrade1FeaturesAdded = ["Google Reviews Sync", "Interactive Direction Maps", "Custom Contact Flows"];

    let upgrade2Name = "✦ Fusion Pro";
    let upgrade2Price = "₹29,999";
    let upgrade2FeaturesAdded = ["Newsletter Automated Campaign Engine", "Minor Automated Calendar Tasks", "High-Authority Search Optimization (SEO)"];

    if (packageId === "foundation") {
      baseName = "⚡ Ignite";
      basePrice = "₹9,999";
      baseFeatures = [
        "Premium One Page Website",
        "Mobile Responsive",
        "WhatsApp Integration",
        "Contact Form",
        "Google Maps",
        "Basic SEO Setup"
      ];
      upgrade1Name = "⚡ Ignite+";
      upgrade1Price = "₹12,999";
      upgrade1FeaturesAdded = ["Interactive Portfolio Display", "Custom Inquiry & Lead Forms", "Micro-animations"];
      upgrade2Name = "⚡ Ignite Pro";
      upgrade2Price = "₹14,999";
      upgrade2FeaturesAdded = ["Integrated Newsletter Signups", "Google Reviews Synchronization", "Comprehensive Local SEO Package"];
    } else if (packageId === "dominance") {
      baseName = "⬢ Catalyst";
      basePrice = "₹49,999";
      baseFeatures = [
        "Everything in Fusion",
        "AI Receptionist Integration",
        "Lead Capture System",
        "CRM Ready Structure",
        "Advanced Automation Setup",
        "Analytics Dashboard Setup"
      ];
      upgrade1Name = "⬢ Catalyst+";
      upgrade1Price = "₹54,999";
      upgrade1FeaturesAdded = ["Conversational Smart AI Assistant", "Centralized CRM Lead Repository", "Interactive customer routing maps"];
      upgrade2Name = "⬢ Catalyst Pro";
      upgrade2Price = "₹59,999";
      upgrade2FeaturesAdded = ["Client Portal Dashboard", "Full Automated Tool Synchronizations", "Custom Enterprise Analytics Charts"];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic upgrade recommendations.");
      return res.json({
        options: getFallbackUpgrades(packageId, businessName, ownerName, industry, goal)
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are an elite pricing strategist and senior business consultant at CodeFuser.
Your task is to generate and write the text for THREE customized card packages to show to a client after they have completed their onboarding form.
The customer has selected the package: ${baseName} (${basePrice}).
Your goal is not to pressure them, but to help them intelligently compare nearby upgrade options and confidently choose the best investment for their business: "${businessName}" (Industry: "${industry || 'General'}", Goal: "${goal || 'Growth'}").

Strict Rules for Card Generation:
1. Card 1 must match the SELECTED package "${baseName}" at exactly "${basePrice}". It must include:
   - "headline": Short strategic statement why it fits their current business entry parameters.
   - "benefits": A bullet list of 3-4 items explaining how its standard features will immediately help their business. Focus on OUTCOMES (e.g., "✓ Help more customers contact your business" instead of "Contact Form").
   - "rationale": Clear explanation why this package perfectly fits their selected starting point.

2. Card 2 ("Better Value") must be "${upgrade1Name}" at exactly "${upgrade1Price}". It must include only the features added: ${upgrade1FeaturesAdded.join(', ')}. It must include:
   - "headline": Explaining why this modest investment unlocks disproportionate value.
   - "benefits": A list of 2-3 new added outcomes explaining ONLY the newly added value. Must focus on business benefits (e.g. "✓ Build stronger trust with customer reviews" or "✓ Make it easier for customers to book or enquire"). Each item must start with "✓ ".
   - "rationale": Strategic explanation of why spending a little more (just ${upgrade1Price}) improves long-term business value.

3. Card 3 ("Most Optimal Choice") must be "${upgrade2Name}" at exactly "${upgrade2Price}". It must include only its additional features: ${upgrade2FeaturesAdded.join(', ')}. It must include:
   - "headline": Explaining why this is the strategic pinnacle of investment.
   - "benefits": A list of 2-3 final added outcomes compared to Card 2. Each item must start with "✓ ".
   - "rationale": Strategic explanation of why this provides the absolute strongest balance between their investment and future brand growth.

Important:
- NEVER explain recommendations using technical terminology only. Do NOT use terms like "CRM Integration", "API Integration", "Analytics Dashboard". Use clear, helpful, customer-centric business outcomes like:
  ✓ Help more customers contact your business
  ✓ Build stronger trust with customer reviews
  ✓ Improve visibility on Google Search
  ✓ Reduce manual follow-up work
  ✓ Make it easier for customers to book or enquire
- The progression must stay psychologically close to their chosen budget.
- The outcome list should be tailored specifically to ${businessName} operating in the ${industry || 'general'} space.
- The language must be professional, warm, insightful, and strictly outcomes-focused.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate the three strategic package cards as requested.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: {
              type: Type.ARRAY,
              description: "Must contain exactly 3 strategic card options: Card 1, Card 2, and Card 3",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Must be 'current', 'upgrade_1', or 'upgrade_2'" },
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  benefits: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Outcome bullet points starting with a checkmark or clear action phrase"
                  },
                  rationale: { type: Type.STRING }
                },
                required: ["id", "name", "price", "headline", "benefits", "rationale"]
              }
            }
          },
          required: ["options"]
        }
      }
    });

    if (response && response.text) {
      const data = JSON.parse(response.text);
      if (data.options && data.options.length === 3) {
        return res.json(data);
      }
    }
    
    throw new Error("Invalid response format from content generation");

  } catch (err: any) {
    console.error("Failed to generate package upgrade recommendations:", err);
    // Fallback response:
    const { packageId, businessName, ownerName, industry, goal } = req.body;
    const fallback = getFallbackUpgrades(packageId, businessName, ownerName, industry, goal);
    return res.json({ options: fallback });
  }
});

function getFallbackUpgrades(
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

// Resolute dynamic fallback rule so the user is never blocked or shown an error
function getDeterministicRecommendation(formData: any) {
  const businessName = formData.businessName || 'Your Business';
  const painPoint = formData.businessPainPoint || 'lack of online inquiries';
  const targetAudience = formData.targetAudience || 'local prospective clients';
  
  const needsBooking = !!formData.needsBooking;
  const needsFeatures = !!(formData.needsReviews || formData.needsProducts || formData.needsPortfolioGrid);

  let bestMatchId = 'growth';
  let bestMatchName = '✦ Fusion';
  let bestMatchPrice = '₹24,999';
  let bestMatchTagline = `Engineered to capture and schedule ${targetAudience} effortlessly.`;
  
  if (needsBooking) {
    bestMatchId = 'growth';
    bestMatchName = '✦ Fusion';
    bestMatchPrice = '₹24,999';
    bestMatchTagline = 'Automates live booking channels to immediately bypass your scheduling roadblocks.';
  } else if (!needsBooking && !needsFeatures) {
    bestMatchId = 'foundation';
    bestMatchName = '⚡ Ignite';
    bestMatchPrice = '₹9,999';
    bestMatchTagline = 'High-velocity showcase to validate your visual identity with minimal latency.';
  } else {
    bestMatchId = 'dominance';
    bestMatchName = '⬢ Catalyst';
    bestMatchPrice = '₹49,999';
    bestMatchTagline = 'Maximal digital expansion featuring automated capture workflows and review synchronization.';
  }

  return [
    {
      planId: bestMatchId,
      planName: bestMatchName,
      tag: "⭐ Best Match For Your Business",
      tagline: bestMatchTagline,
      price: bestMatchPrice,
      bullets: [
        `Specially optimized to override: "${painPoint}" by implementing modern high-efficiency layout patterns.`,
        `Positions your unique advantage to build strong visual authority among ${targetAudience}.`,
        "Pre-configures required integrations (calendars/forms) directly into a gorgeous, smooth client funnel."
      ]
    },
    {
      planId: "foundation",
      planName: "⚡ Ignite",
      tag: "💰 Best Value",
      tagline: "Unlocks high-impact conversion metrics with lightweight overhead.",
      price: "₹9,999",
      bullets: [
        "Provides an elegant single-page presentation optimized specifically for mobile responsiveness.",
        "Perfect entry point for capturing new digital leads without secondary maintenance overhead.",
        "Equipped with instant contact hooks including WhatsApp click-to-connect."
      ]
    },
    {
      planId: "dominance",
      planName: "⬢ Catalyst",
      tag: "📈 Built For Growth",
      tagline: "Total digital empowerment utilizing advanced visual layouts and automated captures.",
      price: "₹49,999",
      bullets: [
        "Integrates continuous automation channels like AI assistants, review feeds, and CRM triggers.",
        "Designed explicitly to support infinite expansion as you scale your brand presence.",
        "Includes absolute layout flexibility and prioritized diagnostic support cycles."
      ]
    }
  ];
}

// Server bootstrap with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
