"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass, Map, Briefcase, ChevronRight, CheckCircle2,
  Circle, Star, ArrowRight, Zap, PlayCircle, Trophy,
} from "lucide-react";
import Link from "next/link";
import { useSkillAnalytics } from "@/lib/hooks/useSkillAnalytics";

const CAREER_PATHS = [
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
        description: "Master the building blocks of the web and DOM manipulation.",
        completed: true,
        skills: ["HTML5", "CSS3", "JavaScript", "Web APIs"],
      },
      {
        title: "Modern Frontend Frameworks",
        description: "Build interactive UIs with React and Next.js, managing complex states.",
        completed: true,
        skills: ["React", "Next.js", "Redux", "Tailwind CSS"],
      },
      {
        title: "Backend Development",
        description: "Develop robust server-side logic and RESTful architectures.",
        completed: false,
        skills: ["Node.js", "Express", "REST API", "GraphQL"],
      },
      {
        title: "Databases & Architecture",
        description: "Design efficient schemas and understand scalable system design.",
        completed: false,
        skills: ["PostgreSQL", "MongoDB", "Redis", "System Design"],
      },
      {
        title: "Deployment & DevOps",
        description: "Containerize applications and set up automated deployment pipelines.",
        completed: false,
        skills: ["Docker", "AWS", "CI/CD", "Vercel"],
      },
      {
        title: "Advanced Engineering",
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
        description: "Strong foundation in programming and mathematical concepts.",
        completed: false,
        skills: ["Python", "Linear Algebra", "Statistics", "Calculus"],
      },
      {
        title: "Data Manipulation",
        description: "Clean, transform, and analyze datasets efficiently.",
        completed: false,
        skills: ["Pandas", "NumPy", "SQL", "Data Cleaning"],
      },
      {
        title: "Data Visualization",
        description: "Create compelling dashboards and visual narratives.",
        completed: false,
        skills: ["Matplotlib", "Seaborn", "Tableau", "PowerBI"],
      },
      {
        title: "Machine Learning",
        description: "Train predictive models and evaluate their performance.",
        completed: false,
        skills: ["Scikit-Learn", "Regression", "Classification", "XGBoost"],
      },
      {
        title: "Deep Learning (Advanced)",
        description: "Build neural networks for complex pattern recognition.",
        completed: false,
        skills: ["TensorFlow", "PyTorch", "NLP", "Computer Vision"],
      },
      {
        title: "Model Deployment (MLOps)",
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
        description: "Master operating systems administration and network protocols.",
        completed: false,
        skills: ["Linux Admin", "Bash Scripting", "TCP/IP", "DNS"],
      },
      {
        title: "Version Control & CI/CD",
        description: "Manage source code and automate testing and deployments.",
        completed: false,
        skills: ["Git", "GitHub Actions", "Jenkins", "GitLab CI"],
      },
      {
        title: "Containerization",
        description: "Package applications with dependencies into portable containers.",
        completed: false,
        skills: ["Docker", "Docker Compose", "Container Registry"],
      },
      {
        title: "Infrastructure as Code",
        description: "Provision and manage infrastructure programmatically.",
        completed: false,
        skills: ["Terraform", "Ansible", "CloudFormation"],
      },
      {
        title: "Container Orchestration",
        description: "Manage large clusters of containers efficiently.",
        completed: false,
        skills: ["Kubernetes", "Helm", "Istio", "EKS/GKE"],
      },
      {
        title: "Monitoring & Observability",
        description: "Track system health, logs, and performance metrics.",
        completed: false,
        skills: ["Prometheus", "Grafana", "ELK Stack", "Datadog"],
      },
    ],
  },
];

export default function CareerGuidancePage() {
  const { skills, loading } = useSkillAnalytics();
  const [selectedPath, setSelectedPath] = useState(CAREER_PATHS[0]);

  // Calculate suitability score for each path based on student skills
  const getSuitability = (path: typeof CAREER_PATHS[0]) => {
    if (skills.length === 0) return 0;
    const reqLower = path.requiredSkills.map((s) => s.toLowerCase());
    const matched = skills.filter((s) => reqLower.includes(s.name.toLowerCase()));
    return Math.round((matched.length / reqLower.length) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Guidance</h1>
          <p className="text-muted-foreground mt-1">Loading career paths...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Guidance</h1>
          <p className="text-muted-foreground mt-1">
            Explore career paths, map your skills, and get AI-driven advice.
          </p>
        </div>
        <Button asChild className="bg-primary/10 text-primary hover:bg-primary/20">
          <Link href="/student/copilot">
            <SparklesIcon className="w-4 h-4 mr-2" /> Ask AI Mentor
          </Link>
        </Button>
      </div>

      {/* Career Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAREER_PATHS.map((path) => {
          const suitability = getSuitability(path);
          const isSelected = selectedPath.id === path.id;

          return (
            <Card
              key={path.id}
              className={`cursor-pointer transition-all duration-200 border-border/50 ${
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-lg hover:border-primary/30"
              }`}
              onClick={() => setSelectedPath(path)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${path.bg}`}>
                    <path.icon className={`w-5 h-5 ${path.color}`} />
                  </div>
                  <Badge variant={suitability >= 70 ? "default" : "secondary"}>
                    {suitability}% Match
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{path.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {path.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Path Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" /> Roadmap: {selectedPath.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {selectedPath.demand} Demand
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" /> {selectedPath.salary}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-12 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent before:rounded-full">
                {selectedPath.phases.map((phase, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-background bg-secondary text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 transition-transform duration-300 group-hover:scale-110">
                      {phase.completed ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <Circle className="w-7 h-7 text-primary/40" />
                      )}
                    </div>
                    {/* Card */}
                    <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3.5rem)] p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <span className="text-sm font-bold uppercase text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit">
                          Phase {i + 1}
                        </span>
                        {phase.completed && (
                          <Badge variant="outline" className="text-[10px] uppercase text-emerald-600 border-emerald-500/30 bg-emerald-500/10 py-1 px-3">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{phase.title}</h4>
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                        {phase.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {phase.skills?.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-secondary/60 hover:bg-secondary border-none">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {!phase.completed && (
                        <Button variant="default" size="sm" className="w-full sm:w-auto bg-primary/90 hover:bg-primary shadow-md hover:shadow-primary/25 transition-all" asChild>
                          <Link href={`/student/learning-hub?phase=${encodeURIComponent(phase.title)}&skills=${encodeURIComponent(phase.skills?.join(",") || "")}`}>
                            Find Courses <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> AI Career Mentor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-sm leading-relaxed text-muted-foreground">
                <p className="mb-3">
                  Based on your current skills, you have a <strong className="text-foreground">{getSuitability(selectedPath)}% match</strong> for <strong>{selectedPath.title}</strong>.
                </p>
                <p className="mb-3">
                  <strong>Strengths:</strong> You have verified experience in some of the core frontend technologies.
                </p>
                <p>
                  <strong>Next Steps:</strong> Focus on completing Phase 3. Consider taking the Node.js assessment or enrolling in a backend development course.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/student/copilot">
                  Discuss Career Plan <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Key Skills Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedPath.requiredSkills.map((skill) => {
                  const hasSkill = skills.some(
                    (s) => s.name.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <Badge
                      key={skill}
                      variant={hasSkill ? "default" : "secondary"}
                      className={hasSkill ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" : ""}
                    >
                      {skill} {hasSkill && <CheckCircle2 className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
