// Mock AI Service for CareerPilot AI
import { mockQuestionsBank } from '../data/mockInterviews.js';

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
