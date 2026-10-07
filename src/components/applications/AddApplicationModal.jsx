import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { calculateJobFit } from '../../utils/fitScoreCalculator';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function AddApplicationModal({
  isOpen,
  onClose,
  initialStatus = 'Applied',
  onAdd,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company: '',
    jobTitle: '',
    jobUrl: '',
    location: 'Remote',
    salary: '',
    status: initialStatus,
    applicationDate: new Date().toISOString().split('T')[0],
    deadline: '',
    interviewDate: '',
    resumeUsed: 'Primary_Resume.pdf',
    notes: '',
    jobDescription: '',
  });

  const [calculatedFit, setCalculatedFit] = useState(80);

  useEffect(() => {
    if (initialStatus) {
      setFormData(prev => ({ ...prev, status: initialStatus }));
    }
  }, [initialStatus]);

  const handleJdChange = (e) => {
    const text = e.target.value;
    setFormData(prev => ({ ...prev, jobDescription: text }));
    if (text.length > 30) {
      const userSkills = Array.isArray(user?.skills) ? user.skills : [];
      const userProjects = Array.isArray(user?.projects) ? user.projects : [];
      if (userSkills.length > 0) {
        const fit = calculateJobFit(text, userSkills, userProjects);
        if (fit) {
          setCalculatedFit(fit.overallScore);
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.jobTitle) return;

    onAdd({
      ...formData,
      fitScore: calculatedFit,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track New Application"
      subtitle="Log a new job application and let CareerPilot calculate fit scores and track deadlines."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Google, Stripe, Linear"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Software Engineer - Frontend"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Assessment">Assessment</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. San Francisco (Hybrid)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Salary Range
            </label>
            <input
              type="text"
              placeholder="e.g. $140,000 - $160,000"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Application Date
            </label>
            <input
              type="date"
              value={formData.applicationDate}
              onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resume Used
            </label>
            <select
              value={formData.resumeUsed}
              onChange={(e) => setFormData({ ...formData, resumeUsed: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            >
              <option value="Alex_Rivera_SWE_Backend_v2.pdf">Alex_Rivera_SWE_Backend_v2.pdf</option>
              <option value="Alex_Rivera_Frontend_Master.pdf">Alex_Rivera_Frontend_Master.pdf</option>
              <option value="Alex_Rivera_FullStack_2026.pdf">Alex_Rivera_FullStack_2026.pdf</option>
            </select>
          </div>
        </div>

        {/* Job Description Textarea with AI estimation */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Job Description (Optional for AI Match Analysis)
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              <Sparkles className="w-3 h-3" />
              Estimated Fit: {calculatedFit}%
            </span>
          </div>
          <textarea
            rows="3"
            placeholder="Paste snippet or full job description to trigger instant skill match calculation..."
            value={formData.jobDescription}
            onChange={handleJdChange}
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 resize-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Personal Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Referred by MIT alumni, need to follow up in 5 days"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
          >
            Save Application
          </button>
        </div>
      </form>
    </Modal>
  );
}
