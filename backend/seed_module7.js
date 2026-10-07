require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const InterviewQuestion = require('./models/InterviewQuestion');

const sampleQuestions = [
  // Technical - Core CS & Backend
  {
    question: 'What is the difference between ArrayList and LinkedList in Java, and when would you choose one over the other?',
    category: 'Technical',
    difficulty: 'Medium',
    jobTitle: 'Software Engineer',
    company: 'Generic Tech',
    skills: ['Java', 'Data Structures', 'Algorithms'],
    sampleAnswer: 'ArrayList is backed by a dynamic resizable array providing O(1) random access by index, but O(n) worst-case insertion/deletion when shifting elements. LinkedList is a doubly-linked list providing O(1) insertions/deletions given a node pointer, but O(n) element search due to sequential traversal. Choose ArrayList for read-heavy operations, and LinkedList for frequent insertions/deletions in the middle or ends.',
    tips: ['Mention time complexities for search, insert, and delete.', 'Discuss memory overhead from node pointers in LinkedList.']
  },
  {
    question: 'What is polymorphism in Object-Oriented Programming, and what is the difference between compile-time and runtime polymorphism?',
    category: 'Technical',
    difficulty: 'Easy',
    jobTitle: 'Software Developer',
    company: 'Generic Tech',
    skills: ['OOP', 'Java', 'C++', 'Python'],
    sampleAnswer: 'Polymorphism allows objects of different classes to be treated as instances of a common superclass while executing their own overridden behaviors. Compile-time (static) polymorphism is achieved via method overloading and resolved at compilation. Runtime (dynamic) polymorphism is achieved through method overriding and virtual method invocation resolved during execution based on actual object type.',
    tips: ['Give concrete examples like Method Overloading vs Overriding.', 'Mention method dispatch tables (vtable).']
  },
  {
    question: 'What is database normalization, and why are 1NF, 2NF, and 3NF important?',
    category: 'Technical',
    difficulty: 'Medium',
    jobTitle: 'Backend Engineer',
    company: 'Generic Tech',
    skills: ['DBMS', 'SQL', 'Database Design'],
    sampleAnswer: 'Normalization is the process of structuring relational database schemas to reduce data redundancy and eliminate insert, update, and deletion anomalies. 1NF ensures atomic columns and unique rows. 2NF removes partial functional dependencies on candidate keys. 3NF removes transitive dependencies where non-key attributes depend on other non-key attributes.',
    tips: ['Explain the trade-off between normalization (clean data) and denormalization (faster read performance in OLAP).']
  },
  {
    question: 'What are the key differences between TCP and UDP protocols?',
    category: 'Technical',
    difficulty: 'Easy',
    jobTitle: 'Network / Systems Engineer',
    company: 'Generic Tech',
    skills: ['Networking', 'TCP/IP', 'Operating Systems'],
    sampleAnswer: 'TCP (Transmission Control Protocol) is connection-oriented, reliable, and guarantees ordered packet delivery with flow control and retransmission mechanisms (via 3-way handshake). UDP (User Datagram Protocol) is connectionless, lightweight, and transmits datagrams without delivery acknowledgment or ordering guarantees, making it suitable for low-latency streaming and gaming.',
    tips: ['Mention the 3-way handshake (SYN, SYN-ACK, ACK).', 'Contrast reliability vs latency tradeoffs.']
  },
  {
    question: 'Explain how React Virtual DOM and reconciliation algorithm work.',
    category: 'Technical',
    difficulty: 'Medium',
    jobTitle: 'Frontend Engineer',
    company: 'Generic Tech',
    skills: ['React', 'JavaScript', 'Web Performance'],
    sampleAnswer: 'The Virtual DOM is an in-memory lightweight representation of the actual UI tree. When state changes, React renders a new virtual DOM tree, computes diffs against the previous snapshot via its heuristic Diffing algorithm (O(n) complexity), and patches only the changed real DOM nodes during the commit phase for optimal rendering speed.',
    tips: ['Explain component keys and why they prevent unnecessary re-renders.', 'Mention batching and fiber architecture.']
  },
  {
    question: 'How do indexes work in MongoDB, and what is the difference between a single field and a compound index?',
    category: 'Technical',
    difficulty: 'Medium',
    jobTitle: 'Full Stack Engineer',
    company: 'Generic Tech',
    skills: ['MongoDB', 'NoSQL', 'Database Indexing'],
    sampleAnswer: 'MongoDB indexes use B-Tree data structures to store a small portion of the collection dataset in an easy-to-traverse form. Without indexes, MongoDB must perform a collection scan (COLLSCAN) checking every document. A single field index indexes one attribute, whereas a compound index indexes multiple fields where order matters according to the Equality-Sort-Range (ESR) rule.',
    tips: ['Mention executionStats and explainQuery.', 'Explain the prefix rule for compound indexes.']
  },
  {
    question: 'What are RESTful API best practices regarding HTTP status codes and idempotency?',
    category: 'Technical',
    difficulty: 'Medium',
    jobTitle: 'API Engineer',
    company: 'Generic Tech',
    skills: ['REST', 'HTTP', 'API Architecture'],
    sampleAnswer: 'REST APIs utilize HTTP methods semantically: GET for safe retrieval, POST for resource creation, PUT for complete idempotent replacement, PATCH for partial modification, and DELETE for idempotent removal. Status codes must accurately reflect outcomes: 2xx for success (200 OK, 201 Created), 4xx for client errors (400 Bad Request, 401 Unauthorized, 404 Not Found), and 5xx for internal server errors.',
    tips: ['Define what idempotency means (multiple identical requests yield identical server state).']
  },

  // Behavioral - STAR Framework
  {
    question: 'Tell me about yourself and your career journey so far.',
    category: 'Behavioral',
    difficulty: 'Easy',
    jobTitle: 'Any Role',
    company: 'Generic Tech',
    skills: ['Communication', 'Personal Pitch'],
    sampleAnswer: 'I am a computer science student and software developer passionate about building scalable web applications and intuitive user experiences. Over the past few years, I have engineered full-stack projects using React, Node.js, and MongoDB, and led collaborative university teams. I am excited to apply my problem-solving skills to target production-grade engineering challenges.',
    tips: ['Follow Present-Past-Future structure.', 'Keep answer under 2 minutes and tie it to the job role.']
  },
  {
    question: 'Describe a challenging technical project you worked on and how you overcame major obstacles.',
    category: 'Behavioral',
    difficulty: 'Medium',
    jobTitle: 'Software Engineer',
    company: 'Generic Tech',
    skills: ['Problem Solving', 'Resilience', 'STAR Method'],
    sampleAnswer: 'In my recent project, our real-time notification engine suffered high latency during peak traffic spikes. Using the STAR method: Situation - high database query latency on notifications. Task - optimize the throughput without scaling infrastructure costs. Action - I profiled database queries, added compound indexes, and introduced an in-memory caching layer with Redis. Result - Reduced response latency by 68% and eliminated 504 timeouts.',
    tips: ['Structure response clearly: Situation, Task, Action, Result.', 'Quantify the outcome where possible.']
  },
  {
    question: 'Tell me about a time you had a disagreement with a teammate and how you resolved it.',
    category: 'Behavioral',
    difficulty: 'Medium',
    jobTitle: 'Software Engineer',
    company: 'Generic Tech',
    skills: ['Collaboration', 'Conflict Resolution', 'Teamwork'],
    sampleAnswer: 'During a hackathon, a peer and I disagreed on whether to use GraphQL or standard REST endpoints given our tight 24-hour deadline. Rather than arguing personal preferences, we quickly listed the concrete requirements, frontend data dependencies, and our team familiarity. We concluded REST would allow us to ship the MVP faster with zero setup overhead while maintaining clean documentation.',
    tips: ['Focus on empathy, data-driven decisions, and positive collaborative outcomes.']
  },
  {
    question: 'Describe a situation where you had to learn a new technology or framework under tight deadlines.',
    category: 'Behavioral',
    difficulty: 'Medium',
    jobTitle: 'Software Developer',
    company: 'Generic Tech',
    skills: ['Adaptability', 'Fast Learner'],
    sampleAnswer: 'When starting a project requiring MongoDB and Mongoose aggregation pipelines, which I had not previously used in depth, I read the official documentation, built small focused proof-of-concept scripts, and tested edge cases. Within four days, I was able to write robust aggregation pipelines that matched our team schema and passed all integration tests.',
    tips: ['Highlight proactive learning habits and hands-on experimentation.']
  },

  // HR & Motivation
  {
    question: 'Why do you want to work for our company?',
    category: 'HR',
    difficulty: 'Easy',
    jobTitle: 'Intern / Graduate Engineer',
    company: 'Generic Tech',
    skills: ['Culture Fit', 'Company Research'],
    sampleAnswer: 'I admire your commitment to engineering excellence and user-first products. Seeing how your distributed infrastructure handles high concurrency with high availability aligns directly with the systems architecture skills I have been building. I want to contribute to an engineering culture that values continuous learning, ownership, and innovation.',
    tips: ['Mention specific products, technology stacks, or company values.']
  },
  {
    question: 'Why should we hire you over other candidates?',
    category: 'HR',
    difficulty: 'Easy',
    jobTitle: 'Software Engineer',
    company: 'Generic Tech',
    skills: ['Confidence', 'Self-Awareness'],
    sampleAnswer: 'Beyond strong foundations in data structures, algorithms, and full-stack software development, I bring high ownership, curiosity, and rapid adaptability. I take pride in writing clean, well-tested, documented code and working collaboratively to deliver dependable features on schedule.',
    tips: ['Balance confidence with humility.', 'Focus on your unique combination of skills, attitude, and work ethic.']
  },
  {
    question: 'Where do you see yourself in 3 to 5 years?',
    category: 'HR',
    difficulty: 'Easy',
    jobTitle: 'Software Engineer',
    company: 'Generic Tech',
    skills: ['Career Planning', 'Ambition'],
    sampleAnswer: 'In 3 to 5 years, I envision myself as a seasoned software engineer who designs end-to-end distributed system features, mentors junior engineers, and takes ownership of key technical modules while contributing to strategic architectural decisions.',
    tips: ['Emphasize continuous technical growth, leadership, and long-term organizational impact.']
  },

  // Managerial & Ownership
  {
    question: 'How do you prioritize competing deadlines and tasks when working on multiple features?',
    category: 'Managerial',
    difficulty: 'Medium',
    jobTitle: 'Software Engineer',
    company: 'Generic Tech',
    skills: ['Time Management', 'Prioritization'],
    sampleAnswer: 'I evaluate tasks based on business impact, technical dependencies, and urgency using an Eisenhower matrix approach. I break large deliverables into milestone subtasks, communicate early with leads if scope adjustments are necessary, and focus on unblocking critical path dependencies first.',
    tips: ['Demonstrate clear communication with stakeholders and realistic planning.']
  },
  {
    question: 'How do you handle production incidents or bugs that occur after deployment?',
    category: 'Managerial',
    difficulty: 'Hard',
    jobTitle: 'Software Engineer / DevOps',
    company: 'Generic Tech',
    skills: ['Incident Management', 'Root Cause Analysis'],
    sampleAnswer: 'First, I prioritize immediate mitigation to stabilize user impact, either by rolling back the deployment or applying a feature flag toggle. Once stable, I investigate telemetry and server logs to determine root cause, write an automated regression test, deploy the patch, and conduct a blameless post-mortem to prevent recurrence.',
    tips: ['Emphasize mitigation first, root-cause second, and post-mortem learning third.']
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot';
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const count = await InterviewQuestion.countDocuments();
    console.log(`Current interview question bank count: ${count}`);

    if (count < 15) {
      console.log('Seeding question bank with sample questions...');
      await InterviewQuestion.insertMany(sampleQuestions);
      console.log(`Successfully seeded ${sampleQuestions.length} interview questions!`);
    } else {
      console.log('Question bank already contains sufficient questions. Adding any missing ones...');
      for (const q of sampleQuestions) {
        const exists = await InterviewQuestion.findOne({ question: q.question });
        if (!exists) {
          await InterviewQuestion.create(q);
        }
      }
      console.log('Question bank synced.');
    }

    const finalCount = await InterviewQuestion.countDocuments();
    console.log(`Total active questions in bank: ${finalCount}`);
    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
