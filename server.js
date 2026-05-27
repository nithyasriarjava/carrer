import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { DEPARTMENTS, INTERESTS, STANDARD_RECS } from "./src/data.js";
import cors from "cors";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Standard initialization of GoogleGenAI on the server
// Set User-Agent headers to 'aistudio-build' for AI Studio's tracking telemetry.
let googleAi = null;
if (process.env.GEMINI_API_KEY) {
  googleAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Initialized server-side Google GenAI client successfully.");
} else {
  console.warn("GEMINI_API_KEY env variable not found. Server endpoints will gracefully fallback to local recommendation engines.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for all routes
  app.use(cors());

  // Midddleware for parsing JSON objects
  app.use(express.json());

  // API routers for local data catalog
  app.get("/departments", (req, res) => {
    res.json(DEPARTMENTS);
  });

  app.get("/skills", (req, res) => {
    const allSkills = DEPARTMENTS.flatMap(dept => dept.skills.map(skillName => ({
        name: skillName,
        departmentId: dept.id
    })));
    res.json(allSkills);
  });

  app.get("/interests", (req, res) => {
      res.json(INTERESTS);
  });

  app.get("/careers", (req, res) => {
      const allCareers = Object.values(STANDARD_RECS).flat().map(rec => ({
          role: rec.role,
          salary: rec.salary,
          demand: rec.demand,
          difficulty: rec.difficulty,
          description: rec.why,
          techStack: rec.techStack.split(',').map(s => s.trim()),
          departmentId: Object.keys(STANDARD_RECS).find(key => STANDARD_RECS[key].includes(rec))
      }));
      res.json(allCareers);
  });

  app.get("/roadmaps", (req, res) => {
      const allRoadmaps = Object.values(STANDARD_RECS).flat().map(rec => ({
          role: rec.role,
          roadmap: rec.roadmap
      }));
      res.json(allRoadmaps);
  });

  app.get("/learning_resources", (req, res) => {
      res.json([]);
  });

  app.get("/career_skills", (req, res) => {
      res.json([]);
  });

  app.get("/career_interests", (req, res) => {
      res.json([]);
  });

  app.get("/user_progress", (req, res) => {
      res.json([]);
  });

  // API router for recommendations based on skills & interests
  app.post("/api/career/recommend", async (req, res) => {
    try {
      const { department, skills, interests } = req.body;
      if (!department) {
        return res.status(400).json({ error: "Department is required." });
      }

      // If we don't have Gemini API configured, fallback immediately to intelligent local dataset matching
      if (!googleAi) {
        return handleLocalRecommendations(department, skills, interests, res);
      }

      // Create a highly professional system prompt for carrier matching
      const systemPrompt = `You are a professional, elite career guidance counselor. 
Analyze the student's department, selected list of technical/practical skills, and general domain interests.
Provide exactly 3 custom high-value visual career paths matching their background.
Return the output strictly in a JSON array of objects conforming to the provided schema.`;

      const prompt = `Department: ${department}
Selected Skills: ${(skills || []).join(", ")}
Chosen Areas of Interest: ${(interests || []).join(", ")}

Generate exactly 3 ideal career paths for this student.`;

      // Call Gemini 3.5 Flash for basic text/json structuring task
      const result = await googleAi.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Array of exactly 3 matched career recommendations",
            items: {
              type: Type.OBJECT,
              properties: {
                role: {
                  type: Type.STRING,
                  description: "Full title of the career path, e.g. 'Advanced Frontend Architect' or 'Cloud DevOps Engineer'."
                },
                match: {
                  type: Type.INTEGER,
                  description: "Match percentage between 60 and 99 based on the synergy of their inputs."
                },
                salary: {
                  type: Type.STRING,
                  description: "Estimated median salary bracket in USD, e.g. '$115,000 - $160,000'."
                },
                demand: {
                  type: Type.STRING,
                  description: "E.g. 'Stable', 'High', 'Very High', or 'Extreme'."
                },
                difficulty: {
                  type: Type.STRING,
                  description: "The learning curve, e.g. 'Low', 'Medium', 'High', or 'Intense'."
                },
                why: {
                  type: Type.STRING,
                  description: "A professional, personalized overview sentence explaining why their specific skills and interests synergize with this exact role."
                },
                techStack: {
                  type: Type.STRING,
                  description: "Comma-separated list of 5-8 primary skills, languages, or tools critical for this career."
                }
              },
              required: ["role", "match", "salary", "demand", "difficulty", "why", "techStack"]
            }
          }
        }
      });

      const responseText = result.text || "[]";
      const cleanedResponseText = responseText.trim();
      const recommendations = JSON.parse(cleanedResponseText);
      return res.json({ recommendations });
    } catch (e) {
      console.error("Gemini Recommendations failed, falling back to local database:", e.message);
      // Fail gracefully: fallback to local pre-computed data
      return handleLocalRecommendations(req.body.department, req.body.skills, req.body.interests, res);
    }
  });

  // API router for constructing dynamic step-by-step roadmap
  app.post("/api/career/roadmap", async (req, res) => {
    try {
      const { role, department, skills, interests } = req.body;
      if (!role) {
        return res.status(400).json({ error: "Career role is required to construct a roadmap." });
      }

      if (!googleAi) {
        return handleLocalRoadmap(role, department, res);
      }

      const systemPrompt = `You are a premium curriculum designer and technical roadmap architect.
Given a career goal, student's department, starting skills, and interests, create an actionable, extremely beautiful, 4-step step-by-step career learning roadmap.
Conform the response strictly to the JSON schema specified, with exactly 4 detailed steps (no code explanation, just the clean JSON).`;

      const prompt = `Construct an elite 4-step learning roadmap to become an exceptional "${role}".
Student's starting department: ${department}.
Starting skills: ${(skills || []).join(", ")}.
Core values and interests: ${(interests || []).join(", ")}.

Create the 4 steps (from Foundation to Professional Portfolio and Interview readiness). Make sure the list of projects is highly tailored, practical, and exciting for this role.`;

      const result = await googleAi.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Array of exactly 4 sequentially structured roadmap phases",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "E.g. 'Phase 1: Advanced Languages & Mechanics' or 'Phase 3: Portfolio Projects'."
                },
                description: {
                  type: Type.STRING,
                  description: "Comprehensive summary of topics to focus on, tools to master, and methodologies to learn during this phase."
                },
                resources: {
                  type: Type.STRING,
                  description: "Recommended elite tutorials, books, or documentation sites (e.g. 'Mozilla MDN, Tailwind Official Docs, Epic React series')."
                },
                projects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 2 custom-tailored, inspiring capstone projects that prove competence in these specific techniques."
                }
              },
              required: ["title", "description", "resources", "projects"]
            }
          }
        }
      });

      const responseText = result.text || "[]";
      const roadmap = JSON.parse(responseText.trim());
      return res.json({ roadmap });
    } catch (e) {
      console.error("Gemini Roadmap failed, falling back to local catalog:", e.message);
      return handleLocalRoadmap(req.body.role, req.body.department, res);
    }
  });

  // API router for interactive Career AI Mentor Chatbot
  app.post("/api/career/chat", async (req, res) => {
    try {
      const { messages, role, agentType } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "A message history array is required." });
      }

      if (!googleAi) {
        let fallbackMsg = `Hello! I am currently running offline. 

To achieve your goal of becoming a **${role || "Professionally-guided Specialist"}**, I highly recommend starting with the structured milestones in your interactive Roadmap chart. 

Once your Gemini API Key is configured via the Secrets panel in the sidebar, we can discuss any specific technology details, code suggestions, or interview strategies in real-time!`;

        if (agentType === "explainer") {
          fallbackMsg = `Hello! I am Socrates AI, your Concept Explainer, currently running in offline preview mode because no Gemini API Key is detected in your environment. 
          
To understand any technical topics deeply, try checking off core theory milestones in your syllabus! Once connected, I will provide simple, beautiful analogies and breakdowns of advanced terms.`;
        } else if (agentType === "interviewer") {
          fallbackMsg = `Hello, I'm Recruiter Rex! I am running in offline mode. 
          
Once your AI Key is configured, I will run a fully interactive, graded mock interview simulation with you and guide you step-by-step through standard engineering coding questions! For now, keep learning and finishing portfolio milestones.`;
        } else if (agentType === "strategist") {
          fallbackMsg = `Hi, I am Coach Chelsea, your portfolio strategy wizard. 
          
While running offline, my recommendation is to prioritize real, working web applications to present to potential hires rather than simple textbook examples! Add a Gemini API Key to unlock advanced resume tuning.`;
        }

        return res.json({ reply: fallbackMsg });
      }

      // Convert incoming message objects into standard contents format for Gemini
      // Format should be messages: { role: "user" | "model", parts: [{ text: "..." }] }
      const formattedContents = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      // Dynamically load tailored system instruction depending on the selected Agent Mode
      let systemPrompt = `You are a world-class AI Career Coach & Technical Mentor specializing in guiding students towards becoming elite "${role || "Career Professionals"}".
Keep your answers inspiring, targeted, structured in clean Markdown, and highly practical. Provide references, career hacks, or small mock interview examples when requested. Do not exceed 2-3 short, highly readable paragraphs or bullet clusters.`;

      if (agentType === "explainer") {
        systemPrompt = `You are "Socrates AI", a patient, highly professional Concept Explainer and teacher. 
Your goal is to break down complex technical terms, algorithms, architectural concepts, code blocks, or structures relevant to the role of ${role || "Specialist"} using plain English, incredibly intuitive analogies, and clean step-by-step logic.
Keep explanations accessible, extremely elegant, structured with clean Markdown bullets or simple ascii text illustrations, and easy to grasp. Never introduce jargon without instantly explaining it.`;
      } else if (agentType === "interviewer") {
        systemPrompt = `You are "Recruiter Rex", a professional Technical HR Recruiter and Screening Interviewer for candidates aiming to become a ${role || "Specialist"}.
Your responsibility is to conduct an interactive, realistic, high-value simulated technical/behavioral screening. 
Ask exactly ONE professional question at a time. After the user replies, grade their response on a structural scale from 1 to 10. Give exactly 1 bullet point of feedback on how they can improve their technical vocabulary or communication strategy, and then ask the corresponding next question. Keep your tone supportive yet professional and corporate.`;
      } else if (agentType === "strategist") {
        systemPrompt = `You are "Coach Chelsea", an elite Career Strategy Consultant and Portfolio Architect. 
Your responsibility is to help the candidate stand out in recruitment pipelines for the role of "${role || "Specialist"}".
Provide pragmatic, highly actionable advice about:
1. ATS-proof resume bullets that demonstrate metrics and achievements.
2. Premium, high-visibility GitHub project ideas tailored specifically to this role.
3. Industry hiring trends, direct recruiter outreach scripts, and interview confidence hacks.
Use bullet points, bold key terms, and highly practical instructions.`;
      }

      const result = await googleAi.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt
        }
      });

      return res.json({ reply: result.text });
    } catch (e) {
      console.error("Gemini Chat failed:", e.message);
      return res.status(500).json({ error: "Failed to query Gemini API." });
    }
  });

  // Vite static assets serving / routing setup
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware for dev mode.
    // Handles Hot Module Replacement & static client delivery.
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve build artifacts in production mode.
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Career Guidance dev server active on: http://0.0.0.0:${PORT}`);
  });
}

// Local match-modeling for career recommendations in offline fallback scenarios
function handleLocalRecommendations(department, skills, interests, res) {
  // Import local suggestions dynamically from local dataset
  // We look into standard mappings based on the selected department
  const list = STANDARD_RECS[department] || STANDARD_RECS["cse"];
  
  // Calculate specific cosmetic match numbers based on skill overlap to make it feel customized & responsive
  const enhancedList = list.map((item, idx) => {
    const calculatedMatch = 80 + (skills.length * 3) + (interests.length * 2) - (idx * 5);
    const finalMatch = Math.min(Math.max(calculatedMatch, 72), 98);
    return {
      ...item,
      match: finalMatch
    };
  });
  
  return res.json({ recommendations: enhancedList });
}

// Local roadmap construction in offline fallback scenarios
function handleLocalRoadmap(role, department, res) {
  // Look up in our local standard mappings
  const deptKey = department || "cse";
  const recList = STANDARD_RECS[deptKey] || STANDARD_RECS["cse"];
  
  // Find matching role fallback, else default to first one
  const matchedRole = recList.find((r) => r.role.toLowerCase() === role.toLowerCase()) || recList[0];
  
  return res.json({ roadmap: matchedRole.roadmap });
}

startServer();
