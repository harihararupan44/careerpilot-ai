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
