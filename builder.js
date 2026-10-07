import fs from 'fs';
import path from 'path';

function ensureDir(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log('Created:', filePath);
}

// ==========================================
// 1. src/utils/formatters.js
// ==========================================
writeFile('src/utils/formatters.js', `
export function formatCurrency(amount) {
  if (!amount) return 'Negotiable';
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }
  return amount;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return 'in ' + diffDays + ' days';
  if (diffDays === -1) return 'Yesterday';
  return Math.abs(diffDays) + ' days ago';
}

export function getStatusConfig(status) {
  switch (status?.toLowerCase()) {
    case 'saved':
      return {
        label: 'Saved',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-700 dark:text-slate-300',
        borderColor: 'border-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-400',
        stepIndex: 0,
      };
    case 'applied':
      return {
        label: 'Applied',
        bgColor: 'bg-blue-50 dark:bg-blue-950/40',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-200 dark:border-blue-800',
        dotColor: 'bg-blue-500',
        stepIndex: 1,
      };
    case 'assessment':
      return {
        label: 'Assessment',
        bgColor: 'bg-purple-50 dark:bg-purple-950/40',
        textColor: 'text-purple-700 dark:text-purple-300',
        borderColor: 'border-purple-200 dark:border-purple-800',
        dotColor: 'bg-purple-500',
        stepIndex: 2,
      };
    case 'interview':
      return {
        label: 'Interview',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        textColor: 'text-amber-700 dark:text-amber-300',
        borderColor: 'border-amber-200 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        stepIndex: 3,
      };
    case 'offer':
      return {
        label: 'Offer Received',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
        stepIndex: 4,
      };
    case 'rejected':
      return {
        label: 'Rejected',
        bgColor: 'bg-rose-50 dark:bg-rose-950/40',
        textColor: 'text-rose-700 dark:text-rose-300',
        borderColor: 'border-rose-200 dark:border-rose-800',
        dotColor: 'bg-rose-500',
        stepIndex: 4,
      };
    case 'withdrawn':
      return {
        label: 'Withdrawn',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-600 dark:text-gray-400',
        borderColor: 'border-gray-300 dark:border-gray-700',
        dotColor: 'bg-gray-400',
        stepIndex: 4,
      };
    default:
      return {
        label: status || 'Unknown',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-300',
        dotColor: 'bg-slate-400',
        stepIndex: 0,
      };
  }
}

export function getFitScoreBadge(score) {
  if (score >= 85) {
    return {
      text: 'High Match',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      ringColor: '#10b981',
      bgBar: 'bg-emerald-500',
    };
  } else if (score >= 70) {
    return {
      text: 'Good Match',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      ringColor: '#3b82f6',
      bgBar: 'bg-blue-500',
    };
  } else if (score >= 50) {
    return {
      text: 'Moderate Match',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      ringColor: '#f59e0b',
      bgBar: 'bg-amber-500',
    };
  } else {
    return {
      text: 'Low Match',
      textColor: 'text-rose-700 dark:text-rose-300',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'border-rose-200 dark:border-rose-800',
      ringColor: '#ef4444',
      bgBar: 'bg-rose-500',
    };
  }
}
`);

// ==========================================
// 2. src/utils/fitScoreCalculator.js
// ==========================================
writeFile('src/utils/fitScoreCalculator.js', `
export function calculateJobFit(jobDescription, userSkills = [], userProjects = []) {
  if (!jobDescription) return null;
  const jdLower = jobDescription.toLowerCase();

  const skillKeywords = [
    'react', 'react.js', 'javascript', 'typescript', 'node.js', 'nodejs', 'express', 'python',
    'django', 'fastapi', 'java', 'spring boot', 'c++', 'go', 'golang', 'rust',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'rest api', 'docker',
    'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'git', 'linux', 'tailwind',
    'next.js', 'redux', 'kafka', 'microservices', 'system design', 'agile', 'testing', 'jest'
  ];

  const foundKeywords = skillKeywords.filter(skill => jdLower.includes(skill.toLowerCase()));

  const matchedSkills = [];
  const missingSkills = [];

  foundKeywords.forEach(keyword => {
    const hasSkill = userSkills.some(s => s.name?.toLowerCase() === keyword.toLowerCase() || keyword.toLowerCase().includes(s.name?.toLowerCase()));
    if (hasSkill) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  });

  const totalKeywords = foundKeywords.length || 1;
  const skillMatchRatio = matchedSkills.length / Math.max(1, totalKeywords);

  const skillScore = Math.min(95, Math.max(50, Math.round(skillMatchRatio * 90 + 10)));
  const experienceScore = 78;
  const educationScore = 92;
  const projectScore = matchedSkills.length >= 3 ? 84 : 68;
  const atsScore = Math.round(skillScore * 0.85 + 12);

  const overallScore = Math.round(
    skillScore * 0.35 +
    experienceScore * 0.2 +
    educationScore * 0.15 +
    projectScore * 0.15 +
    atsScore * 0.15
  );

  return {
    overallScore,
    skillScore,
    experienceScore,
    educationScore,
    projectScore,
    atsScore,
    matchedSkills: matchedSkills.length ? matchedSkills : ['JavaScript', 'React', 'Git', 'REST API'],
    missingSkills: missingSkills.length ? missingSkills : ['Kubernetes', 'AWS Lambda', 'GraphQL'],
    totalKeywordsFound: foundKeywords.length,
  };
}
`);

// ==========================================
// 3. src/utils/dateUtils.js
// ==========================================
writeFile('src/utils/dateUtils.js', `
export function getCountdownTime(targetDate) {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}
`);

// ==========================================
// 4. src/data/mockUser.js
// ==========================================
writeFile('src/data/mockUser.js', `
export const mockUser = {
  id: 'usr_9941',
  name: 'Alex Rivera',
  email: 'alex.rivera@university.edu',
  role: 'Software Engineer & CS Senior',
  college: 'Massachusetts Institute of Technology (MIT)',
  degree: 'Bachelor of Science in Computer Science & Engineering',
  graduationYear: 'May 2026',
  gpa: '3.86 / 4.00',
  location: 'Boston, MA (Open to Relocate / Remote)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Driven Computer Science senior specializing in scalable full-stack web platforms, distributed backends, and cloud microservices. Active open-source contributor and hackathon winner.',
  github: 'https://github.com/alexrivera-dev',
  linkedin: 'https://linkedin.com/in/alexrivera-tech',
  portfolio: 'https://alexrivera.dev',
  phone: '+1 (555) 234-8901',
  careerReadiness: {
    total: 76,
    breakdown: {
      resume: 84,
      technicalSkills: 72,
      projects: 81,
      interviewSkills: 68,
      communication: 75,
    }
  },
  skills: [
    { name: 'JavaScript', category: 'Languages', level: 'Expert' },
    { name: 'TypeScript', category: 'Languages', level: 'Advanced' },
    { name: 'Python', category: 'Languages', level: 'Advanced' },
    { name: 'Java', category: 'Languages', level: 'Intermediate' },
    { name: 'C++', category: 'Languages', level: 'Intermediate' },
    { name: 'React', category: 'Frameworks', level: 'Expert' },
    { name: 'Node.js', category: 'Frameworks', level: 'Advanced' },
    { name: 'Next.js', category: 'Frameworks', level: 'Advanced' },
    { name: 'Express.js', category: 'Frameworks', level: 'Advanced' },
    { name: 'FastAPI', category: 'Frameworks', level: 'Intermediate' },
    { name: 'Tailwind CSS', category: 'Frameworks', level: 'Expert' },
    { name: 'PostgreSQL', category: 'Databases', level: 'Advanced' },
    { name: 'MongoDB', category: 'Databases', level: 'Advanced' },
    { name: 'Redis', category: 'Databases', level: 'Intermediate' },
    { name: 'Docker', category: 'DevOps & Cloud', level: 'Advanced' },
    { name: 'AWS (S3, EC2, Lambda)', category: 'DevOps & Cloud', level: 'Intermediate' },
    { name: 'Git & GitHub Actions', category: 'DevOps & Cloud', level: 'Expert' },
    { name: 'GraphQL', category: 'APIs', level: 'Intermediate' },
    { name: 'REST APIs', category: 'APIs', level: 'Expert' },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'CloudMesh — Distributed Cache & Load Balancer',
      description: 'Engineered a high-throughput, horizontally scalable distributed key-value cache in Go and Node.js supporting 45,000 requests/sec with Raft consensus.',
      tags: ['Go', 'Node.js', 'Raft Consensus', 'Docker', 'Redis'],
      link: 'https://github.com/alexrivera-dev/cloudmesh',
      stars: 124,
      role: 'Lead Architect',
    },
    {
      id: 'proj-2',
      title: 'DocuQuery AI — Multimodal Semantic Search Engine',
      description: 'Full-stack document intelligence platform leveraging vector embeddings (Pinecone) and LLM context synthesis. Used by 1,200+ campus students.',
      tags: ['React', 'FastAPI', 'Python', 'OpenAI', 'Pinecone', 'Tailwind'],
      link: 'https://github.com/alexrivera-dev/docuquery-ai',
      stars: 88,
      role: 'Solo Creator',
    },
    {
      id: 'proj-3',
      title: 'CampusPulse — Real-Time Event & Marketplace Hub',
      description: 'Collaborative student portal featuring live WebSockets messaging, Stripe payment escrow, and zero-downtime CI/CD deployment on AWS.',
      tags: ['Next.js', 'PostgreSQL', 'Prisma', 'WebSockets', 'AWS'],
      link: 'https://github.com/alexrivera-dev/campuspulse',
      stars: 45,
      role: 'Full Stack Engineer',
    }
  ],
  education: [
    {
      institution: 'Massachusetts Institute of Technology',
      degree: 'B.S. in Computer Science and Engineering',
      period: '2022 - May 2026',
      gpa: '3.86 / 4.00',
      coursework: ['Data Structures & Algorithms', 'Distributed Systems', 'Computer Networks', 'Operating Systems', 'Database Systems', 'Machine Learning'],
      honors: ['Dean’s Honor List (4 Semesters)', 'HackMIT 2024 1st Runner Up', 'ACM Student Chapter Vice Chair']
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: 'Aug 2025',
      credentialId: 'AWS-ASA-891048'
    },
    {
      name: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Coursera / Meta',
      issueDate: 'Jan 2025',
      credentialId: 'META-FED-39921'
    }
  ]
};
`);

// ==========================================
// 5. src/data/mockApplications.js
// ==========================================
writeFile('src/data/mockApplications.js', `
export const mockApplications = [
  {
    id: 'app-1',
    company: 'Stripe',
    jobTitle: 'Software Engineer - New Grad 2026',
    jobUrl: 'https://stripe.com/jobs/new-grad-swe-2026',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$165,000 - $185,000 / yr + Equity',
    status: 'Interview',
    fitScore: 88,
    applicationDate: '2026-08-05',
    deadline: '2026-09-10',
    interviewDate: '2026-08-30T14:00:00Z',
    interviewRound: 'Technical Virtual Onsite - Round 2',
    resumeUsed: 'Alex_Rivera_SWE_Backend_v2.pdf',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    companyColor: '#635BFF',
    matchingSkills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'Distributed Systems', 'REST APIs', 'PostgreSQL', 'Docker'],
    missingSkills: ['Ruby', 'gRPC', 'Payment Processing Protocols'],
    notes: 'Completed Round 1 Coding assessment with 100% test cases passed. Round 2 is Systems Architecture & API Design with Senior Staff Engineer.',
    jobDescription: 'Stripe builds financial infrastructure for the internet. As a New Grad Software Engineer, you will design robust, fault-tolerant APIs, build real-time payment settlement pipelines, and work with distributed data stores handling billions of dollars daily. Requirements: Strong proficiency in TypeScript/Node.js or Ruby/Go, solid understanding of distributed systems, RESTful API design, relational databases, and clean code principles.',
    timeline: [
      { status: 'Saved', date: '2026-08-01', note: 'Bookmarked from University career portal' },
      { status: 'Applied', date: '2026-08-05', note: 'Submitted application with customized backend resume' },
      { status: 'Assessment', date: '2026-08-12', note: 'HackerRank 90-min coding test passed (3/3 problems)' },
      { status: 'Interview', date: '2026-08-20', note: 'Recruiter screen cleared. Scheduled technical onsite for Aug 30.' },
    ]
  },
  {
    id: 'app-2',
    company: 'Datadog',
    jobTitle: 'Full Stack Engineer - Core Platform',
    jobUrl: 'https://datadoghq.com/careers/fullstack-core',
    location: 'New York, NY (Hybrid)',
    salary: '$150,000 - $170,000 / yr',
    status: 'Interview',
    fitScore: 84,
    applicationDate: '2026-08-10',
    deadline: '2026-09-15',
    interviewDate: '2026-09-02T10:30:00Z',
    interviewRound: 'Live Coding & System Discussion',
    resumeUsed: 'Alex_Rivera_FullStack_2026.pdf',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    companyColor: '#7742E6',
    matchingSkills: ['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Git'],
    missingSkills: ['Go', 'Kafka', 'Time-Series DBs'],
    notes: 'Passed initial screening. Need to review high-throughput frontend rendering and data visualization architectures (Recharts/D3).',
    jobDescription: 'We are looking for a high-performing Full Stack Engineer to build next-generation monitoring dashboards. You will build responsive React visualizations, optimize high-throughput telemetry data queries in Python/Go, and collaborate directly with product designers.',
    timeline: [
      { status: 'Saved', date: '2026-08-08', note: 'Discovered through MIT career fair' },
      { status: 'Applied', date: '2026-08-10', note: 'Applied via employee referral' },
      { status: 'Assessment', date: '2026-08-16', note: 'Take-home dashboard project submitted' },
      { status: 'Interview', date: '2026-08-24', note: 'Invited to Round 2 Live Coding session' },
    ]
  },
  {
    id: 'app-3',
    company: 'Airbnb',
    jobTitle: 'Frontend Engineer - Guest Experience',
    jobUrl: 'https://airbnb.com/careers/guest-fe',
    location: 'San Francisco, CA (Remote Friendly)',
    salary: '$160,000 - $175,000 / yr + RSU',
    status: 'Offer',
    fitScore: 92,
    applicationDate: '2026-07-15',
    deadline: '2026-08-31',
    interviewDate: null,
    interviewRound: 'Offer Negotiation Phase',
    resumeUsed: 'Alex_Rivera_Frontend_Master.pdf',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
    companyColor: '#FF5A5F',
    matchingSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Web Performance', 'Accessibility (a11y)', 'Jest'],
    missingSkills: ['React Native'],
    notes: 'Received written offer! Base $162k + $40k equity/yr + $15k sign-on. Deadline to sign is Sept 5.',
    jobDescription: 'Join Airbnb Guest Experience team building world-class booking interfaces. You will create performant, accessible UI components, optimize core web vitals, and work with design systems at massive scale.',
    timeline: [
      { status: 'Saved', date: '2026-07-10', note: 'Saved listing' },
      { status: 'Applied', date: '2026-07-15', note: 'Submitted tailored application' },
      { status: 'Assessment', date: '2026-07-22', note: 'Online frontend challenge' },
      { status: 'Interview', date: '2026-08-03', note: 'Virtual onsite: 4 rounds of coding, architecture, behavioral' },
      { status: 'Offer', date: '2026-08-22', note: 'Official offer letter received!' },
    ]
  },
  {
    id: 'app-4',
    company: 'Snowflake',
    jobTitle: 'Cloud Infrastructure & Backend Intern/Grad',
    jobUrl: 'https://snowflake.com/careers/infra-grad',
    location: 'San Mateo, CA (Hybrid)',
    salary: '$155,000 - $170,000 / yr',
    status: 'Interview',
    fitScore: 81,
    applicationDate: '2026-08-14',
    deadline: '2026-09-20',
    interviewDate: '2026-09-08T16:00:00Z',
    interviewRound: 'System Design & Concurrency Interview',
    resumeUsed: 'Alex_Rivera_SWE_Backend_v2.pdf',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    companyColor: '#29B5E8',
    matchingSkills: ['C++', 'Python', 'AWS', 'Docker', 'Distributed Systems', 'SQL', 'Git', 'Linux'],
    missingSkills: ['Rust', 'Kubernetes Operator development'],
    notes: 'Preparing for concurrency and query engine storage concepts. Brush up on Raft consensus implementation from CloudMesh project.',
    jobDescription: 'Snowflake is looking for cloud infrastructure engineers to build resilient, auto-scaling database engines. You will optimize query execution pipelines, work with cloud object stores (S3/GCS), and guarantee 99.999% availability.',
    timeline: [
      { status: 'Applied', date: '2026-08-14', note: 'Application submitted online' },
      { status: 'Assessment', date: '2026-08-20', note: 'Passed Codesignal assessment (840/850)' },
      { status: 'Interview', date: '2026-08-26', note: 'System Design round scheduled' },
    ]
  },
  {
    id: 'app-5',
    company: 'Figma',
    jobTitle: 'Software Engineer - Editor Performance',
    jobUrl: 'https://figma.com/careers/swe-editor',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$165,000 - $190,000 / yr',
    status: 'Rejected',
    fitScore: 74,
    applicationDate: '2026-07-20',
    deadline: '2026-08-15',
    interviewDate: null,
    interviewRound: 'Post-Assessment Stage',
    resumeUsed: 'Alex_Rivera_Frontend_Master.pdf',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
    companyColor: '#F24E1E',
    matchingSkills: ['JavaScript', 'TypeScript', 'React', 'WebSockets', 'Git'],
    missingSkills: ['WebAssembly (Wasm)', 'WebGL / Canvas rendering', 'C++ memory management', 'CRDTs'],
    notes: 'Received automated rejection post-OA. AI Analysis indicates high gap in low-level graphics rendering and WebAssembly.',
    jobDescription: 'Figma editor engine requires deep understanding of WebAssembly, C++, real-time conflict resolution algorithms (CRDTs), and WebGL shader programming.',
    timeline: [
      { status: 'Saved', date: '2026-07-15', note: 'Saved role' },
      { status: 'Applied', date: '2026-07-20', note: 'Applied with general frontend resume' },
      { status: 'Assessment', date: '2026-07-28', note: 'Completed online assessment' },
      { status: 'Rejected', date: '2026-08-15', note: 'Application not moved forward' },
    ]
  },
  {
    id: 'app-6',
    company: 'Microsoft',
    jobTitle: 'Software Engineer - Azure Cloud Native',
    jobUrl: 'https://careers.microsoft.com/azure-swe',
    location: 'Redmond, WA (Hybrid)',
    salary: '$145,000 - $165,000 / yr',
    status: 'Rejected',
    fitScore: 71,
    applicationDate: '2026-07-05',
    deadline: '2026-08-01',
    interviewDate: null,
    interviewRound: 'Resume Screening Stage',
    resumeUsed: 'Alex_Rivera_SWE_Backend_v1.pdf',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=80',
    companyColor: '#00A4EF',
    matchingSkills: ['Java', 'C++', 'Python', 'Docker', 'REST APIs', 'SQL'],
    missingSkills: ['C# / .NET Core', 'Azure Kubernetes Service (AKS)', 'Enterprise OAuth/SAML'],
    notes: 'Rejected at resume screening stage. Resume was missing enterprise C#/.NET keywords and AKS production deployment examples.',
    jobDescription: 'Build core Azure infrastructure services supporting enterprise cloud tenants. Requires deep knowledge of C#/.NET Core, Kubernetes, enterprise security protocols, and high-scale telemetry.',
    timeline: [
      { status: 'Applied', date: '2026-07-05', note: 'Applied on university portal' },
      { status: 'Rejected', date: '2026-07-29', note: 'Application closed without interview' },
    ]
  },
  {
    id: 'app-7',
    company: 'Amazon',
    jobTitle: 'Software Development Engineer I (SDE I)',
    jobUrl: 'https://amazon.jobs/sde-1-grad',
    location: 'Seattle, WA (Onsite)',
    salary: '$140,000 - $160,000 / yr',
    status: 'Assessment',
    fitScore: 82,
    applicationDate: '2026-08-18',
    deadline: '2026-09-05',
    interviewDate: null,
    interviewRound: 'Online Assessment (OA2: Work Simulation)',
    resumeUsed: 'Alex_Rivera_SWE_Backend_v2.pdf',
    logo: 'https://images.unsplash.com/photo-1523474253246-72cb9dcdd8b6?w=100&auto=format&fit=crop&q=80',
    companyColor: '#FF9900',
    matchingSkills: ['Java', 'Python', 'AWS', 'Data Structures & Algorithms', 'REST APIs', 'SQL', 'Git'],
    missingSkills: ['DynamoDB', 'AWS CloudFormation', 'Amazon Leadership Principles mastery'],
    notes: 'Completed OA1 (Coding) with 2/2 passes. Currently working on OA2 (Work Simulation & Leadership Principles).',
    jobDescription: 'As an SDE I at Amazon, you will build customer-facing applications and scalable distributed systems using AWS services, Java, and modern web frameworks.',
    timeline: [
      { status: 'Saved', date: '2026-08-15', note: 'Bookmarked listing' },
      { status: 'Applied', date: '2026-08-18', note: 'Applied online' },
      { status: 'Assessment', date: '2026-08-25', note: 'Received Online Assessment invitation' },
    ]
  },
  {
    id: 'app-8',
    company: 'Uber',
    jobTitle: 'Backend Engineer - Marketplace Dynamics',
    jobUrl: 'https://uber.com/careers/marketplace-swe',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$158,000 - $178,000 / yr',
    status: 'Applied',
    fitScore: 85,
    applicationDate: '2026-08-22',
    deadline: '2026-09-25',
    interviewDate: null,
    interviewRound: 'Application In Review',
    resumeUsed: 'Alex_Rivera_SWE_Backend_v2.pdf',
    logo: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=100&auto=format&fit=crop&q=80',
    companyColor: '#000000',
    matchingSkills: ['Go', 'Python', 'Node.js', 'PostgreSQL', 'Redis', 'Distributed Systems', 'Docker'],
    missingSkills: ['Apache Kafka', 'Cassandra', 'Geospatial indexing (H3)'],
    notes: 'Referred by MIT alumni working on dispatch algorithms. Application currently undergoing recruiter review.',
    jobDescription: 'Design low-latency matching and surge pricing systems in Go and Java. You will optimize real-time routing engines and stream processing architectures.',
    timeline: [
      { status: 'Saved', date: '2026-08-20', note: 'Reached out to alum for referral' },
      { status: 'Applied', date: '2026-08-22', note: 'Referred and applied' },
    ]
  },
  {
    id: 'app-9',
    company: 'Netflix',
    jobTitle: 'Full Stack Engineer - Content Studio',
    jobUrl: 'https://jobs.netflix.com/swe-content',
    location: 'Los Gatos, CA (Hybrid)',
    salary: '$170,000 - $210,000 / yr (All-Cash)',
    status: 'Saved',
    fitScore: 89,
    applicationDate: null,
    deadline: '2026-09-30',
    interviewDate: null,
    interviewRound: 'Not Applied',
    resumeUsed: 'Alex_Rivera_FullStack_2026.pdf',
    logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&auto=format&fit=crop&q=80',
    companyColor: '#E50914',
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Microservices', 'Tailwind CSS', 'Docker'],
    missingSkills: ['RxJS', 'gRPC-Web', 'Complex state orchestration in production'],
    notes: 'Need to refine portfolio with DocuQuery AI case study before applying.',
    jobDescription: 'Build next-generation creative tools for Hollywood filmmakers and content producers. We need engineers with strong craft in React, GraphQL, and modern UI architectures.',
    timeline: [
      { status: 'Saved', date: '2026-08-26', note: 'Saved role to tracker' },
    ]
  },
  {
    id: 'app-10',
    company: 'Vercel',
    jobTitle: 'Developer Experience (DX) Engineer',
    jobUrl: 'https://vercel.com/careers/dx-engineer',
    location: 'Remote (Worldwide)',
    salary: '$140,000 - $165,000 / yr + Options',
    status: 'Withdrawn',
    fitScore: 91,
    applicationDate: '2026-07-25',
    deadline: '2026-08-30',
    interviewDate: null,
    interviewRound: 'Withdrawn by Candidate',
    resumeUsed: 'Alex_Rivera_Frontend_Master.pdf',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    companyColor: '#000000',
    matchingSkills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Git', 'Open Source', 'Node.js'],
    missingSkills: ['Edge Middleware optimization', 'Turborepo'],
    notes: 'Withdrew after receiving Airbnb written offer.',
    jobDescription: 'Build outstanding developer tools, sample templates, and documentation for Next.js and Vercel cloud platforms.',
    timeline: [
      { status: 'Applied', date: '2026-07-25', note: 'Applied online' },
      { status: 'Interview', date: '2026-08-08', note: 'Screening passed' },
      { status: 'Withdrawn', date: '2026-08-24', note: 'Politely withdrew due to accepting Airbnb offer' },
    ]
  }
];
`);

// ==========================================
// 6. src/data/mockResume.js
// ==========================================
writeFile('src/data/mockResume.js', `
export const mockResumeData = {
  fileName: 'Alex_Rivera_Resume_2026.pdf',
  uploadedAt: '2026-08-27T10:15:00Z',
  fileSize: '242 KB',
  overallScore: 84,
  atsScore: 88,
  readabilityScore: 90,
  impactScore: 78,
  keywordDensity: 82,
  extractedData: {
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    phone: '+1 (555) 234-8901',
    location: 'Boston, MA',
    summary: 'Computer Science senior at MIT with a 3.86 GPA and extensive practical experience building distributed cloud applications and high-performance React frontends. Proficient in TypeScript, Python, Go, and AWS.',
    skills: {
      languages: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'Go (Golang)', 'Java', 'C++', 'SQL'],
      frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS', 'Redux Toolkit'],
      cloudDevops: ['Docker', 'AWS (EC2, S3, Lambda)', 'Git', 'GitHub Actions CI/CD', 'Linux/Unix'],
      databases: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma ORM'],
      softSkills: ['Agile Collaboration', 'Technical Writing', 'Cross-Functional Leadership', 'Problem Solving']
    },
    education: [
      {
        institution: 'Massachusetts Institute of Technology (MIT)',
        degree: 'Bachelor of Science in Computer Science and Engineering',
        duration: 'Sep 2022 - May 2026 (Expected)',
        gpa: '3.86 / 4.00',
        honors: "Dean's List, HackMIT 2024 Finalist, ACM Member"
      }
    ],
    experience: [
      {
        title: 'Software Engineering Intern',
        company: 'NovaScale Technologies',
        location: 'Boston, MA',
        duration: 'Jun 2025 - Aug 2025',
        highlights: [
          'Engineered a microservice in Go and PostgreSQL that cut data ingestion latency by 38% for 500k+ daily transactions.',
          'Built responsive analytics dashboard widgets using React and Tailwind CSS, increasing internal engineering adoption by 60%.',
          'Automated end-to-end testing pipeline using Jest and GitHub Actions, improving release stability and cutting bug reports by 25%.'
        ]
      }
    ],
    projects: [
      {
        name: 'CloudMesh — Distributed Key-Value Cache',
        tech: 'Go, Raft Consensus, Redis, Docker',
        highlights: [
          'Architected a distributed key-value store in Go implementing Raft consensus protocol for fault-tolerant state replication.',
          'Benchmarked performance to handle 45,000 requests/sec with sub-5ms p99 latency across a 5-node cluster.'
        ]
      },
      {
        name: 'DocuQuery AI — Semantic Document Intelligence Platform',
        tech: 'React, TypeScript, FastAPI, Pinecone, OpenAI',
        highlights: [
          'Developed a full-stack document analyzer enabling semantic search and AI summarization across 10,000+ academic papers.',
          'Optimized vector embeddings retrieval to return relevant citations in under 280ms.'
        ]
      }
    ],
    certifications: [
      'AWS Certified Solutions Architect – Associate (2025)',
      'Meta Front-End Developer Professional Certificate (2025)'
    ]
  },
  strengths: [
    {
      title: 'Strong Quantifiable Metrics',
      description: 'Bullet points consistently use strong action verbs paired with quantifiable impact metrics (e.g. "cut latency by 38%", "45,000 requests/sec").'
    },
    {
      title: 'Modern & In-Demand Tech Stack',
      description: 'Clear emphasis on industry-standard technologies like React, TypeScript, Go, Docker, AWS, and PostgreSQL.'
    },
    {
      title: 'ATS-Friendly Formatting',
      description: 'Clean single-column structure, standard section headers, and machine-parsable date formats.'
    }
  ],
  weaknesses: [
    {
      title: 'Limited Cloud Orchestration Keywords',
      description: 'Missing keywords like Kubernetes (K8s), Helm, Terraform, or Infrastructure as Code (IaC).'
    },
    {
      title: 'Summary Section Needs Role Customization',
      description: 'The objective statement is somewhat general. Tailor the opening summary depending on whether you are applying for Backend vs Full-Stack.'
    },
    {
      title: 'System Architecture Depth',
      description: 'Expand on how projects handled edge cases, error boundaries, rate limiting, and automated security scans.'
    }
  ],
  aiSuggestions: [
    {
      id: 'sug-1',
      section: 'Work Experience',
      current: 'Built responsive analytics dashboard widgets using React and Tailwind CSS.',
      improved: 'Architected modular React/Tailwind analytics widgets with optimistic UI updates, cutting dashboard render time by 42% for 12,000 monthly active users.',
      reason: 'Adds performance metrics and user scale to demonstrate enterprise-level frontend competency.'
    },
    {
      id: 'sug-2',
      section: 'Projects (CloudMesh)',
      current: 'Benchmarked performance to handle 45,000 requests/sec with sub-5ms p99 latency.',
      improved: 'Benchmarked distributed throughput handling 45,000 req/sec with sub-5ms p99 latency using custom Go load-testing harnesses and Grafana metrics.',
      reason: 'Highlights observability tooling (Grafana) and testing rigor.'
    },
    {
      id: 'sug-3',
      section: 'Skills Summary',
      current: 'AWS (EC2, S3, Lambda)',
      improved: 'Cloud & DevOps: AWS (EC2, S3, Lambda, CloudWatch), Docker, CI/CD Pipelines, Microservices Architecture',
      reason: 'Includes high-weight ATS keywords for DevOps and Cloud roles.'
    }
  ]
};
`);

// ==========================================
// 7. src/data/mockJobs.js
// ==========================================
writeFile('src/data/mockJobs.js', `
export const mockJobTemplates = [
  {
    id: 'sample-fullstack',
    title: 'Full Stack Software Engineer (New Grad / Junior)',
    company: 'Fintech Cloud Technologies',
    location: 'San Francisco, CA / Remote',
    salary: '$135,000 - $160,000 / yr',
    description: \`About the Role:
We are looking for an ambitious Full Stack Software Engineer to join our Core Banking Experience team. You will build user-friendly financial applications used by millions of customers while architecting scalable, resilient backends.

Key Responsibilities:
- Build modular, accessible web applications using React, TypeScript, and modern CSS (Tailwind).
- Design and implement REST and GraphQL APIs using Node.js/Express or Python (FastAPI).
- Work with relational databases (PostgreSQL) and in-memory caches (Redis) to ensure high throughput.
- Collaborate with product managers, UX designers, and senior engineers in an agile environment.
- Maintain automated unit and integration test suites (Jest, Playwright) and CI/CD pipelines.

Required Qualifications:
- Bachelor's degree in Computer Science, Software Engineering, or related technical field (or graduating by 2026).
- Strong proficiency in JavaScript/TypeScript and modern React.
- Solid understanding of backend web services, RESTful APIs, and database fundamentals.
- Familiarity with version control (Git) and Docker containerization.
- Excellent problem-solving, communication, and debugging skills.

Preferred Qualifications:
- Experience with cloud providers such as AWS or GCP.
- Understanding of microservices, distributed systems, and message queues (Kafka/RabbitMQ).
- Contributions to open-source software or compelling side projects.\`
  },
  {
    id: 'sample-backend',
    title: 'Backend Distributed Systems Engineer',
    company: 'HyperScale Data Labs',
    location: 'New York, NY (Hybrid)',
    salary: '$150,000 - $175,000 / yr',
    description: \`HyperScale Data Labs is seeking a Backend Engineer to power our real-time streaming data analytics engine.

What You Will Do:
- Architect high-throughput backend services in Go, Java, or C++.
- Optimize database queries, indexing strategies, and data partitioning in PostgreSQL and Redis.
- Build fault-tolerant distributed systems capable of processing millions of events per second.
- Implement CI/CD pipelines, Docker containers, and Kubernetes deployments on AWS.

Requirements:
- BS/MS in Computer Science or equivalent practical experience.
- Deep knowledge of Data Structures, Algorithms, and Concurrency.
- Experience with Go, Python, or Java and distributed consensus mechanisms (Raft, Paxos).
- Solid grasp of Linux networking, TCP/IP, and asynchronous programming.\`
  },
  {
    id: 'sample-frontend',
    title: 'Frontend Engineer - Design Systems & Web Core',
    company: 'PixelCraft Studio',
    location: 'Remote',
    salary: '$140,000 - $165,000 / yr',
    description: \`PixelCraft is seeking a talented Frontend Engineer passionate about crafting beautiful, accessible, and ultra-fast web experiences.

Responsibilities:
- Develop reusable React UI component libraries with Tailwind CSS and Radix UI primitives.
- Optimize Core Web Vitals (LCP, FID, CLS) and client-side rendering performance.
- Implement complex state management, real-time WebSocket collaborations, and interactive charts.
- Write unit, integration, and visual regression tests with Jest and Cypress.

Requirements:
- Strong mastery of TypeScript, modern React (Hooks, Context, Server Components), and CSS architecture.
- Deep empathy for user experience, web accessibility (WCAG 2.1 AA), and responsive layouts.
- Experience building full-stack Next.js applications and integrating with REST/GraphQL endpoints.\`
  }
];
`);

// ==========================================
// 8. src/data/mockInterviews.js
// ==========================================
writeFile('src/data/mockInterviews.js', `
export const mockInterviewPrepData = {
  'app-1': {
    company: 'Stripe',
    role: 'Software Engineer - New Grad 2026',
    interviewDate: '2026-08-30T14:00:00Z',
    round: 'Technical Virtual Onsite - Round 2',
    fitScore: 88,
    topicsToRevise: [
      { topic: 'Idempotent API Design', importance: 'High', notes: 'Review how Stripe handles duplicate requests using idempotency keys and transactional locking.' },
      { topic: 'Distributed Rate Limiting', importance: 'High', notes: 'Understand token bucket and sliding window counter algorithms in Redis.' },
      { topic: 'Relational Database Transactions (ACID)', importance: 'High', notes: 'Isolation levels, pessimistic vs optimistic locking, and foreign key cascades.' },
      { topic: 'Webhooks & Retry Backoff', importance: 'Medium', notes: 'Exponential backoff with jitter, dead-letter queues, and signature verification.' },
    ],
    technicalQuestions: [
      {
        question: 'How would you design an Idempotent API endpoint for processing monetary transfers?',
        hint: 'Discuss UUID idempotency headers, database transaction isolation, unique constraints, and cached response replaying.',
        keyPoints: [
          'Client supplies a unique Idempotency-Key header.',
          'Server checks cache/DB inside an atomic transaction before processing.',
          'Return stored response if already processed; return 409 or in-progress if currently locking.'
        ]
      },
      {
        question: 'Explain how you would implement a distributed rate limiter that handles 50,000 requests per second.',
        hint: 'Compare Sliding Window Log, Sliding Window Counter, and Token Bucket in Redis.',
        keyPoints: [
          'Redis Lua scripts for atomic increments.',
          'Sliding window counter with sub-second granularity.',
          'Graceful degradation when Redis instance is unreachable.'
        ]
      }
    ],
    hrQuestions: [
      {
        question: 'Tell me about a time you faced a difficult technical disagreement on an engineering project.',
        hint: 'Use the STAR method (Situation, Task, Action, Result) focusing on objective data and user empathy.',
        keyPoints: ['Acknowledge other perspectives', 'Run benchmarks or PoCs', 'Focus on team goals']
      },
      {
        question: 'Why do you want to join Stripe over other tech companies?',
        hint: 'Mention Stripe developer experience, financial infrastructure complexity, and cultural values (rigor, impact).',
        keyPoints: ['Obsession with developer APIs', 'Scale of global economic infrastructure', 'High engineering bar']
      }
    ],
    resumeQuestions: [
      {
        question: 'In your CloudMesh project, how did you handle network partition scenarios in your Raft implementation?',
        hint: 'Explain leader election timeouts, split-brain mitigation with quorum (N/2 + 1), and log uncommitted rollbacks.'
      },
      {
        question: 'How did you achieve a 38% reduction in latency during your NovaScale internship?',
        hint: 'Detail the connection pooling, batch queries, and Go goroutine concurrency model used.'
      }
    ],
    projectQuestions: [
      {
        question: 'Walk me through the architecture of DocuQuery AI from client request to vector retrieval and LLM synthesis.',
        hint: 'Describe React client -> FastAPI gateway -> Chunking pipeline -> Pinecone similarity search -> Prompt augmentation -> Streaming response.'
      }
    ],
    jdSpecificQuestions: [
      {
        question: 'How do you ensure zero data loss during high-volume payment ledger updates?',
        hint: 'Discuss double-entry bookkeeping, write-ahead logs (WAL), and distributed sagas.'
      }
    ],
    behaviorTips: [
      'Speak your thought process aloud before writing code.',
      'Ask clarifying questions about input bounds, edge cases (empty arrays, nulls, concurrent duplicate hits).',
      'Validate time and space complexity upfront.'
    ],
    checklist: [
      { id: 'c1', text: 'Test webcam, microphone, and quiet lighting setup in advance', completed: true },
      { id: 'c2', text: 'Have a glass of water and notepad ready by your desk', completed: true },
      { id: 'c3', text: 'Review STAR behavioral stories for 5 core situations (Conflict, Failure, Leadership, Ambiguity, Tight Deadline)', completed: false },
      { id: 'c4', text: 'Prepare 3 thoughtful questions to ask the interviewer about their team and technical challenges', completed: false },
      { id: 'c5', text: 'Review CloudMesh and NovaScale internship architectural diagrams', completed: false },
    ]
  },
  'app-2': {
    company: 'Datadog',
    role: 'Full Stack Engineer - Core Platform',
    interviewDate: '2026-09-02T10:30:00Z',
    round: 'Live Coding & System Discussion',
    fitScore: 84,
    topicsToRevise: [
      { topic: 'React Performance & Virtualized Lists', importance: 'High', notes: 'Rendering thousands of log events smoothly using windowing (react-window/virtual).' },
      { topic: 'Time-Series Aggregations', importance: 'High', notes: 'Downsampling, rolling averages, and p50/p90/p99 metric calculations.' },
      { topic: 'State Management & Custom Hooks', importance: 'Medium', notes: 'Optimistic UI updates, caching layers, and subscription cleanup.' }
    ],
    technicalQuestions: [
      {
        question: 'How would you render a live real-time chart updating 100 times a second without freezing the React UI?',
        hint: 'Mention WebGL/Canvas rendering, requestAnimationFrame batching, Web Workers, and decoupled state subscriptions.',
        keyPoints: ['Avoid full React tree re-renders', 'Use Canvas/WebGL context directly', 'Throttle data intake with ring buffers']
      }
    ],
    hrQuestions: [
      {
        question: 'Describe a project where you had to quickly learn an unfamiliar technology under tight deadlines.',
        hint: 'Focus on systematic documentation reading, building quick spike prototypes, and delivering results.'
      }
    ],
    resumeQuestions: [
      {
        question: 'Why did you choose FastAPI over Flask or Django for DocuQuery AI?',
        hint: 'Pydantic data validation, native async/await for I/O operations, automatic OpenAPI documentation.'
      }
    ],
    projectQuestions: [
      {
        question: 'How would you scale CampusPulse marketplace to support 100,000 concurrent active users during campus rush week?',
        hint: 'Discuss CDN caching, read replicas in PostgreSQL, Redis pub/sub for WebSockets, and horizontal pod autoscaling.'
      }
    ],
    jdSpecificQuestions: [
      {
        question: 'What are the key differences between logs, metrics, and distributed traces?',
        hint: 'Explain telemetry pillars: discrete events vs numerical aggregations vs request lifecycle spans.'
      }
    ],
    behaviorTips: [
      'Communicate user experience trade-offs (e.g. latency vs consistency).',
      'Structure code cleanly with reusable helper functions and clear naming.'
    ],
    checklist: [
      { id: 'd1', text: 'Review React 19 concurrent features and hooks', completed: true },
      { id: 'd2', text: 'Practice 2 frontend live-coding whiteboard problems', completed: false },
      { id: 'd3', text: 'Review Datadog product features (APM, Synthetics, Dashboards)', completed: false }
    ]
  },
  'app-4': {
    company: 'Snowflake',
    role: 'Cloud Infrastructure & Backend Intern/Grad',
    interviewDate: '2026-09-08T16:00:00Z',
    round: 'System Design & Concurrency Interview',
    fitScore: 81,
    topicsToRevise: [
      { topic: 'Multi-threaded Concurrency & Mutexes', importance: 'High', notes: 'Deadlock avoidance, read-write locks, atomic operations in C++/Go.' },
      { topic: 'Columnar Storage vs Row Storage', importance: 'High', notes: 'Parquet/ORC compression, micro-partitioning, and vectorized execution.' }
    ],
    technicalQuestions: [
      {
        question: 'Explain how separation of storage and compute works in modern cloud data warehouses.',
        hint: 'Decoupled stateless compute clusters querying shared immutable object storage (AWS S3) with local SSD caching.',
        keyPoints: ['Independent scaling of compute and storage', 'Ephemeral query nodes', 'Local caching tier']
      }
    ],
    hrQuestions: [
      {
        question: 'Why Snowflake over legacy database companies?',
        hint: 'Pioneering cloud data cloud architecture, multi-cloud elasticity, and high-performance querying.'
      }
    ],
    resumeQuestions: [
      {
        question: 'How did you benchmark the 45,000 req/sec in your CloudMesh distributed cache?',
        hint: 'Describe wrk/vegeta load testing tools, network bandwidth constraints, and goroutine allocation.'
      }
    ],
    projectQuestions: [
      {
        question: 'What data structure would you use to implement an LRU cache with O(1) get and put operations?',
        hint: 'Hash Map combined with a Doubly Linked List.'
      }
    ],
    jdSpecificQuestions: [
      {
        question: 'How does query compilation differ from interpreted query execution?',
        hint: 'JIT compilation to machine code vs iterator (Volcano) execution model.'
      }
    ],
    behaviorTips: [
      'Draw block diagrams clearly and explain data flow from client to disks.',
      'Explicitly state trade-offs regarding memory, I/O, and CPU.'
    ],
    checklist: [
      { id: 's1', text: 'Review C++ memory model and Go concurrency primitives', completed: false },
      { id: 's2', text: 'Study Snowflake architecture whitepaper overview', completed: false }
    ]
  }
};

export const mockQuestionsBank = [
  {
    id: 'q-1',
    category: 'System Design',
    question: 'How would you design a scalable URL shortener service (like bit.ly) handling 500 million links and 10 billion clicks per month?',
    expectedPoints: ['Base62 encoding of 64-bit auto-incrementing ID', 'Redis caching for hot URL redirects (80/20 rule)', 'Database schema with short_hash, original_url, created_at, user_id', 'Scale calculations for storage and QPS'],
    sampleGoodAnswer: 'To design a URL shortener like bit.ly, I will break it into API design, data modeling, hashing strategy, and caching. For write traffic of ~200 writes/sec and read traffic of ~4,000 reads/sec, a relational DB like PostgreSQL with an indexed 7-character Base62 hash is optimal. We store the original URL and map it to a generated 64-bit integer encoded in Base62. For high-speed reads, we use a Redis cache cluster caching the top 20% most accessed URLs with an LRU eviction policy, achieving sub-10ms redirect latency.'
  },
  {
    id: 'q-2',
    category: 'Algorithms & Architecture',
    question: 'Explain how you would handle race conditions when two users attempt to purchase the exact last seat on a flight simultaneously.',
    expectedPoints: ['Pessimistic locking with SELECT FOR UPDATE', 'Optimistic locking with version timestamp / ETag', 'Distributed lock using Redis Redlock', 'Idempotency and database isolation levels'],
    sampleGoodAnswer: 'We can prevent double-booking using either database-level pessimistic locking or optimistic concurrency control. With optimistic locking, the seat record has a version column. When reserving, we execute UPDATE seats SET status = "RESERVED", version = version + 1 WHERE seat_id = ? AND version = ?. If rows affected is 0, another transaction won, and we inform the user the seat is no longer available. For high concurrency across multiple microservices, we can acquire a temporary 10-minute hold lock using a distributed Redis lock with TTL.'
  },
  {
    id: 'q-3',
    category: 'Behavioral & Leadership',
    question: 'Tell me about a time you made a technical mistake or suffered an outage. What happened and what did you learn?',
    expectedPoints: ['Ownership and quick incident mitigation', 'Blameless root cause analysis (RCA)', 'Preventative action items: automated regression tests, lint checks, staging parity'],
    sampleGoodAnswer: 'During my internship, I pushed a database migration script that missed an index on a frequently queried foreign key column. When deployed to staging with large mock datasets, API response times spiked to 8 seconds. Once notified, I immediately rolled back the migration, analyzed query execution plans using EXPLAIN ANALYZE, added the composite B-Tree index, and updated our CI pipeline to mandate query cost linting checks for all future PRs.'
  }
];
`);

// ==========================================
// 9. src/data/mockAnalytics.js
// ==========================================
writeFile('src/data/mockAnalytics.js', `
export const mockAnalyticsData = {
  summary: {
    totalApplications: 10,
    interviews: 3,
    offers: 1,
    rejections: 2,
    assessments: 1,
    saved: 2,
    withdrawn: 1,
    interviewRate: 30.0,
    rejectionRate: 20.0,
    offerRate: 10.0,
    averageFitScore: 82.6,
    careerReadinessScore: 76,
  },
  applicationsOverTime: [
    { month: 'Apr', applications: 2, interviews: 0, offers: 0 },
    { month: 'May', applications: 4, interviews: 1, offers: 0 },
    { month: 'Jun', applications: 6, interviews: 2, offers: 0 },
    { month: 'Jul', applications: 8, interviews: 3, offers: 0 },
    { month: 'Aug', applications: 10, interviews: 3, offers: 1 },
  ],
  statusDistribution: [
    { name: 'Interview', value: 3, color: '#f59e0b' },
    { name: 'Offer', value: 1, color: '#10b981' },
    { name: 'Assessment', value: 1, color: '#a855f7' },
    { name: 'Applied', value: 1, color: '#3b82f6' },
    { name: 'Saved', value: 2, color: '#64748b' },
    { name: 'Rejected', value: 2, color: '#ef4444' },
    { name: 'Withdrawn', value: 1, color: '#94a3b8' },
  ],
  fitScoreTrends: [
    { range: '90-100%', applications: 2, interviewRate: 100, label: '90-100%' },
    { range: '80-89%', applications: 5, interviewRate: 60, label: '80-89%' },
    { range: '70-79%', applications: 3, interviewRate: 0, label: '70-79%' },
    { range: '<70%', applications: 0, interviewRate: 0, label: '<70%' },
  ],
  skillGapFrequency: [
    { skill: 'Kubernetes / K8s', missingInJobs: 4, category: 'DevOps' },
    { skill: 'Apache Kafka / Streaming', missingInJobs: 3, category: 'Backend' },
    { skill: 'WebAssembly (Wasm)', missingInJobs: 2, category: 'Frontend' },
    { skill: 'GraphQL Subscriptions', missingInJobs: 2, category: 'APIs' },
    { skill: 'gRPC / Protocol Buffers', missingInJobs: 2, category: 'Backend' },
    { skill: 'Terraform / IaC', missingInJobs: 2, category: 'DevOps' },
  ],
  aiCoachInsights: [
    {
      id: 'coach-1',
      type: 'high_priority',
      title: 'Fit Score > 80% yields 80% higher interview callbacks',
      description: 'Your applications with a Fit Score above 80% have received 3 interviews and 1 offer. Prioritize applying to roles where your skill overlap is at least 80%.',
      actionText: 'Run Job Intelligence on new listings'
    },
    {
      id: 'coach-2',
      type: 'skill_recommendation',
      title: 'Add Kafka & Kubernetes to unlock 4 more Tier-1 tech roles',
      description: 'Kafka and Kubernetes appeared as missing skills in 40% of your targeted backend applications (Snowflake, Datadog, Uber). Building a small event-driven pipeline project will bridge this gap.',
      actionText: 'View Recommended Project Blueprints'
    },
    {
      id: 'coach-3',
      type: 'interview_tip',
      title: 'Stripe Onsite scheduled in 2 days',
      description: 'Review Idempotency Keys and Distributed Rate Limiting. Practice our AI Mock Interview session to test your verbal clarity under time constraints.',
      actionText: 'Start Stripe Mock Interview'
    }
  ]
};
`);

// ==========================================
// 10. src/services/mockAiService.js
// ==========================================
writeFile('src/services/mockAiService.js', `
// Mock AI Service for CareerPilot AI
import { mockQuestionsBank } from '../data/mockInterviews';

export const mockAiService = {
  // Simulate AI Job Description Analysis
  async analyzeJobDescription(jdText, userProfile) {
    await new Promise(resolve => setTimeout(resolve, 800)); // realistic AI latency simulation
    const text = jdText.toLowerCase();

    const techStack = [
      'react', 'typescript', 'javascript', 'node.js', 'python', 'go', 'golang', 'java',
      'c++', 'sql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws',
      'next.js', 'tailwind', 'graphql', 'rest api', 'kafka', 'ci/cd'
    ];

    const detected = techStack.filter(t => text.includes(t));
    const userSkills = userProfile?.skills?.map(s => s.name.toLowerCase()) || [];

    const matching = detected.filter(t => userSkills.some(us => us.includes(t) || t.includes(us)));
    const missing = detected.filter(t => !userSkills.some(us => us.includes(t) || t.includes(us)));

    const fitScore = Math.min(96, Math.max(58, Math.round((matching.length / Math.max(1, detected.length)) * 80 + 20)));

    return {
      fitScore,
      skillMatchScore: Math.min(95, fitScore + 4),
      experienceMatchScore: 82,
      educationMatchScore: 95,
      projectMatchScore: matching.length > 2 ? 88 : 65,
      atsKeywordScore: Math.round(fitScore * 0.9 + 5),
      requiredSkills: detected.slice(0, 5).map(s => s.toUpperCase()),
      preferredSkills: detected.slice(5).map(s => s.toUpperCase()),
      matchingSkills: matching.map(s => s.toUpperCase()),
      missingSkills: missing.length ? missing.map(s => s.toUpperCase()) : ['KUBERNETES', 'KAFKA'],
      aiSummary: 'This role aligns strongly with your full-stack and distributed systems experience. To maximize callback chances, emphasize your project metrics and add mentions of scalable database query optimizations.',
      customResumeBullets: [
        'Demonstrated ability building high-scale services matching the requirements for ' + (matching[0] || 'core engineering') + '.',
        'Experience architecting robust APIs and modular frontend components with sub-second response times.'
      ]
    };
  },

  // Simulate AI Mock Interview Evaluation
  async evaluateInterviewAnswer(questionText, userAnswer) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const answerLen = userAnswer.trim().length;

    let score = 75;
    let feedback = '';
    let strengths = [];
    let improvements = [];

    if (answerLen < 50) {
      score = 45;
      feedback = 'Your answer is quite brief. In a real technical interview, provide concrete architectural trade-offs, step-by-step reasoning, and specific technologies.';
      strengths = ['Addressed the topic directly'];
      improvements = ['Elaborate on edge cases', 'Structure response using STAR or architectural layers', 'Mention specific metrics and technologies'];
    } else if (answerLen < 150) {
      score = 72;
      feedback = 'Solid response covering the foundational concepts. To reach an elite rating, emphasize scalability bottlenecks, failure modes, and performance trade-offs.';
      strengths = ['Clear terminology', 'Good understanding of basic workflow'];
      improvements = ['Mention database indexing or caching layers', 'Discuss how to handle high-concurrency collisions'];
    } else {
      score = 89;
      feedback = 'Excellent, structured, and comprehensive answer! You clearly demonstrated systematic problem solving, discussed trade-offs, and mentioned relevant protocols.';
      strengths = ['Structured response with deep technical terminology', 'Addressed concurrency and performance trade-offs', 'Realistic implementation details'];
      improvements = ['Can briefly touch upon automated telemetry and alerting monitoring'];
    }

    return {
      score,
      feedback,
      strengths,
      improvements,
      clarityScore: Math.min(95, score + 4),
      technicalAccuracy: score,
      starCompliance: answerLen > 100 ? 88 : 60,
    };
  }
};
`);

console.log('Utilities, mock data, and mock AI service successfully generated.');