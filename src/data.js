// Dataset for Career Guidance
// Using standard Javascript definitions inside a .ts file for seamless build compatibility without complex TS types.

export const DEPARTMENTS = [
  {
    id: "cse",
    name: "Computer Science & Engineering",
    icon: "Cpu",
    description: "Software engineering, artificial intelligence, cloud architectures, cybersecurity, and web development.",
    skills: [
      "React & Frontend Framworks",
      "Node.js & Backend APIs",
      "Python & Scripting",
      "TypeScript & JavaScript",
      "PostgreSQL & Databases",
      "Docker & Kubernetes",
      "AWS & Cloud Computing",
      "Machine Learning & TensorFlow",
      "Data Structures & Algorithms",
      "Cybersecurity Tools & Pen-Testing",
      "DevOps & CI/CD",
      "Mobile Dev (Swift/Kotlin)",
      "Git & Collaborative Workflows"
    ]
  },
  {
    id: "ece",
    name: "Electronics & Communication",
    icon: "Radio",
    description: "Embedded microcontrollers, Internet of Things (IoT), circuit design, VLSI circuitry, and telecommunication networks.",
    skills: [
      "Arduino & Prototyping",
      "C & C++ Programming",
      "Embedded C Programming",
      "Raspberry Pi & Single Board Computers",
      "Verilog & VHDL",
      "VLSI & Semiconductor Design",
      "MATLAB & Signal Processing",
      "Network Protocols & Architecture",
      "Internet of Things (IoT) Systems",
      "Circuit Simulation (SPICE)",
      "FPGA Programming",
      "PCB Designing & Fabrication"
    ]
  },
  {
    id: "mech",
    name: "Mechanical & Aerospace Engineering",
    icon: "Wrench",
    description: "CAD modeling, material strength, aerodynamics, robotics hydraulics, and thermal & structural simulations.",
    skills: [
      "AutoCAD & 2D Drafting",
      "SolidWorks & 3D CAD Modeling",
      "Fusion 360",
      "Finite Element Analysis (FEA)",
      "Computational Fluid Dynamics (CFD)",
      "Thermodynamics & Heat Transfer",
      "CNC Programming & Manufacturing",
      "Robotics Kinematics",
      "3D Printing & Rapid Prototyping",
      "Geometric Dimensioning & Tolerancing (GD&T)",
      "Ansys Simulation Suite"
    ]
  },
  {
    id: "business",
    name: "Business Administration & Marketing",
    icon: "TrendingUp",
    description: "Strategic project planning, financial accounting, product design, agility frameworks, and performance marketing.",
    skills: [
      "Google Analytics & SEO",
      "Financial Modeling & Forecasting",
      "Agile & Scrum Project Planning",
      "Product Management & UX Strategy",
      "Brand Lifecycle Design",
      "Advanced Excel Data Modeling",
      "Market Research & Competitor Analysis",
      "Copywriting & Content Strategy",
      "CRM Platforms (Salesforce)",
      "Presentation & Public Speaking",
      "Paid Ads (Google, Meta)"
    ]
  },
  {
    id: "arts",
    name: "Creative Arts, Storytelling & Design",
    icon: "Palette",
    description: "Visual design interfaces, video and graphic editing, branding design, creative journalism, and copy strategy.",
    skills: [
      "Figma UI/UX Prototyping",
      "Adobe Photoshop & Illustrator",
      "Storyboarding & Visual Arts",
      "Creative Copywriting & Editing",
      "Video Editing (Premiere, Resolve)",
      "UX Research & Persona Blueprinting",
      "Typography & Visual Identity",
      "Motion Graphics (After Effects)",
      "Brand Strategy & Communication",
      "Layout & Editorial Design"
    ]
  }
];

export const INTERESTS = [
  {
    id: "design",
    name: "Designing User Experiences & Visual Aesthetics",
    icon: "Paintbrush",
    description: "You love styling layout architectures, creating balanced wireframes, picking typography pairings, and designing screens."
  },
  {
    id: "logic",
    name: "Developing Algorithms, Complex Coding & Backends",
    icon: "GitBranch",
    description: "You get thrilled by databases, scalable server architectures, complex state flows, and solving logical problems."
  },
  {
    id: "analytics",
    name: "Analyzing Big Data, Visualizing Stats & Trends",
    icon: "BarChart3",
    description: "You love creating charts, inspecting data anomalies, and extracting hidden trends from numeric systems."
  },
  {
    id: "hardware",
    name: "Building Boards, IoT, robotics & physical electronics",
    icon: "Component",
    description: "You like circuits, physical sensory widgets, soldering chipsets, and combining microcomputers with mechanical gears."
  },
  {
    id: "business_strategy",
    name: "Scaling business ventures, strategy & product launches",
    icon: "Briefcase",
    description: "You love pitch decks, customer growth metrics, strategic pricing, organizing agile sprints, and managing teams."
  },
  {
    id: "writing_story",
    name: "Drafting copies, making content portfolios & screenplays",
    icon: "PenTool",
    description: "You enjoy writing articles, creating media scripts, structuring marketing copies, and presenting brand arguments."
  },
  {
    id: "physics_mech",
    name: "Assembling solid hardware, blueprints & engine structures",
    icon: "Milestone",
    description: "You like 3D physics modeling, visualizing physical structural stress, understanding engine rotations, and aerospace machinery."
  }
];

// Fallback suggestions mapping in case of connection limits or offline state.
export const STANDARD_RECS = {
  cse: [
    {
      role: "Full Stack Engineer",
      match: 94,
      salary: "$110,000 - $160,000",
      demand: "Very High",
      difficulty: "Medium",
      why: "Matches your analytical mindset plus your mix of logic and functional UI styling.",
      techStack: "React, Node.js, PostgreSQL, TypeScript, cloud setups.",
      roadmap: [
        {
          title: "Foundations & Front-end Essentials",
          description: "Master modern semantic UI, standard JavaScript design patterns, and responsive layout styling with Tailwind.",
          resources: "Mozilla Developer Network, freeCodeCamp Front-End Course.",
          projects: ["Dynamic Profile Card", "Highly Interactive Financial Dashboard", "Fully Responsive Admin Workspace"]
        },
        {
          title: "Back-end Architectures & Databases",
          description: "Explore RESTful APIs, relational databases, schema normalization, and modular server controllers.",
          resources: "Express JS Documentation, Node.js Design Patterns.",
          projects: ["Secure Task API", "Multipurpose Storage Server", "Comprehensive Ecommerce DB Schema"]
        },
        {
          title: "Infrastructure & Orchestration",
          description: "Containerize servers, design persistent volumes, and set up continuous integration pipelines.",
          resources: "Docker Deep Dive, GitHub Actions Guide.",
          projects: ["Multi-container Application Deployment", "Automated Testing Pipeline"]
        },
        {
          title: "Portfolio Branding & Professional Launch",
          description: "Deploy production targets, build dynamic resume portfolios, and practice core design algorithms.",
          resources: "Frontend Mentor, Tech Interview Handbook.",
          projects: ["Production Interactive Career Guidance App"]
        }
      ]
    },
    {
      role: "AI & Machine Learning Engineer",
      match: 88,
      salary: "$130,000 - $185,000",
      demand: "Extreme",
      difficulty: "High",
      why: "Matches your logical mindset and passion for analyzing complex numerical patterns.",
      techStack: "Python, TensorFlow, PyTorch, pandas, Scikit-Learn, Jupyter.",
      roadmap: [
        {
          title: "Mathematical Core & Python Essentials",
          description: "Dive deep into linear algebra, statistics, differential calculus, and professional Python scripts.",
          resources: "MIT Mathematics for Computer Science, Python for Data Analysis.",
          projects: ["Statistical Formula Solver", "Interactive Probability Calculator"]
        },
        {
          title: "Supervised & Unsupervised Algorithms",
          description: "Write linear regression model structures, decision trees, and cluster segmentation algorithms from scratch.",
          resources: "Coursera Machine Learning by Andrew Ng.",
          projects: ["Housing Price Forecaster", "Customer Cluster Visualizer"]
        },
        {
          title: "Neural Networks & Generative models",
          description: "Implement convolutional nets, Transformers, and construct prompt engineering wrappers.",
          resources: "PyTorch Official Tutorials, HuggingFace Course.",
          projects: ["Custom Text Generation Agent", "Convolutional Image Classifier"]
        },
        {
          title: "AI Production & API Deployment",
          description: "Expose trained weights via high-performance microservices and optimize inference pipelines.",
          resources: "FastAPI Documentation, AWS SageMaker Guide.",
          projects: ["High-Throughput Prediction Gateway"]
        }
      ]
    }
  ],
  ece: [
    {
      role: "IoT Systems Architect",
      match: 92,
      salary: "$105,000 - $145,000",
      demand: "High",
      difficulty: "High",
      why: "Your department and electronics prototyping interests make you ideal for sensor and microcontroller nodes.",
      techStack: "C, Embedded Platforms, MQTT, Raspberry Pi, ESP32, Python.",
      roadmap: [
        {
          title: "Microcontroller Basics & Bare-Metal C",
          description: "Learn clock system timers, standard registers, hardware interrupts, and custom assembly structures.",
          resources: "Embedded Systems on ARM Cortex-M Course on EdX.",
          projects: ["Interrupt-Driven Timer Alarm", "Bare-Metal GPIO Controller"]
        },
        {
          title: "Sensors & Mesh Communication Protocols",
          description: "Connect SPI/I2C temperature, humidity, and location sensor components. Send telemetry packets via MQTT.",
          resources: "MQTT Essentials, SparkFun Electronics Academy.",
          projects: ["Smart Climate Logging Station", "Universal I2C Sensor Scanner"]
        },
        {
          title: "IoT Edge Gateways & Cloud Dashboards",
          description: "Bridge low-energy sensor signals into high-performance web analytics using single-board microcomputers.",
          resources: "Raspberry Pi Foundation Guides, Adafruit IO Tutorials.",
          projects: ["Real-time Fleet Sensor Hub", "Live Remote Telemetry Dashboard"]
        }
      ]
    }
  ],
  mech: [
    {
      role: "Robotics Design Engineer",
      match: 90,
      salary: "$112,000 - $155,000",
      demand: "High",
      difficulty: "High",
      why: "Perfect bridge between physical structures, mechanical CAD blueprints, and sensor controllers.",
      techStack: "SolidWorks, ROS (Robot Operating System), Python, C++, Kinematics.",
      roadmap: [
        {
          title: "Aesthetic Core CAD & Solid Geometry Modeling",
          description: "Master parametric sketching, assembly constraints, geometric tolerances, and manufacturing workflows.",
          resources: "SolidWorks Training Catalog, Fusion 360 Tutorial.",
          projects: ["Complex Planetary Gearbox Assembly", "Ergonomic Robotic Gripper CAD"]
        },
        {
          title: "Material Stresses & Structural Simulation",
          description: "Verify mechanical strain distribution, thermal dissipation, and modal vibrations across assemblies.",
          resources: "Ansys Structural Basics, EdX Engineering Mechanics.",
          projects: ["Chassis Structural Load Simulator", "Heat Sync Thermal Distribution Plot"]
        },
        {
          title: "Kinematic Systems & Controller Programming",
          description: "Program sensor behaviors, actuator positions, and write rigid body forward model controllers.",
          resources: "Introduction to ROS (Robot Operating System).",
          projects: ["3-Axis Arm Movement Controller", "Autonomous Path-Following Simulation"]
        }
      ]
    }
  ],
  business: [
    {
      role: "Tech Product Manager",
      match: 95,
      salary: "$115,000 - $165,000",
      demand: "Very High",
      difficulty: "Medium",
      why: "Your combination of business logic, agility planning, and communication skills is exactly what software PMs need.",
      techStack: "Agile, Figma, Jira, Google Analytics, Market Analysis.",
      roadmap: [
        {
          title: "Core UX Concepts & Feature Wireframing",
          description: "Learn how to build user profiles, conduct field user studies, and draft functional screens.",
          resources: "Nielsen Norman Group UX Reports, Product School PM Resources.",
          projects: ["New Social Media App Feature Blueprint", "Interactive Landing Page Spec"]
        },
        {
          title: "Agile Project Execution & Telemetry Stats",
          description: "Structure epic backlogs, specify ticket specs, organize sprint teams, and design telemetry KPIs.",
          resources: "Atlassian Scrum & Kanban Handbooks.",
          projects: ["Product Requirement Document (PRD) with Metrics Checklist", "Sprint Planning Board Design"]
        },
        {
          title: "Go-to-market Strategy & Growth Funnels",
          description: "Draft comprehensive viral loops, calculate user conversion rates, and organize launch events.",
          resources: "Reforge Growth Series, Lean Startup Methodology.",
          projects: ["Viral Acquisition Campaign Blueprint", "Complete Market Positioning Slide Deck"]
        }
      ]
    }
  ],
  arts: [
    {
      role: "Digital Brand Strategist",
      match: 94,
      salary: "$85,000 - $125,000",
      demand: "High",
      difficulty: "Medium",
      why: "Your talent for storytelling, aesthetic hierarchy, and copy alignment is ideal for shaping digital brand systems.",
      techStack: "Figma, Adobe Creative Suite, Copywriting, Marketing Analytics.",
      roadmap: [
        {
          title: "Aesthetics, Visual Principles & Layout Styling",
          description: "Understand layout golden ratios, grid hierarchies, typography hierarchy, and emotional color palettes.",
          resources: "Adobe Design Circle, Creative Review Guides.",
          projects: ["Modern Print Magazine Spreads", "Interactive Typography Spec Guide"]
        },
        {
          title: "Copywriting Frameworks & Conversational Branding",
          description: "Learn hooks, conversion copies, and creating consistent brand communication guides.",
          resources: "Copyblogger Copywriting Essentials, Ogilvy on Advertising.",
          projects: ["Complete Content Campaign Portfolio", "Brand Tone & Style Guide Blueprint"]
        },
        {
          title: "Professional Digital Campaigns & Visual Audits",
          description: "Design cross-channel visual assets, build portfolio showcases, and measure audience reach.",
          resources: "Google Digital Marketing Garage.",
          projects: ["High-Conversion Startup Brand Identity System"]
        }
      ]
    }
  ]
};
