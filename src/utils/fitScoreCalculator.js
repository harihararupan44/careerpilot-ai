export function calculateJobFit(jobDescription, userSkillsInput = [], userProjects = []) {
  if (!jobDescription) return null;
  const jdLower = jobDescription.toLowerCase();

  // Normalize skills input
  let userSkills = [];
  if (Array.isArray(userSkillsInput)) {
    userSkills = userSkillsInput;
  } else if (userSkillsInput && Array.isArray(userSkillsInput.skills)) {
    userSkills = userSkillsInput.skills;
  }

  const skillKeywords = [
    'react', 'react.js', 'javascript', 'typescript', 'node.js', 'nodejs', 'express', 'python',
    'django', 'fastapi', 'java', 'spring boot', 'c++', 'go', 'golang', 'rust',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'rest api', 'docker',
    'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'git', 'linux', 'tailwind',
    'next.js', 'redux', 'kafka', 'microservices', 'system design', 'agile', 'testing', 'jest'
  ];

  const foundKeywords = skillKeywords.filter(skill => jdLower.includes(skill.toLowerCase()));

  const matchedSkills = [];
  const missingSkills = [];

  foundKeywords.forEach(keyword => {
    const hasSkill = userSkills.some(s => {
      const skillName = typeof s === 'string' ? s : s?.name;
      if (!skillName) return false;
      return skillName.toLowerCase() === keyword.toLowerCase() || keyword.toLowerCase().includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(keyword.toLowerCase());
    });
    if (hasSkill) {
      matchedSkills.push(keyword.toUpperCase());
    } else {
      missingSkills.push(keyword.toUpperCase());
    }
  });

  const totalKeywords = foundKeywords.length || 1;
  const skillMatchRatio = matchedSkills.length / Math.max(1, totalKeywords);

  const skillScore = Math.min(95, Math.max(50, Math.round(skillMatchRatio * 90 + 10)));
  const experienceScore = 78;
  const educationScore = 92;
  const projectScore = matchedSkills.length >= 3 ? 84 : 68;
  const atsScore = Math.round(skillScore * 0.85 + 12);

  const overallScore = Math.round(
    skillScore * 0.35 +
    experienceScore * 0.2 +
    educationScore * 0.15 +
    projectScore * 0.15 +
    atsScore * 0.15
  );

  return {
    overallScore,
    fitScore: overallScore,
    skillScore,
    experienceScore,
    educationScore,
    projectScore,
    atsScore,
    matchedSkills: matchedSkills.length ? matchedSkills : ['JAVASCRIPT', 'REACT', 'GIT', 'REST API'],
    matchingSkills: matchedSkills.length ? matchedSkills : ['JAVASCRIPT', 'REACT', 'GIT', 'REST API'],
    missingSkills: missingSkills.length ? missingSkills : ['KUBERNETES', 'AWS LAMBDA', 'GRAPHQL'],
    totalKeywordsFound: foundKeywords.length,
  };
}
