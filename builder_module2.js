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

// 1. src/data/mockPeople.js with rich Public Profile fields
writeFile('src/data/mockPeople.js', `
export const mockPeople = [
  {
    id: 'person-1',
    name: 'Arun Kumar',
    role: 'Software Development Engineer',
    company: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=80&auto=format&fit=crop&q=80',
    college: 'Sri Krishna College of Technology',
    location: 'Coimbatore, India',
    skills: ['Java', 'DSA', 'SQL', 'AWS', 'Spring Boot', 'System Design', 'Git'],
    bio: 'Software engineer with experience preparing for product-based company placements. Cracked Amazon off-campus in 2024.',
    about: 'I am a Software Development Engineer at Amazon with a strong passion for scalable backend architectures and distributed data pipelines. During my undergraduate studies at Sri Krishna College of Technology, I dedicated over 400 hours to mastering Data Structures, Algorithms, and Object-Oriented Design patterns. I successfully navigated Amazon\\'s 4-round off-campus interview process and now actively mentor engineering students aiming for top-tier product engineering roles.',
    experienceLevel: '1-2 Years',
    experienceYears: 2,
    availableForGuidance: true,
    guidanceCount: 24,
    addedDate: '2026-08-15',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'Sri Krishna College of Technology',
      degree: 'Bachelor of Technology (B.Tech)',
      branch: 'Information Technology',
      graduationYear: '2024',
      gpa: '8.8 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/arunkumar-tech',
      github: 'https://github.com/arunkumar-dev'
    },
    projects: [
      {
        id: 'proj-1',
        name: 'Distributed Order Processing Engine',
        description: 'Built an event-driven microservices order processing pipeline in Java & Spring Boot handling 20,000 requests/sec with Kafka and Redis caching.',
        technologies: ['Java', 'Spring Boot', 'Apache Kafka', 'Redis', 'PostgreSQL'],
        githubUrl: 'https://github.com/arunkumar-dev/order-engine',
        demoUrl: 'https://order-engine-demo.dev'
      },
      {
        id: 'proj-2',
        name: 'LeetCode Pattern Visualizer',
        description: 'Interactive web platform explaining two-pointer, sliding window, and graph BFS/DFS algorithmic patterns with step-by-step memory diagrams.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'DSA'],
        githubUrl: 'https://github.com/arunkumar-dev/algo-visualizer',
        demoUrl: 'https://algo-visualizer.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: 'Nov 2024',
        credentialUrl: 'https://aws.amazon.com/verification'
      },
      {
        id: 'cert-2',
        name: 'Oracle Certified Professional: Java SE 17 Developer',
        issuer: 'Oracle',
        issueDate: 'May 2023',
        credentialUrl: 'https://oracle.com/certview'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'SKCT Information Technology', date: '2020 - 2024', description: 'Built strong foundations in OS, DBMS, Computer Networks, and OOP concepts.' },
      { stage: 'Preparation', title: 'Dedicated DSA & Core CS Grinding', date: 'Jan 2024 - Apr 2024', description: 'Solved 350+ LeetCode problems covering Trees, Graphs, DP, and practiced Amazon Leadership Principles.' },
      { stage: 'Assessment', title: 'Amazon Online Assessment (OA)', date: 'May 2024', description: 'Cleared 2 algorithmic coding problems + Work Styles assessment with 100% test cases.' },
      { stage: 'Technical Interviews', title: 'Rounds 1 & 2 Video Interviews', date: 'June 2024', description: 'Designed an LRU cache with concurrent lock safety and implemented binary tree serialization.' },
      { stage: 'HR', title: 'Bar Raiser & Behavioral Round', date: 'June 2024', description: 'Demonstrated Customer Obsession and Bias for Action through past production project examples.' },
      { stage: 'Offer', title: 'SDE-1 Job Offer Letter', date: 'July 2024', description: 'Received official offer letter for SDE-1 position with competitive compensation package.' },
      { stage: 'Current Role', title: 'SDE @ Amazon Fulfillment Tech', date: 'Aug 2024 - Present', description: 'Developing real-time inventory allocation services with high availability and low latency.' }
    ],
    placementJourney: {
      company: 'Amazon',
      role: 'Software Development Engineer (SDE-1)',
      preparationDuration: '4 months',
      selectionProcess: [
        'Online Assessment (OA - 2 Coding Problems + Work Simulation)',
        'Technical Round 1 (DSA: Trees, HashMaps, Heap)',
        'Technical Round 2 (Low-Level Design & Concurrency)',
        'Bar Raiser & HR (Amazon Leadership Principles & Behavioral)',
        'Official Offer Letter'
      ],
      skillsUsed: ['Java', 'Data Structures & Algorithms', 'System Design Basics', 'SQL', 'Amazon Leadership Principles'],
      preparationStrategy: 'I structured my daily routine into 3 hours of DSA problem-solving (focusing on pattern recognition rather than memorization) and 1 hour of CS fundamentals revision. For behavioral rounds, I mapped 8 distinct real project challenges to Amazon Leadership Principles using the STAR method.'
    },
    interviewExperiences: [
      {
        id: 'exp-1',
        company: 'Amazon',
        role: 'Software Development Engineer',
        year: '2024',
        difficulty: 'Medium - Hard',
        roundsCount: '4 Rounds',
        description: 'Comprehensive 4-round process covering sliding window arrays, Trie implementation, concurrency in Java, and in-depth STAR behavioral questions on failure and ownership.'
      },
      {
        id: 'exp-2',
        company: 'Zoho',
        role: 'Software Developer',
        year: '2023',
        difficulty: 'Medium',
        roundsCount: '5 Rounds',
        description: 'Campus placement drive consisting of basic C programming test, advanced algorithmic problem solving in Java, and OOP application design.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '96%',
      avgResponseTime: 'Within 24 hours'
    }
  },
  {
    id: 'person-2',
    name: 'Priya Sharma',
    role: 'Software Engineer - Core Search',
    company: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=80&auto=format&fit=crop&q=80',
    college: 'NIT Trichy',
    location: 'Bangalore, India',
    skills: ['C++', 'Distributed Systems', 'Python', 'Algorithms', 'System Design', 'Go'],
    bio: 'Ex-competitive programmer. Mentoring college students on Google STEP & SWE campus interviews.',
    about: 'I am a Software Engineer on the Core Search infrastructure team at Google Bangalore. An alumnus of NIT Trichy, I represented my college in ACM-ICPC regionals and was an active mentor for juniors. My preparation centered on writing bug-free, optimal C++ code under time pressure and articulating time/space complexities clearly.',
    experienceLevel: '3-5 Years',
    experienceYears: 4,
    availableForGuidance: true,
    guidanceCount: 42,
    addedDate: '2026-08-20',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'National Institute of Technology (NIT), Trichy',
      degree: 'Bachelor of Technology (B.Tech)',
      branch: 'Computer Science and Engineering',
      graduationYear: '2022',
      gpa: '9.4 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/priyasharma-swe',
      github: 'https://github.com/priyasharma-code'
    },
    projects: [
      {
        id: 'proj-3',
        name: 'Distributed KV-Store with Raft Consensus',
        description: 'Implemented a fault-tolerant distributed key-value store in Go with log replication and leader election based on the Raft consensus paper.',
        technologies: ['Go', 'Raft Consensus', 'gRPC', 'Protobuf'],
        githubUrl: 'https://github.com/priyasharma-code/raft-kv',
        demoUrl: 'https://raft-kv-docs.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-3',
        name: 'Google Cloud Certified Professional Cloud Architect',
        issuer: 'Google Cloud',
        issueDate: 'Jan 2023',
        credentialUrl: 'https://cloud.google.com/certification'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'NIT Trichy Computer Science', date: '2018 - 2022', description: 'Competed in Codeforces (Candidate Master) and ACM-ICPC Regionals.' },
      { stage: 'Preparation', title: 'Advanced Algorithms & Graph Theory', date: '2021 - 2022', description: 'Practiced advanced DP, Segment Trees, Network Flows, and clean code communication.' },
      { stage: 'Assessment', title: 'Google Online Challenge', date: 'Oct 2021', description: 'Solved 2 competitive programming challenges in C++ in 60 minutes.' },
      { stage: 'Technical Interviews', title: '3 Technical Phone / Video Rounds', date: 'Nov 2021', description: 'Live coding on Google Docs focusing on time complexity, edge cases, and modular functions.' },
      { stage: 'HR', title: 'Googleyness & Leadership', date: 'Dec 2021', description: 'Discussed teamwork in hackathons, handling ambiguity, and navigating disagreements.' },
      { stage: 'Offer', title: 'Google SWE Offer Letter', date: 'Jan 2022', description: 'Offer extended and joined Google Search infrastructure in Bangalore.' },
      { stage: 'Current Role', title: 'SWE II @ Google Search Core', date: '2022 - Present', description: 'Optimizing query ranking pipelines serving millions of queries per second.' }
    ],
    placementJourney: {
      company: 'Google',
      role: 'Software Engineer',
      preparationDuration: '6 months',
      selectionProcess: [
        'Google Online Challenge (GOC)',
        'Technical Round 1 (Hard DP & Graphs)',
        'Technical Round 2 (Data Structures & Bit Manipulation)',
        'Technical Round 3 (System Architecture & Scale)',
        'Googleyness & Leadership Interview'
      ],
      skillsUsed: ['C++', 'Competitive Programming', 'Graph Theory', 'Dynamic Programming', 'Googleyness'],
      preparationStrategy: 'I solved Codeforces Div 2 problems regularly to build speed, and simulated mock interviews on Google Docs without IDE auto-complete. Communicating your thought process before writing a single line of code is 80% of what Google interviewers evaluate.'
    },
    interviewExperiences: [
      {
        id: 'exp-3',
        company: 'Google',
        role: 'Software Engineer',
        year: '2022',
        difficulty: 'Hard',
        roundsCount: '4 Rounds',
        description: 'High emphasis on writing clean, optimal code on Google Docs, explaining mathematical bounds, and solving follow-up scalability questions.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '98%',
      avgResponseTime: 'Within 12 hours'
    }
  },
  {
    id: 'person-3',
    name: 'Rohan Mehta',
    role: 'Full Stack Engineer',
    company: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=80&auto=format&fit=crop&q=80',
    college: 'BITS Pilani',
    location: 'Hyderabad, India',
    skills: ['TypeScript', 'React', 'Azure', 'C# / .NET', 'Node.js', 'SQL'],
    bio: 'Passionate about building scalable UI components and enterprise cloud microservices on Azure.',
    about: 'Full Stack Engineer at Microsoft Azure Core Developer Tools. Graduated from BITS Pilani where I led the developer student club. I enjoy mentoring students on how to showcase full-stack projects on GitHub, write production-quality TypeScript, and prepare for Microsoft campus & off-campus hiring drives.',
    experienceLevel: '1-2 Years',
    experienceYears: 1.5,
    availableForGuidance: true,
    guidanceCount: 18,
    addedDate: '2026-08-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'BITS Pilani',
      degree: 'B.E. (Hons)',
      branch: 'Computer Science',
      graduationYear: '2024',
      gpa: '8.9 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/rohanmehta-dev',
      github: 'https://github.com/rohanmehta'
    },
    projects: [
      {
        id: 'proj-4',
        name: 'Azure Resource Telemetry Dashboard',
        description: 'Real-time monitoring panel displaying CPU, memory, and latency bottlenecks for cloud services with React and WebSocket telemetry.',
        technologies: ['React', 'TypeScript', 'Tailwind', 'Azure Functions'],
        githubUrl: 'https://github.com/rohanmehta/azure-dashboard',
        demoUrl: 'https://azure-dashboard.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-4',
        name: 'Microsoft Certified: Azure Developer Associate',
        issuer: 'Microsoft',
        issueDate: 'Aug 2024',
        credentialUrl: 'https://learn.microsoft.com/credentials'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'BITS Pilani CS', date: '2020 - 2024', description: 'Led full-stack campus web projects and hackathon winning teams.' },
      { stage: 'Preparation', title: 'Full Stack Projects & DSA', date: '2023 - 2024', description: 'Built production-grade apps in TypeScript and solved 250+ LeetCode mediums.' },
      { stage: 'Assessment', title: 'Microsoft Online Coding Round', date: 'Feb 2024', description: '3 coding questions focusing on Arrays, Strings, and Recursion.' },
      { stage: 'Technical Interviews', title: '2 Rounds of DSA & Architecture', date: 'Mar 2024', description: 'Deep dive into full-stack architecture, React performance, and tree traversals.' },
      { stage: 'HR', title: 'Microsoft Leadership & Values', date: 'Mar 2024', description: 'Evaluated Growth Mindset and collaboration across multidisciplinary teams.' },
      { stage: 'Offer', title: 'Software Engineer Offer', date: 'Apr 2024', description: 'Joined Microsoft Azure Developer Tools in Hyderabad.' },
      { stage: 'Current Role', title: 'Full Stack Engineer @ Microsoft', date: '2024 - Present', description: 'Building cloud SDKs and developer extensions.' }
    ],
    placementJourney: {
      company: 'Microsoft',
      role: 'Full Stack Software Engineer',
      preparationDuration: '5 months',
      selectionProcess: [
        'Online Coding Assessment (Codility)',
        'Technical Round 1 (DSA: Trees, Dynamic Programming)',
        'Technical Round 2 (System Design & Project Architecture)',
        'Director / HR Round (Growth Mindset & Cultural Fit)',
        'Offer Extended'
      ],
      skillsUsed: ['TypeScript', 'C# / .NET', 'React', 'DSA', 'Azure'],
      preparationStrategy: 'Microsoft focuses heavily on the "Growth Mindset" alongside strong DSA basics. Make sure your GitHub projects are deployed and demonstrate real-world utility with unit tests and clear README documentation.'
    },
    interviewExperiences: [
      {
        id: 'exp-4',
        company: 'Microsoft',
        role: 'Software Engineer',
        year: '2024',
        difficulty: 'Medium - Hard',
        roundsCount: '4 Rounds',
        description: 'Well-structured rounds testing both algorithmic depth (Binary Search, DP) and practical full-stack system architecture.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '94%',
      avgResponseTime: 'Within 24 hours'
    }
  },
  {
    id: 'person-4',
    name: 'Sneha Patel',
    role: 'Frontend Developer',
    company: 'Zoho',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&auto=format&fit=crop&q=80',
    college: 'PSG College of Technology',
    location: 'Chennai, India',
    skills: ['JavaScript', 'React', 'CSS3', 'REST APIs', 'HTML5', 'Git'],
    bio: 'Cracked Zoho campus placement with strong foundations in vanilla JS and UI engineering fundamentals.',
    about: 'Frontend Developer at Zoho Corporation working on Zoho CRM UI components. Alumnus of PSG College of Technology. Zoho has a distinct interview process that emphasizes strong foundational programming in C/Java/JS without external libraries. I love guiding students on cracking Zoho round-by-round.',
    experienceLevel: 'Entry Level (Campus Placement)',
    experienceYears: 0.8,
    availableForGuidance: true,
    guidanceCount: 31,
    addedDate: '2026-08-25',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'PSG College of Technology',
      degree: 'B.E.',
      branch: 'Computer Science and Engineering',
      graduationYear: '2025',
      gpa: '8.6 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/snehapatel-zoho',
      github: 'https://github.com/snehapatel'
    },
    projects: [
      {
        id: 'proj-5',
        name: 'Accessible Component Design System',
        description: 'Zero-dependency accessible UI library adhering to WCAG 2.1 AA standards with smooth keyboard navigation.',
        technologies: ['JavaScript', 'CSS3', 'HTML5', 'Web Accessibility'],
        githubUrl: 'https://github.com/snehapatel/accessible-ui',
        demoUrl: 'https://accessible-ui.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-5',
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta (Coursera)',
        issueDate: 'Jun 2024',
        credentialUrl: 'https://coursera.org/verify'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'PSG Tech CSE', date: '2021 - 2025', description: 'Built solid grasp on C, Data Structures, and vanilla Web technologies.' },
      { stage: 'Preparation', title: 'Zoho-Specific Problem Solving', date: 'Jan 2025 - Mar 2025', description: 'Practiced Zoho previous year questions, pattern printing, and OOP console apps.' },
      { stage: 'Assessment', title: 'Zoho Round 1: Basic Programming', date: 'Apr 2025', description: 'Cleared 10 aptitude questions + 5 basic coding challenges in C.' },
      { stage: 'Technical Interviews', title: 'Zoho Advanced Coding & Design', date: 'Apr 2025', description: 'Built an in-memory Train Ticket Reservation system with OOP design.' },
      { stage: 'HR', title: 'Technical HR & General HR', date: 'May 2025', description: 'Evaluated problem solving mindset, cultural fit, and long-term commitment.' },
      { stage: 'Offer', title: 'Zoho Product Developer Offer', date: 'May 2025', description: 'Joined Zoho CRM development team in Chennai.' },
      { stage: 'Current Role', title: 'Frontend Developer @ Zoho', date: '2025 - Present', description: 'Developing core CRM modules with ultra-fast render speeds.' }
    ],
    placementJourney: {
      company: 'Zoho',
      role: 'Frontend / Product Developer',
      preparationDuration: '3 months',
      selectionProcess: [
        'Round 1: Basic Programming Test (C/Java/Python)',
        'Round 2: Advanced Programming (Complex DSA & String manipulation)',
        'Round 3: Application Design (Console OOP app like Railway Booking / Banking)',
        'Round 4: Technical HR (In-depth resume & CS fundamentals)',
        'Round 5: General HR (Offer discussion)'
      ],
      skillsUsed: ['JavaScript', 'C / Java Basics', 'Object-Oriented Design', 'CSS3', 'Data Structures'],
      preparationStrategy: 'Zoho tests your core ability to write algorithms from scratch without library shortcuts. Practice implementing data structures, string parsing algorithms, and console-based OOP application designs.'
    },
    interviewExperiences: [
      {
        id: 'exp-5',
        company: 'Zoho',
        role: 'Frontend Developer',
        year: '2025',
        difficulty: 'Medium',
        roundsCount: '5 Rounds',
        description: 'Unique 5-stage placement drive testing pure raw coding capability, application design from scratch, and OOP architectural fundamentals.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '95%',
      avgResponseTime: 'Within 24 hours'
    }
  },
  {
    id: 'person-5',
    name: 'Vikramaditya Iyer',
    role: 'Senior Cloud Consultant',
    company: 'Accenture',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&auto=format&fit=crop&q=80',
    college: 'Vellore Institute of Technology',
    location: 'Pune, India',
    skills: ['AWS', 'DevOps', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    bio: 'Certified AWS Solutions Architect helping candidates prepare for cloud consulting & DevOps roles.',
    about: 'Senior Cloud Consultant at Accenture with 5+ years of experience architecting cloud migrations, containerized Kubernetes deployments, and automated CI/CD pipelines for Fortune 500 financial clients.',
    experienceLevel: '3-5 Years',
    experienceYears: 5,
    availableForGuidance: false,
    guidanceCount: 15,
    addedDate: '2026-07-28',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'Vellore Institute of Technology (VIT)',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: '2021',
      gpa: '8.4 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/vikram-iyer',
      github: 'https://github.com/vikram-cloud'
    },
    projects: [
      {
        id: 'proj-6',
        name: 'Multi-Cloud Infrastructure as Code Blueprint',
        description: 'Terraform blueprints deploying production-ready EKS & GKE clusters with automated ingress controllers, Prometheus, and Grafana.',
        technologies: ['Terraform', 'Kubernetes', 'AWS', 'Docker'],
        githubUrl: 'https://github.com/vikram-cloud/terraform-blueprints',
        demoUrl: 'https://terraform-docs.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-6',
        name: 'AWS Certified Solutions Architect – Professional',
        issuer: 'Amazon Web Services',
        issueDate: '2023',
        credentialUrl: 'https://aws.amazon.com/verification'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'VIT Computer Science', date: '2017 - 2021', description: 'Explored Linux sysadmin, networking, and cloud basics.' },
      { stage: 'Preparation', title: 'DevOps & Cloud Certifications', date: '2020 - 2021', description: 'Acquired AWS and Docker certifications and practiced automation scripting.' },
      { stage: 'Assessment', title: 'Accenture Assessment Round', date: 'Feb 2021', description: 'Cognitive & Technical assessment covering cloud fundamentals and pseudocode.' },
      { stage: 'Technical Interviews', title: 'Technical Interview', date: 'Mar 2021', description: 'Discussed cloud microservices, Docker networking, and security best practices.' },
      { stage: 'HR', title: 'HR & Communication Interview', date: 'Mar 2021', description: 'Assessed business communication and client handling.' },
      { stage: 'Offer', title: 'Cloud Specialist Offer', date: 'Apr 2021', description: 'Joined Accenture Cloud practice.' },
      { stage: 'Current Role', title: 'Senior Cloud Consultant @ Accenture', date: '2021 - Present', description: 'Leading enterprise cloud transformation architectures.' }
    ],
    placementJourney: {
      company: 'Accenture',
      role: 'Senior Cloud Consultant',
      preparationDuration: '4 months',
      selectionProcess: [
        'Cognitive & Technical Assessment',
        'Coding & Pseudocode Round',
        'Technical Cloud Interview',
        'HR & Leadership Assessment',
        'Offer Letter'
      ],
      skillsUsed: ['AWS', 'Kubernetes', 'Docker', 'Linux', 'DevOps'],
      preparationStrategy: 'Having certified credentials like AWS Associate and hands-on GitHub projects with Terraform and Docker gives candidates an immense competitive advantage in consulting interviews.'
    },
    interviewExperiences: [
      {
        id: 'exp-6',
        company: 'Accenture',
        role: 'Cloud Consultant',
        year: '2021',
        difficulty: 'Moderate',
        roundsCount: '3 Rounds',
        description: 'Focus on cloud infrastructure, containerization principles, CI/CD automation, and client communication skills.'
      }
    ],
    guidance: {
      available: false,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '75%',
      avgResponseTime: 'Currently busy'
    }
  },
  {
    id: 'person-6',
    name: 'Ananya Reddy',
    role: 'Digital Specialist Engineer',
    company: 'Infosys',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&auto=format&fit=crop&q=80',
    college: 'Amrita Vishwa Vidyapeetham',
    location: 'Bangalore, India',
    skills: ['Python', 'Django', 'SQL', 'FastAPI', 'DSA', 'REST APIs'],
    bio: 'Cleared InfyTQ and Infosys DSE rounds. Happy to share DSA roadmap & interview tips.',
    about: 'Digital Specialist Engineer (DSE) at Infosys Center of Excellence. Cleared the InfyTQ and HackWithInfy competitions with top percentile scores. I help pre-final year and final year students prepare for Infosys DSE/Specialist Programmer roles.',
    experienceLevel: 'Entry Level (Campus Placement)',
    experienceYears: 1,
    availableForGuidance: true,
    guidanceCount: 29,
    addedDate: '2026-08-22',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'Amrita Vishwa Vidyapeetham',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: '2025',
      gpa: '8.7 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/ananya-reddy',
      github: 'https://github.com/ananya-reddy'
    },
    projects: [
      {
        id: 'proj-7',
        name: 'MediTrack — Healthcare Records API',
        description: 'HIPAA-compliant RESTful backend service built in Python and FastAPI with JWT authentication and PostgreSQL.',
        technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
        githubUrl: 'https://github.com/ananya-reddy/meditrack',
        demoUrl: 'https://meditrack-api.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-7',
        name: 'Infosys Certified Python Programmer',
        issuer: 'Infosys Springboard',
        issueDate: '2024',
        credentialUrl: 'https://springboard.infosys.com'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'Amrita CSE', date: '2021 - 2025', description: 'Focused on Python backend development and database internals.' },
      { stage: 'Preparation', title: 'InfyTQ & HackWithInfy Prep', date: '2024 - 2025', description: 'Practiced medium-hard algorithmic questions in Python.' },
      { stage: 'Assessment', title: 'HackWithInfy Contest', date: 'Jan 2025', description: 'Solved 3 challenging dynamic programming and graph problems.' },
      { stage: 'Technical Interviews', title: 'DSE Technical Interview', date: 'Feb 2025', description: 'Detailed discussion on project architecture, DBMS normalization, and live coding.' },
      { stage: 'HR', title: 'HR Round', date: 'Mar 2025', description: 'General behavioral discussion and joining preferences.' },
      { stage: 'Offer', title: 'DSE Offer Letter', date: 'Mar 2025', description: 'Secured Digital Specialist Engineer offer.' },
      { stage: 'Current Role', title: 'Digital Specialist Engineer @ Infosys', date: '2025 - Present', description: 'Developing microservices for global enterprise clients.' }
    ],
    placementJourney: {
      company: 'Infosys',
      role: 'Digital Specialist Engineer (DSE)',
      preparationDuration: '3 months',
      selectionProcess: [
        'HackWithInfy Coding Competition',
        'Technical Interview (DSA & Database Internals)',
        'HR Interview',
        'Offer Letter'
      ],
      skillsUsed: ['Python', 'FastAPI', 'Data Structures', 'SQL', 'DBMS'],
      preparationStrategy: 'Targeting HackWithInfy or InfyTQ is the fastest path to land the higher-tier DSE/SP package at Infosys. Master medium DP, Tree BFS/DFS, and relational database indexing.'
    },
    interviewExperiences: [
      {
        id: 'exp-7',
        company: 'Infosys',
        role: 'Digital Specialist Engineer',
        year: '2025',
        difficulty: 'Medium',
        roundsCount: '2 Rounds',
        description: 'Direct interview round post HackWithInfy coding test focusing on DBMS queries, complex data structures, and resume projects.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '96%',
      avgResponseTime: 'Within 24 hours'
    }
  },
  {
    id: 'person-7',
    name: 'Karthik Raja',
    role: 'Systems Engineer - Innovator',
    company: 'TCS',
    companyLogo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=80&auto=format&fit=crop&q=80',
    college: 'Sri Krishna College of Engineering and Technology',
    location: 'Coimbatore, India',
    skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'DSA', 'Git'],
    bio: 'Cracked TCS Digital through TCS NQT. Mentoring on aptitude, coding rounds and technical interviews.',
    about: 'Systems Engineer - Innovator (TCS Digital) at Tata Consultancy Services. Alumnus of Sri Krishna College of Engineering and Technology. Cleared TCS National Qualifier Test (NQT) in the top 5% bracket. I guide students on how to crack both TCS Ninja and TCS Digital selection pathways.',
    experienceLevel: '1-2 Years',
    experienceYears: 2,
    availableForGuidance: true,
    guidanceCount: 36,
    addedDate: '2026-08-18',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'Sri Krishna College of Engineering and Technology',
      degree: 'B.E.',
      branch: 'Computer Science and Engineering',
      graduationYear: '2024',
      gpa: '8.5 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/karthikraja-dev',
      github: 'https://github.com/karthikraja'
    },
    projects: [
      {
        id: 'proj-8',
        name: 'Microservices Banking Ledger',
        description: 'Transactional banking core written in Spring Boot with PostgreSQL ACID guarantees and Docker deployment.',
        technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
        githubUrl: 'https://github.com/karthikraja/banking-ledger',
        demoUrl: 'https://banking-ledger.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-8',
        name: 'TCS Certified Java Professional',
        issuer: 'TCS iON',
        issueDate: '2024',
        credentialUrl: 'https://tcsion.com'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'SKCET CSE', date: '2020 - 2024', description: 'Active member of college coding club and technical symposiums.' },
      { stage: 'Preparation', title: 'TCS NQT Preparation', date: '2023 - 2024', description: 'Rigorous preparation on Advanced Quantitative Aptitude and Java coding.' },
      { stage: 'Assessment', title: 'TCS NQT Online Exam', date: 'Nov 2023', description: 'Scored 92% in Advanced Cognitive & Hands-on Coding.' },
      { stage: 'Technical Interviews', title: 'Technical Interview (TR)', date: 'Dec 2023', description: 'Detailed questions on Java memory management, Spring Boot annotations, and SQL Joins.' },
      { stage: 'HR', title: 'Managerial & HR Round (MR/HR)', date: 'Dec 2023', description: 'Situational judgment and company background knowledge.' },
      { stage: 'Offer', title: 'TCS Digital Offer', date: 'Jan 2024', description: 'Received TCS Digital cadre offer.' },
      { stage: 'Current Role', title: 'Systems Engineer @ TCS Digital', date: '2024 - Present', description: 'Building banking microservices for global financial clients.' }
    ],
    placementJourney: {
      company: 'TCS',
      role: 'Systems Engineer (TCS Digital)',
      preparationDuration: '3 months',
      selectionProcess: [
        'TCS National Qualifier Test (NQT - Foundation + Advanced)',
        'Technical Interview (TR: Java & SQL)',
        'Managerial Interview (MR: Situational Questions)',
        'HR Interview (HR: Background & Mobility)',
        'TCS Digital Offer'
      ],
      skillsUsed: ['Java', 'Spring Boot', 'SQL', 'Aptitude & Reasoning', 'Git'],
      preparationStrategy: 'TCS NQT has negative marking in the cognitive section. Practice time management for aptitude and solve at least 15 previous years coding questions in Java without syntax errors.'
    },
    interviewExperiences: [
      {
        id: 'exp-8',
        company: 'TCS',
        role: 'Systems Engineer (Digital)',
        year: '2024',
        difficulty: 'Medium',
        roundsCount: '3 Rounds',
        description: 'Comprehensive evaluation combining NQT test scores, hands-on Java coding, Spring Boot fundamentals, and managerial situational judgment.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '97%',
      avgResponseTime: 'Within 18 hours'
    }
  },
  {
    id: 'person-8',
    name: 'Divya Nair',
    role: 'Product Engineer',
    company: 'Zoho',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&auto=format&fit=crop&q=80',
    college: 'College of Engineering Guindy (CEG)',
    location: 'Chennai, India',
    skills: ['Java', 'C++', 'Data Structures', 'OOP', 'SQL', 'System Design'],
    bio: 'Deep understanding of OOP design, system design basics, and Zoho 5-round interview process.',
    about: 'Product Engineer at Zoho Books with 2.5 years of experience architecting high-scale accounting and taxation modules. Alumnus of CEG Anna University. Passionate about teaching low-level system design, object-oriented modeling, and writing modular clean code.',
    experienceLevel: '1-2 Years',
    experienceYears: 2.5,
    availableForGuidance: true,
    guidanceCount: 22,
    addedDate: '2026-08-05',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'College of Engineering, Guindy (CEG)',
      degree: 'B.E.',
      branch: 'Computer Science and Engineering',
      graduationYear: '2023',
      gpa: '9.0 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/divyanair',
      github: 'https://github.com/divyanair'
    },
    projects: [
      {
        id: 'proj-9',
        name: 'In-Memory Key Value Store with LRU Cache',
        description: 'Pure Java in-memory caching engine with thread-safe read/write locks and LRU eviction policy.',
        technologies: ['Java', 'Concurrency', 'OOP Design', 'Data Structures'],
        githubUrl: 'https://github.com/divyanair/in-memory-cache',
        demoUrl: 'https://in-memory-cache.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-9',
        name: 'Oracle Certified Associate Java Programmer',
        issuer: 'Oracle',
        issueDate: '2023',
        credentialUrl: 'https://oracle.com'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'CEG Anna University', date: '2019 - 2023', description: 'Academic excellence and core CS foundations.' },
      { stage: 'Preparation', title: 'OOP Design & DSA', date: '2022 - 2023', description: 'Mastered modular OOP architecture and clean Java code.' },
      { stage: 'Assessment', title: 'Zoho Campus Drive Round 1 & 2', date: 'Oct 2022', description: 'Cleared basic & advanced programming tests.' },
      { stage: 'Technical Interviews', title: 'Application Design Round', date: 'Nov 2022', description: 'Designed a complete Console Banking System in 2.5 hours.' },
      { stage: 'HR', title: 'Technical & General HR', date: 'Nov 2022', description: 'Discussed architectural trade-offs and team vision.' },
      { stage: 'Offer', title: 'Product Engineer Offer', date: 'Dec 2022', description: 'Joined Zoho Books team in Chennai.' },
      { stage: 'Current Role', title: 'Product Engineer @ Zoho', date: '2023 - Present', description: 'Building core taxation and invoice generation engines.' }
    ],
    placementJourney: {
      company: 'Zoho',
      role: 'Product Engineer',
      preparationDuration: '4 months',
      selectionProcess: [
        'Round 1: Basic Programming',
        'Round 2: Advanced Coding',
        'Round 3: Application Design (Console OOP App)',
        'Round 4: Technical HR',
        'Round 5: HR Interview'
      ],
      skillsUsed: ['Java', 'Object Oriented Programming', 'Data Structures', 'Design Patterns'],
      preparationStrategy: 'In the application design round, focus on creating clean classes, interfaces, and separation of concerns rather than putting everything inside the main method.'
    },
    interviewExperiences: [
      {
        id: 'exp-9',
        company: 'Zoho',
        role: 'Product Engineer',
        year: '2023',
        difficulty: 'Medium',
        roundsCount: '5 Rounds',
        description: 'Comprehensive evaluation of object-oriented design patterns, raw Java problem-solving without external helper libraries, and code elegance.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '94%',
      avgResponseTime: 'Within 24 hours'
    }
  },
  {
    id: 'person-9',
    name: 'Siddharth Verma',
    role: 'Backend SDE',
    company: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=80&auto=format&fit=crop&q=80',
    college: 'IIT Madras',
    location: 'Bangalore, India',
    skills: ['Go', 'Kafka', 'DynamoDB', 'AWS', 'Distributed Systems', 'System Design'],
    bio: 'Working on high-throughput order management services at Amazon. Passionate about distributed concurrency.',
    about: 'Backend SDE at Amazon Bangalore with 3.5 years of experience building resilient distributed services, real-time message streams, and NoSQL storage architectures. IIT Madras graduate and mentor for off-campus tech recruitment.',
    experienceLevel: '3-5 Years',
    experienceYears: 3.5,
    availableForGuidance: true,
    guidanceCount: 48,
    addedDate: '2026-08-27',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'Indian Institute of Technology (IIT), Madras',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: '2022',
      gpa: '9.1 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/siddharth-verma',
      github: 'https://github.com/siddharth-v'
    },
    projects: [
      {
        id: 'proj-10',
        name: 'High-Throughput Distributed Rate Limiter',
        description: 'Distributed token bucket rate limiter in Go with Redis cluster coordination handling 100k requests/second.',
        technologies: ['Go', 'Redis', 'Docker', 'gRPC'],
        githubUrl: 'https://github.com/siddharth-v/rate-limiter',
        demoUrl: 'https://rate-limiter.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-10',
        name: 'AWS Certified Developer – Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2023',
        credentialUrl: 'https://aws.amazon.com'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'IIT Madras CSE', date: '2018 - 2022', description: 'Explored parallel computing, distributed systems, and computer architecture.' },
      { stage: 'Preparation', title: 'System Design & High-Scale Systems', date: '2021 - 2022', description: 'Studied DynamoDB, Kafka, and LeetCode hard problems.' },
      { stage: 'Assessment', title: 'Amazon OA', date: 'Sep 2021', description: 'Passed online assessment with full score.' },
      { stage: 'Technical Interviews', title: '3 Technical Rounds', date: 'Oct 2021', description: 'Covered graph traversals, distributed caching, and lock-free data structures.' },
      { stage: 'HR', title: 'Bar Raiser Round', date: 'Oct 2021', description: 'Amazon Leadership Principles and architectural decision tradeoffs.' },
      { stage: 'Offer', title: 'SDE Offer Letter', date: 'Nov 2021', description: 'Joined Amazon Order Management in Bangalore.' },
      { stage: 'Current Role', title: 'Backend SDE @ Amazon', date: '2022 - Present', description: 'Managing distributed microservices with millions of daily transactions.' }
    ],
    placementJourney: {
      company: 'Amazon',
      role: 'Backend SDE',
      preparationDuration: '5 months',
      selectionProcess: [
        'Amazon Online Assessment (OA)',
        'Technical Round 1 (DSA & Code Quality)',
        'Technical Round 2 (System Design & Concurrency)',
        'Bar Raiser (Behavioral & Leadership Principles)',
        'Offer Extended'
      ],
      skillsUsed: ['Go', 'Distributed Systems', 'AWS', 'DSA', 'Kafka'],
      preparationStrategy: 'Focus equally on clean algorithmic code and practical distributed systems concepts (like caching, rate limiting, and eventual consistency).'
    },
    interviewExperiences: [
      {
        id: 'exp-10',
        company: 'Amazon',
        role: 'Backend SDE',
        year: '2022',
        difficulty: 'Hard',
        roundsCount: '4 Rounds',
        description: 'Deep dive into distributed systems, graph algorithms, concurrency, and high standards on Amazon Leadership Principles.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '98%',
      avgResponseTime: 'Within 12 hours'
    }
  },
  {
    id: 'person-10',
    name: 'Meera Krishnan',
    role: 'Project Engineer - Cloud & AI',
    company: 'Wipro',
    companyLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&auto=format&fit=crop&q=80',
    college: 'Government College of Technology (GCT)',
    location: 'Coimbatore, India',
    skills: ['Python', 'Machine Learning', 'SQL', 'GCP', 'Data Analysis', 'Git'],
    bio: 'Wipro Elite & Turbo qualifier. Assisting juniors with resume tailoring and campus placement prep.',
    about: 'Project Engineer in the Cloud & Applied AI division at Wipro Technologies. GCT Coimbatore graduate with top academic standing. Qualified both Wipro Elite NLTH and Turbo tracks with distinction.',
    experienceLevel: 'Entry Level (Campus Placement)',
    experienceYears: 1,
    availableForGuidance: true,
    guidanceCount: 19,
    addedDate: '2026-08-12',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'Government College of Technology (GCT)',
      degree: 'B.E.',
      branch: 'Electronics & Communication',
      graduationYear: '2025',
      gpa: '8.7 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/meera-krishnan',
      github: 'https://github.com/meera-ai'
    },
    projects: [
      {
        id: 'proj-11',
        name: 'AI Document Summarizer & QA Engine',
        description: 'NLP pipeline using transformer models and FastAPI to extract structured insights from enterprise PDF contracts.',
        technologies: ['Python', 'HuggingFace', 'FastAPI', 'GCP'],
        githubUrl: 'https://github.com/meera-ai/doc-summarizer',
        demoUrl: 'https://doc-summarizer.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-11',
        name: 'Google Associate Cloud Engineer',
        issuer: 'Google Cloud',
        issueDate: '2024',
        credentialUrl: 'https://cloud.google.com'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'GCT Coimbatore', date: '2021 - 2025', description: 'Focused on Python programming, machine learning, and cloud.' },
      { stage: 'Preparation', title: 'Wipro NLTH / Turbo Prep', date: '2024 - 2025', description: 'Aptitude, Python DSA, and SQL queries.' },
      { stage: 'Assessment', title: 'Wipro National Talent Hunt', date: 'Oct 2024', description: 'Cleared Aptitude, Written English, and Coding.' },
      { stage: 'Technical Interviews', title: 'Technical Interview', date: 'Nov 2024', description: 'Coding in Python, SQL Joins, and project explanation.' },
      { stage: 'HR', title: 'HR Discussion', date: 'Dec 2024', description: 'Company overview and location preference.' },
      { stage: 'Offer', title: 'Wipro Turbo Offer', date: 'Jan 2025', description: 'Received official offer letter.' },
      { stage: 'Current Role', title: 'Project Engineer @ Wipro Cloud & AI', date: '2025 - Present', description: 'Building cloud automation and AI pipelines.' }
    ],
    placementJourney: {
      company: 'Wipro',
      role: 'Project Engineer (Cloud & AI)',
      preparationDuration: '3 months',
      selectionProcess: [
        'Wipro NLTH (Aptitude + Essay Writing + Coding)',
        'Technical Interview (TR)',
        'HR Interview (HR)',
        'Offer Letter'
      ],
      skillsUsed: ['Python', 'SQL', 'Aptitude', 'Cloud Fundamentals'],
      preparationStrategy: 'Essay writing in Wipro NLTH tests grammar and vocabulary. Practice typing fast with zero spelling errors along with practicing basic array and string coding in Python.'
    },
    interviewExperiences: [
      {
        id: 'exp-11',
        company: 'Wipro',
        role: 'Project Engineer',
        year: '2025',
        difficulty: 'Moderate',
        roundsCount: '2 Rounds',
        description: 'Testing core Python programming, SQL Joins, and situational willingness to learn emerging technologies.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '95%',
      avgResponseTime: 'Within 24 hours'
    }
  },
  {
    id: 'person-11',
    name: 'Gaurav Sen',
    role: 'Staff Software Engineer',
    company: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=80&auto=format&fit=crop&q=80',
    college: 'IIT Kharagpur',
    location: 'Remote, India',
    skills: ['System Design', 'Go', 'Kubernetes', 'Microservices', 'Distributed Systems', 'C++'],
    bio: 'Author of scalable architecture guides. Advising on L4/L5 system design and behavioral rounds.',
    about: 'Staff Software Engineer at Google with 7+ years of experience in distributed infrastructure and large-scale backend systems. Known for creating comprehensive system design resources and teaching software architecture fundamentals.',
    experienceLevel: 'Senior (5+ Years)',
    experienceYears: 7,
    availableForGuidance: false,
    guidanceCount: 85,
    addedDate: '2026-07-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'Indian Institute of Technology (IIT), Kharagpur',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: '2019',
      gpa: '9.3 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/gauravsen',
      github: 'https://github.com/gauravsen'
    },
    projects: [
      {
        id: 'proj-12',
        name: 'Monolith to Microservices Orchestrator',
        description: 'Open-source distributed tracing and traffic migration framework for enterprise legacy platforms.',
        technologies: ['Go', 'Kubernetes', 'Envoy', 'gRPC'],
        githubUrl: 'https://github.com/gauravsen/microservice-orchestrator',
        demoUrl: 'https://microservice-orchestrator.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-12',
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation',
        issueDate: '2022',
        credentialUrl: 'https://cncf.io'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'IIT Kharagpur', date: '2015 - 2019', description: 'Specialized in computer systems and networks.' },
      { stage: 'Preparation', title: 'System Architecture Mastery', date: '2019', description: 'Authored system design case studies and solved complex concurrency problems.' },
      { stage: 'Assessment', title: 'Engineering Screening', date: '2019', description: 'Advanced algorithms and systems evaluation.' },
      { stage: 'Technical Interviews', title: 'Systems & Architecture Rounds', date: '2019', description: 'High-level and low-level system design deep dives.' },
      { stage: 'HR', title: 'Leadership & Culture Fit', date: '2019', description: 'Evaluating engineering vision and technical mentorship.' },
      { stage: 'Offer', title: 'Staff Engineer Offer', date: '2019', description: 'Joined Google Cloud systems infrastructure.' },
      { stage: 'Current Role', title: 'Staff SWE @ Google', date: '2019 - Present', description: 'Leading distributed systems initiatives.' }
    ],
    placementJourney: {
      company: 'Google',
      role: 'Staff Software Engineer',
      preparationDuration: '6 months',
      selectionProcess: [
        'Recruiter Initial Screen',
        'Technical Phone Screen (Algorithms)',
        'System Design Round 1 (High Level Design)',
        'System Design Round 2 (Low Level Design & Concurrency)',
        'Googleyness & Leadership'
      ],
      skillsUsed: ['System Design', 'Go', 'Kubernetes', 'Microservices', 'Distributed Systems'],
      preparationStrategy: 'For senior and staff interviews, dive deeply into tradeoffs: consistency vs availability, latency vs throughput, and hardware bottlenecks.'
    },
    interviewExperiences: [
      {
        id: 'exp-12',
        company: 'Google',
        role: 'Staff Software Engineer',
        year: '2019',
        difficulty: 'Hard',
        roundsCount: '5 Rounds',
        description: 'Elite architecture evaluation covering large-scale distributed caching, consensus algorithms, and fault tolerance.'
      }
    ],
    guidance: {
      available: false,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '60%',
      avgResponseTime: 'Currently unavailable'
    }
  },
  {
    id: 'person-12',
    name: 'Harini Venkatesh',
    role: 'Software Engineer',
    company: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=80&auto=format&fit=crop&q=80',
    college: 'SSN College of Engineering',
    location: 'Bangalore, India',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Azure', 'DSA'],
    bio: 'Ex-intern, now full-time at Microsoft Teams. Mentor for women in tech initiatives and off-campus hiring.',
    about: 'Software Engineer at Microsoft Teams in Bangalore. SSN College of Engineering graduate. Joined Microsoft through the off-campus internship-to-FTE conversion path. Dedicated to mentoring aspiring women engineers in DSA and frontend architecture.',
    experienceLevel: '1-2 Years',
    experienceYears: 2,
    availableForGuidance: true,
    guidanceCount: 33,
    addedDate: '2026-08-26',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    education: {
      college: 'SSN College of Engineering',
      degree: 'B.Tech',
      branch: 'Information Technology',
      graduationYear: '2024',
      gpa: '9.2 / 10'
    },
    socials: {
      linkedin: 'https://linkedin.com/in/harini-venkatesh',
      github: 'https://github.com/harini-v'
    },
    projects: [
      {
        id: 'proj-13',
        name: 'Collaborative Real-time Canvas Board',
        description: 'Collaborative web drawing canvas with live cursor synchronization over WebSockets and state conflict resolution.',
        technologies: ['React', 'TypeScript', 'WebSockets', 'GraphQL'],
        githubUrl: 'https://github.com/harini-v/collaborative-canvas',
        demoUrl: 'https://collaborative-canvas.dev'
      }
    ],
    certifications: [
      {
        id: 'cert-13',
        name: 'Microsoft Certified: Azure Fundamentals',
        issuer: 'Microsoft',
        issueDate: '2024',
        credentialUrl: 'https://learn.microsoft.com'
      }
    ],
    careerJourney: [
      { stage: 'College', title: 'SSN College of Engineering', date: '2020 - 2024', description: 'Active contributor to open-source and hackathon winner.' },
      { stage: 'Preparation', title: 'Off-Campus Hiring Prep', date: '2023 - 2024', description: 'Solved 300+ LeetCode problems and built real-time WebSocket apps.' },
      { stage: 'Assessment', title: 'Microsoft Online Assessment', date: 'Feb 2024', description: 'Cleared 3 DSA problems with optimal complexities.' },
      { stage: 'Technical Interviews', title: '2 Rounds of DSA & Frontend Architecture', date: 'Mar 2024', description: 'Trees, Linked Lists, React reconciliation, and state management.' },
      { stage: 'HR', title: 'Values & Teamwork', date: 'Apr 2024', description: 'Discussed handling production bugs, mentorship, and growth mindset.' },
      { stage: 'Offer', title: 'FTE Software Engineer Offer', date: 'Apr 2024', description: 'Joined Microsoft Teams core engineering.' },
      { stage: 'Current Role', title: 'Software Engineer @ Microsoft Teams', date: '2024 - Present', description: 'Developing real-time collaboration features.' }
    ],
    placementJourney: {
      company: 'Microsoft',
      role: 'Software Engineer',
      preparationDuration: '4 months',
      selectionProcess: [
        'Online Assessment (Codility)',
        'Technical Round 1 (Data Structures: Trees, Graphs)',
        'Technical Round 2 (Frontend Architecture & System Design)',
        'Leadership & Culture Fit Round',
        'Official Offer Letter'
      ],
      skillsUsed: ['React', 'TypeScript', 'DSA', 'GraphQL', 'Azure'],
      preparationStrategy: 'Pair strong algorithmic fundamentals with a deep understanding of browser runtime, asynchronous JavaScript, and real-time state synchronization.'
    },
    interviewExperiences: [
      {
        id: 'exp-13',
        company: 'Microsoft',
        role: 'Software Engineer',
        year: '2024',
        difficulty: 'Medium - Hard',
        roundsCount: '4 Rounds',
        description: 'Balanced interviews testing clean recursion/tree logic, React virtual DOM internals, and team behavioral dynamics.'
      }
    ],
    guidance: {
      available: true,
      topics: ['DSA', 'Resume', 'Projects', 'Technical Interviews', 'HR Interviews', 'Placement Preparation'],
      responseRate: '96%',
      avgResponseTime: 'Within 24 hours'
    }
  }
];
`);

// 2. src/pages/PublicProfile.jsx
writeFile('src/pages/PublicProfile.jsx', `
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  MapPin,
  Briefcase,
  UserCheck,
  UserPlus,
  Bookmark,
  Send,
  Sparkles,
  ExternalLink,
  FolderGit2,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Share2,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import Card from '../components/common/Card';
import SkillBadge from '../components/common/SkillBadge';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import { mockPeople } from '../data/mockPeople';
import { useToast } from '../context/ToastContext';

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isConnected, setIsConnected] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Find person by id or fallback to person-1 (Arun Kumar)
  const person = mockPeople.find(p => p.id === id) || mockPeople[0];

  const handleConnect = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      addToast({
        title: 'Connection Request Sent',
        message: \`You sent a connection request to \${person.name}.\`,
        type: 'success'
      });
    } else {
      addToast({
        title: 'Connection Removed',
        message: \`Connection with \${person.name} removed.\`,
        type: 'info'
      });
    }
  };

  const handleSaveProfile = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      addToast({
        title: 'Profile Saved',
        message: \`\${person.name}'s profile saved to your bookmarks.\`,
        type: 'success'
      });
    } else {
      addToast({
        title: 'Profile Removed',
        message: 'Profile removed from your saved bookmarks.',
        type: 'info'
      });
    }
  };

  const handleReadExperience = (exp) => {
    // Navigate to interview experience page
    navigate(\`/interviews/\${exp.id}\`);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const guidanceTopics = person.guidance?.topics || [
    'DSA',
    'Resume',
    'Projects',
    'Technical Interviews',
    'HR Interviews',
    'Placement Preparation'
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/explore')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore People</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Career Profile</span>
          </span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              {person.avatar ? (
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={\`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-2xl items-center justify-center shadow-md \${
                  person.avatar ? 'hidden' : 'flex'
                }\`}
              >
                {getInitials(person.name)}
              </div>
              {person.availableForGuidance && (
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-3 border-white dark:border-slate-900 rounded-full"
                  title="Available for Guidance"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {person.name}
                </h1>
                {person.availableForGuidance ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Available for Guidance</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <span>Busy with projects</span>
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                {person.role} <span className="text-indigo-600 dark:text-indigo-400 font-bold">@ {person.company}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {person.college}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {person.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  {person.experienceLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsGuidanceModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Request Guidance</span>
            </button>

            <button
              onClick={handleConnect}
              className={\`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-all \${
                isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }\`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isConnected ? 'Connected' : 'Connect'}</span>
            </button>

            <button
              onClick={handleSaveProfile}
              title="Save Profile"
              className={\`p-2.5 rounded-xl border transition-all \${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }\`}
            >
              <Bookmark className={\`w-4 h-4 \${isSaved ? 'fill-amber-500 text-amber-500' : ''}\`} />
            </button>
          </div>
        </div>

        {/* Short Bio Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
          "{person.bio}"
        </div>
      </div>

      {/* Main Grid: 2 Columns Left (Content), 1 Column Right (Guidance, Education, Certifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* About Section */}
          <Card title="About">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {person.about || person.bio}
            </p>
          </Card>

          {/* Skills Section */}
          <Card title="Technical & Professional Skills" subtitle="Core competencies used in production & interviews">
            <div className="flex flex-wrap gap-2">
              {person.skills?.map((skill) => (
                <SkillBadge key={skill} name={skill} type="matched" />
              ))}
            </div>
          </Card>

          {/* Placement Journey Section */}
          {person.placementJourney && (
            <Card
              title="Placement Journey"
              subtitle={\`How \${person.name.split(' ')[0]} prepared and cracked \${person.company}\`}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Target Company & Role:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {person.placementJourney.company} — {person.placementJourney.role}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Preparation Duration:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      ⏱ {person.placementJourney.preparationDuration}
                    </span>
                  </div>
                </div>

                {/* Selection Process Stepper */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Selection Process Breakdown:
                  </span>
                  <div className="space-y-2">
                    {person.placementJourney.selectionProcess?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="font-medium pt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparation Strategy */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Preparation Strategy & Advice:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    "{person.placementJourney.preparationStrategy}"
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Visual Career Journey Timeline */}
          {person.careerJourney && (
            <Card title="Career Journey & Milestones" subtitle="Step-by-step progression from college to current role">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100 dark:before:bg-indigo-950">
                {person.careerJourney.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900 shadow-xs" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {step.stage}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {step.title}
                          </h4>
                        </div>
                        {step.date && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {step.date}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Featured Projects */}
          <Card title="Featured Projects" subtitle="Portfolio applications and open-source systems">
            <div className="space-y-4">
              {person.projects?.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {proj.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.technologies?.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Interview Experiences Section */}
          {person.interviewExperiences && person.interviewExperiences.length > 0 && (
            <Card
              title="Interview Experiences"
              subtitle="Real interview questions and evaluation notes from this profile"
            >
              <div className="space-y-3">
                {person.interviewExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {exp.company} — {exp.role}
                          </h4>
                          <span className="text-xs text-slate-400">({exp.year})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                            Difficulty: {exp.difficulty}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {exp.roundsCount}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReadExperience(exp)}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Read Experience</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Guidance Mentorship Box */}
          <Card
            title="Career Guidance & Mentorship"
            subtitle="Connect 1-on-1 for personalized interview coaching"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Status:</span>
                {person.availableForGuidance ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Available for Mentorship
                  </span>
                ) : (
                  <span className="font-semibold text-slate-500">
                    Currently Unavailable
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Guidance Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {guidanceTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Response Rate:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{person.guidance?.responseRate || '95%'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{person.guidance?.avgResponseTime || 'Within 24h'}</span>
                </div>
              </div>

              <button
                onClick={() => setIsGuidanceModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Request Guidance</span>
              </button>
            </div>
          </Card>

          {/* Education Details */}
          <Card title="Education">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {person.education?.college || person.college}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {person.education?.degree || 'Bachelor of Technology'} — {person.education?.branch || 'Computer Science'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Class of {person.education?.graduationYear || '2024'}</span>
                    {person.education?.gpa && <span>GPA: {person.education?.gpa}</span>}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Certifications */}
          {person.certifications && person.certifications.length > 0 && (
            <Card title="Certifications & Honors">
              <div className="space-y-3">
                {person.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-3 text-xs">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {cert.name}
                      </h5>
                      <p className="text-slate-500">{cert.issuer} • {cert.issueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Public Profile Privacy Notice */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>CareerPilot Privacy Standard</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Personal contact numbers and private emails are hidden for user safety. Connect via CareerPilot Guidance Requests.
            </p>
          </div>
        </div>
      </div>

      {/* Request Guidance Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={person}
      />
    </div>
  );
}
`);

console.log('Module 2 files generated successfully.');