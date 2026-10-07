/**
 * AI Prompts and System Directives for CareerPilot AI
 */

const SYSTEM_INSTRUCTIONS = `
You are CareerPilot AI, an expert technical career strategist, principal recruiter, and engineering mentor.
Your role is to provide actionable, precise, and realistic career intelligence.

CRITICAL RULES:
1. Never invent or hallucinate facts that do not exist in the candidate's resume or job description.
2. Never guarantee job placement or employment outcomes.
3. Keep feedback constructively candid, measurable, and highly tailored to modern tech hiring standards.
4. Always return valid, strictly formatted JSON matching the requested structure without markdown formatting or conversational wrapping when JSON is requested.
`;

const RESUME_ANALYSIS_PROMPT = (resume) => `
Analyze the following candidate resume for technical software engineering roles:
Candidate Resume:
${JSON.stringify(resume, null, 2)}

Provide an honest, highly specific technical critique and scoring:
1. overallScore (Integer from 0 to 100 based on true technical quality, metrics, and market readiness)
2. atsScore (Integer from 0 to 100 based on standard ATS parsability, keywords, and structural headers)
3. skillsScore (Integer from 0 to 100 based on technical relevance, depth, and industry alignment)
4. impactScore (Integer from 0 to 100 based on quantifiable numbers, latency/throughput metrics, and action verbs)
5. formattingScore (Integer from 0 to 100 based on completeness and organization)
6. strengths (Array of { "title": string, "description": string }, 2-5 items reflecting their actual content)
7. weaknesses (Array of { "title": string, "description": string }, 2-5 items reflecting their actual gaps)
8. missingSkills (Array of high-impact skills that would make this profile more competitive, 2-6 items)
9. improvements (Array of { "title": string, "description": string, "priority": "high"|"medium"|"low", "actionTab": "skills"|"rewrites"|"sections" }, 2-5 items)
10. aiSuggestions (Array of { "id": string, "section": string, "original": string, "improved": string, "reason": string })
11. sections (Array of { "name": string, "status": "Complete"|"Needs Improvement"|"Missing" })
12. summary (A concise 2-3 sentence executive evaluation)

CRITICAL: If the resume contains non-technical skills (e.g. cooking, cricket) or vague descriptions ("I worked on things"), give honest low scores (20-40) and explicitly call out the lack of technical credentials.

Return ONLY a valid JSON object matching this schema:
{
  "overallScore": 82,
  "atsScore": 85,
  "skillsScore": 80,
  "impactScore": 78,
  "formattingScore": 88,
  "strengths": [{ "title": "...", "description": "..." }],
  "weaknesses": [{ "title": "...", "description": "..." }],
  "missingSkills": ["...", "..."],
  "improvements": [{ "title": "...", "description": "...", "priority": "high", "actionTab": "rewrites" }],
  "aiSuggestions": [{ "id": "sug-1", "section": "Experience", "original": "...", "improved": "...", "reason": "..." }],
  "sections": [{ "name": "Professional Summary", "status": "Complete" }],
  "summary": "..."
}
`;

const RESUME_IMPROVE_PROMPT = (section, content, targetRole, skills) => `
Improve the following resume "${section}" section for a candidate targeting "${targetRole || 'Software Engineer'}":
Skills context: ${(skills || []).join(', ')}

Original Section Content:
"${content || ''}"

Instructions:
- Enhance clarity, impact, technical depth, and quantifiable achievement metrics (e.g. latency reduction, throughput, users).
- Use active action verbs (Architected, Engineered, Optimized, Deployed).
- Keep it honest and aligned with the original context.

Return ONLY a valid JSON object:
{
  "section": "${section}",
  "original": "${content || ''}",
  "suggested": "..."
}
`;

const JOB_ANALYSIS_PROMPT = (job) => `
Analyze the following technical job description:
Title: ${job.title || ''}
Company: ${job.company || ''}
Location: ${job.location || ''}
Description:
${job.description || ''}

Return ONLY a valid JSON object:
{
  "role": "${job.title || 'Software Engineer'}",
  "requiredSkills": ["..."],
  "preferredSkills": ["..."],
  "experienceLevel": "Entry / Mid / Senior / Lead",
  "keyResponsibilities": ["...", "..."],
  "importantKeywords": ["...", "..."],
  "summary": "..."
}
`;

const RESUME_JOB_MATCH_PROMPT = (resume, job) => `
Compare candidate resume with target job description:
Candidate Resume Skills: ${(resume.skills || []).join(', ')}
Candidate Summary: ${resume.summary || ''}
Candidate Projects: ${JSON.stringify(resume.projects || [], null, 2)}
Candidate Experience: ${JSON.stringify(resume.experience || [], null, 2)}

Target Job:
Title: ${job.title || ''}
Description: ${job.description || ''}
Required Skills: ${(job.skills || []).join(', ')}

Evaluate fit, overlap, gaps, and concrete recommendations.

Return ONLY a valid JSON object:
{
  "matchScore": 85,
  "matchedSkills": ["...", "..."],
  "missingSkills": ["...", "..."],
  "matchingStrengths": ["...", "..."],
  "gaps": ["...", "..."],
  "recommendations": ["...", "..."],
  "summary": "..."
}
`;

const SKILL_GAP_PROMPT = (targetRole, currentSkills, profile) => `
Analyze the skill gap for candidate targeting "${targetRole}":
Candidate Current Skills: ${(currentSkills || []).join(', ')}
Candidate Bio/Summary: ${profile?.bio || ''}
Candidate Projects: ${JSON.stringify(profile?.projects || [], null, 2)}

Provide a practical learning roadmap and project blueprints to close the gap.

Return ONLY a valid JSON object:
{
  "targetRole": "${targetRole}",
  "currentSkills": ["..."],
  "requiredSkills": ["..."],
  "strongSkills": ["..."],
  "missingSkills": ["..."],
  "prioritySkills": ["..."],
  "recommendedProjects": [
    {
      "title": "...",
      "description": "...",
      "skillsCovered": ["..."]
    }
  ],
  "learningPlan": [
    {
      "phase": "Phase 1 (Weeks 1-2)",
      "focus": "...",
      "topics": ["..."]
    }
  ]
}
`;

const CAREER_RECOMMENDATIONS_PROMPT = (userProfile, resume) => `
Analyze candidate profile and resume to generate tailored career guidance:
Profile:
Target Role: ${userProfile?.targetRole || 'Software Engineer'}
Skills: ${(userProfile?.skills || resume?.skills || []).join(', ')}
College/Degree: ${userProfile?.degree || ''} at ${userProfile?.college || ''}
Bio: ${userProfile?.bio || ''}
Projects: ${JSON.stringify(userProfile?.projects || resume?.projects || [], null, 2)}

Provide actionable career recommendations.

Return ONLY a valid JSON object:
{
  "recommendedRoles": ["...", "..."],
  "skillsToLearn": ["...", "..."],
  "projectIdeas": [
    {
      "title": "...",
      "description": "...",
      "technologies": ["..."]
    }
  ],
  "resumeActions": ["...", "..."],
  "interviewPreparation": ["...", "..."]
}
`;

const INTERVIEW_QUESTIONS_PROMPT = (job, interviewType, count = 5) => `
Generate ${count} realistic ${interviewType || 'Technical'} interview questions for:
Job Title: ${job.title || 'Software Engineer'}
Company: ${job.company || 'Tech Company'}
Key Skills/Description: ${job.description || (job.skills || []).join(', ')}

Return ONLY a valid JSON object:
{
  "questions": [
    {
      "question": "...",
      "category": "${interviewType || 'Technical'}",
      "difficulty": "Easy / Medium / Hard",
      "expectedTopics": ["...", "..."]
    }
  ]
}
`;

const INTERVIEW_FEEDBACK_PROMPT = (question, answer, interviewType) => `
Evaluate the candidate's interview answer:
Question: "${question}"
Interview Type: ${interviewType || 'Technical'}
Candidate Answer:
"${answer}"

Evaluate clarity, technical correctness, STAR method structure, and trade-off considerations.

Return ONLY a valid JSON object:
{
  "score": 80,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "missingPoints": ["...", "..."],
  "improvedAnswer": "...",
  "tips": ["...", "..."]
}
`;

const MOCK_INTERVIEW_SESSION_PROMPT = (session, questionsAndAnswers) => `
Evaluate candidate's full mock interview session:
Role Context: ${session.title || 'Mock Technical Interview'}
Questions & Candidate Responses:
${JSON.stringify(questionsAndAnswers, null, 2)}

Provide aggregate scoring and per-question feedback.

Return ONLY a valid JSON object:
{
  "overallScore": 82,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "questionFeedback": [
    {
      "question": "...",
      "answer": "...",
      "score": 85,
      "feedback": "...",
      "strengths": ["..."],
      "improvements": ["..."]
    }
  ],
  "recommendations": ["...", "..."]
}
`;

module.exports = {
  SYSTEM_INSTRUCTIONS,
  RESUME_ANALYSIS_PROMPT,
  RESUME_IMPROVE_PROMPT,
  JOB_ANALYSIS_PROMPT,
  RESUME_JOB_MATCH_PROMPT,
  SKILL_GAP_PROMPT,
  CAREER_RECOMMENDATIONS_PROMPT,
  INTERVIEW_QUESTIONS_PROMPT,
  INTERVIEW_FEEDBACK_PROMPT,
  MOCK_INTERVIEW_SESSION_PROMPT
};
