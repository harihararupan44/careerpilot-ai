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
