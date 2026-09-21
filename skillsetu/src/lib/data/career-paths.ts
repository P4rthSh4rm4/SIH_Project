import {
  Compass, Map, Zap, BrainCircuit, ShieldAlert,
  Smartphone, Cloud, Palette, Blocks,
  Star, Briefcase, Award, Shield
} from "lucide-react";

export const CAREER_PATHS = [
  {
    id: "fullstack",
    title: "Full-Stack Engineer",
    description: "Build end-to-end web applications, from responsive UIs to scalable backends.",
    icon: Compass,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    salary: "₹8L - ₹25L",
    demand: "High",
    requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
    phases: [
      {
        title: "Frontend Fundamentals",
        program_id: "89cd3d5a-9a27-4254-9b75-60cb5798ac36",
        description: "Master the building blocks of the web and DOM manipulation.",
        completed: true,
        skills: ["HTML5", "CSS3", "JavaScript", "Web APIs"],
      },
      {
        title: "Modern Frontend Frameworks",
        program_id: "dcab13b6-9d6c-4d0e-9169-7036bc416975",
        description: "Build interactive UIs with React and Next.js, managing complex states.",
        completed: true,
        skills: ["React", "Next.js", "Redux", "Tailwind CSS"],
      },
      {
        title: "Backend Development",
        program_id: "b41c6f07-2cfe-4680-8cb7-71903670993a",
        description: "Develop robust server-side logic and RESTful architectures.",
        completed: false,
        skills: ["Node.js", "Express", "REST API", "GraphQL"],
      },
      {
        title: "Databases & Architecture",
        program_id: "8e517198-0901-4e7d-b7f5-f0c847ea32fa",
        description: "Design efficient schemas and understand scalable system design.",
        completed: false,
        skills: ["PostgreSQL", "MongoDB", "Redis", "System Design"],
      },
      {
        title: "Deployment & DevOps",
        program_id: "f14978b6-a4ea-4fc5-b4f2-9b8085478a87",
        description: "Containerize applications and set up automated deployment pipelines.",
        completed: false,
        skills: ["Docker", "AWS", "CI/CD", "Vercel"],
      },
      {
        title: "Advanced Engineering",
        program_id: "d624b825-84c1-4a18-83c5-c0a6500a8cfe",
        description: "Master real-time communication and microservice architectures.",
        completed: false,
        skills: ["WebSockets", "Microservices", "Kafka", "Performance Optimization"],
      },
    ],
  },
  {
    id: "data_science",
    title: "Data Scientist",
    description: "Extract insights from data, build ML models, and drive data-informed decisions.",
    icon: Map,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    salary: "₹10L - ₹30L",
    demand: "Very High",
    requiredSkills: ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization"],
    phases: [
      {
        title: "Programming & Math",
        program_id: "2089271c-d783-442f-8586-618958fe6be0",
        description: "Strong foundation in programming and mathematical concepts.",
        completed: false,
        skills: ["Python", "Linear Algebra", "Statistics", "Calculus"],
      },
      {
        title: "Data Manipulation",
        program_id: "66b7d0b6-9eb8-4a7f-9a8c-d3288f985982",
        description: "Clean, transform, and analyze datasets efficiently.",
        completed: false,
        skills: ["Pandas", "NumPy", "SQL", "Data Cleaning"],
      },
      {
        title: "Data Visualization",
        program_id: "315c81eb-c2a0-40d2-b716-5067dde59176",
        description: "Create compelling dashboards and visual narratives.",
        completed: false,
        skills: ["Matplotlib", "Seaborn", "Tableau", "PowerBI"],
      },
      {
        title: "Machine Learning",
        program_id: "8dae7e41-6b20-4689-ad42-80e12af353fc",
        description: "Train predictive models and evaluate their performance.",
        completed: false,
        skills: ["Scikit-Learn", "Regression", "Classification", "XGBoost"],
      },
      {
        title: "Deep Learning (Advanced)",
        program_id: "7a340fc5-6be3-41c7-bc5c-7b4ce7b0d89f",
        description: "Build neural networks for complex pattern recognition.",
        completed: false,
        skills: ["TensorFlow", "PyTorch", "NLP", "Computer Vision"],
      },
      {
        title: "Model Deployment (MLOps)",
        program_id: "fa590488-247e-489e-8c35-4285ddcdb4c8",
        description: "Deploy machine learning models into production environments.",
        completed: false,
        skills: ["MLflow", "FastAPI", "Docker", "Model Monitoring"],
      },
    ],
  },
  {
    id: "devops",
    title: "DevOps Engineer",
    description: "Automate infrastructure, CI/CD pipelines, and ensure system reliability.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    salary: "₹10L - ₹28L",
    demand: "High",
    requiredSkills: ["Linux", "Git", "Docker", "Kubernetes", "AWS", "Terraform"],
    phases: [
      {
        title: "OS & Networking",
        program_id: "1c694924-390c-4c52-8982-86d7d989a4ed",
        description: "Master operating systems administration and network protocols.",
        completed: false,
        skills: ["Linux Admin", "Bash Scripting", "TCP/IP", "DNS"],
      },
      {
        title: "Version Control & CI/CD",
        program_id: "65f3df05-6001-480b-8935-2f27c9b2a42a",
        description: "Manage source code and automate testing and deployments.",
        completed: false,
        skills: ["Git", "GitHub Actions", "Jenkins", "GitLab CI"],
      },
      {
        title: "Containerization",
        program_id: "5426c48b-2e22-4ad8-b476-e9d95673068e",
        description: "Package applications with dependencies into portable containers.",
        completed: false,
        skills: ["Docker", "Docker Compose", "Container Registry"],
      },
      {
        title: "Infrastructure as Code",
        program_id: "eb1377ae-9ced-40ba-b8c7-eef12359f3ea",
        description: "Provision and manage infrastructure programmatically.",
        completed: false,
        skills: ["Terraform", "Ansible", "CloudFormation"],
      },
      {
        title: "Container Orchestration",
        program_id: "b951daa4-1dde-4047-9ba9-3f4ea658beff",
        description: "Manage large clusters of containers efficiently.",
        completed: false,
        skills: ["Kubernetes", "Helm", "Istio", "EKS/GKE"],
      },
      {
        title: "Monitoring & Observability",
        program_id: "3668682a-d460-40bf-b87f-2353ce6e40e8",
        description: "Track system health, logs, and performance metrics.",
        completed: false,
        skills: ["Prometheus", "Grafana", "ELK Stack", "Datadog"],
      },
    ],
  },
  {
    id: "ai_engineer",
    title: "AI Engineer",
    description: "Build and integrate generative AI models, LLMs, and intelligent agents into products.",
    icon: BrainCircuit,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    salary: "₹15L - ₹40L",
    demand: "Very High",
    requiredSkills: ["Python", "PyTorch", "LLMs", "LangChain", "Vector DBs"],
    phases: [
      {
        title: "Foundations of AI",
        description: "Understand neural networks, transformers, and the basics of generative AI.",
        completed: false,
        skills: ["Transformers", "Attention Mechanism", "Embeddings"],
      },
      {
        title: "Working with APIs & Models",
        description: "Integrate APIs from OpenAI, Anthropic, or open-source HuggingFace models.",
        completed: false,
        skills: ["OpenAI API", "HuggingFace", "Prompt Engineering"],
      },
      {
        title: "RAG & Vector Databases",
        description: "Build Retrieval-Augmented Generation systems for private data.",
        completed: false,
        skills: ["Pinecone", "ChromaDB", "LangChain", "LlamaIndex"],
      },
      {
        title: "Fine-Tuning & Deployment",
        description: "Fine-tune models on custom datasets and serve them efficiently.",
        completed: false,
        skills: ["LoRA", "QLoRA", "vLLM", "Ollama"],
      },
    ]
  },
  {
    id: "cyber_security",
    title: "Cyber Security Analyst",
    description: "Protect systems and networks from cyber threats and vulnerabilities.",
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10",
    salary: "₹8L - ₹22L",
    demand: "High",
    requiredSkills: ["Networking", "Linux", "Ethical Hacking", "SIEM", "Cryptography"],
    phases: [
      {
        title: "Network Fundamentals",
        description: "Understand TCP/IP, routing, and network packet analysis.",
        completed: false,
        skills: ["Wireshark", "TCP/IP", "Nmap"],
      },
      {
        title: "System Security & Hardening",
        description: "Secure operating systems and identify misconfigurations.",
        completed: false,
        skills: ["Linux Security", "Windows Active Directory", "IAM"],
      },
      {
        title: "Vulnerability Management",
        description: "Scan, assess, and patch vulnerabilities in systems and applications.",
        completed: false,
        skills: ["Nessus", "Burp Suite", "OWASP Top 10"],
      },
      {
        title: "Incident Response",
        description: "Detect, analyze, and respond to active security incidents.",
        completed: false,
        skills: ["Splunk", "SIEM", "Digital Forensics"],
      },
    ]
  },
  {
    id: "mobile_dev",
    title: "Mobile App Developer",
    description: "Build native or cross-platform mobile applications for iOS and Android.",
    icon: Smartphone,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    salary: "₹6L - ₹20L",
    demand: "Medium",
    requiredSkills: ["React Native", "Flutter", "Swift", "Kotlin", "Mobile UI"],
    phases: [
      {
        title: "Mobile UX & Fundamentals",
        description: "Learn mobile design patterns and basic application lifecycle.",
        completed: false,
        skills: ["Figma", "UI/UX", "Mobile Patterns"],
      },
      {
        title: "Cross-Platform Frameworks",
        description: "Build apps that run on both iOS and Android using a single codebase.",
        completed: false,
        skills: ["React Native", "Flutter", "Dart"],
      },
      {
        title: "State Management & APIs",
        description: "Connect to backends and manage complex application state.",
        completed: false,
        skills: ["Redux", "REST APIs", "GraphQL"],
      },
      {
        title: "Native Modules & Deployment",
        description: "Interact with device hardware and publish to app stores.",
        completed: false,
        skills: ["App Store Connect", "Google Play Console", "Native Code (Swift/Kotlin)"],
      },
    ]
  },
  {
    id: "ui_ux",
    title: "UI/UX Designer",
    description: "Design intuitive, engaging, and accessible user experiences for digital products.",
    icon: Palette,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    salary: "₹7L - ₹18L",
    demand: "High",
    requiredSkills: ["Figma", "Prototyping", "User Research", "Wireframing", "Interaction Design"],
    phases: [
      {
        title: "Design Principles",
        description: "Master color theory, typography, spacing, and layout.",
        completed: false,
        skills: ["Color Theory", "Typography", "Grid Systems"],
      },
      {
        title: "User Research & Empathy",
        description: "Understand user needs through interviews, surveys, and personas.",
        completed: false,
        skills: ["User Interviews", "Personas", "Journey Mapping"],
      },
      {
        title: "Wireframing & Prototyping",
        description: "Create low and high-fidelity prototypes using modern design tools.",
        completed: false,
        skills: ["Figma", "Adobe XD", "Interactive Prototyping"],
      },
      {
        title: "Design Systems",
        description: "Build scalable, reusable component libraries.",
        completed: false,
        skills: ["Component Variants", "Auto Layout", "Design Tokens"],
      }
    ]
  }
];
export const AYURVEDA_CAREER_PATHS = [
  {
    id: "ayurveda_clinical",
    title: "Clinical Practitioner (Ayurveda)",
    description: "Diagnose and manage patients using Ayurvedic principles, clinical knowledge, lifestyle guidance, and appropriate therapies.",
    icon: Compass,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    salary: "₹5L - ₹15L",
    demand: "High",
    requiredSkills: ["Clinical Knowledge", "Patient Assessment", "Ayurveda Fundamentals", "Clinical Reasoning", "Patient Communication", "Documentation"],
    phases: [
      {
        title: "Ayurveda Clinical Foundations",
        program_id: "ayur-clin-101",
        description: "Master the core concepts of Doshas, Dhatus, and Malas.",
        completed: false,
        skills: ["Clinical Knowledge", "Ayurveda Fundamentals", "Roga Nidan", "Patient Assessment"],
      },
      {
        title: "Clinical Practice",
        program_id: "ayur-clin-201",
        description: "Learn advanced diagnostic techniques and case taking.",
        completed: false,
        skills: ["Case Taking", "Clinical Reasoning", "Treatment Planning", "Patient Communication"],
      },
      {
        title: "Professional Practice",
        program_id: "ayur-clin-301",
        description: "Develop professional ethics and patient counseling skills.",
        completed: false,
        skills: ["Clinical Documentation", "Patient Counselling", "Ethical Practice", "Healthcare Communication"],
      },
      {
        title: "Career Readiness",
        program_id: "ayur-clin-401",
        description: "Prepare for internships and professional practice.",
        completed: false,
        skills: ["Internship/Clinical Experience", "Resume", "Interview Preparation", "Professional Development"],
      }
    ],
  },
  {
    id: "ayurvedic_pharma",
    title: "Ayurvedic Pharma Specialist",
    description: "Work with Ayurvedic formulations, quality processes, manufacturing, documentation, and pharmaceutical practices.",
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    salary: "₹6L - ₹18L",
    demand: "Medium",
    requiredSkills: ["Ayurvedic Formulation", "Quality Control", "Pharmaceutical Processes", "Documentation", "Medicinal Plants", "Research"],
    phases: [
      {
        title: "Formulation Basics",
        program_id: "ayur-pharm-101",
        description: "Understand the preparation of classical and proprietary formulations.",
        completed: false,
        skills: ["Ayurvedic Formulation", "Herbal Extraction", "Formulation Design"],
      },
      {
        title: "Quality & Process Management",
        program_id: "ayur-pharm-201",
        description: "Learn GMP standards and quality testing for Ayurvedic drugs.",
        completed: false,
        skills: ["Quality Control", "Pharmaceutical Processes", "GMP", "Safety Testing"],
      }
    ]
  },
  {
    id: "ayurveda_researcher",
    title: "Ayurveda Researcher",
    description: "Work on Ayurvedic clinical, drug, pre-clinical, or fundamental research and evidence-based documentation.",
    icon: Map,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    salary: "₹7L - ₹20L",
    demand: "High",
    requiredSkills: ["Research Methodology", "Clinical Research", "Data Interpretation", "Scientific Documentation", "Evidence-Based Practice", "Ayurveda Research"],
    phases: [
      {
        title: "Research Fundamentals",
        program_id: "ayur-res-101",
        description: "Introduction to research methodologies in Ayurveda.",
        completed: false,
        skills: ["Research Methodology", "Literature Review", "Study Design"],
      },
      {
        title: "Clinical Trials & Documentation",
        program_id: "ayur-res-201",
        description: "Execute clinical research and maintain evidence-based documentation.",
        completed: false,
        skills: ["Clinical Research", "Scientific Documentation", "Data Interpretation", "Evidence-Based Practice"],
      }
    ]
  },
  {
    id: "panchakarma_specialist",
    title: "Panchakarma & Wellness Specialist",
    description: "Build expertise in Panchakarma, wellness practices, patient care, and related therapeutic procedures.",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    salary: "₹6L - ₹15L",
    demand: "High",
    requiredSkills: ["Panchakarma", "Wellness Practices", "Patient Care", "Therapeutic Procedures"],
    phases: [
      {
        title: "Panchakarma Foundations",
        program_id: "ayur-panch-101",
        description: "Core principles of Purva, Pradhana, and Paschat Karma.",
        completed: false,
        skills: ["Panchakarma", "Therapeutic Procedures"],
      },
      {
        title: "Wellness & Patient Care",
        program_id: "ayur-panch-201",
        description: "Integrate wellness therapies with holistic patient care.",
        completed: false,
        skills: ["Wellness Practices", "Patient Care", "Lifestyle Counseling"],
      }
    ]
  },
  {
    id: "ayurveda_documentation",
    title: "Ayurveda Clinical Documentation Specialist",
    description: "Focus on clinical documentation, case records, healthcare documentation, communication, and Ayurvedic practice support.",
    icon: Briefcase,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    salary: "₹4L - ₹10L",
    demand: "Medium",
    requiredSkills: ["Clinical Documentation", "Case Records", "Healthcare Documentation", "Communication", "Practice Support"],
    phases: [
      {
        title: "Documentation Standards",
        program_id: "ayur-doc-101",
        description: "Learn healthcare and Ayurvedic record-keeping standards.",
        completed: false,
        skills: ["Clinical Documentation", "Healthcare Documentation"],
      },
      {
        title: "Case Records & Communication",
        program_id: "ayur-doc-201",
        description: "Maintain accurate case records and coordinate practice support.",
        completed: false,
        skills: ["Case Records", "Communication", "Practice Support"],
      }
    ]
  },
  {
    id: "ayurveda_academic",
    title: "Ayurveda Academic & Teaching",
    description: "Pursue teaching, academic development, training, and knowledge-sharing in Ayurveda.",
    icon: Award,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    salary: "₹6L - ₹14L",
    demand: "Medium",
    requiredSkills: ["Academic Development", "Teaching", "Training", "Knowledge-Sharing", "Ayurveda Fundamentals"],
    phases: [
      {
        title: "Academic Pedagogy",
        program_id: "ayur-acad-101",
        description: "Principles of teaching and instructional design in Ayurveda.",
        completed: false,
        skills: ["Teaching", "Training", "Academic Development"],
      },
      {
        title: "Knowledge Dissemination",
        program_id: "ayur-acad-201",
        description: "Effectively share Ayurvedic knowledge and train the next generation.",
        completed: false,
        skills: ["Knowledge-Sharing", "Ayurveda Fundamentals"],
      }
    ]
  },
  {
    id: "ayurveda_medicinal_plants",
    title: "Ayurvedic Medicinal Plants Specialist",
    description: "Work with medicinal plants, identification, cultivation, documentation, research, and Ayurvedic applications.",
    icon: Shield,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    salary: "₹5L - ₹12L",
    demand: "Medium",
    requiredSkills: ["Medicinal Plants", "Plant Identification", "Cultivation", "Documentation", "Research"],
    phases: [
      {
        title: "Plant Identification & Cultivation",
        program_id: "ayur-plant-101",
        description: "Learn to accurately identify and cultivate Ayurvedic medicinal herbs.",
        completed: false,
        skills: ["Medicinal Plants", "Plant Identification", "Cultivation"],
      },
      {
        title: "Documentation & Application",
        program_id: "ayur-plant-201",
        description: "Document herbal properties and research their applications.",
        completed: false,
        skills: ["Documentation", "Research", "Ayurvedic Applications"],
      }
    ]
  }
];

export const getCareerPaths = (department?: string) => {
  return department === "Ayurveda" ? AYURVEDA_CAREER_PATHS : CAREER_PATHS;
};
