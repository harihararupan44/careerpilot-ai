export const mockResumeData = {
  fileName: 'Alex_Rivera_Resume_2026.pdf',
  uploadedAt: '2026-08-27T10:15:00Z',
  fileSize: '242 KB',
  overallScore: 84,
  atsScore: 88,
  readabilityScore: 90,
  impactScore: 78,
  keywordDensity: 82,
  sections: [
    { name: 'Contact & Header Information', status: 'Complete' },
    { name: 'Professional Summary', status: 'Complete' },
    { name: 'Technical Skills Matrix', status: 'Complete' },
    { name: 'Work Experience & Impact', status: 'Complete' },
    { name: 'Projects & Repositories', status: 'Complete' },
    { name: 'Education & Honors', status: 'Complete' },
    { name: 'Industry Certifications', status: 'Complete' }
  ],
  keywords: [
    { skill: 'React', count: 8 },
    { skill: 'TypeScript', count: 6 },
    { skill: 'Go / Golang', count: 5 },
    { skill: 'PostgreSQL', count: 4 },
    { skill: 'AWS', count: 4 },
    { skill: 'Docker', count: 3 },
    { skill: 'Distributed Systems', count: 3 },
    { skill: 'FastAPI', count: 2 }
  ],
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
