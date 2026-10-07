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
