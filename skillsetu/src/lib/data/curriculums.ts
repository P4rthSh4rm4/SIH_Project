export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  youtube_url: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Curriculum {
  overview: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimated_duration: string;
  instructor: string;
  modules: Module[];
}

export const COURSE_CURRICULUMS: Record<string, Curriculum> = {
  "Full-Stack Engineer Bootcamp": {
    overview: "Master full-stack development with MERN stack.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu Academy",
    modules: [
      {
        id: "fsb-m1",
        title: "Frontend with React",
        lessons: [
          { id: "fsb-l1", title: "React JS Crash Course", description: "Learn React.", duration: "1 hr 48 min", youtube_url: "https://www.youtube.com/embed/w7ejDZ8SWv8" }
        ]
      },
      {
        id: "fsb-m2",
        title: "Backend with Node & MongoDB",
        lessons: [
          { id: "fsb-l2", title: "Node.js & Express", description: "Learn Node.js", duration: "1 hr 30 min", youtube_url: "https://www.youtube.com/embed/fBNz5xF-Kx4" }
        ]
      }
    ]
  },
  "Data Scientist Certification Course": {
    overview: "Complete Data Science Certification.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu Data School",
    modules: [
      {
        id: "dsc-m1",
        title: "Data Science with Python",
        lessons: [
          { id: "dsc-l1", title: "Python for Data Science", description: "Learn Python.", duration: "1 hr 0 min", youtube_url: "https://www.youtube.com/embed/kqtD5dpn9C8" }
        ]
      }
    ]
  },
  "DevOps Engineer Masterclass": {
    overview: "Master Docker, Kubernetes, and CI/CD.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu Cloud",
    modules: [
      {
        id: "dem-m1",
        title: "Docker & Kubernetes",
        lessons: [
          { id: "dem-l1", title: "Docker Crash Course", description: "Learn Docker.", duration: "1 hr 11 min", youtube_url: "https://www.youtube.com/embed/pTFZFxd4hOI" },
          { id: "dem-l2", title: "Kubernetes Tutorial", description: "Learn K8s.", duration: "3 hr 42 min", youtube_url: "https://www.youtube.com/embed/X48VuDVv0do" }
        ]
      }
    ]
  },
  "AI Engineer Professional Certificate": {
    overview: "Learn PyTorch, LLMs, and Generative AI.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu AI Lab",
    modules: [
      {
        id: "aie-m1",
        title: "Deep Learning with PyTorch",
        lessons: [
          { id: "aie-l1", title: "PyTorch Full Course", description: "Learn PyTorch.", duration: "25 hr 11 min", youtube_url: "https://www.youtube.com/embed/V_xro1bcAuA" }
        ]
      }
    ]
  },
  "Cyber Security Analyst Training": {
    overview: "Master Ethical Hacking and Network Security.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu Security",
    modules: [
      {
        id: "csa-m1",
        title: "Ethical Hacking Basics",
        lessons: [
          { id: "csa-l1", title: "Ethical Hacking Full Course", description: "Learn ethical hacking.", duration: "10 hr 0 min", youtube_url: "https://www.youtube.com/embed/c9Wg6Cb_YlU" }
        ]
      }
    ]
  },
  "Mobile App Developer with React Native": {
    overview: "Build cross-platform mobile apps.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu Mobile",
    modules: [
      {
        id: "mad-m1",
        title: "React Native",
        lessons: [
          { id: "mad-l1", title: "React Native Tutorial", description: "Learn React Native.", duration: "2 hr 0 min", youtube_url: "https://www.youtube.com/embed/0-S5a0eXPoc" }
        ]
      }
    ]
  },
  "UI/UX Designer Fundamentals": {
    overview: "Learn User Research, Prototyping, and Figma.",
    difficulty: "Beginner",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu Design",
    modules: [
      {
        id: "uix-m1",
        title: "Figma & UI Design",
        lessons: [
          { id: "uix-l1", title: "Figma Tutorial", description: "Learn Figma.", duration: "1 hr 0 min", youtube_url: "https://www.youtube.com/embed/c9Wg6Cb_YlU" }
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════
  "Frontend Fundamentals": {
    overview: "Master the building blocks of the web: HTML5, CSS3, and JavaScript.",
    difficulty: "Beginner",
    estimated_duration: "Complete in 5 Days",
    instructor: "Traversy Media",
    modules: [
      {
        id: "ff-m1",
        title: "HTML & CSS",
        lessons: [
          { id: "ff-l1", title: "HTML Crash Course For Absolute Beginners", description: "Learn how to structure web pages using HTML5 tags, boilerplate code, and best practices.", duration: "1 hr 0 min", youtube_url: "https://www.youtube.com/embed/UB1O30fR-EE" },
          { id: "ff-l2", title: "CSS Crash Course For Absolute Beginners", description: "Learn how to target HTML elements and apply custom styles using CSS.", duration: "1 hr 25 min", youtube_url: "https://www.youtube.com/embed/yfoY53QXEnI" },
        ]
      },
      {
        id: "ff-m2",
        title: "JavaScript",
        lessons: [
          { id: "ff-l3", title: "JavaScript Crash Course For Beginners", description: "Dive into JavaScript programming concepts like variables, loops, functions, and DOM manipulation.", duration: "1 hr 40 min", youtube_url: "https://www.youtube.com/embed/hdI2bqOjy3c" },
        ]
      }
    ]
  },
  "Modern Frontend Frameworks": {
    overview: "Learn to build modern, reactive user interfaces using React and Next.js.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "Traversy Media",
    modules: [
      {
        id: "mff-m1",
        title: "React Core Concepts",
        lessons: [
          { id: "mff-l1", title: "React JS Crash Course", description: "Understand how React components, JSX, state, props, and hooks work together.", duration: "1 hr 48 min", youtube_url: "https://www.youtube.com/embed/w7ejDZ8SWv8" },
        ]
      },
      {
        id: "mff-m2",
        title: "Next.js & Server-Side Rendering",
        lessons: [
          { id: "mff-l2", title: "Next.js Crash Course", description: "Learn the latest Next.js architecture, server components, and dynamic routing.", duration: "1 hr 25 min", youtube_url: "https://www.youtube.com/embed/Sklc_fQBmcs" },
        ]
      }
    ]
  },
  "Backend Development": {
    overview: "Build scalable and secure APIs using Node.js and Express.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "Traversy Media",
    modules: [
      {
        id: "bd-m1",
        title: "Node.js Fundamentals",
        lessons: [
          { id: "bd-l1", title: "Node.js Crash Course", description: "Understand Node.js asynchronous, non-blocking architecture, modules, and the event loop.", duration: "1 hr 30 min", youtube_url: "https://www.youtube.com/embed/fBNz5xF-Kx4" },
        ]
      },
      {
        id: "bd-m2",
        title: "Express.js & REST APIs",
        lessons: [
          { id: "bd-l2", title: "Express JS Crash Course", description: "Build RESTful APIs, handle routing, middleware, and request processing with Express.", duration: "1 hr 14 min", youtube_url: "https://www.youtube.com/embed/L72fhGm1tfE" },
        ]
      }
    ]
  },
  "Databases & Architecture": {
    overview: "Design robust database schemas with PostgreSQL and MongoDB.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "Amigoscode & Traversy Media",
    modules: [
      {
        id: "da-m1",
        title: "Relational Databases",
        lessons: [
          { id: "da-l1", title: "PostgreSQL Tutorial Full Course", description: "Learn how to write SQL queries, create tables, use joins, and manage relational data.", duration: "2 hr 20 min", youtube_url: "https://www.youtube.com/embed/85pG_pDkITY" },
        ]
      },
      {
        id: "da-m2",
        title: "NoSQL",
        lessons: [
          { id: "da-l2", title: "MongoDB Crash Course", description: "Understand NoSQL document databases and how to use them with Node.js.", duration: "1 hr 17 min", youtube_url: "https://www.youtube.com/embed/-56x56UppqQ" },
        ]
      }
    ]
  },
  "Deployment & DevOps": {
    overview: "Take your applications to production with Docker and CI/CD.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "TechWorld with Nana",
    modules: [
      {
        id: "dd-m1",
        title: "Containerization & Deployment",
        lessons: [
          { id: "dd-l1", title: "Docker Crash Course for Absolute Beginners", description: "Learn what containers are, how to write Dockerfiles, and deploy containerized apps.", duration: "1 hr 11 min", youtube_url: "https://www.youtube.com/embed/pTFZFxd4hOI" },
        ]
      }
    ]
  },
  "Advanced Engineering": {
    overview: "Explore real-time communication, caching, and scalable enterprise architectures.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "Web Dev Simplified & Traversy",
    modules: [
      {
        id: "ae-m1",
        title: "Real-time & Caching",
        lessons: [
          { id: "ae-l1", title: "Redis Crash Course", description: "Drastically reduce database load and improve response times using Redis in-memory cache.", duration: "1 hr 15 min", youtube_url: "https://www.youtube.com/embed/jgpVdJB2sKQ" },
          { id: "ae-l2", title: "Socket.io Tutorial", description: "Build real-time bidirectional communication layers into your web apps.", duration: "30 min", youtube_url: "https://www.youtube.com/embed/ZKEqqIO7n-k" },
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // DATA SCIENTIST ROADMAP
  // ═══════════════════════════════════════════════════
  "Programming & Math": {
    overview: "Master Python programming and essential mathematics for data science.",
    difficulty: "Beginner",
    estimated_duration: "Complete in 5 Days",
    instructor: "Programming with Mosh",
    modules: [
      {
        id: "pm-m1",
        title: "Python for Data Science",
        lessons: [
          { id: "pm-l1", title: "Python for Beginners - Full Course", description: "Learn the core syntax, loops, variables, conditionals, functions, and data structures in Python.", duration: "1 hr 0 min", youtube_url: "https://www.youtube.com/embed/kqtD5dpn9C8" },
        ]
      }
    ]
  },
  "Data Manipulation": {
    overview: "Learn to clean, process, and manipulate large datasets using NumPy and Pandas.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "freeCodeCamp",
    modules: [
      {
        id: "dm-m1",
        title: "NumPy",
        lessons: [
          { id: "dm-l1", title: "NumPy Tutorial for Beginners", description: "Perform high-speed mathematical operations using multi-dimensional NumPy arrays.", duration: "1 hr 11 min", youtube_url: "https://www.youtube.com/embed/QUT1VHiLmmI" },
        ]
      },
      {
        id: "dm-m2",
        title: "Pandas",
        lessons: [
          { id: "dm-l2", title: "Data Analysis with Python & Pandas", description: "Load, inspect, filter, and clean tabular data using the powerful Pandas library.", duration: "2 hr 10 min", youtube_url: "https://www.youtube.com/embed/vmEHCJofslg" },
        ]
      }
    ]
  },
  "Data Visualization": {
    overview: "Communicate insights effectively by building visual representations of data.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "Keith Galli & Kimberly Fessel",
    modules: [
      {
        id: "dv-m1",
        title: "Matplotlib",
        lessons: [
          { id: "dv-l1", title: "Matplotlib Tutorial (Plotting in Python)", description: "Create line charts, bar plots, scatter plots, and histograms using Matplotlib.", duration: "33 min", youtube_url: "https://www.youtube.com/embed/DAQNHzOcO5A" },
        ]
      },
      {
        id: "dv-m2",
        title: "Seaborn",
        lessons: [
          { id: "dv-l2", title: "Seaborn Full Course", description: "Generate beautiful statistical graphics, pair plots, and heatmaps with Seaborn.", duration: "1 hr 14 min", youtube_url: "https://www.youtube.com/embed/6GUZXDef2U0" },
        ]
      }
    ]
  },
  "Machine Learning": {
    overview: "Train models to recognize patterns and make predictions using Scikit-Learn.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "freeCodeCamp",
    modules: [
      {
        id: "ml-m1",
        title: "Scikit-Learn & Core ML",
        lessons: [
          { id: "ml-l1", title: "Scikit-Learn Crash Course", description: "Train your first machine learning model — linear regression, classification, and model evaluation.", duration: "2 hr 15 min", youtube_url: "https://www.youtube.com/embed/pqNCD_5r0IU" },
        ]
      },
      {
        id: "ml-m2",
        title: "Machine Learning Comprehensive",
        lessons: [
          { id: "ml-l2", title: "Machine Learning for Everybody", description: "Comprehensive coverage of major ML algorithms: regression, trees, SVM, clustering, and ensembles.", duration: "9 hr 52 min", youtube_url: "https://www.youtube.com/embed/i_LwzRVP7bg" },
        ]
      }
    ]
  },
  "Deep Learning (Advanced)": {
    overview: "Dive into neural networks and deep learning architectures with PyTorch.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "freeCodeCamp & Daniel Bourke",
    modules: [
      {
        id: "dl-m1",
        title: "Neural Networks & PyTorch",
        lessons: [
          { id: "dl-l1", title: "But what is a Neural Network?", description: "A visual and intuitive explanation of how artificial neural networks learn from data.", duration: "19 min", youtube_url: "https://www.youtube.com/embed/aircAruvnKk" },
          { id: "dl-l2", title: "PyTorch for Deep Learning - Full Course", description: "Write deep learning models from scratch using the PyTorch framework.", duration: "25 hr 11 min", youtube_url: "https://www.youtube.com/embed/V_xro1bcAuA" },
        ]
      }
    ]
  },
  "Model Deployment (MLOps)": {
    overview: "Learn how to package, deploy, and monitor machine learning models in production.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "TechWorld with Nana",
    modules: [
      {
        id: "md-m1",
        title: "Containerizing ML Models",
        lessons: [
          { id: "md-l1", title: "Docker Tutorial for ML Deployment", description: "Package your models and dependencies into portable Docker containers for production.", duration: "1 hr 11 min", youtube_url: "https://www.youtube.com/embed/pTFZFxd4hOI" },
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // DEVOPS ENGINEER ROADMAP
  // ═══════════════════════════════════════════════════
  "OS & Networking": {
    overview: "Build a strong foundation in Linux administration and shell scripting.",
    difficulty: "Beginner",
    estimated_duration: "Complete in 5 Days",
    instructor: "freeCodeCamp",
    modules: [
      {
        id: "on-m1",
        title: "Linux & Shell",
        lessons: [
          { id: "on-l1", title: "Linux Operating System - Full Course", description: "Navigate the file system, manage permissions, and write bash scripts from the terminal.", duration: "1 hr 11 min", youtube_url: "https://www.youtube.com/embed/sWbUDq4S6Y8" },
        ]
      }
    ]
  },
  "Version Control & CI/CD": {
    overview: "Master Git for collaboration and automate your deployment pipelines.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "freeCodeCamp",
    modules: [
      {
        id: "vc-m1",
        title: "Git Version Control",
        lessons: [
          { id: "vc-l1", title: "Git and GitHub for Beginners - Crash Course", description: "Initialize repositories, commit changes, push code to remotes, branch, and merge.", duration: "1 hr 8 min", youtube_url: "https://www.youtube.com/embed/RGOj5yH7evk" },
        ]
      },
      {
        id: "vc-m2",
        title: "CI/CD Pipelines",
        lessons: [
          { id: "vc-l2", title: "GitHub Actions Tutorial", description: "Automatically test and deploy your code whenever changes are pushed to a repository.", duration: "1 hr 22 min", youtube_url: "https://www.youtube.com/embed/R8_veQiYBjI" },
        ]
      }
    ]
  },
  "Containerization": {
    overview: "Package applications and dependencies into standard units with Docker.",
    difficulty: "Intermediate",
    estimated_duration: "Complete in 5 Days",
    instructor: "TechWorld with Nana",
    modules: [
      {
        id: "ct-m1",
        title: "Docker Essentials",
        lessons: [
          { id: "ct-l1", title: "Docker Tutorial for Beginners", description: "Understand containers, images, volumes, networks, and Docker Compose.", duration: "1 hr 11 min", youtube_url: "https://www.youtube.com/embed/pTFZFxd4hOI" },
        ]
      }
    ]
  },
  "Infrastructure as Code": {
    overview: "Provision and manage infrastructure programmatically using Terraform.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "TechWorld with Nana",
    modules: [
      {
        id: "ic-m1",
        title: "Terraform Fundamentals",
        lessons: [
          { id: "ic-l1", title: "Terraform Explained in 15 Minutes", description: "Define cloud resources (AWS, GCP, Azure) purely through HCL configuration code.", duration: "15 min", youtube_url: "https://www.youtube.com/embed/l5k1ai_GBDE" },
        ]
      }
    ]
  },
  "Container Orchestration": {
    overview: "Automate deployment, scaling, and management of containers with Kubernetes.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "TechWorld with Nana",
    modules: [
      {
        id: "co-m1",
        title: "Kubernetes Core",
        lessons: [
          { id: "co-l1", title: "Kubernetes Tutorial for Beginners - Full Course", description: "Understand pods, nodes, deployments, services, ingress, and the Kubernetes architecture.", duration: "3 hr 42 min", youtube_url: "https://www.youtube.com/embed/X48VuDVv0do" },
        ]
      }
    ]
  },
  "Monitoring & Observability": {
    overview: "Keep your systems reliable with robust monitoring and logging stacks.",
    difficulty: "Advanced",
    estimated_duration: "Complete in 5 Days",
    instructor: "freeCodeCamp",
    modules: [
      {
        id: "mo-m1",
        title: "DevOps Monitoring Stack",
        lessons: [
          { id: "mo-l1", title: "DevOps Tutorial for Beginners", description: "Learn the complete DevOps toolchain including monitoring with Prometheus and Grafana.", duration: "7 hr 0 min", youtube_url: "https://www.youtube.com/embed/hQcFE0RD0cQ" },
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // FALLBACK DOMAINS
  // ═══════════════════════════════════════════════════
  "Quantitative Aptitude": {
    overview: "Develop strong analytical and quantitative skills for competitive exams.",
    difficulty: "Beginner",
    estimated_duration: "Complete in 5 Days",
    instructor: "Programming with Mosh",
    modules: [
      {
        id: "qa-m1",
        title: "Math & Problem Solving",
        lessons: [
          { id: "qa-l1", title: "Python Math & Problem Solving", description: "Strengthen your quantitative reasoning through Python-based problem solving.", duration: "1 hr 0 min", youtube_url: "https://www.youtube.com/embed/kqtD5dpn9C8" },
        ]
      }
    ]
  },
  "Professional Communication": {
    overview: "Master professional communication, public speaking, and corporate etiquette.",
    difficulty: "Beginner",
    estimated_duration: "Complete in 5 Days",
    instructor: "Stanford GSB",
    modules: [
      {
        id: "pc-m1",
        title: "Professional Communication",
        lessons: [
          { id: "pc-l1", title: "Think Fast, Talk Smart: Communication Techniques", description: "Eliminate stage fright and present ideas clearly and persuasively.", duration: "58 min", youtube_url: "https://www.youtube.com/embed/HAnw168huqA" },
        ]
      }
    ]
  }
};

/**
 * Resolves a curriculum for a given course title.
 * First tries an exact match, then a fuzzy keyword match, then a safe fallback.
 */
export function getCurriculum(title: string): Curriculum {
  if (!title) return COURSE_CURRICULUMS["Frontend Fundamentals"];

  // Exact match
  if (COURSE_CURRICULUMS[title]) return COURSE_CURRICULUMS[title];

  // Fuzzy keyword match
  const t = title.toLowerCase();

  if (t.includes("data") || t.includes("analy")) return COURSE_CURRICULUMS["Data Manipulation"];
  if (t.includes("backend") || t.includes("node") || t.includes("express")) return COURSE_CURRICULUMS["Backend Development"];
  if (t.includes("frontend") || t.includes("react") || t.includes("next")) return COURSE_CURRICULUMS["Modern Frontend Frameworks"];
  if (t.includes("devops") || t.includes("cloud") || t.includes("deploy")) return COURSE_CURRICULUMS["Deployment & DevOps"];
  if (t.includes("docker") || t.includes("container")) return COURSE_CURRICULUMS["Containerization"];
  if (t.includes("kubernetes") || t.includes("k8s")) return COURSE_CURRICULUMS["Container Orchestration"];
  if (t.includes("terraform") || t.includes("infrastructure")) return COURSE_CURRICULUMS["Infrastructure as Code"];
  if (t.includes("monitor") || t.includes("observ") || t.includes("grafana")) return COURSE_CURRICULUMS["Monitoring & Observability"];
  if (t.includes("machine learning") || t.includes("scikit") || t.includes("ml")) return COURSE_CURRICULUMS["Machine Learning"];
  if (t.includes("deep learning") || t.includes("neural") || t.includes("pytorch")) return COURSE_CURRICULUMS["Deep Learning (Advanced)"];
  if (t.includes("visual")) return COURSE_CURRICULUMS["Data Visualization"];
  if (t.includes("python") || t.includes("math") || t.includes("programming")) return COURSE_CURRICULUMS["Programming & Math"];
  if (t.includes("database") || t.includes("sql") || t.includes("postgres") || t.includes("mongo")) return COURSE_CURRICULUMS["Databases & Architecture"];
  if (t.includes("git") || t.includes("ci/cd") || t.includes("version")) return COURSE_CURRICULUMS["Version Control & CI/CD"];
  if (t.includes("aptitude") || t.includes("quantitative")) return COURSE_CURRICULUMS["Quantitative Aptitude"];
  if (t.includes("communication") || t.includes("soft")) return COURSE_CURRICULUMS["Professional Communication"];
  if (t.includes("linux") || t.includes("network") || t.includes("os")) return COURSE_CURRICULUMS["OS & Networking"];
  if (t.includes("mlops") || t.includes("model deploy")) return COURSE_CURRICULUMS["Model Deployment (MLOps)"];

  // Safe fallback — uses a verified working video
  return {
    overview: "Comprehensive course covering " + title + ". Learn the core principles and practical applications required to master this domain.",
    difficulty: "Beginner",
    estimated_duration: "Complete in 5 Days",
    instructor: "SkillSetu Expert",
    modules: [
      {
        id: "fb-m1",
        title: "Getting Started",
        lessons: [
          { id: "fb-l1", title: "Introduction to " + title, description: "An introductory overview of the core concepts you need to grasp.", duration: "1 hr 0 min", youtube_url: "https://www.youtube.com/embed/kqtD5dpn9C8" },
        ]
      }
    ]
  };
}

/**
 * Returns the flat list of all lessons in a curriculum.
 * Used for index-based progress calculations: completedLessons / totalLessons.
 */
export function getFlatLessons(curriculum: Curriculum): { moduleIndex: number; lessonIndex: number; lesson: Lesson }[] {
  const flat: { moduleIndex: number; lessonIndex: number; lesson: Lesson }[] = [];
  for (let m = 0; m < curriculum.modules.length; m++) {
    for (let l = 0; l < curriculum.modules[m].lessons.length; l++) {
      flat.push({
        moduleIndex: m,
        lessonIndex: l,
        lesson: curriculum.modules[m].lessons[l],
      });
    }
  }
  return flat;
}
