const axios = require('axios');
const aiPrompts = require('./aiPrompts');

/**
 * Safe JSON extractor from LLM text responses
 */
const safeParseJSON = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;

  try {
    // 1. Direct parse attempt
    return JSON.parse(rawText.trim());
  } catch (e1) {
    try {
      // 2. Extract JSON fenced inside ```json ... ``` or ``` ... ```
      const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fencedMatch && fencedMatch[1]) {
        return JSON.parse(fencedMatch[1].trim());
      }

      // 3. Extract between first { and last }
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      }

      // 4. Extract between first [ and last ]
      const firstBracket = rawText.indexOf('[');
      const lastBracket = rawText.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        return JSON.parse(rawText.substring(firstBracket, lastBracket + 1));
      }
    } catch (e2) {
      // Return null on failure
      return null;
    }
  }
  return null;
};

/**
 * Core AI Provider caller (Supports Gemini API, OpenAI, or Custom Gateway)
 */
const generateAIResponse = async (prompt, systemInstruction = aiPrompts.SYSTEM_INSTRUCTIONS) => {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';

  if (apiKey && apiKey.trim().length > 5) {
    try {
      // If using Gemini API Key
      if (apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY || modelName.includes('gemini')) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        };

        const response = await axios.post(url, payload, { timeout: 15000 });
        const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = safeParseJSON(candidate);
        if (parsed) return parsed;
      } else {
        // Standard OpenAI compatible endpoint
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: modelName.includes('gpt') ? modelName : 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          },
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout: 15000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        const parsed = safeParseJSON(content);
        if (parsed) return parsed;
      }
    } catch (apiError) {
      console.warn('Live AI provider request error, engaging deterministic expert engine:', apiError.response ? apiError.response.status : apiError.message);
    }
  }

  return null;
};

// =========================================================================
// DETERMINISTIC EXPERT REASONING ENGINES (Clean validation & fallback)
// =========================================================================

/**
 * 1. Analyze Resume with Expert Rules & NLP extraction
 */
const TECH_SKILLS_SET = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'sql', 'nosql', 'react', 'react.js', 'next.js',
  'vue', 'angular', 'node', 'node.js', 'express', 'express.js', 'django', 'flask',
  'fastapi', 'spring', 'spring boot', 'laravel', 'asp.net', '.net', 'html', 'css',
  'tailwind', 'tailwindcss', 'bootstrap', 'sass', 'redux', 'graphql', 'rest',
  'rest api', 'restful', 'grpc', 'microservices', 'postgresql', 'postgres', 'mysql',
  'mongodb', 'redis', 'elasticsearch', 'cassandra', 'sqlite', 'dynamodb', 'docker',
  'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'git', 'github', 'gitlab', 'ci/cd',
  'jenkins', 'terraform', 'ansible', 'linux', 'unix', 'data structures', 'algorithms',
  'system design', 'distributed systems', 'kafka', 'rabbitmq', 'jest', 'pytest'
]);

const normalizeArrayOfObjects = (arr, defaultTitle, defaultDesc) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [{ title: defaultTitle, description: defaultDesc }];
  }
  return arr.map((item) => {
    if (typeof item === 'string') {
      return { title: item.slice(0, 45), description: item };
    }
    return {
      title: item.title || item.heading || defaultTitle,
      description: item.description || item.desc || defaultDesc
    };
  });
};

const analyzeResume = async (resume) => {
  const prompt = aiPrompts.RESUME_ANALYSIS_PROMPT(resume);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && typeof liveResult.overallScore === 'number') {
    const rawOverall = Math.min(100, Math.max(0, Math.round(liveResult.overallScore)));
    const ats = typeof liveResult.atsScore === 'number' ? Math.min(100, Math.max(0, Math.round(liveResult.atsScore))) : Math.min(100, rawOverall + 4);
    const skillsScore = typeof liveResult.skillsScore === 'number' ? Math.min(100, Math.max(0, Math.round(liveResult.skillsScore))) : rawOverall;
    const impact = typeof liveResult.impactScore === 'number' ? Math.min(100, Math.max(0, Math.round(liveResult.impactScore))) : Math.max(10, rawOverall - 6);
    const formatting = typeof liveResult.formattingScore === 'number' ? Math.min(100, Math.max(0, Math.round(liveResult.formattingScore))) : Math.min(100, rawOverall + 6);

    return {
      overallScore: rawOverall,
      atsScore: ats,
      skillsScore: skillsScore,
      impactScore: impact,
      formattingScore: formatting,
      strengths: normalizeArrayOfObjects(liveResult.strengths, 'Technical Competency', 'Demonstrated relevant technical background.'),
      weaknesses: normalizeArrayOfObjects(liveResult.weaknesses, 'Improvement Opportunity', 'Add more quantifiable metrics and system architecture details.'),
      missingSkills: Array.isArray(liveResult.missingSkills) && liveResult.missingSkills.length > 0 ? liveResult.missingSkills : ['Docker', 'CI/CD Pipelines', 'System Design'],
      improvements: Array.isArray(liveResult.improvements) && liveResult.improvements.length > 0 ? liveResult.improvements : [
        { title: 'Quantify Impact & Project Metrics', description: 'Highlight measurable business outcomes and latency reductions.', priority: 'high', actionTab: 'rewrites' },
        { title: 'Add Missing Technical Keywords', description: 'Incorporate relevant industry technologies in your skills matrix.', priority: 'medium', actionTab: 'skills' }
      ],
      aiSuggestions: Array.isArray(liveResult.aiSuggestions) ? liveResult.aiSuggestions : [],
      sections: Array.isArray(liveResult.sections) ? liveResult.sections : [
        { name: 'Professional Summary', status: resume.summary ? 'Complete' : 'Needs Improvement' },
        { name: 'Technical Skills', status: Array.isArray(resume.skills) && resume.skills.length > 0 ? 'Complete' : 'Needs Improvement' },
        { name: 'Work Experience', status: Array.isArray(resume.experience) && resume.experience.length > 0 ? 'Complete' : 'Missing' },
        { name: 'Projects', status: Array.isArray(resume.projects) && resume.projects.length > 0 ? 'Complete' : 'Missing' },
        { name: 'Education', status: Array.isArray(resume.education) && resume.education.length > 0 ? 'Complete' : 'Needs Improvement' }
      ],
      summary: typeof liveResult.summary === 'string' ? liveResult.summary : 'Resume evaluated against modern software engineering criteria.'
    };
  }

  // =========================================================================
  // DETERMINISTIC MULTI-DIMENSIONAL EVALUATION ENGINE
  // =========================================================================
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const education = Array.isArray(resume.education) ? resume.education : [];
  const summary = (resume.summary || '').trim();

  // 1. Technical Skills Evaluation
  const recognizedTech = skills.filter((s) => {
    const clean = String(s).toLowerCase().trim();
    return TECH_SKILLS_SET.has(clean) || Array.from(TECH_SKILLS_SET).some((ts) => clean.includes(ts) || ts.includes(clean));
  });
  const nonTechSkills = skills.filter((s) => !recognizedTech.includes(s));

  let calculatedSkillsScore = 20;
  if (recognizedTech.length === 0) {
    calculatedSkillsScore = nonTechSkills.length > 0 ? 18 : 15;
  } else if (recognizedTech.length <= 2) {
    calculatedSkillsScore = 38 + recognizedTech.length * 10;
  } else if (recognizedTech.length <= 5) {
    calculatedSkillsScore = 65 + recognizedTech.length * 4;
  } else {
    calculatedSkillsScore = 85 + Math.min(10, (recognizedTech.length - 5) * 2);
  }

  // 2. Experience & Impact Evaluation
  const actionVerbRegex = /\b(developed|architected|engineered|optimized|implemented|deployed|spearheaded|built|designed|led|reduced|scaled|increased|automated|improved)\b/i;
  const metricRegex = /(\d+[\d,]*%|\d+[\d,]*\+?|\$\d+[\d,]*|\bsub-\d+ms\b|\b\d+k\b|\b\d+m\b|\b\d+\s*(users|requests|qps|ms|sec)\b)/i;

  let totalExpChars = 0;
  let hasActionVerbs = false;
  let hasMetrics = false;

  experience.forEach((exp) => {
    const text = `${exp.role || ''} ${exp.description || ''}`;
    totalExpChars += text.trim().length;
    if (actionVerbRegex.test(text)) hasActionVerbs = true;
    if (metricRegex.test(text)) hasMetrics = true;
  });

  projects.forEach((proj) => {
    const text = `${proj.title || ''} ${proj.description || ''}`;
    totalExpChars += text.trim().length;
    if (actionVerbRegex.test(text)) hasActionVerbs = true;
    if (metricRegex.test(text)) hasMetrics = true;
  });

  let calculatedImpactScore = 15;
  if (experience.length === 0 && projects.length === 0) {
    calculatedImpactScore = 15;
  } else if (totalExpChars < 60) {
    calculatedImpactScore = 25; // Short/vague (e.g. "I worked on things")
  } else {
    calculatedImpactScore = 50;
    if (hasActionVerbs) calculatedImpactScore += 20;
    if (hasMetrics) calculatedImpactScore += 22;
    if (projects.length >= 2) calculatedImpactScore += 6;
  }
  calculatedImpactScore = Math.min(96, Math.max(15, calculatedImpactScore));

  // 3. ATS Readability & Keyword Compatibility
  let calculatedAtsScore = 25;
  if (summary.length > 25) calculatedAtsScore += 15;
  if (recognizedTech.length >= 3) calculatedAtsScore += 25;
  else if (recognizedTech.length > 0) calculatedAtsScore += 10;
  if (experience.length > 0) calculatedAtsScore += 18;
  if (projects.length > 0) calculatedAtsScore += 12;
  if (education.length > 0) calculatedAtsScore += 10;
  calculatedAtsScore = Math.min(95, Math.max(25, calculatedAtsScore));

  // 4. Formatting & Structure Completeness
  let sectionsCompleteCount = 0;
  if (summary.length > 20) sectionsCompleteCount++;
  if (skills.length > 0) sectionsCompleteCount++;
  if (experience.length > 0) sectionsCompleteCount++;
  if (projects.length > 0) sectionsCompleteCount++;
  if (education.length > 0) sectionsCompleteCount++;

  const calculatedFormattingScore = Math.min(95, Math.max(30, 30 + sectionsCompleteCount * 13));

  // 5. Weighted Overall Score
  const calculatedOverallScore = Math.min(
    98,
    Math.max(
      18,
      Math.round(
        0.35 * calculatedSkillsScore +
        0.30 * calculatedImpactScore +
        0.20 * calculatedAtsScore +
        0.15 * calculatedFormattingScore
      )
    )
  );

  // 6. Dynamic Strengths
  const strengths = [];
  if (recognizedTech.length >= 3) {
    strengths.push({
      title: 'Strong Technical Stack',
      description: `Demonstrated technical knowledge in ${recognizedTech.slice(0, 4).join(', ')}.`
    });
  }
  if (hasMetrics) {
    strengths.push({
      title: 'Quantified Business Impact',
      description: 'Project descriptions feature strong numerical indicators and performance metrics.'
    });
  }
  if (projects.length >= 1 && (projects[0].description || '').length > 30) {
    strengths.push({
      title: 'Practical Project Portfolio',
      description: `Concrete software implementation shown in ${projects[0].title || 'portfolio project'}.`
    });
  }
  if (strengths.length === 0) {
    strengths.push({
      title: 'Initial Resume Structure',
      description: 'Profile is created in the database and ready for technical enrichment.'
    });
  }

  // 7. Dynamic Weaknesses
  const weaknesses = [];
  if (recognizedTech.length === 0) {
    weaknesses.push({
      title: 'Critical Lack of Technical Skills',
      description: `No recognized software engineering skills detected. Unrelated keywords (${nonTechSkills.join(', ') || 'unspecified'}) provide no technical signaling for tech recruiters.`
    });
  } else if (recognizedTech.length < 4) {
    weaknesses.push({
      title: 'Limited Technical Keyword Breadth',
      description: `Only ${recognizedTech.length} technical skills detected. Target roles typically expect 6-10 specialized keywords.`
    });
  }

  if (!hasMetrics) {
    weaknesses.push({
      title: 'Missing Measurable Impact & Metrics',
      description: 'Experience and projects lack concrete quantifiable outcomes (e.g. latency numbers, request volume, % improvements).'
    });
  }

  if (totalExpChars < 80) {
    weaknesses.push({
      title: 'Vague Experience & Project Descriptions',
      description: 'Descriptions are overly brief and lack specific technical architecture details or trade-off explanations.'
    });
  }

  if (summary.length < 20) {
    weaknesses.push({
      title: 'Missing Professional Summary',
      description: 'Include a 2-3 sentence targeted professional summary highlighting your specialization and core tech stack.'
    });
  }

  // 8. Missing Skills Recommendation
  const standardTechBank = ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'System Design', 'Git', 'CI/CD'];
  const missingSkills = standardTechBank.filter(
    (st) => !skills.some((s) => s.toLowerCase() === st.toLowerCase())
  ).slice(0, 5);

  // 9. Prioritized Action Items
  const improvements = [];
  if (recognizedTech.length < 3) {
    improvements.push({
      title: 'Add Core Software Engineering Skills',
      description: 'Include in-demand programming languages, frameworks, and databases (e.g. JavaScript, React, Node.js, SQL).',
      priority: 'high',
      actionTab: 'skills'
    });
  }
  if (!hasMetrics || totalExpChars < 100) {
    improvements.push({
      title: 'Rewrite Bullets with Action + Metrics',
      description: 'Use strong action verbs (Architected, Optimized) and quantify your impact with latency, volume, or % improvements.',
      priority: 'high',
      actionTab: 'rewrites'
    });
  }
  if (summary.length < 30) {
    improvements.push({
      title: 'Craft a Specialized Professional Summary',
      description: 'Write a concise opening statement aligning your background with your target engineering role.',
      priority: 'medium',
      actionTab: 'sections'
    });
  }
  if (!skills.some((s) => /docker|aws|k8s|kubernetes|cloud/i.test(s))) {
    improvements.push({
      title: 'Add Cloud & DevOps Technologies',
      description: 'Adding Docker, AWS, or CI/CD pipelines will significantly boost ATS keyword match rates.',
      priority: 'medium',
      actionTab: 'skills'
    });
  }

  // 10. AI Bullet Rewrites
  const aiSuggestions = [];
  if (experience.length > 0 && experience[0].description) {
    const orig = experience[0].description;
    aiSuggestions.push({
      id: 'sug-exp-1',
      section: 'Work Experience',
      original: orig,
      improved: `Architected and deployed scalable services using ${recognizedTech[0] || 'core technologies'}, increasing throughput by 35% and ensuring 99.9% uptime under production load.`,
      reason: 'Replaces passive wording with high-impact action verbs and measurable performance metrics.'
    });
  }
  if (projects.length > 0 && projects[0].description) {
    const orig = projects[0].description;
    aiSuggestions.push({
      id: 'sug-proj-1',
      section: 'Projects',
      original: orig,
      improved: `Engineered ${projects[0].title || 'full-stack application'} utilizing ${(projects[0].technologies || recognizedTech).slice(0, 3).join(', ') || 'modern architecture'}, optimizing database queries to achieve sub-120ms response times.`,
      reason: 'Highlights specific technical tools and quantifiable latency optimizations.'
    });
  }

  // 11. Section Audit
  const sections = [
    { name: 'Contact & Header Information', status: 'Complete' },
    { name: 'Professional Summary', status: summary.length > 25 ? 'Complete' : (summary.length > 0 ? 'Needs Improvement' : 'Missing') },
    { name: 'Technical Skills Matrix', status: recognizedTech.length >= 4 ? 'Complete' : (skills.length > 0 ? 'Needs Improvement' : 'Missing') },
    { name: 'Work Experience & Impact', status: experience.length > 0 && totalExpChars > 50 ? 'Complete' : (experience.length > 0 ? 'Needs Improvement' : 'Missing') },
    { name: 'Projects & Repositories', status: projects.length >= 1 ? 'Complete' : 'Missing' },
    { name: 'Education & Honors', status: education.length > 0 ? 'Complete' : 'Missing' }
  ];

  // 12. Summary Text
  let summaryText = '';
  if (calculatedOverallScore >= 80) {
    summaryText = `Strong candidate profile demonstrating clear technical competency in ${recognizedTech.slice(0, 3).join(', ') || 'modern engineering'} with strong project depth and measurable impact.`;
  } else if (calculatedOverallScore >= 50) {
    summaryText = `Moderate technical foundation in ${recognizedTech.slice(0, 2).join(', ') || 'software development'}, but needs more quantifiable metrics, architectural depth, and cloud keywords.`;
  } else {
    summaryText = `Resume requires significant technical enhancement. Missing essential engineering skills, quantifiable metrics, and project depth needed to pass technical screening filters.`;
  }

  return {
    overallScore: calculatedOverallScore,
    atsScore: calculatedAtsScore,
    skillsScore: calculatedSkillsScore,
    impactScore: calculatedImpactScore,
    formattingScore: calculatedFormattingScore,
    strengths,
    weaknesses,
    missingSkills,
    improvements,
    aiSuggestions,
    sections,
    summary: summaryText
  };
};

/**
 * 2. Improve Resume Section
 */
const improveResumeSection = async (section, content, targetRole, skills) => {
  const prompt = aiPrompts.RESUME_IMPROVE_PROMPT(section, content, targetRole, skills);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && typeof liveResult.suggested === 'string') {
    return {
      section: section || 'summary',
      original: content || '',
      suggested: liveResult.suggested
    };
  }

  // Deterministic Suggestion Generator
  let suggested = content || '';
  if (section === 'summary') {
    const roleStr = targetRole || 'Software Engineer';
    const topSkills = (skills || []).slice(0, 4).join(', ') || 'modern full-stack technologies';
    suggested = `Performance-driven ${roleStr} with deep expertise in ${topSkills}. Proven track record designing scalable microservices, optimizing low-latency REST APIs, and delivering resilient distributed systems in fast-paced engineering environments.`;
  } else if (section === 'experience' || section === 'projects') {
    suggested = `${content ? content.trim() + ' ' : ''}Architected scalable microservices using asynchronous task processing, reducing p99 latency by 42% and ensuring 99.9% uptime under high concurrency.`;
  } else if (section === 'skills') {
    const defaultList = ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Docker', 'REST APIs', 'Git'];
    suggested = Array.from(new Set([...(skills || []), ...defaultList])).join(', ');
  } else {
    suggested = `Engineered high-impact technical solutions adhering to clean code standards and continuous integration pipelines.`;
  }

  return {
    section: section || 'summary',
    original: content || '',
    suggested
  };
};

/**
 * 3. Analyze Job Description
 */
const analyzeJob = async (job) => {
  const prompt = aiPrompts.JOB_ANALYSIS_PROMPT(job);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && Array.isArray(liveResult.requiredSkills)) {
    return {
      role: liveResult.role || job.title || 'Software Engineer',
      requiredSkills: liveResult.requiredSkills,
      preferredSkills: Array.isArray(liveResult.preferredSkills) ? liveResult.preferredSkills : [],
      experienceLevel: liveResult.experienceLevel || 'Mid-Level',
      keyResponsibilities: Array.isArray(liveResult.keyResponsibilities) ? liveResult.keyResponsibilities : ['Design and build scalable APIs', 'Collaborate with cross-functional teams'],
      importantKeywords: Array.isArray(liveResult.importantKeywords) ? liveResult.importantKeywords : liveResult.requiredSkills,
      summary: liveResult.summary || 'Technical position requiring solid problem-solving and software engineering practices.'
    };
  }

  // Deterministic NLP keyword extraction
  const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();
  const techMap = [
    'java', 'python', 'javascript', 'typescript', 'react', 'node.js', 'express',
    'mongodb', 'sql', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws',
    'rest api', 'microservices', 'git', 'ci/cd', 'spring boot', 'graphql'
  ];

  const detected = techMap.filter(t => text.includes(t)).map(s => s.toUpperCase());
  const required = detected.slice(0, 5).length ? detected.slice(0, 5) : ['JAVASCRIPT', 'REACT', 'NODE.JS', 'REST APIS'];
  const preferred = detected.slice(5).length ? detected.slice(5) : ['DOCKER', 'AWS', 'REDIS'];

  return {
    role: job.title || 'Software Engineer',
    requiredSkills: required,
    preferredSkills: preferred,
    experienceLevel: job.experience || (/senior|lead/i.test(job.title) ? 'Senior Level' : 'Mid-Level'),
    keyResponsibilities: [
      'Design, develop, and deploy scalable features and services.',
      'Maintain automated testing suites and continuous delivery pipelines.',
      'Participate in code reviews and architecture design discussions.'
    ],
    importantKeywords: Array.from(new Set([...required, ...preferred])),
    summary: `Technical opening for ${job.title || 'Software Engineer'} focusing on scalable architecture, code quality, and hands-on system delivery.`
  };
};

/**
 * 4. Resume ↔ Job Matching
 */
const matchResumeToJob = async (resume, job) => {
  const prompt = aiPrompts.RESUME_JOB_MATCH_PROMPT(resume, job);
  const liveResult = await generateAIResponse(prompt);

  // Compute deterministic baseline match score
  const resumeSkills = (resume.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.skills && job.skills.length > 0
    ? job.skills
    : ['React', 'Node.js', 'JavaScript', 'SQL', 'Git']
  ).map(s => s.toLowerCase());

  const matched = jobSkills.filter(js => resumeSkills.some(rs => rs.includes(js) || js.includes(rs)));
  const missing = jobSkills.filter(js => !resumeSkills.some(rs => rs.includes(js) || js.includes(rs)));

  let baseScore = jobSkills.length > 0
    ? Math.round((matched.length / jobSkills.length) * 50) + 40
    : 80;

  if (liveResult && typeof liveResult.matchScore === 'number') {
    baseScore = Math.min(98, Math.max(40, Math.round(liveResult.matchScore)));
  }

  return {
    matchScore: Math.min(98, Math.max(40, baseScore)),
    matchedSkills: matched.map(s => s.toUpperCase()),
    missingSkills: missing.map(s => s.toUpperCase()),
    matchingStrengths: liveResult?.matchingStrengths || [
      `Strong core alignment in ${matched.slice(0, 3).join(', ').toUpperCase() || 'foundational technologies'}.`,
      'Demonstrated hands-on technical project background.'
    ],
    gaps: liveResult?.gaps || (missing.length ? [`Opportunity to demonstrate deeper experience with ${missing.slice(0, 2).join(', ').toUpperCase()}.`] : ['Add further metrics on system performance.']),
    recommendations: liveResult?.recommendations || [
      `Tailor resume bullet points to emphasize ${matched.slice(0, 2).join(', ').toUpperCase() || 'key requirements'}.`,
      'Highlight measurable business impact and latency improvements.'
    ],
    summary: liveResult?.summary || `Strong match (${baseScore}%) for ${job.title || 'the target role'} with clear skill overlap.`
  };
};

/**
 * 5. Career Skill Gap Analysis
 */
const analyzeSkillGap = async (targetRole, currentSkills, profile) => {
  const prompt = aiPrompts.SKILL_GAP_PROMPT(targetRole, currentSkills, profile);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && Array.isArray(liveResult.requiredSkills)) {
    return {
      targetRole: targetRole || 'Software Engineer',
      currentSkills: currentSkills || [],
      requiredSkills: liveResult.requiredSkills,
      strongSkills: Array.isArray(liveResult.strongSkills) ? liveResult.strongSkills : (currentSkills || []).slice(0, 3),
      missingSkills: Array.isArray(liveResult.missingSkills) ? liveResult.missingSkills : ['Docker', 'System Design'],
      prioritySkills: Array.isArray(liveResult.prioritySkills) ? liveResult.prioritySkills : ['Microservices Architecture', 'Caching with Redis'],
      recommendedProjects: Array.isArray(liveResult.recommendedProjects) ? liveResult.recommendedProjects : [],
      learningPlan: Array.isArray(liveResult.learningPlan) ? liveResult.learningPlan : []
    };
  }

  // Deterministic Skill Map
  const standardSkills = ['Data Structures & Algorithms', 'System Design (LLD/HLD)', 'REST APIs', 'SQL Database Optimization', 'Docker & Containerization', 'Redis Caching'];
  const userSkillSet = new Set((currentSkills || []).map(s => s.toLowerCase()));
  const strong = (currentSkills || []).slice(0, 4);
  const missing = standardSkills.filter(s => !userSkillSet.has(s.toLowerCase()));

  return {
    targetRole: targetRole || 'Software Engineer',
    currentSkills: currentSkills || [],
    requiredSkills: standardSkills,
    strongSkills: strong.length ? strong : ['JavaScript', 'Node.js'],
    missingSkills: missing.slice(0, 3),
    prioritySkills: missing.slice(0, 2),
    recommendedProjects: [
      {
        title: 'Distributed Event-Driven Order Processing System',
        description: 'Build a high-throughput microservice handling order events with Redis caching and asynchronous message queues.',
        skillsCovered: ['Node.js', 'Redis', 'Docker', 'System Design']
      },
      {
        title: 'Full-Stack Performance Monitoring Dashboard',
        description: 'Create an analytics dashboard measuring p95 API response times and database query execution metrics.',
        skillsCovered: ['React', 'MongoDB', 'REST APIs', 'Telemetry']
      }
    ],
    learningPlan: [
      {
        phase: 'Phase 1 (Weeks 1-2)',
        focus: 'Core Architecture & Advanced Databases',
        topics: ['SQL Query Optimization', 'Indexing Strategies', 'Connection Pooling']
      },
      {
        phase: 'Phase 2 (Weeks 3-4)',
        focus: 'Distributed Systems & Cloud Tooling',
        topics: ['Redis Caching Patterns', 'Docker Containerization', 'CI/CD Pipelines']
      }
    ]
  };
};

/**
 * 6. Career Recommendations
 */
const getCareerRecommendations = async (profile, resume) => {
  const prompt = aiPrompts.CAREERPILOT_RECOMMENDATIONS_PROMPT
    ? aiPrompts.CAREERPILOT_RECOMMENDATIONS_PROMPT(profile, resume)
    : aiPrompts.CAREER_RECOMMENDATIONS_PROMPT(profile, resume);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && Array.isArray(liveResult.recommendedRoles)) {
    return liveResult;
  }

  const role = profile?.targetRole || 'Full Stack Developer';
  const skills = Array.from(new Set([...(profile?.skills || []), ...(resume?.skills || [])]));

  return {
    recommendedRoles: [
      role,
      'Backend Engineer (Node.js / Distributed Systems)',
      'Frontend Engineer (React / TypeScript)',
      'Cloud Applications Developer'
    ],
    skillsToLearn: ['System Design & Microservices', 'Docker & Kubernetes', 'Redis Caching & Pub/Sub', 'GraphQL APIs'],
    projectIdeas: [
      {
        title: 'High-Concurrency Rate Limiter & Gateway',
        description: 'Implement a token-bucket rate limiter service in Node.js using Redis for distributed synchronization.',
        technologies: ['Node.js', 'Redis', 'Docker', 'Jest']
      },
      {
        title: 'Real-Time Collaborative Workspace',
        description: 'Build a multi-user document editor with WebSockets and conflict-free replicated data types.',
        technologies: ['React', 'TypeScript', 'WebSockets', 'Tailwind CSS']
      }
    ],
    resumeActions: [
      'Highlight p95/p99 performance metrics in previous project descriptions.',
      'Add a dedicated "Cloud & DevOps" skill subsection with Docker and CI/CD.',
      'Ensure every project description follows the Action + Technology + Quantifiable Outcome formula.'
    ],
    interviewPreparation: [
      'Practice Tree & Graph traversal problems with runtime complexity analysis.',
      'Review Low-Level System Design (Design Patterns, Factory, Singleton, Observer).',
      'Prepare 4 STAR behavioral stories demonstrating leadership and conflict resolution.'
    ]
  };
};

/**
 * 7. Generate Interview Questions
 */
const generateInterviewQuestions = async (job, interviewType = 'Technical', count = 5) => {
  const safeCount = Math.min(20, Math.max(1, parseInt(count, 10) || 5));
  const prompt = aiPrompts.INTERVIEW_QUESTIONS_PROMPT(job, interviewType, safeCount);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && Array.isArray(liveResult.questions) && liveResult.questions.length > 0) {
    return {
      questions: liveResult.questions.slice(0, safeCount).map((q, idx) => ({
        id: `gen-q-${idx + 1}`,
        question: q.question,
        category: q.category || interviewType,
        difficulty: q.difficulty || 'Medium',
        expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics : ['Core Fundamentals', 'Trade-offs']
      }))
    };
  }

  // Deterministic Question Bank
  const questionsList = [
    {
      id: 'gen-q-1',
      question: `How would you architect a scalable REST API in ${job.title || 'software systems'} to handle 10,000 requests per second?`,
      category: interviewType,
      difficulty: 'Medium',
      expectedTopics: ['Horizontal Scaling', 'Load Balancing', 'Caching with Redis', 'Database Indexing']
    },
    {
      id: 'gen-q-2',
      question: 'Explain the difference between optimistic and pessimistic locking in concurrent database transactions.',
      category: interviewType,
      difficulty: 'Medium',
      expectedTopics: ['ACID Properties', 'Transaction Isolation', 'Race Conditions', 'Row Versioning']
    },
    {
      id: 'gen-q-3',
      question: 'How do you prevent memory leaks and optimize event loop performance in asynchronous JavaScript/Node.js?',
      category: interviewType,
      difficulty: 'Hard',
      expectedTopics: ['Event Loop Phases', 'Heap Dumps', 'Garbage Collection', 'Stream Processing']
    },
    {
      id: 'gen-q-4',
      question: 'Describe a challenging bug you diagnosed in production and the telemetry tools you used to resolve it.',
      category: 'Behavioral',
      difficulty: 'Medium',
      expectedTopics: ['STAR Method', 'Root Cause Analysis', 'Post-Mortem Documentation', 'Telemetry Logging']
    },
    {
      id: 'gen-q-5',
      question: 'What trade-offs do you consider when choosing between a relational (SQL) and non-relational (MongoDB) database?',
      category: interviewType,
      difficulty: 'Easy',
      expectedTopics: ['Schema Flexibility', 'JOIN Complexity', 'Sharding & Replication', 'Consistency vs Availability']
    }
  ];

  return {
    questions: questionsList.slice(0, safeCount)
  };
};

/**
 * 8. Interview Answer Feedback
 */
const evaluateInterviewAnswer = async (question, answer, interviewType = 'Technical') => {
  const prompt = aiPrompts.INTERVIEW_FEEDBACK_PROMPT(question, answer, interviewType);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && typeof liveResult.score === 'number') {
    return {
      score: Math.min(100, Math.max(0, Math.round(liveResult.score))),
      strengths: Array.isArray(liveResult.strengths) ? liveResult.strengths : ['Addressed the main question clearly.'],
      weaknesses: Array.isArray(liveResult.weaknesses) ? liveResult.weaknesses : ['Could expand on failure modes and edge cases.'],
      missingPoints: Array.isArray(liveResult.missingPoints) ? liveResult.missingPoints : ['Mention performance metrics and trade-offs.'],
      improvedAnswer: liveResult.improvedAnswer || 'A structured response using the STAR framework with concrete architectural outcomes.',
      tips: Array.isArray(liveResult.tips) ? liveResult.tips : ['Structure your response in Situation, Task, Action, and Result.']
    };
  }

  // Deterministic Answer Evaluation
  const len = (answer || '').trim().length;
  let score = 70;
  if (len > 250) score = 88;
  else if (len > 120) score = 78;
  else if (len < 50) score = 48;

  const strengths = [];
  if (len > 100) strengths.push('Good detail depth and structured explanation.');
  strengths.push('Demonstrated understanding of core technical concepts.');

  const weaknesses = [];
  if (len < 80) weaknesses.push('Answer is brief; flesh out concrete system architecture details.');
  weaknesses.push('Include specific metrics (e.g. latency, throughput, scale).');

  return {
    score,
    strengths,
    weaknesses,
    missingPoints: ['Edge case handling', 'Trade-off analysis', 'Automated testing and monitoring'],
    improvedAnswer: `To address "${question}", I first analyze the functional and non-functional requirements. In a previous implementation, I architected a modular service using caching and asynchronous processing, achieving sub-100ms response times and zero downtime during peak traffic.`,
    tips: [
      'Structure technical responses by clarifying requirements first.',
      'Explain why you chose a specific technology over alternatives.',
      'Conclude with measurable outcomes and lessons learned.'
    ]
  };
};

/**
 * 9. Mock Interview Session Evaluation
 */
const evaluateMockInterviewSession = async (session, questionsAndAnswers) => {
  const prompt = aiPrompts.MOCK_INTERVIEW_SESSION_PROMPT(session, questionsAndAnswers);
  const liveResult = await generateAIResponse(prompt);

  if (liveResult && typeof liveResult.overallScore === 'number' && Array.isArray(liveResult.questionFeedback)) {
    return liveResult;
  }

  // Deterministic session feedback
  let totalScore = 0;
  const questionFeedback = (questionsAndAnswers || []).map((qa, index) => {
    const ansLen = (qa.answer || '').length;
    const qScore = ansLen > 150 ? 88 : (ansLen > 50 ? 76 : 52);
    totalScore += qScore;

    return {
      question: qa.question,
      answer: qa.answer || '(No answer provided)',
      score: qScore,
      feedback: ansLen > 100 ? 'Solid response with clear articulation.' : 'Provide more concrete examples and mention trade-offs.',
      strengths: ['Directly tackled the prompt', 'Used appropriate domain terminology'],
      improvements: ['Elaborate on edge cases and failure recovery']
    };
  });

  const overallScore = questionsAndAnswers.length > 0
    ? Math.round(totalScore / questionsAndAnswers.length)
    : 75;

  return {
    overallScore,
    strengths: [
      'Consistent communication style across all questions.',
      'Comfortable answering foundational architectural concepts.'
    ],
    weaknesses: [
      'Can deepen trade-off explanations between competing database choices.',
      'Include quantifiable business impact metrics.'
    ],
    questionFeedback,
    recommendations: [
      'Practice speaking for 90-120 seconds per response using the STAR method.',
      'Deepen system design foundations with distributed caching and queueing patterns.',
      'Review common data structure complexities before your onsite.'
    ]
  };
};

module.exports = {
  generateAIResponse,
  analyzeResume,
  improveResumeSection,
  analyzeJob,
  matchResumeToJob,
  analyzeSkillGap,
  getCareerRecommendations,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  evaluateMockInterviewSession
};
