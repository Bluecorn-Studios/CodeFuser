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
    return res.status(500).json({ error: "Failed to initialize and store project. Please try again." });
  }
});

// API: Get all active projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await getProjects();
    return res.json({ projects });
  } catch (error: any) {
    console.error("Failed to load project database items:", error);
    return res.status(500).json({ error: "Failed to retrieve projects from database backend." });
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

// Resolute dynamic fallback rule so the user is never blocked or shown an error
function getDeterministicRecommendation(formData: any) {
  const businessName = formData.businessName || 'Your Business';
  const painPoint = formData.businessPainPoint || 'lack of online inquiries';
  const targetAudience = formData.targetAudience || 'local prospective clients';
  
  const needsBooking = !!formData.needsBooking;
  const needsFeatures = !!(formData.needsReviews || formData.needsProducts || formData.needsPortfolioGrid);

  let bestMatchId = 'growth';
  let bestMatchName = 'Fusion';
  let bestMatchPrice = '₹24,999';
  let bestMatchTagline = `Engineered to capture and schedule ${targetAudience} effortlessly.`;
  
  if (needsBooking) {
    bestMatchId = 'growth';
    bestMatchName = 'Fusion';
    bestMatchPrice = '₹24,999';
    bestMatchTagline = 'Automates live booking channels to immediately bypass your scheduling roadblocks.';
  } else if (!needsBooking && !needsFeatures) {
    bestMatchId = 'foundation';
    bestMatchName = 'Ignite';
    bestMatchPrice = '₹9,999';
    bestMatchTagline = 'High-velocity showcase to validate your visual identity with minimal latency.';
  } else {
    bestMatchId = 'dominance';
    bestMatchName = 'Catalyst';
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
      planName: "Ignite",
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
      planName: "Catalyst",
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

startServer();
