import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";
import { supabase } from "../services/supabaseClient";
// import { DEPARTMENTS, INTERESTS, STANDARD_RECS } from "./data";
import {
  getDepartments,
  getSkills,
  getInterests,
  getCareers,
  getRoadmaps,
  getLearningResources,
  getCareerSkills,
  getCareerInterests,
  getUserProgress,
  getCareerDepartments,
  saveUserProgress,
  checkUserPreferences,
  savePreferences
} from "../services/api";

// Helper f or rendering Lucide icons dynamically
const Icon = ({ name, className = "h-5 w-5", ...props }) => {
  const IconComponent = Lucide[name];
  if (!IconComponent) return <Lucide.HelpCircle className={className} {...props} />;
  return <IconComponent className={className} {...props} />;
};


export default function App() {
  // Global Flow State
  // "auth" | "department" | "skills" | "interests" | "recommendations" | "roadmap"
  const [step, setStep] = useState("auth");
  const [currentUser, setCurrentUser] = useState(null);

  // Selection State
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchSkillQuery, setSearchSkillQuery] = useState("");

  // Recommendation & Roadmap State
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState({});
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "chat"

  // Quiz Modal State ("I don't know my skills")
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRecommendationText, setQuizRecommendationText] = useState("");

  // API DATAS 

  const [departmentsData, setDepartmentsData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [interestsData, setInterestsData] = useState([]);
  const [careersData, setCareersData] = useState([]);
  const [roadmapsData, setRoadmapsData] = useState([]);
  const [learningResourcesData, setLearningResourcesData] = useState([]);
  const [careerSkillsData, setCareerSkillsData] = useState([]);
  const [careerInterestsData, setCareerInterestsData] = useState([]);
  const [userProgressData, setUserProgressData] = useState([]);
  const [careerDepartmentsData, setCareerDepartmentsData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [preferencesChecked, setPreferencesChecked] = useState(false);

  // Chatbot State with Multi-Agent Console capabilities
  const [selectedAgent, setSelectedAgent] = useState("coach"); // "coach" | "explainer" | "interviewer" | "strategist"
  const [agentChats, setAgentChats] = useState({
    coach: [],
    explainer: [],
    interviewer: [],
    strategist: []
  });
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // API DATAS 

  useEffect(() => {

    const loadApi = async () => {
      setIsDataLoading(true);

      const results = await Promise.allSettled([

        getDepartments(),
        getSkills(),
        getInterests(),
        getCareers(),
        getRoadmaps(),
        getLearningResources(),
        getCareerSkills(),
        getCareerInterests(),
        getUserProgress(),
        getCareerDepartments()

      ]);

      // Extract resolved payload safely regardless of whether data is array or Supabase format { data: [...] }
      const unwrap = (res) => {
        if (res.status === "fulfilled") {
          const val = res.value;
          return Array.isArray(val) ? val : (val?.data || Object.values(val || {}).find(Array.isArray) || []);
        }
        return [];
      };

      setDepartmentsData(unwrap(results[0]));
      setSkillsData(unwrap(results[1]));
      setInterestsData(unwrap(results[2]));
      setCareersData(unwrap(results[3]));
      setRoadmapsData(unwrap(results[4]));
      setLearningResourcesData(unwrap(results[5]));
      setCareerSkillsData(unwrap(results[6]));
      setCareerInterestsData(unwrap(results[7]));
      setUserProgressData(unwrap(results[8]));
      setCareerDepartmentsData(unwrap(results[9]));
      setIsDataLoading(false);

    };

    loadApi();

  }, []);

  console.log("skills", getSkills());
  // Load user session from local storage on startup
  useEffect(() => {
    const savedSession = localStorage.getItem("career_guide_session");
    if (savedSession) {
      try {
        const u = JSON.parse(savedSession);
        setCurrentUser(u);
      } catch (e) {
        localStorage.removeItem("career_guide_session");
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const user = data.session.user;
        const sessionUser = {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email,
        };
        setCurrentUser(sessionUser);
        localStorage.setItem("career_guide_session", JSON.stringify(sessionUser));
      }
    });
  }, []);

  // Sync checklist progress of milestones
  useEffect(() => {
    if (selectedRole) {
      const roleName = selectedRole.career_name;
      const savedProgress = localStorage.getItem(`roadmap_progress_${roleName}`);
      if (savedProgress) {
        try {
          setCompletedMilestones(JSON.parse(savedProgress));
        } catch (e) {
          setCompletedMilestones({});
        }
      } else {
        setCompletedMilestones({});
      }
    }
  }, [selectedRole]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentChats, selectedAgent]);

  // Toggle skill selection
  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Toggle interest selection
  const handleToggleInterest = (interestName) => {
    if (selectedInterests.includes(interestName)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interestName));
    } else {
      setSelectedInterests([...selectedInterests, interestName]);
    }
  };

  // Department metadata helper
  const currentDeptObject = useMemo(() => {
    return departmentsData.find(
      (d) => d.id === selectedDept
    );
  }, [selectedDept, departmentsData]);

  // Filter skills based on user search query
  const filteredSkills = useMemo(() => {

    let skills = skillsData;

    if (!searchSkillQuery) return skills;

    return skills.filter((skill) =>
      (skill.skill_name || "").toLowerCase().includes(
        searchSkillQuery.toLowerCase()
      )
    );

  }, [skillsData, searchSkillQuery]);

  // Fetch career recommendations using fullstack backend API
  const handleGenerateRecommendations = async (overrideDept = null) => {
    const activeDept = (typeof overrideDept === 'string' || typeof overrideDept === 'number') ? overrideDept : selectedDept;

    if (!onboardingCompleted && currentUser && (typeof overrideDept !== 'string' && typeof overrideDept !== 'number')) {
      try {
        const selectedSkillIds = selectedSkills.map(name => {
           const s = skillsData.find(x => x.skill_name === name);
           return s ? s.id : null;
        }).filter(Boolean);
        
        const selectedInterestIds = selectedInterests.map(name => {
           const i = interestsData.find(x => x.interest_name === name);
           return i ? i.id : null;
        }).filter(Boolean);

        await savePreferences({
           user_id: currentUser.id || currentUser.email,
           department_id: activeDept,
           skills: selectedSkillIds,
           interests: selectedInterestIds
        });
        setOnboardingCompleted(true);
      } catch (error) {
        console.error("Failed to save preferences:", error);
      }
    }

    setRecsLoading(true);
    setStep("recommendations");

    try {
      const matchedCareerIds = careerDepartmentsData
        .filter((item) => String(item.department_id) === String(activeDept))
        .map((item) => String(item.career_id));

      const filteredCareers = careersData.filter((career) =>
        matchedCareerIds.includes(String(career.id))
      );

      const finalRecommendations = filteredCareers.map((career, index) => ({
        ...career,
        match: Math.min(95 - (index * 4), 98)
      }));

      setRecommendations(finalRecommendations);
    } catch (error) {
      console.log(error);
      setRecommendations([]);
    } finally {
      setRecsLoading(false);
    }
  };

  // Check User Preferences Flow
  useEffect(() => {
    const checkPrefs = async () => {
      if (currentUser && !isDataLoading && !preferencesChecked) {
        setOnboardingLoading(true);
        try {
          const userId = currentUser.id || currentUser.email;
          const result = await checkUserPreferences(userId);
          
          if (result.exists && result.preferences) {
            setOnboardingCompleted(true);
            setSelectedDept(result.preferences.department_id);
            
            const restoredSkills = (result.preferences.skills || []).map(skillId => {
              const s = skillsData.find(x => String(x.id) === String(skillId));
              return s ? s.skill_name : null;
            }).filter(Boolean);
            setSelectedSkills(restoredSkills);
            
            const restoredInterests = (result.preferences.interests || []).map(intId => {
              const i = interestsData.find(x => String(x.id) === String(intId));
              return i ? i.interest_name : null;
            }).filter(Boolean);
            setSelectedInterests(restoredInterests);
            
            handleGenerateRecommendations(result.preferences.department_id);
          } else {
            setStep("department");
          }
        } catch (error) {
          console.error("Failed to check user preferences:", error);
          setStep("department");
        } finally {
          setPreferencesChecked(true);
          setOnboardingLoading(false);
        }
      }
    };
    checkPrefs();
  }, [currentUser, isDataLoading, preferencesChecked, skillsData, interestsData]);

  // Fetch customizable learning roadmap for selected role
  const handleGenerateRoadmap = async (roleObj) => {
    setSelectedRole(roleObj);
    setRoadmapLoading(true);
    setStep("roadmap");
    setActiveTab("overview");
    setSelectedAgent("coach"); // Reset back to default general overview coach

    const roleName = roleObj.career_name;
    // Initialize standard introductory greetings for each professional agent
    setAgentChats({
      coach: [
        {
          sender: "model",
          text: `Hello, ${currentUser?.fullName || "Aspirant"}! I am your primary **AI Career Coach** specifically tuned to guide you as a **${roleName}**. 🚀

I have structured a detailed stepwise learning timeline curriculum based on your collegiate background and interests in *${currentDeptObject?.department_name || "Engineering"}*.

Feel free to ask me questions like:
- "What core frameworks are the absolute standards in industry?"
- "Can you suggest some free online modules or courses for this stack?"
- "Give me a high-level review checklist to verify my milestones."`
        }
      ],
      explainer: [
        {
          sender: "model",
          text: `Hello, ${currentUser?.fullName || "Aspirant"}! I'm **Socrates AI**, your Concept Explainer. 💡

Whether it's an abstract algorithm (like Dijkstra or Bubbling), a backend architectural pattern, a syntax design, or a complex tool in the **${roleName}** ecosystem, I am here to help you truly **understand things**!

Ask me anything. I will use simple, creative, real-world analogies, step-by-step logic, and code examples so it makes absolute perfect sense!`
        }
      ],
      interviewer: [
        {
          sender: "model",
          text: `Welcome! I am **Recruiter Rex**, your simulated HR and Technical Screener. 🎯

Let's run a realistic mock interview tailored for an associate **${roleName}** position. I'll ask you one question at a time. After you reply:
1. I will grade your response out of 10.
2. Provide a single critical piece of advice to level up your delivery.
3. Move on to the next question.

Are you ready to test your communication?
Let's launch Question 1: **Could you introduce yourself and briefly explain why you are pursuing this specific technical track?**`
        }
      ],
      strategist: [
        {
          sender: "model",
          text: `Hi there! I am **Coach Chelsea**, your Strategic Portfolio & Brand Advisor. 🌟

To turn this learning roadmap into a real job offer, your resume and portfolios must stand out from general applicants! Ask me for:
- ATS-optimized bullet descriptions detailing your core skills
- High-visibility portfolio custom project ideas specifically matching **${roleName}**
- Essential networking strategies to contact recruiters directly or stand out on LinkedIn.`
        }
      ]
    });

    try {
      const localRoadmap = roadmapsData.filter(
        (item) => String(item.career_id) === String(roleObj.id)
      );

      if (localRoadmap.length > 0) {
        localRoadmap.sort((a, b) => Number(a.step_number) - Number(b.step_number));
        setRoadmap(localRoadmap);
      } else {
        setRoadmap([]);
      }
    } catch (err) {
      console.warn("Failed to generate roadmap dynamically.", err);
      setRoadmap([]);
    } finally {
      setRoadmapLoading(false);
    }
  };

  // Dynamic user progress saving
  const handleMarkCompleted = async (skillId) => {
    if (!currentUser || !skillId) return;
    try {
      const newProgress = {
        user_id: currentUser.email,
        skill_id: skillId,
        status: "completed"
      };
      await saveUserProgress(newProgress);
      setUserProgressData((prev) => [...prev, newProgress]);
    } catch (error) {
      console.log("Failed to save progress", error);
    }
  };

  // Checklist updates & progress tracking state
  const handleToggleMilestone = (milestoneKey) => {
    const updated = {
      ...completedMilestones,
      [milestoneKey]: !completedMilestones[milestoneKey],
    };
    setCompletedMilestones(updated);
    if (selectedRole) {
      const roleName = selectedRole.career_name;
      localStorage.setItem(`roadmap_progress_${roleName}`, JSON.stringify(updated));
    }
  };

  // Calculate percentage of checklist steps finished
  const totalSubtasks = useMemo(() => {
    if (!roadmap || roadmap.length === 0) return 0;
    // Each phase has description, resources, and custom project list
    let count = 0;
    roadmap.forEach((phase) => {
      count += 1; // Basic study check
      if (phase.projects) {
        count += phase.projects.length; // Project checks
      }
    });
    return count;
  }, [roadmap]);

  const completedSubtasksCount = useMemo(() => {
    let count = 0;
    Object.keys(completedMilestones).forEach((key) => {
      if (!key.endsWith('-study') && completedMilestones[key]) count++;
    });
    
    roadmap.forEach(phase => {
      const phaseTitle = phase.step_title || phase.title;
      const matchedSkill = skillsData.find(s => s.skill_name?.toLowerCase() === phaseTitle?.toLowerCase());
      const isCompleted = matchedSkill ? userProgressData.some(p => Number(p.skill_id) === Number(matchedSkill.id) && p.user_id === currentUser?.email && p.status === "completed") : false;
      
      if (isCompleted || completedMilestones[`${phaseTitle}-study`]) {
        count++;
      }
    });
    return count;
  }, [completedMilestones, roadmap, skillsData, userProgressData, currentUser]);

  const roadmapProgressPercent = useMemo(() => {
    if (totalSubtasks === 0) return 0;
    return Math.round((completedSubtasksCount / totalSubtasks) * 100);
  }, [totalSubtasks, completedSubtasksCount]);

  // Send message to AI Career Consultant
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: "user", text: chatInput };
    const currentAgentMessages = agentChats[selectedAgent] || [];
    const updatedHistory = [...currentAgentMessages, userMsg];

    // Optimistically update conversation layout for current agent
    setAgentChats((prev) => ({
      ...prev,
      [selectedAgent]: updatedHistory,
    }));
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/career/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
          role: selectedRole?.career_name,
          agentType: selectedAgent,
        }),
      });
      const data = await response.json();
      if (data && data.reply) {
        setAgentChats((prev) => ({
          ...prev,
          [selectedAgent]: [...updatedHistory, { sender: "model", text: data.reply }],
        }));
      } else {
        throw new Error("No chat reply");
      }
    } catch (err) {
      setTimeout(() => {
        setAgentChats((prev) => ({
          ...prev,
          [selectedAgent]: [
            ...updatedHistory,
            {
              sender: "model",
              text: `My cognitive array is currently busy or offline, but here is a strong professional tip: Concentrate on building practical projects matching your checked milestones. Experience is the best teacher!`,
            },
          ],
        }));
        setChatLoading(false);
      }, 700);
    } finally {
      setChatLoading(false);
    }
  };

  // Pre-configured questions for prompt suggestion buttons
  const promptSuggestions = [
    "What core projects should I build first?",
    "Suggest some completely free study courses.",
    "Give me common interview questions for this role."
  ];

  // "I don't know my skills" dynamic modal mechanics
  const quizQuestions = [
    {
      q: "When approaching a difficult puzzle or coding problem, you prefer...",
      options: [
        { label: "Figuring out the underlying engine structure and logical sequences step-by-step", skills: ["Python & Scripting", "TypeScript & JavaScript", "Embedded C Programming", "Data Structures & Algorithms"] },
        { label: "Polishing visual aspects, creating layout wireframes, or drafting screens", skills: ["React & Frontend Framworks", "Figma UI/UX Prototyping", "Adobe Photoshop & Illustrator"] },
        { label: "Gathering people, assigning tickets, and planning project delivery timelines", skills: ["Agile & Scrum Project Planning", "Project Management & UX Strategy"] }
      ]
    },
    {
      q: "Which of the following topics feels the most fascinating to investigate?",
      options: [
        { label: "Advanced cloud websites and automated server operations", skills: ["AWS & Cloud Computing", "Docker & Kubernetes", "Node.js & Backend APIs"] },
        { label: "Sensing environments using hardware chips, smart resistors, and robot gears", skills: ["Arduino & Prototyping", "Raspberry Pi & Single Board Computers", "Internet of Things (IoT) Systems"] },
        { label: "Investigating asset pricing, compound marketing models, and customer segments", skills: ["Financial Modeling & Forecasting", "Google Analytics & SEO", "Market Research & Competitor Analysis"] },
        { label: "Publishing original novels, designing logos, or shooting dynamic brand videos", skills: ["Creative Copywriting & Editing", "Video Editing (Premiere, Resolve)", "Typography & Visual Identity"] }
      ]
    },
    {
      q: "If you had a free weekend to build a cool sandbox project, what would it be?",
      options: [
        { label: "Code an interactive web dashboard with widgets", skills: ["React & Frontend Framworks", "TypeScript & JavaScript"] },
        { label: "Solder a sensor circuit to auto-irrigate houseplants based on soil telemetry", skills: ["PCB Designing & Fabrication", "Arduino & Prototyping", "Internet of Things (IoT) Systems"] },
        { label: "Draft an elegant 3D parametric blueprint of an aerospace casing or engine part", skills: ["SolidWorks & 3D CAD Modeling", "3D Printing & Rapid Prototyping"] },
        { label: "Author a highly responsive copywriting product campaign script", skills: ["Creative Copywriting & Editing", "Brand Strategy & Communication"] }
      ]
    },
    {
      q: "In high school, which analytical subject felt the most naturally comfortable?",
      options: [
        { label: "Mathematics, Matrices and Software Code Logic", skills: ["Python & Scripting", "Data Structures & Algorithms", "TypeScript & JavaScript"] },
        { label: "Physics, Electromagnetic induction, and Circuits", skills: ["Verilog & VHDL", "Network Protocols & Architecture", "Embedded C Programming"] },
        { label: "Social studies, Product advertising, or Case audits", skills: ["Google Analytics & SEO", "Market Research & Competitor Analysis", "Advanced Excel Data Modeling"] },
        { label: "Exposition writing, Logo typography, or Painting", skills: ["Figma UI/UX Prototyping", "Typography & Visual Identity", "UX Research & Persona Blueprinting"] }
      ]
    }
  ];

  const handleStartAptitudeQuiz = () => {
    setQuizOpen(true);
    setQuizIndex(0);
    setQuizAnswers({});
  };

  const handleQuizAnswer = (optionSkills) => {
    const currentDeptSkills = skillsData.map(s => s.skill_name) || [];
    // Accumulate skills
    const newAnswers = { ...quizAnswers };
    optionSkills.forEach((sk) => {
      if (currentDeptSkills.includes(sk)) {
        newAnswers[sk] = (newAnswers[sk] || 0) + 1;
      }
    });
    setQuizAnswers(newAnswers);

    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      // Completed! Identify the top 3 recommended skills
      const sortedSkillsByPreference = Object.entries(newAnswers)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map((entry) => entry[0]);

      // If they got nothing relevant, pick the first 3
      let selectedQuizSkills = sortedSkillsByPreference.slice(0, 3);
      if (selectedQuizSkills.length === 0) {
        selectedQuizSkills = currentDeptSkills.slice(0, 3);
      }

      // Add them checked!
      const finalSelectedSkillsList = Array.from(new Set([...selectedSkills, ...selectedQuizSkills]));
      setSelectedSkills(finalSelectedSkillsList);

      setQuizRecommendationText(`Based on your aptitude responses, the systems matched your cognitive preferences with three foundational specializations in this department:
• ${selectedQuizSkills.join("\n• ")}

We checked these skills for you automatically. You can toggle additional parameters now!`);
      setQuizIndex(quizQuestions.length); // Render summary view inside modal
    }
  };

  // Clear credentials & log out
  const handleLogOut = () => {
    localStorage.removeItem("career_guide_session");
    setCurrentUser(null);
    setSelectedDept("");
    setSelectedSkills([]);
    setSelectedInterests([]);
    setRecommendations([]);
    setSelectedRole(null);
    setRoadmap([]);
    setPreferencesChecked(false);
    setOnboardingCompleted(false);
    setStep("auth");
  };

  // Handle Mock Login / Register Form Submit
  const handleAuthSubmit = async (
    e,
    mode,
    email,
    password,
    fullName
  ) => {

    e.preventDefault();

    try {

      if (mode === "signup") {

        const { data, error } = await supabase.auth.signUp({

          email: email,

          password: password,

          options: {
            data: {
              full_name: fullName
            }
          }

        });

        if (error) {

          alert(error.message);
          return;

        }

        alert(
          "Signup success. Check email verification."
        );

      }


      if (mode === "login") {

        const { data, error } = await supabase.auth.signInWithPassword({

          email: email,
          password: password

        });

        if (error) {

          alert(error.message);
          return;

        }

        const sessionUser = {

          email: data.user.email,

          fullName:
            data.user.user_metadata
              ?.full_name
            ||
            data.user.email,

        };

        setCurrentUser(
          sessionUser
        );

        localStorage.setItem(

          "career_guide_session",

          JSON.stringify(
            sessionUser
          )

        );
          
          setPreferencesChecked(false);
      }

    }

    catch (error) {

      console.log(error);

      alert(
        "Authentication failed"
      );

    }

  };

  const handleGoogleLogin = async () => {

    try {

      const { error } =

        await supabase.auth.signInWithOAuth({

          provider: "google",

          options: {

            redirectTo:

              window.location.origin

          }

        });

      if (error) {

        alert(
          error.message
        );

      }

    }

    catch (error) {

      console.log(error);

    }

  };

  // Auth Screen Local States
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [nameValue, setNameValue] = useState("");

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white" id="main_wrapper">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between" id="platform_header">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <Lucide.GraduationCap className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white font-sans flex items-center gap-2">
              Career Guidance <span className="text-xs bg-indigo-500/10 text-indigo-400 font-mono py-0.5 px-2 rounded-full font-medium">PREMIUM</span>
            </h1>
            <p className="text-xs text-slate-400">Dynamic skill maps & AI roadmaps</p>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-4" id="header_profile_pill">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs text-slate-400">Welcome back,</span>
              <span className="text-sm font-semibold text-slate-200">{currentUser.fullName}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 font-mono text-indigo-400 flex items-center justify-center font-bold text-sm">
              {currentUser.fullName.substring(0, 2).toUpperCase()}
            </div>
            <button
              onClick={handleLogOut}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
              title="Log Out Session"
              id="logout_btn"
            >
              <Lucide.LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </header>

      {/* CORE BODY APP FLOW */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8" id="core_workflow_viewport">
        {isDataLoading || onboardingLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[60vh] space-y-4"
          >
            <Lucide.RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-300 tracking-wider font-mono uppercase">
              {onboardingLoading ? "Checking user preferences..." : "Loading..."}
            </p>
            <p className="text-xs text-slate-500">Please wait while we set things up.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {/* STEP 1: AUTHENTICATION */}
            {step === "auth" && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-md mx-auto my-12"
                id="auth_panel"
              >
                <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 overflow-hidden relative">
                  {/* Visual Accent Decoration */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                  <div className="text-center mb-8">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">Secure Access Platform</span>
                    <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                      {authMode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-sm text-slate-400 mt-2">
                      {authMode === "login"
                        ? "Sign in to resume tracking your personalized career goals."
                        : "Register to build custom technical skills maps and roadmap profiles."}
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => handleAuthSubmit(e, authMode, emailValue, passwordValue, nameValue)}
                    className="space-y-4"
                    id="auth_form"
                  >
                    {authMode === "signup" && (
                      <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <div className="relative">
                          <Lucide.User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            placeholder="Jane Doe"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                      <div className="relative">
                        <Lucide.Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={emailValue}
                          onChange={(e) => setEmailValue(e.target.value)}
                          placeholder="you@university.edu"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Secret Password</label>
                      <div className="relative">
                        <Lucide.Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={passwordValue}
                          onChange={(e) => setPasswordValue(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 active:translate-y-[1px] transition-all flex items-center justify-center gap-2 mt-2"
                      id="submit_auth_btn"
                    >
                      <span>{authMode === "login" ? "Access Dashboard" : "Register Credentials"}</span>
                      <Lucide.ArrowRight className="h-4 w-4" />
                    </button>
                  </form>

                  <div className="my-4 flex items-center">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="px-3 text-xs text-slate-500">OR</span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full bg-white text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-slate-200"
                  >
                    <Lucide.Chrome className="h-5 w-5" />
                    Continue with Google
                  </button>

                  <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm">
                    <span className="text-slate-400">
                      {authMode === "login" ? "New to the portal?" : "Already mapped your profile?"}
                    </span>{" "}
                    <button
                      onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer"
                      id="switch_auth_btn"
                    >
                      {authMode === "login" ? "Create an account" : "Sign in here"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DEPARTMENT SELECTION */}
            {step === "department" && (
              <motion.div
                key="department"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
                id="department_selection"
              >
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase font-semibold">Assessment Phase 1</span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Select Your Core Stream</h2>
                  <p className="text-slate-400 text-sm">
                    We customize the technical assessments and matching models depending on your chosen collegiate or vocational stream. Pick your focus field.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4" id="department_grid">
                  {departmentsData.map((dept) => {
                    const isSelected = selectedDept === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedDept(dept.id)}
                        className={`text-left rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 group cursor-pointer relative overflow-hidden ${isSelected
                          ? "bg-slate-950 border-indigo-500 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80"
                          }`}
                      >
                        {/* Selection dot indicator */}
                        <div className="absolute top-4 right-4 h-5 w-5 rounded-full border border-slate-800 flex items-center justify-center">
                          <div className={`h-2.5 w-2.5 rounded-full transition-all ${isSelected ? "bg-indigo-500 scale-100" : "scale-0"}`} />
                        </div>

                        <div className="space-y-4">
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-indigo-600/20 text-indigo-400" : "bg-slate-900 text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-800"
                            }`}>
                            <Icon name="GraduationCap" className="h-6 w-6 stroke-[1.75]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base tracking-tight">{dept.department_name}</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">A core stream offering specialized technical, theoretical, and practical career development.</p>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Select Stream</span>
                          <Lucide.ChevronRight className="h-3 w-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedDept && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end pt-4"
                  >
                    <button
                      onClick={() => setStep("skills")}
                      className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/15 font-semibold text-white py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg transition-all"
                      id="dept_next_btn"
                    >
                      <span>Proceed to Skills Assessment</span>
                      <Lucide.ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 3: SKILLS SELECTION */}
            {step === "skills" && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
                id="skills_selection"
              >
                {/* Back navigation */}
                <button
                  onClick={() => setStep("department")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  <Lucide.ArrowLeft className="h-4 w-4" />
                  <span>Change Stream</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase font-semibold">Assessment Phase 2</span>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">{currentDeptObject?.department_name} Skills</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Select your current technical strengths or topics you have familiarized yourself with previously.
                    </p>
                  </div>

                  <div className="flex flex-col min-w-[240px] gap-2">
                    <span className="text-xs text-slate-500 font-medium">Unsure of your skillset?</span>
                    <button
                      onClick={handleStartAptitudeQuiz}
                      className="cursor-pointer bg-slate-950 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600/10 transition-colors text-sm"
                      id="quiz_launcher_btn"
                    >
                      <Lucide.Sparkles className="h-4 w-4 fill-indigo-400/20" />
                      <span>Run Aptitude Filter</span>
                    </button>
                  </div>
                </div>

                {/* Skill Search Field */}
                <div className="relative max-w-md">
                  <Lucide.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search and filter skills..."
                    value={searchSkillQuery}
                    onChange={(e) => setSearchSkillQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                    id="skill_search_input"
                  />
                </div>

                {/* Skills grid list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="skills_grid">
                  {filteredSkills.map((skillObj) => {
                    const skillName = typeof skillObj === 'string' ? skillObj : skillObj.skill_name;
                    const skillId = typeof skillObj === 'string' ? skillObj : (skillObj.id || skillName);
                    const isChecked = selectedSkills.includes(skillName);
                    return (
                      <button
                        key={skillId}
                        onClick={() => handleToggleSkill(skillName)}
                        className={`text-left rounded-xl p-4 border flex items-center gap-3 cursor-pointer transition-all ${isChecked
                          ? "bg-slate-950 border-indigo-700/60 ring-1 ring-indigo-500"
                          : "bg-slate-950/30 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-950/60"
                          }`}
                      >
                        <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 bg-slate-900"
                          }`}>
                          {isChecked && <Lucide.Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium text-slate-200">{skillName}</span>
                      </button>
                    );
                  })}

                  {filteredSkills.length === 0 && (
                    <div className="col-span-full bg-slate-950/30 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                      No matching skills found in this stream catalog. Try modifying your search query!
                    </div>
                  )}
                </div>

                {/* Navigation links footer */}
                <div className="flex md:items-center justify-between gap-4 pt-6 flex-col sm:flex-row border-t border-slate-800/80">
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedSkills.length} SKILLS MARKED FOR ASSESSMENT
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => {
                        setSelectedSkills([]);
                        setStep("interests");
                      }}
                      className="cursor-pointer text-slate-400 hover:text-slate-200 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
                      id="skip_skills_btn"
                    >
                      I don't have any matching skills yet
                    </button>
                    <button
                      onClick={() => setStep("interests")}
                      className="cursor-pointer bg-indigo-600 hover:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-colors text-sm"
                      id="skills_next_btn"
                    >
                      <span>Proceed to Interests Matching</span>
                      <Lucide.ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: INTEREST SELECTION */}
            {step === "interests" && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
                id="interests_selection"
              >
                {/* Back navigation */}
                <button
                  onClick={() => setStep("skills")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  <Lucide.ArrowLeft className="h-4 w-4" />
                  <span>Back to Skills</span>
                </button>

                <div className="border-b border-slate-800 pb-5">
                  <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase font-semibold">Assessment Phase 3</span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Core Work Values & Interests</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Which professional domains, objectives, or activities excite you? Select what you love building, exploring, or managing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2" id="interests_grid">
                  {interestsData.map((interest) => {
                    const interestName = interest.interest_name;
                    const interestId = interest.id || interestName;
                    const isChecked = selectedInterests.includes(interestName);
                    return (
                      <button
                        key={interestId}
                        onClick={() => handleToggleInterest(interestName)}
                        className={`text-left rounded-xl p-5 border flex items-start gap-4 cursor-pointer transition-all ${isChecked
                          ? "bg-slate-950 border-indigo-700/60 ring-1 ring-indigo-500"
                          : "bg-slate-950/20 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/40"
                          }`}
                      >
                        <div className={`mt-0.5 h-6 w-6 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 bg-slate-900"
                          }`}>
                          {isChecked && <Lucide.Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <Icon name="Sparkles" className="h-4 w-4 text-indigo-400" />
                            <h4 className="font-bold text-white text-sm tracking-tight">{interestName}</h4>
                          </div>
                          <p className="text-xs text-slate-400 leading-normal">Explore this domain to align your daily professional activities with your core passions.</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation links footer */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedInterests.length} THEMES CHOSEN
                  </div>
                  <button
                    onClick={handleGenerateRecommendations}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl flex items-center gap-2 shadow-lg transition-colors text-sm"
                    id="interests_next_btn"
                  >
                    <span>Build Career Recommendations</span>
                    <Lucide.Sparkles className="h-4 w-4 text-white fill-white/20" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: RECOMMENDATIONS */}
            {step === "recommendations" && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
                id="recommendations_dashboard"
              >
                {/* Back navigation */}
                <button
                  onClick={() => setStep("interests")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  <Lucide.ArrowLeft className="h-4 w-4" />
                  <span>Adjust Interests</span>
                </button>

                <div className="border-b border-slate-800 pb-5 text-center md:text-left">
                  <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase font-semibold">Matched Outputs</span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Recommended Professional Tracks</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Our assessment generated the optimal matches for you based on the intersection of your stream, technical skills, and interests.
                  </p>
                </div>

                {recsLoading ? (
                  <div className="space-y-4 py-12" id="recs_loading_skeleton">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Lucide.RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
                      <p className="text-sm font-semibold text-slate-300">Loading Recommendations...</p>
                      <p className="text-xs text-slate-500">Finding the best matches for your profile.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6" id="recommendations_list">
                    {recommendations.map((rec, index) => {
                      const roleName = rec.career_name;
                      return (
                        <motion.div
                          key={roleName || index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
                        >
                          {/* Progressive Background Accent */}
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500" />

                          {/* Match Progress Score Wheel (SVG) */}
                          <div className="flex items-center gap-6 flex-1">
                            <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center font-mono">
                              <svg className="absolute inset-0 h-full w-full -rotate-90">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="34"
                                  className="stroke-slate-800"
                                  strokeWidth="6"
                                  fill="transparent"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="34"
                                  className="stroke-indigo-500 transition-all duration-1000"
                                  strokeWidth="6"
                                  strokeDasharray={2 * Math.PI * 34}
                                  strokeDashoffset={2 * Math.PI * 34 * (1 - rec.match / 100)}
                                  strokeLinecap="round"
                                  fill="transparent"
                                />
                              </svg>
                              <div className="text-center">
                                <span className="text-lg font-bold text-white leading-none">{rec.match}%</span>
                                <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-semibold font-sans mt-0.5">MATCH</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                                  <span>{roleName}</span>
                                </h3>
                                <p className="text-xs text-slate-400 italic font-medium mt-1 leading-relaxed">
                                  &ldquo;{rec.description}&rdquo;
                                </p>
                              </div>

                              {/* Badges Info Panel */}
                              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                                <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 flex items-center gap-1.5">
                                  <Lucide.Coins className="h-3.5 w-3.5 text-indigo-400" />
                                  <span>Median Pay: <strong className="text-white">{rec.salary}</strong></span>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 flex items-center gap-1.5">
                                  <Lucide.Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400/20" />
                                  <span>Demand: <strong className="text-white">{rec.growth}</strong></span>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 flex items-center gap-1.5">
                                  <Lucide.Terminal className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Difficulty: <strong className="text-white">{rec.difficulty}</strong></span>
                                </div>
                              </div>

                              {/* Core Skills */}
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                <span className="text-xs text-slate-500 font-mono font-semibold uppercase">Key Skills:</span>
                                {selectedSkills.slice(0, 5).map((skillStr) => (
                                  <span
                                    key={skillStr}
                                    className="text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded"
                                  >
                                    {skillStr}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Interactive roadmap submission trigger */}
                          <div className="flex-shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t border-slate-900 md:border-0">
                            <button
                              onClick={() => handleGenerateRoadmap(rec)}
                              className="w-full md:w-auto cursor-pointer bg-white text-slate-950 hover:bg-slate-200 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/5 transition-all text-sm group"
                            >
                              <span>Generate Interactive Roadmap</span>
                              <Lucide.ArrowRight className="h-4 w-4 bg-transparent group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}

                    {recommendations.length === 0 && (
                      <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                        We were unable to extract dynamic recommendations. Try returning to previous steps and verifying your checked traits!
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 6: ROADMAP WORKSPACE */}
            {step === "roadmap" && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
                id="roadmap_workspace"
              >
                {/* Back navigation */}
                <button
                  onClick={() => setStep("recommendations")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider print:hidden"
                >
                  <Lucide.ArrowLeft className="h-4 w-4" />
                  <span>Change Recommended Career</span>
                </button>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6" id="roadmap_profile_header">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 py-1 px-3 rounded-full uppercase tracking-wider">
                        Interactive Syllabus target
                      </span>
                      <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                        Goal: {selectedRole?.career_name}
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Stream background: {currentDeptObject?.department_name} Assessment mapping
                      </p>
                    </div>

                    {/* Progressive Meter */}
                    <div className="space-y-2 max-w-sm pt-2" id="roadmap_progress_section">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-semibold">PROJECTS & TARGETS FINISHED</span>
                        <span className="text-indigo-400 font-bold">{roadmapProgressPercent}% COMPLETE</span>
                      </div>
                      <div className="relative h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${roadmapProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Print exports */}
                  <div className="flex items-center gap-3 self-start md:self-center print:hidden">
                    <button
                      onClick={printDocument}
                      className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:border-slate-700 transition-colors text-xs"
                      title="Export structured syllabus for physical print"
                      id="print_btn"
                    >
                      <Lucide.Printer className="h-4 w-4" />
                      <span>Print Summary PDF</span>
                    </button>
                  </div>
                </div>

                {/* TOGGLE WORKSPACE TABS */}
                <div className="flex items-center border-b border-slate-800 gap-6 print:hidden" id="workspace_tab_bar">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-3 font-semibold text-sm relative transition-all cursor-pointer ${activeTab === "overview" ? "text-indigo-400" : "text-slate-400 hover:text-white"
                      }`}
                    id="tab_overview_btn"
                  >
                    <span className="flex items-center gap-2">
                      <Lucide.Milestone className="h-4.5 w-4.5" />
                      <span>Step-by-Step Learning Timeline</span>
                    </span>
                    {activeTab === "overview" && (
                      <motion.div layoutId="active_tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`py-3 font-semibold text-sm relative transition-all cursor-pointer ${activeTab === "chat" ? "text-indigo-400" : "text-slate-400 hover:text-white"
                      }`}
                    id="tab_chat_btn"
                  >
                    <span className="flex items-center gap-2">
                      <Lucide.MessageSquare className="h-4.5 w-4.5" />
                      <span>AI Career Assistant Bot</span>
                    </span>
                    {activeTab === "chat" && (
                      <motion.div layoutId="active_tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                    )}
                  </button>
                </div>

                {roadmapLoading ? (
                  <div className="space-y-4 py-12" id="roadmap_loading_skeleton">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Lucide.RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
                      <p className="text-sm font-semibold text-slate-300">Loading Roadmap...</p>
                      <p className="text-xs text-slate-500">Creating your personalized step-by-step learning timeline.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6" id="workspace_content">
                    {/* OVERVIEW TAB: ROADMAP TIMELINE */}
                    {activeTab === "overview" && (
                      <div className="space-y-8" id="roadmap_timeline">
                        <div className="relative pl-0 md:pl-6 space-y-8 border-l border-slate-800 ml-4 md:ml-6 py-2">
                          {roadmap.map((phase, pIndex) => {
                            const phaseTitle = phase.step_title || phase.title;
                            const phaseDesc = phase.step_description || phase.description;

                            const matchedSkill = skillsData.find(s => s.skill_name?.toLowerCase() === phaseTitle?.toLowerCase());
                            const matchedResource = matchedSkill ? learningResourcesData.find(r => Number(r.skill_id) === Number(matchedSkill.id)) : null;
                            const isCompleted = matchedSkill ? userProgressData.some(p => Number(p.skill_id) === Number(matchedSkill.id) && p.user_id === currentUser?.email && p.status === "completed") : false;

                            return (
                              <div key={phaseTitle || pIndex} className="relative pl-6 md:pl-8 group mb-4">
                                {/* Pin Timeline Indicator Dot */}
                                <div className="absolute -left-[14px] top-1.5 h-6 w-6 rounded-full bg-slate-900 border-[3px] border-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <span className="text-[10px] font-bold text-indigo-400 font-mono">{pIndex + 1}</span>
                                </div>

                                <motion.div
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: pIndex * 0.1 }}
                                  className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 relative"
                                >
                                  <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                                      <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-extrabold text-white tracking-tight">{phaseTitle}</h3>
                                        {matchedSkill && (
                                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded border ${isCompleted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                                            {isCompleted ? "Completed" : "Pending"}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2.5 py-1 rounded border border-slate-850">
                                        PHASE {pIndex + 1} ASSET SPEC
                                      </span>
                                    </div>

                                    <p className="text-sm text-slate-300 leading-relaxed">{phaseDesc}</p>

                                    {/* Resources reference details */}
                                    {matchedResource ? (
                                      <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider font-sans">
                                          <Lucide.BookOpen className="h-4 w-4" />
                                          <span>Dynamic Learning Resources:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                          {matchedResource.youtube_link && (
                                            <a href={matchedResource.youtube_link} target="_blank" rel="noreferrer" className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                                              <Lucide.Youtube className="h-3.5 w-3.5" />
                                              YouTube
                                            </a>
                                          )}
                                          {matchedResource.documentation_link && (
                                            <a href={matchedResource.documentation_link} target="_blank" rel="noreferrer" className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                                              <Lucide.FileText className="h-3.5 w-3.5" />
                                              Documentation
                                            </a>
                                          )}
                                          {matchedResource.practice_link && (
                                            <a href={matchedResource.practice_link} target="_blank" rel="noreferrer" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                                              <Lucide.Code className="h-3.5 w-3.5" />
                                              Practice
                                            </a>
                                          )}
                                          {matchedResource.w3schools_link && (
                                            <a href={matchedResource.w3schools_link} target="_blank" rel="noreferrer" className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                                              <Lucide.Globe className="h-3.5 w-3.5" />
                                              W3Schools
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider font-sans">
                                          <Lucide.BookOpen className="h-4 w-4" />
                                          <span>Curated Study Resources:</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                          {phase.resources || "Official Documentation repositories, roadmap.sh syllabus guidelines, and freeCodeCamp structures."}
                                        </p>
                                      </div>
                                    )}

                                    {/* Custom capstone checklist */}
                                    <div className="space-y-3" id={`projects_list_phase_${pIndex}`}>
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                                        <Lucide.Award className="h-4 w-4 text-amber-500" />
                                        <span>Phase Hands-On Capstone Objectives:</span>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id={`projects_grid_phase_${pIndex}`}>
                                        {/* Core study target check */}
                                        <button
                                          onClick={() => {
                                            if (matchedSkill && !isCompleted) {
                                              handleMarkCompleted(matchedSkill.id);
                                            } else {
                                              handleToggleMilestone(`${phaseTitle}-study`);
                                            }
                                          }}
                                          disabled={isCompleted}
                                          className={`text-left border rounded-xl p-3.5 flex items-start gap-3 transition-colors ${
                                            (isCompleted || completedMilestones[`${phaseTitle}-study`])
                                              ? "bg-slate-900/60 border-indigo-500/20 text-slate-400 cursor-default"
                                              : "bg-slate-950 border-slate-850 text-slate-200 hover:border-slate-800 cursor-pointer"
                                          }`}
                                        >
                                          <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${(isCompleted || completedMilestones[`${phaseTitle}-study`]) ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 bg-slate-900"}`}>
                                            {(isCompleted || completedMilestones[`${phaseTitle}-study`]) && <Lucide.Check className="h-2.5 w-2.5 stroke-[3]" />}
                                          </div>
                                          <div className="text-xs">
                                            <p className="font-semibold text-white">{isCompleted ? "Completed" : "Complete Step"}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Validate your progress for this skill module.</p>
                                          </div>
                                        </button>

                                        {/* Dynamic project check list */}
                                        {(phase.projects || ["Build Capstone Portfolio Module", "Write Test Suites & Deliver"]).map((projStr, prIndex) => {
                                          const keyStr = `${phaseTitle}-proj-${prIndex}`;
                                          const isProjCompleted = completedMilestones[keyStr];
                                          return (
                                            <button
                                              key={keyStr}
                                              onClick={() => handleToggleMilestone(keyStr)}
                                              className={`text-left border rounded-xl p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${isProjCompleted
                                                ? "bg-slate-900/60 border-indigo-500/20 text-slate-400"
                                                : "bg-slate-950 border-slate-850 text-slate-200 hover:border-slate-800"
                                                }`}
                                            >
                                              <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isProjCompleted ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 bg-slate-900"
                                                }`}>
                                                {isProjCompleted && <Lucide.Check className="h-2.5 w-2.5 stroke-[3]" />}
                                              </div>
                                              <div className="text-xs">
                                                <p className="font-semibold text-white">{projStr}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Build sandbox toys, test parameters, and push to GitHub.</p>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CHAT TAB: LIVE Gemini MULTI-AGENT PROFESSIONAL LOUNGE */}
                    {activeTab === "chat" && (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="multi_agent_lounge">
                        {/* Sidebar panel for Agent Selection */}
                        <div className="lg:col-span-1 flex flex-col gap-3" id="agent_selector_sidebar">
                          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Professional Agents</span>

                            {/* List of Agents */}
                            {[
                              {
                                id: "coach",
                                name: "Coach Core",
                                title: "General Tech Advisor",
                                desc: "Overall syllabus strategy, curriculum advice & goal setting.",
                                icon: "GraduationCap",
                                badge: "CORE"
                              },
                              {
                                id: "explainer",
                                name: "Socrates AI",
                                title: "Concept Explainer",
                                desc: "Simplifies complex terms, frameworks & algorithms under metaphors.",
                                icon: "Brain",
                                badge: "EXPERT"
                              },
                              {
                                id: "interviewer",
                                name: "Recruiter Rex",
                                title: "Mock HR Screener",
                                desc: "Realistic, graded developer interview simulation questions.",
                                icon: "Users2",
                                badge: "MOCK TEST"
                              },
                              {
                                id: "strategist",
                                name: "Coach Chelsea",
                                title: "Portfolio Strategy",
                                desc: "Custom GitHub portfolio builds & ATS resume descriptions.",
                                icon: "TrendingUp",
                                badge: "STRATEGY"
                              }
                            ].map((agent) => {
                              const isCurrent = selectedAgent === agent.id;
                              return (
                                <button
                                  key={agent.id}
                                  onClick={() => setSelectedAgent(agent.id)}
                                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${isCurrent
                                    ? "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-600/5 ring-1 ring-indigo-500"
                                    : "bg-slate-950/25 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40"
                                    }`}
                                >
                                  <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${isCurrent ? "text-indigo-400" : "text-slate-400"}`}>
                                    <Icon name={agent.icon} className="h-4.5 w-4.5" />
                                  </div>
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-xs font-bold text-white truncate">{agent.name}</span>
                                      <span className={`text-[7px] font-extrabold font-mono px-1 rounded truncate border border-indigo-500/10 ${agent.id === "coach" ? "bg-indigo-500/10 text-indigo-400" :
                                        agent.id === "explainer" ? "bg-emerald-500/10 text-emerald-400" :
                                          agent.id === "interviewer" ? "bg-amber-500/10 text-amber-400" :
                                            "bg-rose-500/10 text-rose-400"
                                        }`}>{agent.badge}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-300 font-semibold truncate leading-none">{agent.title}</p>
                                    <p className="text-[9px] text-slate-500 leading-tight mt-1 line-clamp-2">{agent.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Interactive Widget to help understand tech terms */}
                          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-2 text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                              <Lucide.Sparkles className="h-3 w-3 text-indigo-400" />
                              <span>Socratic Dictionary</span>
                            </span>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Need complex jargon/tools simplified instantly? Enter below:
                            </p>
                            <div className="flex gap-1.5 pt-1">
                              <input
                                type="text"
                                id="quick_term_query"
                                placeholder="e.g. CSRF, Docker, TCP..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-indigo-500 placeholder:text-slate-650"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.target.value.trim()) {
                                    const term = e.target.value.trim();
                                    setSelectedAgent("explainer");
                                    setChatInput(`Please explain "${term}" beautifully using Socrates' metaphored analogies!`);
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const el = document.getElementById("quick_term_query");
                                  if (el && el.value.trim()) {
                                    const term = el.value.trim();
                                    setSelectedAgent("explainer");
                                    setChatInput(`Please explain "${term}" beautifully using Socrates' metaphored analogies!`);
                                    el.value = "";
                                  }
                                }}
                                className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white rounded px-2.5 py-1 text-[10px] font-bold"
                              >
                                Go
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Main chat window workspace */}
                        <div className="lg:col-span-3 flex flex-col h-[560px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden" id="assistant_panel">
                          {/* Sub-header status dashboard */}
                          <div className="px-5 py-3 border-b border-slate-900 flex items-center justify-between text-[11px] font-mono bg-slate-950/40">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-slate-400">Gemini-3.5-Flash Active</span>
                            </div>
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="text-slate-500">ACTIVE SPECIALIST:</span>
                              <span className="font-bold text-indigo-400">
                                {selectedAgent === "coach" ? "Coach Core" : selectedAgent === "explainer" ? "Socrates AI" : selectedAgent === "interviewer" ? "Recruiter Rex" : "Coach Chelsea"}
                              </span>
                            </span>
                            <span className="text-slate-500 hidden md:inline truncate max-w-[150px]">
                              ROLE: {(selectedRole?.career_name || "").toUpperCase()}
                            </span>
                          </div>

                          {/* Conversation log stream */}
                          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs md:text-sm" id="chat_messages_viewport">
                            {(agentChats[selectedAgent] || []).map((msg, index) => {
                              const isUser = msg.sender === "user";
                              return (
                                <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 border ${isUser
                                    ? "bg-indigo-600 border-indigo-500 text-white rounded-br-none shadow-md shadow-indigo-600/10"
                                    : "bg-slate-900/90 border-slate-800 text-slate-100 rounded-bl-none"
                                    }`}>
                                    <div className="space-y-1">
                                      {/* Sender header tag */}
                                      <span className="block text-[9px] uppercase font-mono tracking-wider font-bold opacity-60">
                                        {isUser ? "You" : selectedAgent === "coach" ? "AI Career Mentor" : selectedAgent === "explainer" ? "Socrates Explainer" : selectedAgent === "interviewer" ? "Recruiter Rex" : "Coach Chelsea"}
                                      </span>
                                      {/* Rendering text with bullet styling & codeblocks manually for premium rendering */}
                                      <div className="leading-relaxed whitespace-pre-line font-sans prose prose-invert max-w-none text-xs md:text-sm">
                                        {msg.text}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {chatLoading && (
                              <div className="flex justify-start">
                                <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                  <span className="text-xs italic pl-1 font-mono">
                                    {selectedAgent === "explainer" ? "Formulating simple explanation..." : selectedAgent === "interviewer" ? "Rex is grading your answers..." : "Formulating strategic career advice..."}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div ref={chatBottomRef} />
                          </div>

                          {/* Dynamic contextual suggestions panel depending on the selected Agent Mode */}
                          <div className="px-5 py-2.5 border-t border-slate-900 flex flex-wrap gap-2 bg-slate-950/20" id="prompt_suggestions">
                            {(selectedAgent === "coach"
                              ? [
                                "What core frameworks are absolute standard values?",
                                "Construct some free course references.",
                                "Tell me high-level skills for this path."
                              ]
                              : selectedAgent === "explainer"
                                ? [
                                  "Explain Client vs Server components in Web apps.",
                                  "Explain Docker containers using standard metaphors.",
                                  "Explain what an API endpoint is."
                                ]
                                : selectedAgent === "interviewer"
                                  ? [
                                    "I am ready! Let's test standard career questions.",
                                    "Rex, give me a mock tech coding problem.",
                                    "Rex, test my database schema understanding."
                                  ]
                                  : [
                                    "ATS-optimized keywords for this targeted track.",
                                    "Suggest 2 high-level custom project ideas.",
                                    "How do I describe self-taught skills to recruiters?"
                                  ]
                            ).map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => {
                                  setChatInput(suggestion);
                                }}
                                className="bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 border border-slate-800 text-[10px] md:text-sm py-1 px-2.5 rounded-lg transition-all cursor-pointer font-medium"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>

                          {/* Messaging input elements */}
                          <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-900 flex gap-2" id="chat_form">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder={
                                selectedAgent === "coach"
                                  ? "Ask Coach Core about structural roadmap timelines..."
                                  : selectedAgent === "explainer"
                                    ? "Type any confusing framework, keyword, pattern, code..."
                                    : selectedAgent === "interviewer"
                                      ? "Rex is waiting for your mock interview answer..."
                                      : "Say something about resume design, github portfolios, ATS..."
                              }
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs md:text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                              id="chat_input_field"
                            />
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-5 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                              id="send_message_btn"
                            >
                              <Lucide.Send className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER STATS SECTION */}
      <footer className="border-t border-slate-850 bg-slate-950/50 py-6 px-6 text-center text-xs text-slate-500 print:hidden" id="platform_footer">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Career Guidance & Assessments Portal. Created using secure sandboxed interfaces.</p>
          <div className="flex gap-4 font-mono">
            <span>Server Ingress Route: port 3000</span>
            <span>● Sync Stable</span>
          </div>
        </div>
      </footer>

      {/* QUIZ PORTAL DIALOG modal ("I don't know my skills") */}
      <AnimatePresence>
        {quizOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all print:hidden" id="quiz_dialog_viewport">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl overflow-hidden"
              id="quiz_dialog_panel"
            >
              {/* Top gradient strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />

              {/* Close Button */}
              <button
                onClick={() => setQuizOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg"
              >
                <Lucide.X className="h-5 w-5" />
              </button>

              {quizIndex < quizQuestions.length ? (
                // ACTIVE SURVEY QUESTION VIEW
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                      <Lucide.HelpCircle className="h-4 w-4" />
                      <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                      {quizQuestions[quizIndex].q}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-2">
                    {quizQuestions[quizIndex].options.map((opt, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleQuizAnswer(opt.skills)}
                        className="w-full text-left bg-slate-950/60 border border-slate-800 hover:border-indigo-600 hover:bg-slate-950 rounded-xl p-4 transition-all text-sm text-slate-300 font-medium hover:text-white cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Progress dot items indicator */}
                  <div className="flex items-center gap-1.5 justify-center pt-2">
                    {quizQuestions.map((_, dotIndex) => (
                      <div
                        key={dotIndex}
                        className={`h-1.5 rounded-full transition-all ${dotIndex === quizIndex ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-800"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                // APTITUDE SUMMARY RECOMMENDATIONS RESULTS VIEW
                <div className="space-y-5 text-center">
                  <div className="mx-auto h-12 w-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                    <Lucide.Sparkles className="h-6 w-6 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight">Assessment Synthesized!</h3>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Cognitive Profile Generated</p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-5 text-left text-sm text-slate-300 whitespace-pre-line leading-relaxed shadow-inner">
                    {quizRecommendationText}
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setQuizOpen(false)}
                      className="cursor-pointer bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-black/10 text-sm"
                    >
                      Apply Recommended Skills
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sleek CSS optimization stylesheet overlay for physical system printing layout */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #main_wrapper {
            background-color: white !important;
            color: black !important;
            min-height: auto !important;
          }
          #platform_header, #platform_footer, .print\\:hidden, #workspace_tab_bar, #chat_form, #prompt_suggestions {
            display: none !important;
          }
          #core_workflow_viewport {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #roadmap_workspace, #roadmap_timeline, #roadmap_profile_header {
            border: none !important;
            background: transparent !important;
            color: black !important;
            padding: 0 !important;
          }
          h2, h3, h4 {
            color: black !important;
          }
          p, span {
            color: #374151 !important;
          }
          .timeline-dot {
            display: none !important;
          }
          .border, .border-l {
            border-color: #d1d5db !important;
          }
          .bg-slate-950, .bg-slate-950\\/80, .bg-slate-905\\/70, .bg-slate-900 {
            background-color: #f9fafb !important;
            border-color: #e5e7eb !important;
            color: black !important;
          }
          .text-white {
            color: black !important;
          }
          .text-slate-400, .text-slate-500 {
            color: #4b5563 !important;
          }
          input, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
