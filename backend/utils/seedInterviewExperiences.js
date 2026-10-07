const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const InterviewExperience = require('../models/InterviewExperience');

const sampleExperiences = [
  {
    companyName: 'Amazon',
    jobTitle: 'Software Development Engineer I (SDE-1)',
    experienceTitle: 'Amazon SDE-1 Off-Campus Fresher Interview Experience',
    overallDifficulty: 'Hard',
    experienceType: 'Full-time',
    interviewMode: 'Online',
    interviewProcess: 'The recruitment process included an Online Assessment (OA) on HackerRank followed by 3 live technical rounds covering DSA, Low-Level Design, and Amazon Leadership Principles.',
    preparationTips: 'Focus on Trees, Graphs, Dynamic Programming, and practicing STAR format for Amazon Leadership Principles questions.',
    overallExperience: 'Overall a very structured and positive experience. The interviewers were collaborative and guided me whenever I was stuck.',
    topics: ['Binary Trees', 'Dynamic Programming', 'Amazon Leadership Principles', 'Low Level Design'],
    skills: ['Java', 'DSA', 'OOP', 'DBMS', 'SQL', 'System Design'],
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Online Assessment (HackerRank)',
        roundType: 'Coding & Work Simulation',
        difficulty: 'Medium',
        duration: 90,
        description: '2 medium-to-hard coding problems and work-style simulation questions reflecting Amazon Leadership Principles.',
        questions: [
          'Optimizing parcel delivery routes using dynamic programming on DAGs.',
          'Subarray sum divisible by K with sliding window optimization.'
        ],
        tips: 'Ensure all edge cases are tested and spend adequate time on the work simulator section.'
      },
      {
        roundNumber: 2,
        roundName: 'Technical Round 1 (Data Structures)',
        roundType: 'Live Coding',
        difficulty: 'Hard',
        duration: 60,
        description: 'Deep dive into Tree traversals and custom data structure designs with clean, production-grade Java code.',
        questions: [
          'Design an in-memory file system with directory creation, file writing, and wildcard search (Trie + Tree).',
          'Explain time complexity and space trade-offs.'
        ],
        tips: 'Write modular code with proper class interfaces and exception handling.'
      },
      {
        roundNumber: 3,
        roundName: 'Technical Round 2 (LLD & Algorithms)',
        roundType: 'System Design & Problem Solving',
        difficulty: 'Medium',
        duration: 60,
        description: 'Focus was on Object-Oriented Design (SOLID principles) and handling race conditions.',
        questions: [
          'Design a Locker Delivery System (Amazon Locker API, Locker state transitions, sizing algorithms).',
          'Concurrency management in locker reservation.'
        ],
        tips: 'Clarify requirements upfront and write clean class diagrams.'
      },
      {
        roundNumber: 4,
        roundName: 'Bar Raiser & Leadership Principles',
        roundType: 'Behavioral & Architecture',
        difficulty: 'Hard',
        duration: 60,
        description: 'Senior Principal Engineer evaluated ownership, customer obsession, and technical depth using the STAR format.',
        questions: [
          'Tell me about a time you took a calculated risk and failed. What was your pivot?',
          'Deep dive into a college project architecture where you handled high traffic.'
        ],
        tips: 'Have 5-6 well-structured STAR stories ready mapped to different Amazon LPs.'
      }
    ],
    questionsAsked: [
      'Design an In-Memory File System with mkdir, ls, and addContentFromFile',
      'Subarray sum divisible by K',
      'Design Amazon Locker delivery system',
      'Tell me about a time when you disagreed with a team decision and how you handled it'
    ],
    result: 'Selected',
    isAnonymous: false,
    isPublished: true,
    helpfulCount: 42
  },
  {
    companyName: 'Google',
    jobTitle: 'Software Engineer (SWE - Early Career)',
    experienceTitle: 'Google SWE Campus Placement Interview Journey',
    overallDifficulty: 'Very Hard',
    experienceType: 'Placement',
    interviewMode: 'Online',
    interviewProcess: 'Initial snapshot screening followed by 4 pure algorithmic rounds via Google Meet and Google Docs.',
    preparationTips: 'Practice writing clean, bug-free code on Google Docs without IDE autocomplete. Master Graph algorithms, DP, and Segment Trees.',
    overallExperience: 'Challenging but extremely rewarding. The interviewers evaluated algorithmic problem-solving ability and optimization insights.',
    topics: ['Graphs', 'Segment Trees', 'Dynamic Programming', 'Bit Manipulation'],
    skills: ['C++', 'DSA', 'Algorithms', 'Problem Solving'],
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Coding Round 1 (Data Structures)',
        roundType: 'Algorithms',
        difficulty: 'Hard',
        duration: 45,
        description: 'Heavy graph search problem involving topological sorting with cycle detection and lexicographical constraints.',
        questions: [
          'Alien Dictionary variant with ambiguous order resolution.',
          'Finding shortest path in weighted directed grid with obstacle destruction.'
        ],
        tips: 'Always communicate multiple approaches before writing code.'
      },
      {
        roundNumber: 2,
        roundName: 'Coding Round 2 (Algorithms & DP)',
        roundType: 'Algorithms',
        difficulty: 'Very Hard',
        duration: 45,
        description: 'Interval scheduling and dynamic programming on trees with memoization.',
        questions: [
          'Maximum profit from job scheduling with non-overlapping constraints and cooldown periods.',
          'Binary Lifting for Lowest Common Ancestor with range minimum queries.'
        ],
        tips: 'State space definitions in DP must be crystal clear.'
      },
      {
        roundNumber: 3,
        roundName: 'Googliness & Leadership',
        roundType: 'Behavioral',
        difficulty: 'Medium',
        duration: 45,
        description: 'Cultural fit, handling ambiguity, teamwork, and proactive ethics in software engineering.',
        questions: [
          'Describe a situation where project requirements were ambiguous and how you navigated it.',
          'How do you handle constructive feedback from peers?'
        ],
        tips: 'Be honest and demonstrate curiosity, empathy, and intellectual humility.'
      }
    ],
    questionsAsked: [
      'Alien Dictionary topological ordering with ambiguity detection',
      'Job scheduling DP with cooldown periods',
      'Lowest Common Ancestor with Segment Tree range queries',
      'Behavioral questions on navigating ambiguous technical specifications'
    ],
    result: 'Selected',
    isAnonymous: false,
    isPublished: true,
    helpfulCount: 88
  },
  {
    companyName: 'Microsoft',
    jobTitle: 'Software Engineer - Cloud & AI',
    experienceTitle: 'Microsoft SDE Interview Experience - Engage Program',
    overallDifficulty: 'Medium',
    experienceType: 'Internship',
    interviewMode: 'Online',
    interviewProcess: 'Online coding round, followed by project presentation round and 2 core technical rounds on Azure and Data Structures.',
    preparationTips: 'Be thoroughly prepared with every line of code in your resume projects, especially database schemas and API design.',
    overallExperience: 'Friendly interviewers who cared deeply about project architecture and fundamentals of Operating Systems and DBMS.',
    topics: ['System Design', 'DBMS', 'Operating Systems', 'REST APIs'],
    skills: ['Python', 'Django', 'PostgreSQL', 'Azure', 'Docker'],
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Project Deep Dive & System Design',
        roundType: 'Architecture',
        difficulty: 'Medium',
        duration: 60,
        description: 'In-depth review of full-stack project architecture, indexing in PostgreSQL, and horizontal scaling strategies.',
        questions: [
          'Explain how database connection pooling works in PostgreSQL.',
          'How would you cache frequently accessed endpoints using Redis?'
        ],
        tips: 'Know your system architecture diagrams inside out.'
      },
      {
        roundNumber: 2,
        roundName: 'Coding & Fundamentals',
        roundType: 'Technical',
        difficulty: 'Medium',
        duration: 60,
        description: 'Linked list manipulation and tree serialization with OS thread synchronization questions.',
        questions: [
          'Serialize and deserialize a Binary Tree.',
          'Explain process vs thread and deadlock prevention mechanisms.'
        ],
        tips: 'Revise core CS fundamentals thoroughly.'
      }
    ],
    questionsAsked: [
      'Serialize and deserialize binary tree',
      'Explain ACID properties and transaction isolation levels',
      'Database connection pooling and Redis cache invalidation strategies'
    ],
    result: 'Selected',
    isAnonymous: false,
    isPublished: true,
    helpfulCount: 35
  },
  {
    companyName: 'Flipkart',
    jobTitle: 'SDE-1 (Backend Engineer)',
    experienceTitle: 'Flipkart Machine Coding & Technical Interview Experience',
    overallDifficulty: 'Hard',
    experienceType: 'Full-time',
    interviewMode: 'Hybrid',
    interviewProcess: 'Machine Coding round (90 minutes to write working, extensible Java code), followed by 2 DSA rounds and 1 Hiring Manager round.',
    preparationTips: 'Practice designing Clean Architecture code with SOLID principles in under 90 minutes. Test edge cases.',
    overallExperience: 'The machine coding round tests practical software craftsmanship. Focus on design patterns.',
    topics: ['Machine Coding', 'Design Patterns', 'SOLID Principles', 'DSA'],
    skills: ['Java', 'Design Patterns', 'Concurrency', 'JUnit', 'SQL'],
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Machine Coding Round',
        roundType: 'Machine Coding',
        difficulty: 'Hard',
        duration: 90,
        description: 'Design and implement an in-memory Ride Sharing Application (like Uber/Ola) with driver matching and fare calculation.',
        questions: [
          'Implement RideSharingService with registerUser, addVehicle, bookRide, endRide methods.',
          'Driver rating and pricing strategy strategies using Strategy Pattern.'
        ],
        tips: 'Keep code clean, modular, and ensure driver code runs without compilation errors.'
      },
      {
        roundNumber: 2,
        roundName: 'DSA & Problem Solving',
        roundType: 'Algorithms',
        difficulty: 'Medium',
        duration: 60,
        description: 'Heaps, priority queues, and dynamic programming questions.',
        questions: [
          'Find median in a running data stream (Two Heaps approach).',
          'LRU Cache implementation with O(1) get and put.'
        ],
        tips: 'Explain the internal workings of DoublyLinkedList and HashMap.'
      }
    ],
    questionsAsked: [
      'Machine coding: In-memory Ride Sharing Application',
      'Median in a running stream using MaxHeap and MinHeap',
      'LRU Cache implementation from scratch'
    ],
    result: 'Selected',
    isAnonymous: true,
    isPublished: true,
    helpfulCount: 56
  },
  {
    companyName: 'Infosys',
    jobTitle: 'Specialist Programmer (Power Programmer)',
    experienceTitle: 'Infosys HackWithInfy Specialist Programmer Interview',
    overallDifficulty: 'Medium',
    experienceType: 'Placement',
    interviewMode: 'Online',
    interviewProcess: 'Grand finale coding round followed by 1 in-depth technical interview.',
    preparationTips: 'Practice advanced graph algorithms (Dijkstra, Floyd-Warshall) and core Java multithreading.',
    overallExperience: 'Straightforward technical interview that checked DSA, database indexing, and web development fundamentals.',
    topics: ['Java Core', 'Spring Boot', 'SQL', 'Graphs'],
    skills: ['Java', 'Spring Boot', 'MySQL', 'DSA', 'REST APIs'],
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Technical & Coding Round',
        roundType: 'Technical',
        difficulty: 'Medium',
        duration: 60,
        description: 'Live coding problem on Dijkstra shortest path and discussion on Spring Boot REST annotations.',
        questions: [
          'Implement Dijkstra algorithm for network latency calculation.',
          'Difference between @Controller and @RestController in Spring Boot.'
        ],
        tips: 'Be clear on Spring Boot lifecycle and annotations.'
      }
    ],
    questionsAsked: [
      'Network delay time using Dijkstra algorithm',
      'Spring Boot annotations and Dependency Injection',
      'Indexing types in MySQL (B-Tree vs Hash index)'
    ],
    result: 'Selected',
    isAnonymous: false,
    isPublished: true,
    helpfulCount: 22
  }
];

const seedInterviewExperiences = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('⚠️ MONGO_URI not found, skipping seeding.');
      return;
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const count = await InterviewExperience.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Interview experiences already exist (${count} items). Skipping seed.`);
      return;
    }

    // Find any user in DB to associate
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('⚠️ No users found in database to assign interview experiences.');
      return;
    }

    const experiencesToInsert = sampleExperiences.map((exp, idx) => {
      const assignedUser = users[idx % users.length];
      return {
        ...exp,
        user: assignedUser._id
      };
    });

    await InterviewExperience.insertMany(experiencesToInsert);
    console.log(`✅ Successfully seeded ${experiencesToInsert.length} interview experiences.`);
  } catch (error) {
    console.error('❌ Error seeding interview experiences:', error.message);
  }
};

if (require.main === module) {
  seedInterviewExperiences().then(() => {
    mongoose.connection.close();
  });
}

module.exports = { seedInterviewExperiences };
