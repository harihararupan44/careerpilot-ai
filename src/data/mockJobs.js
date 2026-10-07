export const mockJobsList = [
  {
    id: 'job-1',
    title: 'Software Engineer - New Grad 2026',
    company: 'Stripe',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experience: 'New Grad 2026',
    salary: '$165,000 - $185,000 / yr',
    postedDate: '2026-08-25',
    fitScore: 91,
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Distributed Systems', 'REST APIs'],
    matchingSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs'],
    missingSkills: ['Ruby', 'gRPC', 'Payment Processing Protocols'],
    description: 'Stripe builds economic infrastructure for the internet. You will design, build, and maintain APIs, services, and systems across Stripe\'s engineering organization.',
    insights: {
      whyMatch: 'Your strong TypeScript, React, and PostgreSQL background aligns closely with Stripe\'s core infrastructure stack.',
      potentialGap: 'Stripe uses Ruby for parts of its monolith and gRPC for microservice RPCs.',
      suggestedAction: 'Review idempotent API design patterns and distributed transaction concepts before your technical screen.'
    }
  },
  {
    id: 'job-2',
    title: 'Software Development Engineer I (SDE I)',
    company: 'Amazon',
    logo: 'https://images.unsplash.com/photo-1523474253246-72cb9dcdd8b6?w=100&auto=format&fit=crop&q=80',
    location: 'Seattle, WA',
    workMode: 'Onsite',
    jobType: 'Full-time',
    experience: '0-2 years',
    salary: '$140,000 - $160,000 / yr',
    postedDate: '2026-08-24',
    fitScore: 88,
    skills: ['Java', 'Python', 'AWS', 'DSA', 'SQL', 'Git', 'Distributed Systems'],
    matchingSkills: ['Python', 'SQL', 'Git', 'DSA', 'Distributed Systems'],
    missingSkills: ['Java Enterprise', 'DynamoDB', 'AWS CloudFormation'],
    description: 'As an SDE I, you will work on customer-facing architectures, build scalable backends, and innovate with AWS cloud native technologies.',
    insights: {
      whyMatch: 'Your solid foundation in Algorithms, Data Structures, and Python gives you a strong competitive edge.',
      potentialGap: 'Amazon heavily emphasizes Java OOP design patterns and DynamoDB NoSQL data modeling.',
      suggestedAction: 'Prepare STAR-format behavioral stories demonstrating Amazon Leadership Principles (Customer Obsession, Ownership).'
    }
  },
  {
    id: 'job-3',
    title: 'Full Stack Engineer - Core Platform',
    company: 'Datadog',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experience: 'New Grad / Junior',
    salary: '$150,000 - $170,000 / yr',
    postedDate: '2026-08-22',
    fitScore: 86,
    skills: ['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
    matchingSkills: ['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
    missingSkills: ['Go (Golang)', 'Apache Kafka', 'Time-Series DBs'],
    description: 'Build responsive telemetry dashboards, real-time visualization widgets, and microservices supporting billions of daily monitoring events.',
    insights: {
      whyMatch: 'You possess 100% of the required frontend and API framework skills (React, TypeScript, FastAPI).',
      potentialGap: 'Datadog processes massive event volume using Kafka and custom time-series engines.',
      suggestedAction: 'Brush up on frontend rendering optimization for large real-time datasets (virtualization & canvas).'
    }
  },
  {
    id: 'job-4',
    title: 'Frontend Engineer - Web Experience',
    company: 'Airbnb',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    workMode: 'Remote',
    jobType: 'Full-time',
    experience: 'New Grad / 1-2 yrs',
    salary: '$160,000 - $175,000 / yr',
    postedDate: '2026-08-20',
    fitScore: 94,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance', 'Accessibility'],
    matchingSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    missingSkills: ['React Native', 'GraphQL Relay'],
    description: 'Join Airbnb Guest Experience creating world-class booking interfaces, performant design systems, and delightful travel discovery tools.',
    insights: {
      whyMatch: 'Exceptional match with your frontend architecture and component design expertise.',
      potentialGap: 'Knowledge of WCAG 2.1 AA accessibility standards is tested during technical interviews.',
      suggestedAction: 'Review Next.js App Router caching behavior and Server Actions implementation.'
    }
  },
  {
    id: 'job-5',
    title: 'Cloud Infrastructure & Backend Intern/Grad',
    company: 'Snowflake',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    location: 'San Mateo, CA',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experience: 'New Grad 2026',
    salary: '$155,000 - $170,000 / yr',
    postedDate: '2026-08-19',
    fitScore: 82,
    skills: ['C++', 'Python', 'AWS', 'Docker', 'Distributed Systems', 'SQL', 'Linux'],
    matchingSkills: ['Python', 'AWS', 'Docker', 'Distributed Systems', 'SQL', 'Linux'],
    missingSkills: ['C++ Systems Programming', 'Rust', 'Kubernetes Operator Development'],
    description: 'Build resilient, auto-scaling query compilation engines and cloud-native object storage pipelines handling petabytes of data.',
    insights: {
      whyMatch: 'Your background in distributed systems and cloud primitives provides strong foundation.',
      potentialGap: 'Snowflake query engine internals require deep C++/concurrency knowledge.',
      suggestedAction: 'Revisit Raft consensus and lock-free data structures from your academic coursework.'
    }
  },
  {
    id: 'job-6',
    title: 'Backend Engineer - Marketplace Dynamics',
    company: 'Uber',
    logo: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=100&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experience: '0-2 years',
    salary: '$158,000 - $178,000 / yr',
    postedDate: '2026-08-18',
    fitScore: 85,
    skills: ['Go', 'Python', 'Node.js', 'PostgreSQL', 'Redis', 'Distributed Systems', 'Docker'],
    matchingSkills: ['Go', 'Python', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    missingSkills: ['Apache Kafka', 'Cassandra', 'Geospatial H3 Indexing'],
    description: 'Design low-latency matching and dispatch algorithms in Go and Java, scaling real-time rider and driver coordination worldwide.',
    insights: {
      whyMatch: 'Strong proficiency in Go, microservices, and PostgreSQL.',
      potentialGap: 'Uber makes heavy use of Kafka streaming and Apache Flink for real-time trip state.',
      suggestedAction: 'Explore Uber\'s open-source H3 hexagonal spatial indexing library.'
    }
  },
  {
    id: 'job-7',
    title: 'Software Engineer - Azure Cloud Native',
    company: 'Microsoft',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&auto=format&fit=crop&q=80',
    location: 'Redmond, WA',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    experience: 'New Grad 2026',
    salary: '$145,000 - $165,000 / yr',
    postedDate: '2026-08-15',
    fitScore: 79,
    skills: ['C#', '.NET', 'Java', 'Python', 'Docker', 'Kubernetes', 'REST APIs', 'SQL'],
    matchingSkills: ['Python', 'Docker', 'REST APIs', 'SQL'],
    missingSkills: ['C# / .NET Core', 'Azure Kubernetes Service (AKS)', 'OAuth 2.0 / SAML'],
    description: 'Build enterprise-grade cloud native microservices on Microsoft Azure powering millions of global organizations.',
    insights: {
      whyMatch: 'Solid understanding of REST APIs, containerization, and relational databases.',
      potentialGap: 'Role requires C#/.NET Core and familiarity with Azure services.',
      suggestedAction: 'Highlight transferrable Java OOP concepts and microservices architectural patterns.'
    }
  },
  {
    id: 'job-8',
    title: 'Full Stack Engineer - Content Studio',
    company: 'Netflix',
    logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&auto=format&fit=crop&q=80',
    location: 'Los Gatos, CA',
    workMode: 'Remote',
    jobType: 'Full-time',
    experience: 'Junior / Mid',
    salary: '$170,000 - $210,000 / yr (All-Cash)',
    postedDate: '2026-08-12',
    fitScore: 89,
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Microservices', 'Tailwind CSS', 'Docker'],
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS', 'Docker'],
    missingSkills: ['RxJS', 'gRPC-Web', 'Complex State Orchestration'],
    description: 'Create high-productivity creative tools for studio producers, directors, and artists creating Netflix Original productions.',
    insights: {
      whyMatch: 'Near-perfect stack alignment with React, TypeScript, GraphQL, and modern web architectures.',
      potentialGap: 'Netflix emphasizes extreme ownership, candid feedback, and independent execution.',
      suggestedAction: 'Be ready to discuss deep architectural tradeoffs and client-side performance bottlenecks.'
    }
  }
];

export const mockJobTemplates = [
  {
    id: 'sample-fullstack',
    title: 'Full Stack Software Engineer (New Grad / Junior)',
    company: 'Fintech Cloud Technologies',
    location: 'San Francisco, CA / Remote',
    salary: '$135,000 - $160,000 / yr',
    description: `About the Role:
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
- Contributions to open-source software or compelling side projects.`
  },
  {
    id: 'sample-backend',
    title: 'Backend Distributed Systems Engineer',
    company: 'HyperScale Data Labs',
    location: 'New York, NY (Hybrid)',
    salary: '$150,000 - $175,000 / yr',
    description: `HyperScale Data Labs is seeking a Backend Engineer to power our real-time streaming data analytics engine.

What You Will Do:
- Architect high-throughput backend services in Go, Java, or C++.
- Optimize database queries, indexing strategies, and data partitioning in PostgreSQL and Redis.
- Build fault-tolerant distributed systems capable of processing millions of events per second.
- Implement CI/CD pipelines, Docker containers, and Kubernetes deployments on AWS.

Requirements:
- BS/MS in Computer Science or equivalent practical experience.
- Deep knowledge of Data Structures, Algorithms, and Concurrency.
- Experience with Go, Python, or Java and distributed consensus mechanisms (Raft, Paxos).
- Solid grasp of Linux networking, TCP/IP, and asynchronous programming.`
  },
  {
    id: 'sample-frontend',
    title: 'Frontend Engineer - Design Systems & Web Core',
    company: 'PixelCraft Studio',
    location: 'Remote',
    salary: '$140,000 - $165,000 / yr',
    description: `PixelCraft is seeking a talented Frontend Engineer passionate about crafting beautiful, accessible, and ultra-fast web experiences.

Responsibilities:
- Develop reusable React UI component libraries with Tailwind CSS and Radix UI primitives.
- Optimize Core Web Vitals (LCP, FID, CLS) and client-side rendering performance.
- Implement complex state management, real-time WebSocket collaborations, and interactive charts.
- Write unit, integration, and visual regression tests with Jest and Cypress.

Requirements:
- Strong mastery of TypeScript, modern React (Hooks, Context, Server Components), and CSS architecture.
- Deep empathy for user experience, web accessibility (WCAG 2.1 AA), and responsive layouts.
- Experience building full-stack Next.js applications and integrating with REST/GraphQL endpoints.`
  }
];
