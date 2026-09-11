export interface SkillGap {
  skill: string;
  current: number;
  target: number;
  gap: number;
}

export interface Recommendation {
  id: string;
  type: 'course' | 'project' | 'certification';
  title: string;
  skillImproved?: string;
  reason?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  expectedImprovement: number;
  priority: 'High Priority' | 'Medium Priority' | 'Optional';
  url: string;
  provider?: string;
  skillsCovered?: string[];
  careerValue?: string;
}

export interface Platform {
  name: string;
  url: string;
  logo: string;
}

export const KNOWLEDGE_BASE: Record<string, { courses: Recommendation[], certifications: Recommendation[], platforms: Platform[] }> = {
  "Problem Solving": {
    courses: [
      { id: "c_ps_1", type: "course", title: "Data Structures & Algorithms", skillImproved: "Problem Solving", reason: "Required by 92% of Software Engineer roles.", difficulty: "Intermediate", duration: "6 Weeks", expectedImprovement: 18, priority: "High Priority", url: "/student/learning-hub" }
    ],
    certifications: [
      { id: "cert_ps_1", type: "certification", title: "HackerRank Problem Solving (Basic)", provider: "HackerRank", difficulty: "Beginner", duration: "1 Week", expectedImprovement: 10, priority: "Medium Priority", url: "https://hackerrank.com", skillsCovered: ["Algorithms", "Data Structures"], careerValue: "Demonstrates fundamental coding ability." }
    ],
    platforms: [
      { name: "LeetCode", url: "https://leetcode.com", logo: "/logos/leetcode.png" },
      { name: "GeeksforGeeks", url: "https://geeksforgeeks.org", logo: "/logos/gfg.png" }
    ]
  },
  "Web Development": {
    courses: [
      { id: "c_wd_1", type: "course", title: "Modern Web Development", skillImproved: "Web Development", reason: "Core foundation for full-stack roles.", difficulty: "Beginner", duration: "4 Weeks", expectedImprovement: 15, priority: "High Priority", url: "/student/learning-hub" }
    ],
    certifications: [
      { id: "cert_wd_1", type: "certification", title: "Meta Frontend Developer", provider: "Coursera", difficulty: "Intermediate", duration: "3 Months", expectedImprovement: 20, priority: "High Priority", url: "https://coursera.org", skillsCovered: ["React", "UI/UX", "JavaScript"], careerValue: "Industry recognized frontend credential." }
    ],
    platforms: [
      { name: "freeCodeCamp", url: "https://freecodecamp.org", logo: "/logos/fcc.png" },
      { name: "MDN", url: "https://developer.mozilla.org", logo: "/logos/mdn.png" }
    ]
  },
  "SQL": {
    courses: [
      { id: "c_sql_1", type: "course", title: "Advanced SQL", skillImproved: "SQL", reason: "Crucial for backend and data engineering.", difficulty: "Intermediate", duration: "3 Weeks", expectedImprovement: 12, priority: "Medium Priority", url: "/student/learning-hub" }
    ],
    certifications: [
      { id: "cert_sql_1", type: "certification", title: "Oracle SQL Certified Associate", provider: "Oracle", difficulty: "Intermediate", duration: "2 Months", expectedImprovement: 25, priority: "High Priority", url: "https://oracle.com", skillsCovered: ["RDBMS", "Joins", "Optimization"], careerValue: "Enterprise standard database certification." }
    ],
    platforms: [
      { name: "HackerRank", url: "https://hackerrank.com", logo: "/logos/hackerrank.png" }
    ]
  },
  "Data Structures & Algorithms": {
    courses: [
      { id: "c_dsa_1", type: "course", title: "Mastering DSA", skillImproved: "Data Structures & Algorithms", reason: "Essential for clearing technical rounds.", difficulty: "Advanced", duration: "8 Weeks", expectedImprovement: 25, priority: "High Priority", url: "/student/learning-hub" }
    ],
    certifications: [],
    platforms: [
      { name: "LeetCode", url: "https://leetcode.com", logo: "/logos/leetcode.png" }
    ]
  },
  "Logical Reasoning": {
    courses: [
      { id: "c_lr_1", type: "course", title: "Quantitative Aptitude & Logic", skillImproved: "Logical Reasoning", reason: "Most companies use this for initial screening.", difficulty: "Intermediate", duration: "4 Weeks", expectedImprovement: 10, priority: "Medium Priority", url: "/student/learning-hub" }
    ],
    certifications: [],
    platforms: [
      { name: "IndiaBix", url: "https://indiabix.com", logo: "/logos/indiabix.png" }
    ]
  },
  "Quantitative Aptitude": {
    courses: [
      { id: "c_qa_1", type: "course", title: "Mastering Aptitude Tests", skillImproved: "Quantitative Aptitude", reason: "Clearing the first round of campus placements.", difficulty: "Intermediate", duration: "4 Weeks", expectedImprovement: 15, priority: "High Priority", url: "/student/learning-hub" }
    ],
    certifications: [],
    platforms: [
      { name: "IndiaBix", url: "https://indiabix.com", logo: "/logos/indiabix.png" }
    ]
  },
  "Communication Skills": {
    courses: [
      { id: "c_comm_1", type: "course", title: "Professional Communication", skillImproved: "Communication Skills", reason: "Critical for HR and behavioral interviews.", difficulty: "Beginner", duration: "2 Weeks", expectedImprovement: 10, priority: "Optional", url: "/student/learning-hub" }
    ],
    certifications: [],
    platforms: [
      { name: "Coursera", url: "https://coursera.org", logo: "/logos/coursera.png" }
    ]
  },
  "Teamwork": {
    courses: [
      { id: "c_tm_1", type: "course", title: "Agile & Team Collaboration", skillImproved: "Teamwork", reason: "Improves behavioral interview readiness.", difficulty: "Beginner", duration: "1 Week", expectedImprovement: 5, priority: "Optional", url: "/student/learning-hub" }
    ],
    certifications: [
       { id: "cert_tm_1", type: "certification", title: "Certified ScrumMaster", provider: "Scrum Alliance", difficulty: "Advanced", duration: "2 Days", expectedImprovement: 15, priority: "Optional", url: "https://scrumalliance.org", skillsCovered: ["Agile", "Scrum", "Leadership"], careerValue: "Highly valued for team leadership." }
    ],
    platforms: []
  }
};

// Fallback for general platforms
export const GENERAL_PLATFORMS: Platform[] = [
  { name: "Coursera", url: "https://coursera.org", logo: "/logos/coursera.png" },
  { name: "Udemy", url: "https://udemy.com", logo: "/logos/udemy.png" },
  { name: "YouTube", url: "https://youtube.com", logo: "/logos/youtube.png" },
  { name: "Roadmap.sh", url: "https://roadmap.sh", logo: "/logos/roadmap.png" },
  { name: "Infosys Springboard", url: "https://infyspringboard.onwingspan.com", logo: "/logos/infosys.png" },
  { name: "NPTEL", url: "https://nptel.ac.in", logo: "/logos/nptel.png" }
];

export function getRecommendations(gaps: SkillGap[], portfolioSkills: any[] = [], completedCourses: any[] = []) {
  // Sort by gap size descending
  const sortedGaps = [...gaps].sort((a, b) => b.gap - a.gap);
  
  const recommendations: Recommendation[] = [];
  const platforms: Platform[] = [];
  const certs: Recommendation[] = [];
  
  // Create sets for easy filtering
  const verifiedSkillNames = new Set(portfolioSkills.filter(s => s.verified).map(s => s.skill?.name));
  const completedCourseTitles = new Set(completedCourses.map(c => c.course?.title));

  sortedGaps.forEach(gap => {
    // Only recommend if gap > 0 and skill is not already fully verified
    if (gap.gap > 0 && !verifiedSkillNames.has(gap.skill)) {
      const knowledge = KNOWLEDGE_BASE[gap.skill] || KNOWLEDGE_BASE["Web Development"]; // fallback
      
      // Filter courses
      const validCourses = knowledge.courses.filter(c => !completedCourseTitles.has(c.title));
      
      validCourses.forEach(course => {
        // Recalculate priority based on actual gap size
        let priority: 'High Priority' | 'Medium Priority' | 'Optional' = 'Optional';
        if (gap.gap >= 20) priority = 'High Priority';
        else if (gap.gap >= 10) priority = 'Medium Priority';
        
        recommendations.push({ ...course, priority, expectedImprovement: Math.min(course.expectedImprovement, gap.gap) });
      });

      // Filter certs
      knowledge.certifications.forEach(cert => certs.push(cert));

      // Add platforms
      knowledge.platforms.forEach(p => {
        if (!platforms.find(existing => existing.name === p.name)) {
          platforms.push(p);
        }
      });
    }
  });

  // Ensure we have some platforms
  if (platforms.length === 0) {
    platforms.push(...GENERAL_PLATFORMS.slice(0, 4));
  }

  // Deduplicate certs
  const uniqueCerts = certs.filter((cert, index, self) => index === self.findIndex((c) => c.id === cert.id));

  return {
    courses: recommendations,
    certifications: uniqueCerts,
    platforms: platforms.slice(0, 6),
    weakestSkills: sortedGaps.filter(g => g.gap > 0).slice(0, 2)
  };
}

export function generateWeeklyRoadmap(skillName: string) {
  // AI Simulation for roadmap generation based on the top missing skill
  return [
    { week: 1, title: `Fundamentals of ${skillName}`, task: "Complete introductory modules and understand core concepts.", focus: "Theory & Syntax" },
    { week: 2, title: `Hands-on Practice`, task: "Solve 20 beginner problems or build a mini-project.", focus: "Application" },
    { week: 3, title: `Advanced Concepts`, task: "Dive into complex scenarios and edge cases.", focus: "Optimization" },
    { week: 4, title: `Assessment & Portfolio`, task: "Take a certification exam or add a project to your portfolio.", focus: "Validation" }
  ];
}
