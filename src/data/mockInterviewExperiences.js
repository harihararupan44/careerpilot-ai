export const mockInterviewExperiences = [
  {
    id: 'exp-1',
    company: 'Amazon',
    role: 'Software Development Engineer (SDE-1)',
    author: {
      id: 'person-1',
      name: 'Arun Kumar',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80',
      role: 'Software Development Engineer',
      company: 'Amazon',
      college: 'Sri Krishna College of Technology'
    },
    year: '2024',
    date: '2024-03-15',
    difficulty: 'Hard',
    preparationDuration: '6 Months',
    numberOfRounds: 4,
    helpfulCount: 248,
    likesCount: 182,
    technologies: ['Java', 'DSA', 'OOP', 'DBMS', 'SQL', 'Operating Systems', 'AWS', 'Spring Boot', 'System Design'],
    topics: ['Binary Trees', 'Dynamic Programming', 'Amazon Leadership Principles', 'Low Level Design'],
    summary: 'Cracked Amazon SDE-1 through off-campus drive. The process consisted of an online assessment followed by 3 technical rounds and a Bar Raiser focusing heavily on LP and scalable data structures.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Assessment', duration: '90 Mins', type: 'Coding & Work Style Simulation', outcome: 'Cleared' },
      { step: 2, name: 'Technical Interview 1', duration: '60 Mins', type: 'Data Structures & Algorithms', outcome: 'Cleared' },
      { step: 3, name: 'Technical Interview 2', duration: '60 Mins', type: 'Low Level Design & OOP', outcome: 'Cleared' },
      { step: 4, name: 'Bar Raiser / Managerial', duration: '60 Mins', type: 'Leadership Principles & Architecture', outcome: 'Cleared' },
      { step: 5, name: 'HR & Offer Discussion', duration: '30 Mins', type: 'Compensation & Team Fit', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Assessment (Hackerrank)',
        type: 'Coding & Work Style Assessment',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Optimizing parcel delivery routes using dynamic programming on DAGs.',
          'Subarray sum divisible by K with sliding window optimization.'
        ],
        description: '2 medium-to-hard coding problems and 20 work-style simulation questions reflecting Amazon Leadership Principles.',
        keyTips: 'Ensure all edge cases are tested and spend adequate time on the work simulator section.'
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (Data Structures)',
        type: 'Live Coding',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an in-memory file system with directory creation, file writing, and wildcard search (Trie + Tree).',
          'Explain time complexity and space trade-offs.'
        ],
        description: 'Deep dive into Tree traversals and custom data structure designs with clean, production-grade Java code.',
        keyTips: 'Write modular code with proper class interfaces and exception handling.'
      },
      {
        roundNumber: 3,
        name: 'Technical Round 2 (LLD & Algorithms)',
        type: 'System Design & Problem Solving',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Design a Locker Delivery System (Amazon Locker API, Locker state transitions, sizing algorithms).',
          'Concurrency management in locker reservation.'
        ],
        description: 'Focus was on Object-Oriented Design (SOLID principles) and handling race conditions.',
        keyTips: 'Clarify requirements upfront and write clean class diagrams.'
      },
      {
        roundNumber: 4,
        name: 'Bar Raiser & Leadership Principles',
        type: 'Behavioral & Architecture',
        duration: '60 Mins',
        outcome: 'Offered',
        questions: [
          'Tell me about a time you took a calculated risk and failed. What was your pivot?',
          'Deep dive into a college project architecture where you handled high traffic.'
        ],
        description: 'Senior Principal Engineer evaluated ownership, customer obsession, and technical depth using the STAR format.',
        keyTips: 'Have 5-6 well-structured STAR stories ready mapped to different Amazon LPs.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Design an In-Memory File System',
          description: 'Implement a directory structure supporting mkdir, addContentToFile, readContentFromFile, and ls with lexical sorting.',
          hint: 'Use a Trie-like multi-way Tree where each Directory node holds a HashMap of child files and directories.',
          timeComplexity: 'O(L + K log K) for ls where L is path length and K is number of directory children.',
          spaceComplexity: 'O(Total file characters + Directory nodes)',
          sampleInputOutput: 'Input: mkdir("/a/b/c") -> Output: Success. ls("/") -> Output: ["a"]'
        },
        {
          title: 'Subarray Sum Divisible by K',
          description: 'Given an integer array nums and an integer k, return the number of non-empty subarrays that have a sum divisible by k.',
          hint: 'Use prefix sums and modulo arithmetic with a frequency map. Normalize negative remainders: ((sum % k) + k) % k.',
          timeComplexity: 'O(N) single-pass scan',
          spaceComplexity: 'O(min(N, K)) hash map storage',
          sampleInputOutput: 'Input: nums = [4,5,0,-2,-3,1], k = 5 -> Output: 7'
        }
      ],
      technical: [
        {
          question: 'How does ConcurrentHashMap achieve thread safety in Java without locking the entire map?',
          answerSummary: 'Java 8+ ConcurrentHashMap uses bucket-level synchronized locks and CAS (Compare-And-Swap) operations on node heads, avoiding full table locks and allowing concurrent reads without blocking.',
          keyConcepts: ['CAS Operations', 'Synchronized Node Heads', 'TreeBin Red-Black Trees', 'Volatile Node Values']
        },
        {
          question: 'Explain Database Isolation Levels and how Amazon handles concurrent inventory decrements.',
          answerSummary: 'Discussed Read Committed, Repeatable Read, and Serializable levels. For inventory, pessimistic row locking (`SELECT FOR UPDATE`) or optimistic concurrency control with version numbers prevents overselling.',
          keyConcepts: ['ACID Guarantees', 'Pessimistic vs Optimistic Locking', 'Dirty Reads vs Phantom Reads']
        }
      ],
      hr: [
        {
          question: 'Tell me about a time you disagreed with a team member on a technical decision (LP: Have Backbone; Disagree and Commit).',
          situationExample: 'During a final year project, team wanted MongoDB for financial ledger entries. I presented benchmarks demonstrating MySQL ACID transactional guarantees, but once team decided on a hybrid approach, I committed fully to optimizing Mongo indexes.',
          keyTip: 'Quantify with data, maintain user empathy, and emphasize commitment once a decision is reached.'
        },
        {
          question: 'Describe a situation where you dove deep into a difficult bug (LP: Dive Deep).',
          situationExample: 'Tracked a silent memory leak during an internship down to unclosed database connection pools under concurrent load using Java heap dumps and VisualVM.',
          keyTip: 'Walk through your systematic debugging process and metric verification.'
        }
      ],
      project: [
        {
          question: 'Walk me through the architecture of your CloudMesh Microservices project.',
          architectureFocus: 'Spring Boot microservices communicating via RabbitMQ event bus, with an API Gateway handling JWT validation and Eureka service discovery.',
          keyTradeoff: 'Chose asynchronous event-driven messaging over synchronous REST to decouple inventory reservations from payment gateway latency.'
        },
        {
          question: 'How would you scale this architecture to support 50,000 requests per second?',
          architectureFocus: 'Add Redis distributed caching for read-heavy catalog endpoints, implement database read replicas, and use AWS Auto Scaling with ALB.',
          keyTradeoff: 'Eventual consistency in search catalog vs strict consistency in order ledger.'
        }
      ]
    },
    preparation: {
      strategy: 'Focused on high-frequency LeetCode questions by topic (Trees, Graphs, DP). Prepared 14 detailed STAR stories with metrics mapped to Amazon Leadership Principles. Practiced mock interviews with peers weekly on CareerPilot AI.',
      timeSpent: '6 Months • 3-4 hours daily (extended to 6 hours on weekends)',
      resources: [
        { name: 'LeetCode Premium (Amazon Tagged)', type: 'Practice Platform', description: 'Solved top 150 tagged Amazon questions.' },
        { name: 'Striver SDE Sheet', type: 'DSA Roadmap', description: 'Comprehensive coverage of core data structures.' },
        { name: 'Designing Data-Intensive Applications', type: 'Book', description: 'Deep conceptual foundations in distributed systems.' },
        { name: 'Grokking the Low Level Design', type: 'System Design Course', description: 'Object-oriented design patterns and UML modeling.' }
      ],
      topicsRevised: ['Binary Trees & BST', 'Dynamic Programming', 'Graph BFS/DFS/Dijkstra', 'SOLID Principles', 'Low Level Design', 'SQL Indexing & Transactions', 'Operating System Threads & Locks']
    },
    mistakesToAvoid: [
      'Do not jump straight into writing code without clarifying input constraints and discussing edge cases (e.g. empty inputs, duplicates, integer overflow).',
      'Do not underestimate Amazon Leadership Principles; LP answers account for over 50% of the hiring evaluation.',
      'Avoid writing messy, single-letter variable names. Write clean, production-grade modular code with proper class interfaces.',
      'Never stay silent when you get stuck. Think out loud so the interviewer can guide you in the right direction.'
    ],
    candidateTips: [
      'Practice writing code on a plain text editor or Google Docs without syntax highlighting or autocomplete.',
      'Structure all behavioral answers strictly in STAR format (Situation, Task, Action, Result) with quantified metrics.',
      'Prepare 3-4 thoughtful technical questions to ask the interviewer at the end of each round.',
      'Master time and space complexity analysis—explain both average and worst-case trade-offs upfront.'
    ],
    keyTakeaways: 'Amazon values code readability and Leadership Principles as much as raw algorithmic problem solving. Practice explaining your thought process out loud.'
  },
  {
    id: 'exp-2',
    company: 'Microsoft',
    role: 'Software Engineer',
    author: {
      id: 'person-2',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
      role: 'Software Engineer',
      company: 'Microsoft',
      college: 'PSG College of Technology'
    },
    year: '2024',
    date: '2024-02-20',
    difficulty: 'Medium',
    preparationDuration: '5 Months',
    numberOfRounds: 4,
    helpfulCount: 195,
    likesCount: 142,
    technologies: ['C++', 'Python', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'Azure', 'Distributed Systems'],
    topics: ['Graphs', 'Recursion', 'Binary Search', 'Microservices', 'System Design'],
    summary: 'Secured an on-campus offer for Microsoft IDC Hyderabad. Questions centered on clean algorithmic reasoning, graph algorithms, and edge-case handling.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Coding Test (Codility)', duration: '75 Mins', type: 'Algorithmic Problem Solving', outcome: 'Cleared' },
      { step: 2, name: 'Technical Round 1', duration: '45 Mins', type: 'Data Structures & Recursion', outcome: 'Cleared' },
      { step: 3, name: 'Technical Round 2', duration: '50 Mins', type: 'System Design & Project Architecture', outcome: 'Cleared' },
      { step: 4, name: 'Director / Hiring Manager Round', duration: '45 Mins', type: 'Growth Mindset & Culture Fit', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Coding Test (Codility)',
        type: 'Algorithms',
        duration: '75 Mins',
        outcome: 'Cleared',
        questions: [
          'Matrix path finding with obstacles and maximum reward collection.',
          'String manipulation with anagram grouped hash maps.'
        ],
        description: '3 programming challenges testing algorithmic efficiency and memory limits.',
        keyTips: 'Write fast, bug-free solutions with clean variable naming.'
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (Data Structures)',
        type: 'Live Coding',
        duration: '45 Mins',
        outcome: 'Cleared',
        questions: [
          'Clone a directed Graph with cycle detection and random pointers.',
          'Binary search on rotated sorted array variations.'
        ],
        description: 'Interviewer was friendly and asked for step-by-step optimization from O(N^2) to O(N).',
        keyTips: 'Always discuss brute-force first before leaping into the optimal approach.'
      },
      {
        roundNumber: 3,
        name: 'Technical Round 2 (System Design & Project Deep Dive)',
        type: 'Technical & System Architecture',
        duration: '50 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an URL Shortener service (Hashing vs Auto-increment, database partitioning, caching).',
          'Deep dive into real-time collaborative code editor project.'
        ],
        description: 'Evaluated database schema design, Redis caching layer, and scaling strategies.',
        keyTips: 'Draw clear architectural diagrams and calculate QPS requirements.'
      },
      {
        roundNumber: 4,
        name: 'Director / Hiring Manager Round',
        type: 'Culture & Behavioral',
        duration: '45 Mins',
        outcome: 'Offered',
        questions: [
          'Why Microsoft? How do your personal career goals align with Azure platform initiatives?',
          'Describe a situation where you resolved a team conflict during a hackathon.'
        ],
        description: 'Discussed growth mindset, continuous learning, and passion for developer tooling.',
        keyTips: 'Demonstrate enthusiasm and research Microsoft cloud ecosystem beforehand.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Clone a Directed Graph with Random Pointers',
          description: 'Given a reference of a node in a connected directed graph, return a deep copy (clone) of the graph.',
          hint: 'Use a Hash Map mapping original nodes to their cloned counterparts to avoid infinite loops in cyclic graphs during BFS/DFS.',
          timeComplexity: 'O(V + E) where V is vertices and E is edges',
          spaceComplexity: 'O(V) to store cloned node references in the map',
          sampleInputOutput: 'Input: adjList = [[2,4],[1,3],[2,4],[1,3]] -> Output: Deep cloned graph instance'
        },
        {
          title: 'Search in Rotated Sorted Array',
          description: 'Given an integer array nums sorted in ascending order (with distinct values) that is rotated at an unknown pivot, find index of target.',
          hint: 'Modified binary search: at least one half (left or right) is guaranteed to be normally sorted. Check if target lies within that range.',
          timeComplexity: 'O(log N)',
          spaceComplexity: 'O(1)',
          sampleInputOutput: 'Input: nums = [4,5,6,7,0,1,2], target = 0 -> Output: 4'
        }
      ],
      technical: [
        {
          question: 'How does virtual memory paging work and what is a Translation Lookaside Buffer (TLB)?',
          answerSummary: 'Virtual memory splits address space into pages mapped to physical frames via Page Tables. TLB is a high-speed hardware cache of recent virtual-to-physical address translations to prevent double memory lookups.',
          keyConcepts: ['Page Tables', 'TLB Miss vs Hit', 'Page Fault Handling', 'Paging vs Segmentation']
        },
        {
          question: 'Explain the difference between clustered and non-clustered indexes in SQL.',
          answerSummary: 'A clustered index determines the physical order of data on disk (only one per table, typically Primary Key). A non-clustered index stores a separate sorted structure with pointers back to the actual data rows.',
          keyConcepts: ['B+ Trees', 'Physical Disk Ordering', 'Leaf Node Pointers', 'Index Scan vs Seek']
        }
      ],
      hr: [
        {
          question: 'Why Microsoft? What inspires you about our mission to empower every person on the planet to achieve more?',
          situationExample: 'Spoke about Microsoft developer tools (VS Code, TypeScript, GitHub) and how they shaped my coding journey in college, expressing eagerness to contribute to Azure developer productivity.',
          keyTip: 'Connect company mission to your authentic personal experiences and career ambitions.'
        },
        {
          question: 'Tell me about a time you had to learn a completely new technology under tight deadlines (Growth Mindset).',
          situationExample: 'Learned WebSockets and WebRTC in 48 hours for a college hackathon to build a peer-to-peer real-time collaboration tool, winning 1st place.',
          keyTip: 'Highlight curiosity, quick prototyping ability, and resilience when facing technical roadblocks.'
        }
      ],
      project: [
        {
          question: 'In your collaborative code editor project, how did you handle concurrent conflicting edits between users?',
          architectureFocus: 'Implemented Operational Transformation (OT) / CRDT logic over WebSockets with server-side sequence numbering to preserve document consistency.',
          keyTradeoff: 'Chose WebSockets with Redis Pub/Sub backplane over polling to minimize typing latency.'
        }
      ]
    },
    preparation: {
      strategy: 'Focused on standard LeetCode Mediums (Trees, Graphs, DP). Read System Design Primer and practiced mock interviews on CareerPilot AI.',
      timeSpent: '5 Months • ~3 hours daily',
      resources: [
        { name: 'LeetCode Medium Problems', type: 'Coding Practice', description: 'Solved 300+ medium tier problems.' },
        { name: 'System Design Primer (GitHub)', type: 'Architecture Guide', description: 'Comprehensive guide to scaling web applications.' },
        { name: 'Operating System Concepts (Galvin)', type: 'Textbook', description: 'Deep dive into processes, threads, memory, and synchronization.' }
      ],
      topicsRevised: ['Binary Search Variants', 'Graph Cycle Detection & Traversal', 'Tree Traversals', 'Operating System Synchronization', 'Database Normalization & Indexing']
    },
    mistakesToAvoid: [
      'Do not jump into an optimal solution without articulating the brute-force approach first.',
      'Never ignore boundary test cases (null pointers, single-node trees, disconnected graphs).',
      'Do not be defensive when an interviewer suggests alternative approaches—show flexibility and adaptability.'
    ],
    candidateTips: [
      'Focus heavily on writing readable C++ code using modern STL conventions and smart pointers.',
      'Explain your thought process step by step as you write code.',
      'Demonstrate a strong growth mindset and passion for continuous learning.'
    ],
    keyTakeaways: 'Microsoft interviewers love candidates who exhibit a growth mindset, write bug-free code, and test edge cases thoroughly.'
  },
  {
    id: 'exp-3',
    company: 'Google',
    role: 'Software Development Engineer',
    author: {
      id: 'person-3',
      name: 'Karthik Raja',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
      role: 'Software Development Engineer',
      company: 'Google',
      college: 'National Institute of Technology, Trichy'
    },
    year: '2024',
    date: '2024-04-10',
    difficulty: 'Hard',
    preparationDuration: '8 Months',
    numberOfRounds: 5,
    helpfulCount: 312,
    likesCount: 265,
    technologies: ['C++', 'Go', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'Distributed Systems', 'Algorithms', 'GCP'],
    topics: ['Trie', 'Segment Trees', 'Dynamic Programming', 'Concurrency', 'Googleyness'],
    summary: 'Cleared Google India off-campus hiring for SDE. 5 rigorous rounds with strong emphasis on algorithmic proofs, edge cases, and Googleyness leadership.',
    selectionProcessTimeline: [
      { step: 1, name: 'Technical Screening', duration: '45 Mins', type: 'Live Coding (Google Docs)', outcome: 'Cleared' },
      { step: 2, name: 'Onsite Round 1', duration: '45 Mins', type: 'Advanced Graph Algorithms', outcome: 'Cleared' },
      { step: 3, name: 'Onsite Round 2', duration: '45 Mins', type: 'String Algorithms & DP', outcome: 'Cleared' },
      { step: 4, name: 'Onsite Round 3', duration: '45 Mins', type: 'Custom Data Structure Design', outcome: 'Cleared' },
      { step: 5, name: 'Googleyness & Leadership', duration: '45 Mins', type: 'Behavioral & Situational Ethics', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Technical Screening Round',
        type: 'Live Coding (Google Docs)',
        duration: '45 Mins',
        outcome: 'Cleared',
        questions: [
          'Range Query optimization using Segment Trees / Fenwick Trees for dynamic updates.',
          'Follow-up with multi-threaded updates.'
        ],
        description: 'Heavy focus on time complexity proofs and writing syntax-error-free code in plain text.',
        keyTips: 'Get comfortable coding without IDE autocomplete or syntax highlighting.'
      },
      {
        roundNumber: 2,
        name: 'Onsite Round 1 (Advanced Graphs)',
        type: 'Live Problem Solving',
        duration: '45 Mins',
        outcome: 'Cleared',
        questions: [
          'Shortest path with at most K stops in a dynamic cost network (Dijkstra + DP).',
          'Memory optimization for large sparse graphs.'
        ],
        description: 'Interviewer provided ambiguous constraints and evaluated candidate clarifying questions.',
        keyTips: 'Never assume constraints—always ask about graph density and cycle guarantees.'
      },
      {
        roundNumber: 3,
        name: 'Onsite Round 2 (String Algorithms & DP)',
        type: 'Live Coding',
        duration: '45 Mins',
        outcome: 'Cleared',
        questions: [
          'Wildcard and Regular Expression Matching with space-optimized DP table.',
          'Streaming text search using Aho-Corasick automaton.'
        ],
        description: 'High standard for optimal space and time complexities.',
        keyTips: 'Explain the recurrence relation clearly before writing tabular code.'
      },
      {
        roundNumber: 4,
        name: 'Onsite Round 3 (System & Data Structure Design)',
        type: 'Architectural Coding',
        duration: '45 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an LFU (Least Frequently Used) Cache with O(1) get and put operations.',
          'Handling concurrent read/write locks.'
        ],
        description: 'Required custom Doubly Linked Lists and Hash Maps with zero external libraries.',
        keyTips: 'Break down data structure pointer manipulations step by step.'
      },
      {
        roundNumber: 5,
        name: 'Googleyness & Leadership Round',
        type: 'Behavioral & Situational',
        duration: '45 Mins',
        outcome: 'Offered',
        questions: [
          'How do you navigate ambiguous product requirements when team members disagree?',
          'Tell me about an open-source contribution you made and what you learned from code reviews.'
        ],
        description: 'Evaluated intellectual humility, collaboration, and ethical decision making.',
        keyTips: 'Be genuine, collaborative, and demonstrate curiosity.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Design an LFU (Least Frequently Used) Cache in O(1)',
          description: 'Design and implement a data structure for a Least Frequently Used (LFU) cache with get(key) and put(key, value) in O(1) time complexity.',
          hint: 'Maintain two HashMaps: keyToValAndFreq, and freqToDoublyLinkedList, alongside a minFreq pointer.',
          timeComplexity: 'O(1) for both get and put operations',
          spaceComplexity: 'O(Capacity) to store nodes and linked lists',
          sampleInputOutput: 'LFUCache cache = new LFUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1); cache.put(3, 3); // evicts key 2'
        },
        {
          title: 'Cheapest Flights Within K Stops',
          description: 'Find the cheapest flight route from src to dst with at most k stops in a directed weighted graph.',
          hint: 'Use Bellman-Ford / BFS with queue storing (stops, city, currentCost) or Dijkstra with distance array indexed by stops.',
          timeComplexity: 'O(K * E) where E is number of flights',
          spaceComplexity: 'O(V + E)',
          sampleInputOutput: 'Input: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1 -> Output: 700'
        }
      ],
      technical: [
        {
          question: 'How do Segment Trees differ from Binary Indexed Trees (Fenwick Trees)?',
          answerSummary: 'Segment Trees support arbitrary range queries (sum, min, max, gcd) and range updates with lazy propagation in O(log N). Fenwick Trees are more lightweight and cache-friendly for prefix cumulative calculations.',
          keyConcepts: ['Lazy Propagation', 'Tree Arrays', 'Prefix Inversion', 'O(log N) Updates']
        }
      ],
      hr: [
        {
          question: 'How do you navigate working on a team where there is no clear technical consensus on an open-ended project?',
          situationExample: 'Proposed setting up an objective benchmarking matrix evaluating latency, memory overhead, and implementation complexity across both competing solutions, turning emotional debates into empirical trade-off discussions.',
          keyTip: 'Show intellectual humility, data-driven reasoning, and collaboration.'
        }
      ],
      project: [
        {
          question: 'In your distributed key-value store, how did you handle Raft leader election during network splits?',
          architectureFocus: 'Implemented term numbers and quorum voting (N/2 + 1). Nodes on minority partitions step down to follower state upon failing to achieve quorum.',
          keyTradeoff: 'Prioritized consistency over availability (CP in CAP theorem).'
        }
      ]
    },
    preparation: {
      strategy: 'Solved 600+ LeetCode questions (specializing in Hard graphs and DP). Participated regularly in Codeforces rounds and read Designing Data-Intensive Applications.',
      timeSpent: '8 Months • 4-5 hours daily',
      resources: [
        { name: 'LeetCode Hard Collection', type: 'Practice Platform', description: 'Mastered 200+ LeetCode Hard problems.' },
        { name: 'CP-Algorithms.com', type: 'Reference', description: 'Advanced graph, tree, and string algorithms with mathematical proofs.' },
        { name: 'Codeforces Div 2 Contests', type: 'Competitive Coding', description: 'Speed and accuracy under tight contest time limits.' }
      ],
      topicsRevised: ['Segment Trees & Fenwick Trees', 'Dijkstra & Bellman Ford', 'LFU / LRU Design', 'Aho-Corasick Automaton', 'Raft Consensus Protocol']
    },
    mistakesToAvoid: [
      'Do not assume constraints without asking—Google intentionally leaves problem statements ambiguous.',
      'Never write code with subtle off-by-one bugs; walk through your code with a sample dry-run before telling the interviewer you are done.',
      'Do not memorize solutions—interviews will pivot with follow-up constraints testing deep understanding.'
    ],
    candidateTips: [
      'Practice coding directly in Google Docs with zero formatting assistance.',
      'State time and space complexity with formal Big-O proofs.',
      'Engage with the interviewer as a peer discussing an engineering trade-off.'
    ],
    keyTakeaways: 'Google tests your ability to think methodically under pressure. Clean code, clear communication, and mathematical rigour are essential.'
  },
  {
    id: 'exp-4',
    company: 'Adobe',
    role: 'Member of Technical Staff',
    author: {
      id: 'person-4',
      name: 'Sneha Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
      role: 'Member of Technical Staff',
      company: 'Adobe',
      college: 'Vellore Institute of Technology'
    },
    year: '2024',
    date: '2024-01-18',
    difficulty: 'Medium',
    preparationDuration: '5 Months',
    numberOfRounds: 4,
    helpfulCount: 164,
    likesCount: 118,
    technologies: ['React', 'TypeScript', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'Node.js', 'WebAssembly'],
    topics: ['DOM Manipulation', 'Design Patterns', 'Arrays & Strings', 'Web Performance'],
    summary: 'On-campus placement experience for Adobe Creative Cloud team. Questions covered modern frontend architecture, WebAssembly, and Core CS Fundamentals.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Assessment', duration: '90 Mins', type: 'Coding & Aptitude MCQs', outcome: 'Cleared' },
      { step: 2, name: 'Technical Round 1', duration: '50 Mins', type: 'DSA & JavaScript Internals', outcome: 'Cleared' },
      { step: 3, name: 'Technical Round 2', duration: '60 Mins', type: 'Frontend Architecture & Canvas Design', outcome: 'Cleared' },
      { step: 4, name: 'HR & Managerial Round', duration: '30 Mins', type: 'Behavioral & Creative Mindset', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Assessment',
        type: 'Coding & Aptitude',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Array manipulation: finding longest subarray with equal 0s and 1s.',
          'Bit manipulation questions and CS core MCQs (OS, DBMS, OOP).'
        ],
        description: '2 coding questions and 30 multiple-choice questions on OS, networking, and algorithms.',
        keyTips: 'Manage time well across coding and MCQ sections.'
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (DSA & Core CS)',
        type: 'Live Coding',
        duration: '50 Mins',
        outcome: 'Cleared',
        questions: [
          'Detect and remove cycle in a Linked List.',
          'Implement a Custom Promise / Async queue in JavaScript/TypeScript.'
        ],
        description: 'Tested standard data structures and deep JavaScript runtime internals (Event Loop, Microtasks).',
        keyTips: 'Know event loop lifecycle and prototype chain thoroughly.'
      },
      {
        roundNumber: 3,
        name: 'Technical Round 2 (Frontend Architecture & Canvas)',
        type: 'System Design & Projects',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an interactive drawing canvas with infinite zoom and undo/redo history (Command Pattern).',
          'Virtual DOM reconciliation vs direct Canvas rendering performance.'
        ],
        description: 'Deep dive into rendering optimizations and memory leak prevention in browser apps.',
        keyTips: 'Explain design patterns like Observer and Command clearly.'
      },
      {
        roundNumber: 4,
        name: 'HR & Management Round',
        type: 'Behavioral',
        duration: '30 Mins',
        outcome: 'Offered',
        questions: [
          'Why Adobe? What Adobe tools have you used in personal projects?',
          'How do you stay updated with emerging web standards?'
        ],
        description: 'Discussed culture fit, innovation mindset, and personal creative projects.',
        keyTips: 'Highlight any UI/UX or interactive graphics projects in your portfolio.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Implement a Custom Promise.all Polyfill',
          description: 'Write a robust implementation of Promise.all with early rejection and proper resolution array index ordering.',
          hint: 'Maintain an array of results and a resolvedCounter. When resolvedCounter reaches promises.length, resolve the outer promise.',
          timeComplexity: 'O(N) where N is number of promises',
          spaceComplexity: 'O(N) for resolved results array',
          sampleInputOutput: 'customPromiseAll([p1, p2, p3]).then(results => console.log(results));'
        }
      ],
      technical: [
        {
          question: 'Explain the browser critical rendering path and how to optimize repaint and reflow.',
          answerSummary: 'DOM + CSSOM -> Render Tree -> Layout -> Paint -> Composite. Minimized reflows using CSS transforms, `requestAnimationFrame`, and `will-change`.',
          keyConcepts: ['DOM & CSSOM Tree', 'Layout Thrashing', 'GPU Compositing', 'Event Loop Microtasks']
        }
      ],
      hr: [
        {
          question: 'Why Adobe? What products in the Creative Cloud ecosystem inspire your technical interests?',
          situationExample: 'Discussed passion for WebAssembly and building desktop-class creative editing experiences directly in the web browser (like Photoshop Web).',
          keyTip: 'Highlight personal alignment with digital creativity and web technology advancements.'
        }
      ],
      project: [
        {
          question: 'How did you optimize memory consumption in your browser-based image filter application?',
          architectureFocus: 'Used OffscreenCanvas and Web Workers to process pixel buffers without blocking the main UI thread.',
          keyTradeoff: 'Transferred ArrayBuffers via transferrable objects to eliminate serialization copy overhead.'
        }
      ]
    },
    preparation: {
      strategy: 'Built 3 production-grade React projects, practiced standard DSA on Striver SDE sheet, and studied browser rendering pipelines.',
      timeSpent: '5 Months • ~3 hours daily',
      resources: [
        { name: 'JavaScript.info', type: 'Documentation', description: 'Deep dive into JavaScript engines, closures, and async patterns.' },
        { name: 'Striver SDE Sheet', type: 'DSA Guide', description: 'Complete problem sets on Linked Lists, Arrays, and Trees.' }
      ],
      topicsRevised: ['JavaScript Event Loop', 'Canvas 2D Context', 'Command & Observer Patterns', 'Linked List Cycle Removal']
    },
    mistakesToAvoid: [
      'Do not treat frontend as only HTML/CSS; deep JavaScript runtime mechanics and memory management are heavily tested.',
      'Do not forget to clean up event listeners and intervals when writing custom asynchronous hooks.'
    ],
    candidateTips: [
      'Showcase live deployed demos of your projects on GitHub Pages or Vercel.',
      'Be prepared to write vanilla JavaScript polyfills without using third-party helper libraries.'
    ],
    keyTakeaways: 'Adobe values deep domain understanding in web technologies alongside solid algorithmic foundations.'
  },
  {
    id: 'exp-5',
    company: 'Uber',
    role: 'Software Engineer (Backend)',
    author: {
      id: 'person-5',
      name: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
      role: 'Software Engineer',
      company: 'Uber',
      college: 'BITS Pilani'
    },
    year: '2023',
    date: '2023-11-12',
    difficulty: 'Hard',
    preparationDuration: '7 Months',
    numberOfRounds: 4,
    helpfulCount: 280,
    likesCount: 210,
    technologies: ['Go', 'Kafka', 'Redis', 'PostgreSQL', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'Microservices', 'Distributed Systems'],
    topics: ['Geohashing (H3)', 'Rate Limiting', 'Concurrency', 'Distributed Locking', 'Kafka Messaging'],
    summary: 'Uber backend placement experience. Focused heavily on high-throughput distributed systems, geospatial indexing, concurrency in Go, and real-time dispatch systems.',
    selectionProcessTimeline: [
      { step: 1, name: 'Coding & Architecture Screen', duration: '60 Mins', type: 'Concurrent Data Structures', outcome: 'Cleared' },
      { step: 2, name: 'Data Structures & Optimization', duration: '60 Mins', type: 'Geospatial Algorithms', outcome: 'Cleared' },
      { step: 3, name: 'High Level System Design', duration: '60 Mins', type: 'Distributed Ride Dispatching', outcome: 'Cleared' },
      { step: 4, name: 'Engineering Culture & Values', duration: '45 Mins', type: 'Ownership & Incident Management', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Coding & Architecture Screen',
        type: 'Online Coding',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an in-memory Key-Value store with TTL and expiration cleanup.',
          'Multi-threaded safe read and write using RWMutex.'
        ],
        description: 'Tested concurrency primitives and efficient background cleanup threads.',
        keyTips: 'Watch out for race conditions and memory leaks.'
      },
      {
        roundNumber: 2,
        name: 'Data Structures & Algorithmic Optimization',
        type: 'Live Coding',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Ride matching algorithm: Given driver and rider coordinates, find top K nearest available drivers within radius.',
          'Optimization using QuadTree / Geohash buckets.'
        ],
        description: 'Focused on geospatial indexing and optimizing priority queues for real-time dispatch.',
        keyTips: 'Demonstrate familiarity with spatial indexing concepts.'
      },
      {
        roundNumber: 3,
        name: 'High Level System Design',
        type: 'System Design',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Design Uber Ride Dispatching & Dynamic Surge Pricing system.',
          'Handling network partitions, idempotency for payment authorizations, and WebSocket connection state.'
        ],
        description: 'Deep dive into message queues, Redis geospatial commands, and database sharding.',
        keyTips: 'Cover both happy path and failure recovery modes (e.g. driver drops offline midway).'
      },
      {
        roundNumber: 4,
        name: 'Engineering Culture & Values',
        type: 'Behavioral',
        duration: '45 Mins',
        outcome: 'Offered',
        questions: [
          'Describe a situation where you challenged a technical decision with data.',
          'How do you handle production outages and post-mortems?'
        ],
        description: 'Evaluated resilience, high bar for engineering standards, and ownership.',
        keyTips: 'Emphasize engineering rigor, monitoring, and automated testing.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Top K Nearest Drivers with Spatial Geohash',
          description: 'Given a stream of driver location updates (lat, lon) and a passenger request, return the K nearest available drivers within radius R.',
          hint: 'Convert coordinates to Geohash / H3 cell indexes. Query neighboring hexagons and use a Max Heap of size K.',
          timeComplexity: 'O(N log K) without index, O(CellNeighbors + K log K) with spatial indexing',
          spaceComplexity: 'O(K) for priority queue',
          sampleInputOutput: 'Input: passenger = (37.77, -122.41), K = 3 -> Output: [Driver_101, Driver_204, Driver_89]'
        }
      ],
      technical: [
        {
          question: 'How do you prevent race conditions in distributed ride acceptance when two drivers accept the same ride simultaneously?',
          answerSummary: 'Used distributed locks with Redis Redlock algorithm or atomic conditional database updates (`UPDATE rides SET driver_id = ? WHERE id = ? AND status = "SEARCHING"`).',
          keyConcepts: ['Distributed Locking', 'Atomic CAS Updates', 'Idempotency Keys', 'Kafka Partition Ordering']
        }
      ],
      hr: [
        {
          question: 'Tell me about a time you handled an urgent production incident.',
          situationExample: 'Discovered a deadlock in an asynchronous payment processing queue during high load. Implemented exponential backoff with jitter and rolled out hotfix within 45 minutes.',
          keyTip: 'Demonstrate calm troubleshooting, root cause analysis, and post-mortem prevention.'
        }
      ],
      project: [
        {
          question: 'How did you structure Kafka partitions in your event pipeline to ensure message ordering?',
          architectureFocus: 'Partitioned topics by `driver_id` and `ride_id` as message keys so all status events for a single ride arrive sequentially on the same partition consumer.',
          keyTradeoff: 'Accepted slight partition skew in exchange for guaranteed FIFO delivery per entity.'
        }
      ]
    },
    preparation: {
      strategy: 'Studied Uber engineering blogs, implemented Raft consensus in Go, and practiced 500+ LeetCode problems with focus on Graphs and Concurrency.',
      timeSpent: '7 Months • 4 hours daily',
      resources: [
        { name: 'Uber Engineering Blog', type: 'System Architecture', description: 'Real-world architectures for dispatch, H3 indexing, and Cherami messaging.' },
        { name: 'Designing Data-Intensive Applications', type: 'Book', description: 'Essential distributed systems and replication guides.' }
      ],
      topicsRevised: ['Go Goroutines & Channels', 'Geohashing / H3 Indexing', 'Kafka Partition Ordering', 'Distributed Transactions & 2PC']
    },
    mistakesToAvoid: [
      'Do not neglect concurrency and race conditions when discussing backend systems.',
      'Avoid single point of failure (SPOF) designs in high-level system design rounds.'
    ],
    candidateTips: [
      'Familiarize yourself with Uber open-source projects like H3 and Jaeger tracing.',
      'Always calculate bandwidth, storage, and QPS numbers upfront in system design.'
    ],
    keyTakeaways: 'Uber has a very high technical bar for backend roles. Strong understanding of concurrency, messaging systems, and spatial partitioning is crucial.'
  },
  {
    id: 'exp-6',
    company: 'Zoho',
    role: 'Software Developer',
    author: {
      id: 'person-6',
      name: 'Ananya Iyer',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
      role: 'Software Developer',
      company: 'Zoho',
      college: 'Thiagarajar College of Engineering'
    },
    year: '2024',
    date: '2024-02-05',
    difficulty: 'Medium',
    preparationDuration: '4 Months',
    numberOfRounds: 5,
    helpfulCount: 215,
    likesCount: 165,
    technologies: ['Java', 'C', 'DSA', 'OOP', 'DBMS', 'SQL', 'Operating Systems'],
    topics: ['Matrix Manipulations', 'Recursion', 'Pattern Printing', 'Custom Data Structures', 'LLD'],
    summary: 'Zoho on-campus recruitment drive. Unique 5-round format emphasizing foundational C/Java problem solving, zero built-in library usage, and advanced application design.',
    selectionProcessTimeline: [
      { step: 1, name: 'Basic Programming & Aptitude', duration: '90 Mins', type: 'C Pointers & Loops', outcome: 'Cleared' },
      { step: 2, name: 'Advanced Programming Round', duration: '180 Mins', type: '5 Pure Logic Problems', outcome: 'Cleared' },
      { step: 3, name: 'Application Design (LLD)', duration: '150 Mins', type: 'Console-based Working App', outcome: 'Cleared' },
      { step: 4, name: 'Technical HR', duration: '45 Mins', type: 'Java Internals & DBMS', outcome: 'Cleared' },
      { step: 5, name: 'General HR', duration: '30 Mins', type: 'Culture & Product Craftsmanship', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Basic Programming & Aptitude Round',
        type: 'Pen & Paper / Online',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Pattern printing with alphanumeric sequences.',
          'Matrix rotations without using extra space.',
          'C pointers and recursion trace outputs.'
        ],
        description: 'Focus was on writing logic without standard libraries (e.g. no String.split() or Arrays.sort()).',
        keyTips: 'Practice basic loops and pointer manipulations in C.'
      },
      {
        roundNumber: 2,
        name: 'Advanced Programming Round',
        type: 'Hands-on Coding',
        duration: '180 Mins',
        outcome: 'Cleared',
        questions: [
          'Given a dictionary of words, find the minimum insertions needed to make a string a palindrome.',
          'Evaluating arithmetic expressions with nested parentheses and custom precedence.'
        ],
        description: '5 challenging problem statements where candidates code on local machines under supervision.',
        keyTips: 'Write clean code and test with all sample cases before calling the evaluator.'
      },
      {
        roundNumber: 3,
        name: 'Design Round (Application Development)',
        type: 'Low Level Design',
        duration: '150 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an Railway Reservation System (Tatkal, Waiting List, RAC, cancellation matrix).',
          'Console-based full interactive menu driven flow in Java.'
        ],
        description: 'Requires writing an end-to-end working application with clean OOP hierarchy and state management.',
        keyTips: 'Create modular classes for Passenger, Ticket, Coach, and BookingManager.'
      },
      {
        roundNumber: 4,
        name: 'Technical HR Round',
        type: 'Technical Interview',
        duration: '45 Mins',
        outcome: 'Cleared',
        questions: [
          'Explain how HashMap works internally in Java (Buckets, Treeification, Hash collision resolution).',
          'Database normalization up to 3NF.'
        ],
        description: 'Evaluated core CS fundamentals, memory management, and project discussions.',
        keyTips: 'Know Java internals and database indexing concepts.'
      },
      {
        roundNumber: 5,
        name: 'General HR Round',
        type: 'Behavioral',
        duration: '30 Mins',
        outcome: 'Offered',
        questions: [
          'Why Zoho? What is your perspective on bootstrap engineering culture?',
          'Willingness to learn proprietary Zoho technology stacks.'
        ],
        description: 'Discussed alignment with Zoho culture, product longevity, and long-term career outlook.',
        keyTips: 'Show genuine commitment to product craftsmanship.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Design Railway Reservation System (Console App)',
          description: 'Create an interactive console application supporting confirmed berths (Upper/Lower/Middle), RAC tickets, Waiting List (WL), and auto-upgrades on cancellation.',
          hint: 'Create dedicated Queues for Waiting List and RAC, and a List for Confirmed tickets. Synchronize booking and cancellation methods.',
          timeComplexity: 'O(1) for booking and cancellation with direct references',
          spaceComplexity: 'O(Total passenger tickets stored)',
          sampleInputOutput: 'Options: 1. Book, 2. Cancel, 3. View Status, 4. Exit'
        }
      ],
      technical: [
        {
          question: 'Explain Java HashMap internal collision resolution and rehashing thresholds.',
          answerSummary: 'Initial capacity of 16 with load factor 0.75. When a bucket length exceeds 8, linked list is converted to a Red-Black Tree (TreeBin) for O(log N) worst-case lookup.',
          keyConcepts: ['Hash Buckets', 'Treeification Threshold', 'Load Factor 0.75', 'HashCode & Equals Contract']
        }
      ],
      hr: [
        {
          question: 'What do you appreciate about Zoho philosophy compared to venture-backed startups?',
          situationExample: 'Emphasized appreciation for long-term product thinking, self-reliance, and crafting sustainable enterprise software.',
          keyTip: 'Show deep respect for engineering fundamentals and company culture.'
        }
      ],
      project: [
        {
          question: 'How would you serialize your in-memory Railway system state to disk without using third-party JSON libraries?',
          architectureFocus: 'Wrote a custom CSV/text file parser reading structured records line by line and populating domain models.',
          keyTradeoff: 'Simplicity and zero external library dependency vs binary serialization performance.'
        }
      ]
    },
    preparation: {
      strategy: 'Practiced classic Zoho interview archives on GeeksforGeeks, built 5 console-based LLD projects (ATM, Snake & Ladder, Railway Booking, Splitwise).',
      timeSpent: '4 Months • 3 hours daily',
      resources: [
        { name: 'GeeksforGeeks Zoho Archive', type: 'Interview Archive', description: 'Past 5 years of Zoho advanced coding questions.' },
        { name: 'Java Complete Reference (Schildt)', type: 'Book', description: 'Deep OOP concepts and core Java collections.' }
      ],
      topicsRevised: ['Pattern Printing', 'Custom String Parsers', 'Java OOP & Inheritance', 'Stack Expression Evaluation', 'File I/O in Java']
    },
    mistakesToAvoid: [
      'Do not rely on built-in library shortcuts (like `Collections.sort()` or `String.replaceAll()`) in Zoho Round 2; write algorithms manually.',
      'Do not write all code in `main()`. Maintain clean class separation, encapsulation, and meaningful variable names.'
    ],
    candidateTips: [
      'Master C loops, pointers, and memory manipulation for Round 1.',
      'Practice building console-based menu-driven applications in under 2 hours.'
    ],
    keyTakeaways: 'Zoho emphasizes core problem-solving from scratch without library dependencies. Master Java OOP and custom data structures.'
  },
  {
    id: 'exp-7',
    company: 'Goldman Sachs',
    role: 'Summer Technology Analyst',
    author: {
      id: 'person-7',
      name: 'Vikramaditya Rao',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
      role: 'Analyst',
      company: 'Goldman Sachs',
      college: 'IIT Madras'
    },
    year: '2023',
    date: '2023-10-05',
    difficulty: 'Hard',
    preparationDuration: '6 Months',
    numberOfRounds: 4,
    helpfulCount: 210,
    likesCount: 155,
    technologies: ['C++', 'Python', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'SQL', 'Financial Systems', 'Math'],
    topics: ['Dynamic Programming', 'Probability Puzzles', 'Bit Manipulation', 'Operating Systems'],
    summary: 'Goldman Sachs Engineering Campus Drive experience. Heavy focus on math puzzles, probability theory, core OS threads, and optimal algorithmic implementations.',
    selectionProcessTimeline: [
      { step: 1, name: 'Aptitude & Technical OA', duration: '105 Mins', type: 'Math, Probability & Coding', outcome: 'Cleared' },
      { step: 2, name: 'Technical Round 1', duration: '45 Mins', type: 'Algorithms & Math Puzzles', outcome: 'Cleared' },
      { step: 3, name: 'Technical Round 2', duration: '50 Mins', type: 'OS, DBMS & Limit Order Book LLD', outcome: 'Cleared' },
      { step: 4, name: 'MD / Culture Round', duration: '45 Mins', type: 'Financial Awareness & Ethics', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Aptitude & Technical OA (HackerRank)',
        type: 'Math, Coding & CS Core',
        duration: '105 Mins',
        outcome: 'Cleared',
        questions: [
          'Advanced tree traversal problem with custom node transformations.',
          '15 Math and Probability questions (Bayes theorem, permutations, conditional expectation).'
        ],
        description: 'Combination of fast math problem solving and 2 algorithmic coding questions.',
        keyTips: 'Revise discrete math, statistics, and probability distributions.'
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (Algorithms & Math Puzzles)',
        type: 'Live Coding & Puzzles',
        duration: '45 Mins',
        outcome: 'Cleared',
        questions: [
          'Trapping Rain Water problem variation with dynamic elevation changes.',
          'Classic puzzle: 100 doors puzzle and biased coin probability game.'
        ],
        description: 'Interviewer tested logical reasoning and code optimization.',
        keyTips: 'Write mathematical proofs clearly before jumping to conclusions.'
      },
      {
        roundNumber: 3,
        name: 'Technical Round 2 (OS, DBMS & LLD)',
        type: 'System & CS Fundamentals',
        duration: '50 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an Order Matching Engine for a Stock Exchange (Limit Order Book matching algorithms).',
          'Virtual memory, paging, and thread synchronization mechanisms.'
        ],
        description: 'Deep dive into financial order book processing and low latency considerations.',
        keyTips: 'Explain binary search trees and heap structures used in order books.'
      },
      {
        roundNumber: 4,
        name: 'Managing Director / Culture Round',
        type: 'Behavioral & Situational',
        duration: '45 Mins',
        outcome: 'Offered',
        questions: [
          'Why Investment Banking Technology over traditional tech companies?',
          'Explain a complex financial term to a non-technical person.'
        ],
        description: 'Evaluated commercial awareness, communication under pressure, and ethical integrity.',
        keyTips: 'Read about Goldman Sachs engineering initiatives and financial terminology.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Trapping Rain Water with Elevation Queries',
          description: 'Given an array of elevations representing height map, calculate total water trapped after rain, and handle single elevation updates.',
          hint: 'Two pointer approach maintains leftMax and rightMax in O(N) time and O(1) space.',
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
          sampleInputOutput: 'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1] -> Output: 6'
        }
      ],
      technical: [
        {
          question: 'How do you design a high-throughput Limit Order Book matching engine?',
          answerSummary: 'Maintained dual sorted price levels: Bids (Max-Heap / TreeMap descending) and Asks (Min-Heap / TreeMap ascending). Each price level contains a FIFO queue of limit orders for price-time priority execution.',
          keyConcepts: ['Price-Time Priority', 'TreeMap / Dual Heaps', 'Zero Garbage Allocation', 'Cache Line Alignment']
        }
      ],
      hr: [
        {
          question: 'Why Goldman Sachs over Big Tech companies?',
          situationExample: 'Spoke about the ultra-low-latency engineering challenges in electronic trading and financial risk modelling.',
          keyTip: 'Show genuine interest in financial markets and technology scale.'
        }
      ],
      project: [
        {
          question: 'How did you ensure zero memory leaks in your C++ multi-threaded order matching simulator?',
          architectureFocus: 'Used RAII idioms, `std::unique_ptr`, and thread-safe lockless ring buffers with `std::atomic`.',
          keyTradeoff: 'Lock-free single producer single consumer queue vs mutex locks.'
        }
      ]
    },
    preparation: {
      strategy: 'Solved 50+ probability puzzles from "Heard on the Street", completed Striver SDE sheet, and practiced multi-threading in C++.',
      timeSpent: '6 Months • 3.5 hours daily',
      resources: [
        { name: 'Heard on the Street (Crack)', type: 'Puzzle Book', description: 'Classic quant and probability interview questions.' },
        { name: 'Striver SDE Sheet', type: 'DSA Sheet', description: 'Core problem coverage in C++.' }
      ],
      topicsRevised: ['Probability & Bayes Theorem', 'Two Pointer Algorithms', 'Operating System Threads & Virtual Memory', 'B-Tree & Indexing']
    },
    mistakesToAvoid: [
      'Do not guess on probability questions—write out clear formulas and sample spaces.',
      'Do not ignore multithreading locks and race condition edge cases in C++.'
    ],
    candidateTips: [
      'Revise classic brain teasers (Monty Hall, 100 prisoners, coins in dark room).',
      'Explain mathematical intuition out loud step by step.'
    ],
    keyTakeaways: 'Goldman Sachs tests mathematical aptitude and speed along with DSA. Puzzles and probability can make or break the interview.'
  },
  {
    id: 'exp-8',
    company: 'Flipkart',
    role: 'Software Development Engineer',
    author: {
      id: 'person-8',
      name: 'Divya Nair',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
      role: 'SDE-1',
      company: 'Flipkart',
      college: 'College of Engineering, Guindy'
    },
    year: '2024',
    date: '2024-03-01',
    difficulty: 'Hard',
    preparationDuration: '6 Months',
    numberOfRounds: 4,
    helpfulCount: 188,
    likesCount: 130,
    technologies: ['Java', 'Spring Boot', 'DSA', 'OOP', 'DBMS', 'SQL', 'Operating Systems', 'Kafka', 'Redis', 'System Design'],
    topics: ['Machine Coding', 'Low Level Design', 'Concurrency', 'Design Patterns'],
    summary: 'Flipkart off-campus hiring process. Features the famous Machine Coding Round where candidates write executable object-oriented code in 90 minutes.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Coding Assessment', duration: '90 Mins', type: 'Graph & DP Algorithms', outcome: 'Cleared' },
      { step: 2, name: 'Machine Coding Round', duration: '90 Mins', type: 'Live Executable LLD Code', outcome: 'Cleared' },
      { step: 3, name: 'Problem Solving & DSA', duration: '60 Mins', type: 'Dual Heaps & Backtracking', outcome: 'Cleared' },
      { step: 4, name: 'Hiring Manager & Values', duration: '45 Mins', type: 'High Concurrency & Culture', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Coding Assessment',
        type: 'Algorithms',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Graph bipartite matching for flash sale inventory allocation.',
          'Substrings with K distinct characters.'
        ],
        description: '3 problems testing graph algorithms and string hashing.',
        keyTips: 'Aim for 100% test cases pass rate on all problems.'
      },
      {
        roundNumber: 2,
        name: 'Machine Coding Round (Famous Flipkart Format)',
        type: 'Live Coding (Executable)',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an In-Memory Flipkart Flash Sale / Inventory Management System.',
          'Handle concurrent order bookings, wallet deductions, inventory locks, and waitlists.'
        ],
        description: 'Candidates build a complete executable Java application with clean models, services, and repositories.',
        keyTips: 'Focus on separation of concerns, SOLID principles, and concurrency handling.'
      },
      {
        roundNumber: 3,
        name: 'Problem Solving & Data Structures',
        type: 'Live Problem Solving',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Find median in a stream of integers (O(1) read, O(log N) write using Dual Heaps).',
          'Word Break II with backtracking and memoization.'
        ],
        description: 'Rigorous algorithmic round testing both theoretical complexity and working code.',
        keyTips: 'Always discuss edge cases before coding the heap operations.'
      },
      {
        roundNumber: 4,
        name: 'Hiring Manager & Engineering Culture',
        type: 'Behavioral & Architecture',
        duration: '45 Mins',
        outcome: 'Offered',
        questions: [
          'How would you handle high concurrency during Big Billion Days?',
          'Tell me about a time you delivered a project under tight constraints.'
        ],
        description: 'Discussed scale challenges, failure modes, and Flipkart cultural values.',
        keyTips: 'Emphasize reliability, customer trust, and speed of execution.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Find Median from Data Stream (Dual Heaps)',
          description: 'Design a data structure that supports adding numbers from a continuous stream and finding median in O(1).',
          hint: 'Maintain a Max-Heap for the lower half and a Min-Heap for the upper half, keeping sizes balanced within 1 element.',
          timeComplexity: 'addNum: O(log N), findMedian: O(1)',
          spaceComplexity: 'O(N) storing stream elements',
          sampleInputOutput: 'addNum(1), addNum(2), findMedian() -> 1.5, addNum(3), findMedian() -> 2.0'
        }
      ],
      technical: [
        {
          question: 'What design patterns are essential for Flipkart Machine Coding rounds?',
          answerSummary: 'Strategy Pattern (for payment/pricing rules), Factory Pattern (for entity creation), Observer Pattern (for notifications/event triggers), and Singleton (for registries).',
          keyConcepts: ['SOLID Principles', 'Strategy Pattern', 'Factory Pattern', 'Decoupled Repositories']
        }
      ],
      hr: [
        {
          question: 'How do you prioritize features under intense deadlines during peak e-commerce events?',
          situationExample: 'Focused on core checkout stability and graceful degradation of non-critical UI widgets like recommendation carousels.',
          keyTip: 'Demonstrate customer-first pragmatism and operational reliability.'
        }
      ],
      project: [
        {
          question: 'How did you prevent overselling in your flash sale inventory module during stress testing?',
          architectureFocus: 'Used Redis Lua scripts for atomic decrement and distributed rate limiting, falling back to an in-memory queue.',
          keyTradeoff: 'Redis atomic counters vs relational row-level locking throughput.'
        }
      ]
    },
    preparation: {
      strategy: 'Practiced 10+ machine coding problems on Work@Tech and LeetCode. Mastered design patterns (Factory, Strategy, Singleton, Observer).',
      timeSpent: '6 Months • 4 hours daily',
      resources: [
        { name: 'Work@Tech Machine Coding Prep', type: 'Design Platform', description: 'Standard machine coding problem blueprints.' },
        { name: 'Head First Design Patterns', type: 'Book', description: 'Clear real-world design pattern implementations in Java.' }
      ],
      topicsRevised: ['Machine Coding Boilerplate', 'Dual Heaps', 'SOLID Principles', 'Redis Atomic Scripts']
    },
    mistakesToAvoid: [
      'Do not spend the first 45 minutes on boilerplate without completing the core business logic.',
      'Do not hardcode business rules—use Strategy Pattern for extensible discount and pricing models.'
    ],
    candidateTips: [
      'Set up your IDE with quick shortcut templates before the Machine Coding timer starts.',
      'Write unit tests or a clear driver `main()` method showing working test cases.'
    ],
    keyTakeaways: 'Flipkart Machine Coding round requires clean code, testability, and fast typing. Practice designing systems under a 90-minute timer.'
  },
  {
    id: 'exp-9',
    company: 'Salesforce',
    role: 'Associate Member of Technical Staff',
    author: {
      id: 'person-9',
      name: 'Harish Kalyan',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80',
      role: 'AMTS',
      company: 'Salesforce',
      college: 'IIIT Hyderabad'
    },
    year: '2023',
    date: '2023-12-08',
    difficulty: 'Medium',
    preparationDuration: '5 Months',
    numberOfRounds: 4,
    helpfulCount: 172,
    likesCount: 124,
    technologies: ['Java', 'Python', 'DSA', 'OOP', 'DBMS', 'SQL', 'Operating Systems', 'AWS', 'REST APIs', 'Cloud Computing'],
    topics: ['Binary Search Trees', 'Tries', 'Microservices', 'Database Indexing'],
    summary: 'Salesforce AMTS on-campus recruitment. Balanced mix of standard DSA, cloud architecture basics, and deep database transaction understanding.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Assessment', duration: '90 Mins', type: 'Coding & Java/DBMS MCQs', outcome: 'Cleared' },
      { step: 2, name: 'Technical Round 1', duration: '60 Mins', type: 'Trees & Trie Autocomplete', outcome: 'Cleared' },
      { step: 3, name: 'Technical Round 2', duration: '60 Mins', type: 'Notification Service System Design', outcome: 'Cleared' },
      { step: 4, name: 'Management & Values', duration: '45 Mins', type: 'Ohana Values & Culture', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Assessment (HackerRank)',
        type: 'Coding & CS MCQs',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Tree path sum with alternating signs.',
          'Bitwise XOR queries in an array.'
        ],
        description: '2 medium coding questions and 20 MCQs on Java, OS, and SQL queries.',
        keyTips: 'Focus on accuracy and optimal time complexity.'
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (DSA & Problem Solving)',
        type: 'Live Coding',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Serialize and Deserialize a Binary Tree.',
          'Implement Autocomplete search using Trie with frequency ranking.'
        ],
        description: 'Evaluated clean recursive thinking and data structure optimization.',
        keyTips: 'Write modular code with clear helper methods.'
      },
      {
        roundNumber: 3,
        name: 'Technical Round 2 (System Design & Projects)',
        type: 'System Design',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Design a Notification Service supporting Email, SMS, and Push notifications with rate limits and priority queues.',
          'Database indexing strategies: B-Tree vs Hash index.'
        ],
        description: 'Discussed queue architectures (RabbitMQ/Kafka) and idempotent delivery.',
        keyTips: 'Clearly define API contracts and error handling mechanisms.'
      },
      {
        roundNumber: 4,
        name: 'Management & Values Round',
        type: 'Behavioral',
        duration: '45 Mins',
        outcome: 'Offered',
        questions: [
          'Why Salesforce? Which Salesforce value (Trust, Customer Success, Innovation, Equality) resonates most with you?',
          'Tell me about your most challenging academic project.'
        ],
        description: 'Discussed alignment with Salesforce Ohana culture and collaborative spirit.',
        keyTips: 'Research Salesforce core values and share real examples of teamwork.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Serialize and Deserialize Binary Tree',
          description: 'Design an algorithm to serialize a binary tree into a string and deserialize that string back to the original tree structure.',
          hint: 'Use pre-order traversal (DFS) with a delimiter and "#" for null nodes.',
          timeComplexity: 'O(N) for both serialize and deserialize',
          spaceComplexity: 'O(N) string storage',
          sampleInputOutput: 'Input: [1,2,3,null,null,4,5] -> Serialized: "1,2,#,#,3,4,#,#,5,#,#"'
        }
      ],
      technical: [
        {
          question: 'How do B-Tree and B+ Tree indexes differ and why do databases use B+ Trees?',
          answerSummary: 'B+ Trees store data records only in leaf nodes, linked sequentially as a linked list. This enables faster range scans and higher branching factors since internal nodes only contain keys.',
          keyConcepts: ['Leaf Linked Lists', 'High Fanout', 'Sequential Disk I/O', 'Cache Efficiency']
        }
      ],
      hr: [
        {
          question: 'Which Salesforce core value (Trust, Customer Success, Innovation, Equality) do you relate to most?',
          situationExample: 'Discussed Trust as the foundational pillar, relating it to writing reliable automated tests and transparent API error contracts in personal projects.',
          keyTip: 'Be sincere and provide concrete academic examples.'
        }
      ],
      project: [
        {
          question: 'How did you handle retry backoffs in your multi-channel notification dispatcher?',
          architectureFocus: 'Configured exponential backoff with dead-letter queues (DLQ) in RabbitMQ to prevent server thundering herd on downstream provider outages.',
          keyTradeoff: 'Idempotency IDs on client messages to prevent duplicate SMS dispatch.'
        }
      ]
    },
    preparation: {
      strategy: 'Practiced 300+ LeetCode problems, read Salesforce Engineering blogs, and studied distributed messaging patterns.',
      timeSpent: '5 Months • ~3 hours daily',
      resources: [
        { name: 'LeetCode Tree & Trie Tagged', type: 'Practice Platform', description: 'Mastered hierarchical data structures.' },
        { name: 'Salesforce Engineering Blog', type: 'Architecture', description: 'Multi-tenant cloud architecture principles.' }
      ],
      topicsRevised: ['Tree Traversals', 'Trie Autocomplete', 'B+ Trees & Database Indexes', 'RabbitMQ DLQ Patterns']
    },
    mistakesToAvoid: [
      'Do not ignore database index internals—Salesforce tests multi-tenancy and data isolation principles thoroughly.',
      'Do not write code with unhandled null pointer exceptions in tree deserialization.'
    ],
    candidateTips: [
      'Understand how multi-tenant architectures isolate customer data in shared databases.',
      'Review Salesforce Ohana cultural values prior to the managerial round.'
    ],
    keyTakeaways: 'Salesforce interviewers are collaborative and helpful. Emphasize clean code, cloud concepts, and positive attitude.'
  },
  {
    id: 'exp-10',
    company: 'Atlassian',
    role: 'Graduate Software Engineer',
    author: {
      id: 'person-10',
      name: 'Pooja Hegde',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
      role: 'Graduate Software Engineer',
      company: 'Atlassian',
      college: 'RV College of Engineering'
    },
    year: '2024',
    date: '2024-03-22',
    difficulty: 'Hard',
    preparationDuration: '7 Months',
    numberOfRounds: 4,
    helpfulCount: 235,
    likesCount: 190,
    technologies: ['Java', 'Kotlin', 'React', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'AWS', 'Microservices', 'Distributed Systems'],
    topics: ['Data Structures', 'System Design', 'Atlassian Values', 'Code Craftsmanship'],
    summary: 'Atlassian off-campus graduate hiring. High bar on code quality, testing, clean design patterns, and value-based behavioral discussions.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Assessment (Mettle)', duration: '90 Mins', type: 'Graph & DP Algorithms', outcome: 'Cleared' },
      { step: 2, name: 'Code Craftsmanship Round', duration: '60 Mins', type: 'Live Clean Code & TDD Unit Testing', outcome: 'Cleared' },
      { step: 3, name: 'System Design Round', duration: '60 Mins', type: 'Scalable Jira Issue Tracker', outcome: 'Cleared' },
      { step: 4, name: 'Atlassian Values & Behavioral', duration: '60 Mins', type: '5 Core Values Deep Dive', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Assessment (Mettle)',
        type: 'Coding',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Graph shortest path with state transitions.',
          'Dynamic programming problem on grid partitions.'
        ],
        description: 'Challenging test with hidden edge cases and strict memory limits.',
        keyTips: 'Ensure O(N) or O(N log N) complexity.'
      },
      {
        roundNumber: 2,
        name: 'Coding & Code Craftsmanship Round',
        type: 'Live Coding (IDE Allowed)',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Implement a Rate Limiter with Sliding Window and Token Bucket algorithms.',
          'Write Unit Tests using JUnit / Mockito demonstrating edge case validation.'
        ],
        description: 'Interviewer evaluated clean naming, unit testing, and design extensibility.',
        keyTips: 'Write unit tests before the interviewer asks for them.'
      },
      {
        roundNumber: 3,
        name: 'System Design Round',
        type: 'High Level Design',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Design Jira Issue Tracking / Notification System with real-time updates.',
          'WebSocket state management and message fanout.'
        ],
        description: 'Evaluated scalable microservice boundaries, caching, and resiliency.',
        keyTips: 'Ask clarifying questions on user scale and read vs write ratios.'
      },
      {
        roundNumber: 4,
        name: 'Atlassian Values & Behavioral Round',
        type: 'Values Interview',
        duration: '60 Mins',
        outcome: 'Offered',
        questions: [
          'Give an example of when you embodied "Open company, no bullshit".',
          'Describe a time you failed and how you communicated it transparently to your team.'
        ],
        description: 'Deep dive into Atlassian 5 core values with genuine real-life stories.',
        keyTips: 'Be authentic, transparent, and articulate lessons learned.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Design an Extensible Rate Limiter (Token Bucket & Sliding Window)',
          description: 'Implement a thread-safe Rate Limiter in Java with configurable rules per client IP / API key, complete with unit test cases.',
          hint: 'Use interface-driven design `RateLimiterStrategy` with implementations `TokenBucket` and `SlidingWindowLog`.',
          timeComplexity: 'O(1) request check',
          spaceComplexity: 'O(Clients)',
          sampleInputOutput: 'rateLimiter.isAllowed("user-123") -> true/false'
        }
      ],
      technical: [
        {
          question: 'What constitutes high "Code Craftsmanship" according to Atlassian engineering standards?',
          answerSummary: 'Clean self-documenting code, meaningful domain naming, SOLID compliance, high test coverage with unit and integration tests, and defensive programming against null pointers.',
          keyConcepts: ['Test-Driven Development (TDD)', 'Interface Segregation', 'Defensive Programming', 'Zero Code Smells']
        }
      ],
      hr: [
        {
          question: 'How do you embody "Open Company, No Bullshit" in daily engineering team collaboration?',
          situationExample: 'Shared an incident where a deadline was at risk; rather than sugarcoating progress, I presented a transparent breakdown of remaining tasks and unblocked the team through early scope adjustment.',
          keyTip: 'Speak authentically without corporate jargon.'
        }
      ],
      project: [
        {
          question: 'How did you handle WebSocket connection state across multiple server instances in your real-time dashboard?',
          architectureFocus: 'Used Redis Pub/Sub channels to fan out events to all gateway instances holding active client socket descriptors.',
          keyTradeoff: 'Redis Pub/Sub transient messaging vs Kafka durable queue overhead.'
        }
      ]
    },
    preparation: {
      strategy: 'Practiced writing clean TDD code in Java, studied System Design Primer, and rehearsed stories for Atlassian values.',
      timeSpent: '7 Months • ~3.5 hours daily',
      resources: [
        { name: 'Clean Code (Robert C. Martin)', type: 'Book', description: 'Writing readable, maintainable, and testable code.' },
        { name: 'Atlassian Values Guide', type: 'Company Culture', description: 'In-depth breakdown of the 5 Atlassian core values.' }
      ],
      topicsRevised: ['Sliding Window Rate Limiter', 'JUnit 5 & Mockito', 'WebSocket Gateway Scaling', 'SOLID Principles']
    },
    mistakesToAvoid: [
      'Do not skip writing test cases in the code craftsmanship round—unit testing is mandatory.',
      'Avoid hardcoding magic numbers or using cryptic variable abbreviations.'
    ],
    candidateTips: [
      'Write unit tests covering normal cases, edge cases, and exception scenarios.',
      'Know all 5 Atlassian values by heart and prepare 2 stories for each value.'
    ],
    keyTakeaways: 'Atlassian places tremendous weight on code craft (clean code + tests) and core company values. Never skip writing test cases!'
  },
  {
    id: 'exp-11',
    company: 'Cisco',
    role: 'Software Engineer (Cloud & Networking)',
    author: {
      id: 'person-11',
      name: 'Sanjay Swaminathan',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=250&auto=format&fit=crop&q=80',
      role: 'Software Engineer',
      company: 'Cisco',
      college: 'Anna University'
    },
    year: '2023',
    date: '2023-09-15',
    difficulty: 'Medium',
    preparationDuration: '4 Months',
    numberOfRounds: 3,
    helpfulCount: 145,
    likesCount: 98,
    technologies: ['C', 'C++', 'Python', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'TCP/IP', 'Linux Internals', 'Socket Programming'],
    topics: ['Networking', 'Bit Manipulation', 'Operating Systems', 'Socket APIs'],
    summary: 'Cisco campus placement experience for Core Networking & Cloud division. Focus was on Computer Networks (OSI model, TCP 3-way handshake), OS memory, and algorithmic problem solving.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Technical Test', duration: '75 Mins', type: 'Coding & Networking Protocols', outcome: 'Cleared' },
      { step: 2, name: 'Technical Round 1', duration: '60 Mins', type: 'Circular Buffer & TCP Stack Deep Dive', outcome: 'Cleared' },
      { step: 3, name: 'Managerial & HR Round', duration: '45 Mins', type: 'End-to-End Web Request & Behavioral', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Technical Test',
        type: 'Coding & Networking MCQs',
        duration: '75 Mins',
        outcome: 'Cleared',
        questions: [
          'IPv4 Subnet calculation and routing table longest prefix match.',
          'Linked list rearrangement and Bitwise operations.'
        ],
        description: '2 coding problems and 25 questions on networking protocols and Linux commands.',
        keyTips: 'Revise subnetting and TCP/UDP headers.'
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (DSA, OS & Networks)',
        type: 'Technical Interview',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Implement a Custom Circular Buffer for network packet processing.',
          'Deep dive into TCP flow control, sliding window, and congestion avoidance algorithms.'
        ],
        description: 'Evaluated low-level memory allocation, socket APIs, and data structures.',
        keyTips: 'Know socket programming lifecycle (socket, bind, listen, accept).'
      },
      {
        roundNumber: 3,
        name: 'Managerial & HR Round',
        type: 'Behavioral & Technical Overview',
        duration: '45 Mins',
        outcome: 'Offered',
        questions: [
          'What happens under the hood from the moment you type a URL in a browser until the page renders?',
          'Why Cisco? How do your academic projects relate to cloud infrastructure?'
        ],
        description: 'Discussed end-to-end networking pipeline (DNS, TCP, TLS handshake, HTTP/2).',
        keyTips: 'Explain the networking stack systematically layer by layer.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Implement a Lock-Free Circular Ring Buffer in C/C++',
          description: 'Design a thread-safe circular ring buffer for incoming network packet ingestion without dynamic heap allocations.',
          hint: 'Use head and tail indexes modulo buffer capacity. Use atomic memory barriers for lockless single-producer single-consumer ingestion.',
          timeComplexity: 'O(1) enqueue and dequeue',
          spaceComplexity: 'O(Capacity) fixed pre-allocated memory buffer',
          sampleInputOutput: 'CircularBuffer cb(1024); cb.push(packet); Packet p = cb.pop();'
        }
      ],
      technical: [
        {
          question: 'Explain TCP 3-Way Handshake, 4-Way Teardown, and why TIME_WAIT state exists.',
          answerSummary: 'Handshake: SYN -> SYN-ACK -> ACK. Teardown: FIN -> ACK -> FIN -> ACK. TIME_WAIT ensures final ACK reaches sender and prevents old duplicate packets from interfering with new connections.',
          keyConcepts: ['SYN / ACK Sequence Numbers', 'TIME_WAIT 2*MSL Timer', 'Sliding Window Flow Control', 'Congestion Window (cwnd)']
        }
      ],
      hr: [
        {
          question: 'Why Cisco? How do you see enterprise networking evolving with cloud migrations?',
          situationExample: 'Spoke about Software-Defined Networking (SDN) and how programmable network fabrics bridge legacy data centers with cloud infrastructure.',
          keyTip: 'Highlight understanding of network virtualization and security.'
        }
      ],
      project: [
        {
          question: 'In your socket-based chat server project, how did you handle 10,000 concurrent client connections?',
          architectureFocus: 'Used Linux `epoll` I/O multiplexing instead of spawning a new OS thread per socket connection.',
          keyTradeoff: 'Event-driven non-blocking I/O vs thread-per-connection context switching overhead.'
        }
      ]
    },
    preparation: {
      strategy: 'Read Kurose & Ross Computer Networking, implemented multi-client chat server in C, and solved 250+ DSA problems.',
      timeSpent: '4 Months • ~3 hours daily',
      resources: [
        { name: 'Computer Networking: A Top-Down Approach', type: 'Textbook', description: 'Comprehensive networking protocols guide.' },
        { name: 'Beej Guide to Network Programming', type: 'Online Guide', description: 'Hands-on socket programming in C.' }
      ],
      topicsRevised: ['OSI 7 Layers vs TCP/IP Model', 'Subnetting & CIDR', 'Linux epoll vs select', 'Bitwise Masks & Flags']
    },
    mistakesToAvoid: [
      'Do not confuse TCP flow control (receiver buffer protection) with congestion control (network capacity protection).',
      'Do not forget memory deallocation when coding in C/C++.'
    ],
    candidateTips: [
      'Be able to trace the full lifecycle of a network packet from physical NIC to application socket.',
      'Practice subnetting calculations and IP header bitfield parsing.'
    ],
    keyTakeaways: 'Cisco values strong computer networks, operating system internals, and clean C/C++ fundamentals.'
  },
  {
    id: 'exp-12',
    company: 'Morgan Stanley',
    role: 'Technology Analyst',
    author: {
      id: 'person-12',
      name: 'Meera Nambiar',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=250&auto=format&fit=crop&q=80',
      role: 'Technology Analyst',
      company: 'Morgan Stanley',
      college: 'BITS Pilani, Goa'
    },
    year: '2024',
    date: '2024-02-28',
    difficulty: 'Hard',
    preparationDuration: '6 Months',
    numberOfRounds: 4,
    helpfulCount: 220,
    likesCount: 160,
    technologies: ['Java', 'Spring Boot', 'SQL', 'DSA', 'OOP', 'DBMS', 'Operating Systems', 'Multithreading', 'Design Patterns'],
    topics: ['Java Concurrency', 'Database Transactions', 'Garbage Collection', 'System Design'],
    summary: 'Morgan Stanley campus hiring for Technology division. Heavy emphasis on Core Java, multi-threading (Locks, ExecutorService), memory optimization, and ACID database guarantees.',
    selectionProcessTimeline: [
      { step: 1, name: 'Online Assessment', duration: '90 Mins', type: 'Algorithmic DP & Core CS', outcome: 'Cleared' },
      { step: 2, name: 'Technical Round 1', duration: '60 Mins', type: 'Core Java Concurrency & JVM Memory', outcome: 'Cleared' },
      { step: 3, name: 'Technical Round 2', duration: '50 Mins', type: 'Transactional Banking Ledger LLD', outcome: 'Cleared' },
      { step: 4, name: 'Director / HR Round', duration: '40 Mins', type: 'Fintech Leadership & Resilience', outcome: 'Offered' }
    ],
    rounds: [
      {
        roundNumber: 1,
        name: 'Online Assessment',
        type: 'Coding & Core CS',
        duration: '90 Mins',
        outcome: 'Cleared',
        questions: [
          'Dynamic programming problem on stock trading with transaction fees.',
          'Graph shortest path in weighted directed grid.'
        ],
        description: '3 coding questions with high penalty for unhandled edge cases.',
        keyTips: 'Write fast and verify O(N) complexity.'
      },
      {
        roundNumber: 2,
        name: 'Technical Round 1 (Java Deep Dive & DSA)',
        type: 'Technical Interview',
        duration: '60 Mins',
        outcome: 'Cleared',
        questions: [
          'Implement a Producer-Consumer pattern using wait() / notify() and BlockingQueue.',
          'Garbage Collection algorithms in Java (G1GC vs ZGC) and memory leaks diagnosis.'
        ],
        description: 'Deep discussion on thread lifecycles, volatile keyword, and memory model.',
        keyTips: 'Understand Java memory layout (Heap, Stack, Metaspace) and concurrency locks.'
      },
      {
        roundNumber: 3,
        name: 'Technical Round 2 (Database & System Design)',
        type: 'System Design & SQL',
        duration: '50 Mins',
        outcome: 'Cleared',
        questions: [
          'Design an Account Balance Ledger with concurrent debit/credit transactions ensuring zero balance inconsistencies.',
          'Database Isolation Levels (Read Committed vs Serializable) and Dirty Reads.'
        ],
        description: 'Focus was on transactional integrity, pessimistic locking, and write-ahead logging.',
        keyTips: 'Explain ACID properties with realistic banking transaction examples.'
      },
      {
        roundNumber: 4,
        name: 'Director / HR Round',
        type: 'Behavioral & Leadership',
        duration: '40 Mins',
        outcome: 'Offered',
        questions: [
          'Why Morgan Stanley? What attracts you to fintech infrastructure?',
          'Tell me about a time you handled stress during a live college deployment.'
        ],
        description: 'Evaluated integrity, critical thinking under pressure, and long-term vision.',
        keyTips: 'Demonstrate interest in high-performance financial systems.'
      }
    ],
    questionsByCategory: {
      coding: [
        {
          title: 'Implement Thread-Safe Bounded Blocking Queue in Java',
          description: 'Design a bounded BlockingQueue from scratch with put(item) and take() blocking operations using explicit ReentrantLock and Condition variables.',
          hint: 'Use a single ReentrantLock with two conditions: `notFull` and `notEmpty`. Signal after state changes.',
          timeComplexity: 'O(1) enqueue and dequeue',
          spaceComplexity: 'O(Capacity) array storage',
          sampleInputOutput: 'CustomBlockingQueue<Integer> q = new CustomBlockingQueue<>(5); q.put(10); int val = q.take();'
        }
      ],
      technical: [
        {
          question: 'Explain Java Memory Model (JMM) happens-before relationship and volatile keyword guarantees.',
          answerSummary: 'Volatile guarantees visibility (flushes value to main memory) and prevents instruction reordering around volatile reads/writes. Does not guarantee atomic compound operations (like `i++`).',
          keyConcepts: ['Happens-Before Order', 'CPU Memory Barriers', 'Atomic vs Volatile', 'Java Metaspace vs Heap']
        }
      ],
      hr: [
        {
          question: 'How do you handle critical mistakes or bugs introduced during software development?',
          situationExample: 'Identified an arithmetic precision rounding bug during financial simulation; immediately raised it to project supervisor, created unit tests replicating edge cases, and implemented `BigDecimal` fix.',
          keyTip: 'Emphasize honesty, proactive ownership, and systematic resolution.'
        }
      ],
      project: [
        {
          question: 'Why did you use BigDecimal instead of double for monetary calculations in your accounting project?',
          architectureFocus: 'Double uses IEEE 754 binary floating-point representation which causes binary fraction rounding errors (e.g. 0.1 + 0.2 != 0.3). `BigDecimal` provides arbitrary-precision decimal arithmetic.',
          keyTradeoff: 'Minor CPU calculation overhead in exchange for zero monetary truncation loss.'
        }
      ]
    },
    preparation: {
      strategy: 'Studied Java Concurrency in Practice, practiced 400+ LeetCode problems, and built a banking transaction ledger simulation.',
      timeSpent: '6 Months • ~3.5 hours daily',
      resources: [
        { name: 'Java Concurrency in Practice (Goetz)', type: 'Book', description: 'The gold standard for multi-threaded programming in Java.' },
        { name: 'Database System Concepts (Silberschatz)', type: 'Textbook', description: 'ACID transactions, locking, and recovery systems.' }
      ],
      topicsRevised: ['ReentrantLock & Condition Variables', 'Java Garbage Collection (G1GC)', 'BigDecimal Precision', 'SQL Transaction Isolation Levels']
    },
    mistakesToAvoid: [
      'Never use `float` or `double` for monetary computations in financial interviews.',
      'Do not call `Thread.sleep()` inside synchronized blocks while holding locks.'
    ],
    candidateTips: [
      'Be able to write thread-safe Java concurrency primitives on a whiteboard without errors.',
      'Know the differences between optimistic concurrency and pessimistic locks in relational databases.'
    ],
    keyTakeaways: 'Morgan Stanley values deep Java concurrency and database internals. Be ready to write clean multithreaded code.'
  }
];
