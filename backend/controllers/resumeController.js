const mongoose = require('mongoose');
const Resume = require('../models/Resume');

/**
 * @route   POST /api/resumes
 * @desc    Create a new resume for authenticated user
 * @access  Private (Protected)
 */
const createResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      title,
      summary,
      skills,
      education,
      experience,
      projects,
      certifications,
      achievements,
      fileName,
      fileUrl,
      isActive,
      version
    } = req.body;

    // 1. Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Resume title is required'
      });
    }

    // 2. Determine active status
    const existingCount = await Resume.countDocuments({ user: userId });
    let shouldBeActive = false;

    if (existingCount === 0 || isActive === true) {
      shouldBeActive = true;
      // If setting this resume active, deactivate all previous resumes of this user
      await Resume.updateMany({ user: userId }, { isActive: false });
    }

    // 3. Format structured payload
    const resumeData = {
      user: userId,
      title: title.trim(),
      summary: summary !== undefined ? String(summary).trim() : '',
      skills: Array.isArray(skills) ? skills.map((s) => String(s).trim()).filter(Boolean) : [],
      education: Array.isArray(education) ? education : [],
      experience: Array.isArray(experience) ? experience : [],
      projects: Array.isArray(projects)
        ? projects.map((p) => ({
            title: p.title || 'Untitled Project',
            description: p.description || '',
            technologies: Array.isArray(p.technologies)
              ? p.technologies
              : Array.isArray(p.tags)
              ? p.tags
              : [],
            githubUrl: p.githubUrl || p.link || '',
            liveUrl: p.liveUrl || p.demo || ''
          }))
        : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      achievements: Array.isArray(achievements)
        ? achievements.map((a) => String(a).trim()).filter(Boolean)
        : [],
      fileName: fileName ? String(fileName).trim() : '',
      fileUrl: fileUrl ? String(fileUrl).trim() : '',
      isActive: shouldBeActive,
      version: typeof version === 'number' && version > 0 ? version : 1
    };

    const resume = await Resume.create(resumeData);

    return res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes belonging to the authenticated user
 * @access  Private (Protected)
 */
const getResumes = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const resumes = await Resume.find({ user: userId }).sort({
      isActive: -1,
      updatedAt: -1
    });

    return res.status(200).json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/resumes/:id
 * @desc    Get single resume by ID (strictly owned by user)
 * @access  Private (Protected)
 */
const getResumeById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const resume = await Resume.findOne({ _id: id, user: userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    return res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update a resume belonging to the authenticated user
 * @access  Private (Protected)
 */
const updateResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const {
      title,
      summary,
      skills,
      education,
      experience,
      projects,
      certifications,
      achievements,
      fileName,
      fileUrl,
      version
    } = req.body;

    const updateFields = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Resume title cannot be empty'
        });
      }
      updateFields.title = title.trim();
    }

    if (summary !== undefined) updateFields.summary = String(summary).trim();
    if (fileName !== undefined) updateFields.fileName = String(fileName).trim();
    if (fileUrl !== undefined) updateFields.fileUrl = String(fileUrl).trim();
    if (typeof version === 'number') updateFields.version = version;

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: 'Skills must be an array'
        });
      }
      updateFields.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    }

    if (education !== undefined) {
      if (!Array.isArray(education)) {
        return res.status(400).json({
          success: false,
          message: 'Education must be an array'
        });
      }
      updateFields.education = education;
    }

    if (experience !== undefined) {
      if (!Array.isArray(experience)) {
        return res.status(400).json({
          success: false,
          message: 'Experience must be an array'
        });
      }
      updateFields.experience = experience;
    }

    if (projects !== undefined) {
      if (!Array.isArray(projects)) {
        return res.status(400).json({
          success: false,
          message: 'Projects must be an array'
        });
      }
      updateFields.projects = projects.map((p) => ({
        title: p.title || 'Untitled Project',
        description: p.description || '',
        technologies: Array.isArray(p.technologies)
          ? p.technologies
          : Array.isArray(p.tags)
          ? p.tags
          : [],
        githubUrl: p.githubUrl || p.link || '',
        liveUrl: p.liveUrl || p.demo || ''
      }));
    }

    if (certifications !== undefined) {
      if (!Array.isArray(certifications)) {
        return res.status(400).json({
          success: false,
          message: 'Certifications must be an array'
        });
      }
      updateFields.certifications = certifications;
    }

    if (achievements !== undefined) {
      if (!Array.isArray(achievements)) {
        return res.status(400).json({
          success: false,
          message: 'Achievements must be an array'
        });
      }
      updateFields.achievements = achievements.map((a) => String(a).trim()).filter(Boolean);
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      resume
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume belonging to the authenticated user
 * @access  Private (Protected)
 */
const deleteResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const deletedResume = await Resume.findOneAndDelete({ _id: id, user: userId });

    if (!deletedResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // If the deleted resume was active, set another remaining resume as active
    if (deletedResume.isActive) {
      const nextResume = await Resume.findOne({ user: userId }).sort({ updatedAt: -1 });
      if (nextResume) {
        await Resume.findByIdAndUpdate(nextResume._id, { isActive: true });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/resumes/:id/active
 * @desc    Set a specific resume as active (and deactivate all other resumes of user)
 * @access  Private (Protected)
 */
const setActiveResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check ownership
    const targetResume = await Resume.findOne({ _id: id, user: userId });

    if (!targetResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Deactivate all user's resumes
    await Resume.updateMany({ user: userId }, { isActive: false });

    // Set selected resume as active
    const resume = await Resume.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Active resume updated',
      resume
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  setActiveResume
};
