const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deactivateCompany,
  getCompanyJobs,
  getCompanyExperiences,
  getCompanyPeople,
  getCompanyStats,
  saveCompany,
  unsaveCompany,
  getSavedCompanies,
  checkSavedCompany
} = require('../controllers/companyController');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

// 1. List all companies with search, filters & pagination
router.get('/', optionalAuth, getCompanies);

// 2. User saved companies list (Must be before `/:id`)
router.get('/saved', protect, getSavedCompanies);

// 3. Relational sub-resources for company (Must be before `/:id`)
router.get('/:id/jobs', optionalAuth, getCompanyJobs);
router.get('/:id/interview-experiences', optionalAuth, getCompanyExperiences);
router.get('/:id/people', optionalAuth, getCompanyPeople);
router.get('/:id/stats', optionalAuth, getCompanyStats);
router.get('/:id/saved', protect, checkSavedCompany);

// 4. Bookmark / Save company actions
router.post('/:id/save', protect, saveCompany);
router.delete('/:id/save', protect, unsaveCompany);

// 5. Admin CRUD operations
router.post('/', protect, adminOnly, createCompany);
router.put('/:id', protect, adminOnly, updateCompany);
router.delete('/:id', protect, adminOnly, deactivateCompany);

// 6. Single company details by ID or slug (Declared after specific sub-resource routes)
router.get('/:id', optionalAuth, getCompanyById);

module.exports = router;
