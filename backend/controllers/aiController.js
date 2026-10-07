const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const MockInterview = require('../models/MockInterview');
const aiService = require('../services/aiService');

/**
 * 1. POST /api/ai/resume/analyze
 * @desc Analyze candidate resume using AI intelligence
 * @access Private (JWT Auth)
 */
const analyzeResumeHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId } = req.body;

    let resume = null;
    if (resumeId) {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({ success: false, message: 'Invalid resume ID format' });
      }
      resume = await Resume.findOne({ _id: resumeId, user: userId });
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found or unauthorized' });
      }
    } else {
      resume = await Resume.findOne({ user: userId, isActive: true }) || await Resume.findOne({ user: userId });
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this user. Please create or upload a resume first.'
      });
    }

    // Safe debugging log (no secrets or sensitive tokens)
    console.log("Resume being analyzed:", {
      id: resume._id,
      title: resume.title,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      projects: resume.projects
    });

    const analysis = await aiService.analyzeResume(resume);

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. POST /api/ai/resume/improve
 * @desc Generate tailored improvements for specific resume section without overwriting
 * @access Private (JWT Auth)
 */
const improveResumeHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId, section = 'summary', content } = req.body;

    let resume = null;
    if (resumeId) {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({ success: false, message: 'Invalid resume ID format' });
      }
      resume = await Resume.findOne({ _id: resumeId, user: userId });
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found or unauthorized' });
      }
    } else {
      resume = await Resume.findOne({ user: userId, isActive: true }) || await Resume.findOne({ user: userId });
    }

    const profile = await Profile.findOne({ user: userId });
    const targetRole = profile?.targetRole || 'Software Engineer';
    const skills = resume?.skills || profile?.skills || [];

    const sectionContent = content || (resume ? resume[section] || resume.summary : '');

    const improvement = await aiService.improveResumeSection(section, sectionContent, targetRole, skills);

    return res.status(200).json({
      success: true,
      data: improvement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. POST /api/ai/job/analyze
 * @desc Analyze technical job description for core requirements, keywords & responsibilities
 * @access Private (JWT Auth)
 */
const analyzeJobHandler = async (req, res, next) => {
  try {
    const { jobId, jobDescription, title, company } = req.body;

    let jobObj = {
      title: title || 'Software Engineer',
      company: company || 'Technology Company',
      description: jobDescription || ''
    };

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid job ID format' });
      }
      const dbJob = await Job.findById(jobId);
      if (!dbJob) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      jobObj = {
        title: dbJob.title,
        company: dbJob.company,
        description: dbJob.description,
        skills: dbJob.skills,
        experience: dbJob.experienceLevel
      };
    }

    if (!jobObj.description && !jobObj.title) {
      return res.status(400).json({
        success: false,
        message: 'Job ID or job description text is required'
      });
    }

    const analysis = await aiService.analyzeJob(jobObj);

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. POST /api/ai/job/match
 * @desc Compare candidate resume against job requirements with deterministic scoring & AI insights
 * @access Private (JWT Auth)
 */
const matchResumeJobHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { resumeId, jobId, jobDescription, jobTitle } = req.body;

    let resume = null;
    if (resumeId) {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({ success: false, message: 'Invalid resume ID format' });
      }
      resume = await Resume.findOne({ _id: resumeId, user: userId });
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found or unauthorized' });
      }
    } else {
      resume = await Resume.findOne({ user: userId, isActive: true }) || await Resume.findOne({ user: userId });
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No candidate resume found for matching'
      });
    }

    let jobObj = {
      title: jobTitle || 'Software Engineer',
      description: jobDescription || '',
      skills: []
    };

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid job ID format' });
      }
      const dbJob = await Job.findById(jobId);
      if (!dbJob) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      jobObj = {
        title: dbJob.title,
        company: dbJob.company,
        description: dbJob.description,
        skills: dbJob.skills || []
      };
    }

    const matchResult = await aiService.matchResumeToJob(resume, jobObj);

    return res.status(200).json({
      success: true,
      data: matchResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. POST /api/ai/career/skill-gap
 * @desc Evaluate candidate skills against target role and generate learning roadmap
 * @access Private (JWT Auth)
 */
const analyzeSkillGapHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetRole: reqTargetRole, currentSkills: reqSkills } = req.body;

    const [profile, resume] = await Promise.all([
      Profile.findOne({ user: userId }),
      Resume.findOne({ user: userId, isActive: true }) || Resume.findOne({ user: userId })
    ]);

    const targetRole = reqTargetRole || profile?.targetRole || 'Full Stack Developer';
    const currentSkills = reqSkills || profile?.skills || resume?.skills || ['JavaScript', 'Node.js', 'React'];

    const gapResult = await aiService.analyzeSkillGap(targetRole, currentSkills, profile);

    return res.status(200).json({
      success: true,
      data: gapResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. POST /api/ai/career/recommendations
 * @desc Generate tailored career recommendations based on Profile & Resume
 * @access Private (JWT Auth)
 */
const getCareerRecommendationsHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [profile, resume] = await Promise.all([
      Profile.findOne({ user: userId }),
      Resume.findOne({ user: userId, isActive: true }) || Resume.findOne({ user: userId })
    ]);

    const recommendations = await aiService.getCareerRecommendations(profile, resume);

    return res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. POST /api/ai/interview/questions
 * @desc Generate realistic interview questions tailored to a specific job
 * @access Private (JWT Auth)
 */
const generateInterviewQuestionsHandler = async (req, res, next) => {
  try {
    const { jobId, jobTitle, interviewType = 'Technical', count = 5 } = req.body;

    let jobObj = {
      title: jobTitle || 'Software Engineer',
      company: 'Tech Company',
      description: ''
    };

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid job ID format' });
      }
      const dbJob = await Job.findById(jobId);
      if (dbJob) {
        jobObj = {
          title: dbJob.title,
          company: dbJob.company,
          description: dbJob.description,
          skills: dbJob.skills
        };
      }
    }

    if (count !== undefined) {
      const numCount = parseInt(count, 10);
      if (isNaN(numCount) || numCount < 1 || numCount > 20) {
        return res.status(400).json({
          success: false,
          message: 'Question count must be an integer between 1 and 20'
        });
      }
    }

    const safeCount = Math.min(20, Math.max(1, parseInt(count, 10) || 5));
    const questionsResult = await aiService.generateInterviewQuestions(jobObj, interviewType, safeCount);

    return res.status(200).json({
      success: true,
      data: questionsResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. POST /api/ai/interview/feedback
 * @desc Evaluate individual candidate interview response
 * @access Private (JWT Auth)
 */
const evaluateInterviewFeedbackHandler = async (req, res, next) => {
  try {
    const { question, answer, interviewType = 'Technical' } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Interview question is required' });
    }
    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: 'Candidate answer is required' });
    }

    const feedback = await aiService.evaluateInterviewAnswer(question.trim(), answer.trim(), interviewType);

    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. POST /api/ai/mock-interview/feedback
 * @desc Generate comprehensive AI feedback report for completed mock interview session
 * @access Private (JWT Auth)
 */
const evaluateMockInterviewSessionHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { mockInterviewId } = req.body;

    if (!mockInterviewId) {
      return res.status(400).json({ success: false, message: 'mockInterviewId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(mockInterviewId)) {
      return res.status(400).json({ success: false, message: 'Invalid mockInterviewId format' });
    }

    const session = await MockInterview.findById(mockInterviewId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Mock interview session not found' });
    }

    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this mock interview session' });
    }

    const qaList = (session.questions || []).map((q) => ({
      question: q.question,
      answer: q.userAnswer || ''
    }));

    const sessionFeedback = await aiService.evaluateMockInterviewSession(session, qaList);

    return res.status(200).json({
      success: true,
      data: sessionFeedback
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResumeHandler,
  improveResumeHandler,
  analyzeJobHandler,
  matchResumeJobHandler,
  analyzeSkillGapHandler,
  getCareerRecommendationsHandler,
  generateInterviewQuestionsHandler,
  evaluateInterviewFeedbackHandler,
  evaluateMockInterviewSessionHandler
};
