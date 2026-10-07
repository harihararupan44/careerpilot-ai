import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import {
  Building2,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Clock,
  Shield,
  Send,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CreateExperienceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false
}) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [experienceTitle, setExperienceTitle] = useState('');
  const [overallDifficulty, setOverallDifficulty] = useState('Medium');
  const [experienceType, setExperienceType] = useState('Full-time');
  const [interviewMode, setInterviewMode] = useState('Online');
  const [result, setResult] = useState('Selected');
  const [overallExperience, setOverallExperience] = useState('');
  const [preparationTips, setPreparationTips] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Tags & Lists
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['Java', 'DSA', 'SQL']);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState(['Binary Trees', 'Dynamic Programming']);
  const [questionInput, setQuestionInput] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState([]);

  // Rounds
  const [rounds, setRounds] = useState([
    {
      roundNumber: 1,
      roundName: 'Online Assessment',
      roundType: 'Technical',
      difficulty: 'Medium',
      duration: 60,
      description: 'Online coding challenge on HackerRank / LeetCode style platform.',
      questions: ['Reverse a Linked List in K-groups', 'SQL join query'],
      tips: 'Practice speed and test edge cases.'
    }
  ]);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName || initialData.company || '');
      setJobTitle(initialData.jobTitle || initialData.role || '');
      setExperienceTitle(initialData.experienceTitle || initialData.title || '');
      setOverallDifficulty(initialData.overallDifficulty || initialData.difficulty || 'Medium');
      setExperienceType(initialData.experienceType || 'Full-time');
      setInterviewMode(initialData.interviewMode || 'Online');
      setResult(initialData.result || (initialData.verdict === 'Offered' ? 'Selected' : initialData.verdict) || 'Selected');
      setOverallExperience(initialData.overallExperience || initialData.summary || '');
      setPreparationTips(initialData.preparationTips || initialData.preparationStrategy || '');
      setIsAnonymous(Boolean(initialData.isAnonymous));
      setSkills(Array.isArray(initialData.skills) && initialData.skills.length > 0 ? initialData.skills : (initialData.technologies || []));
      setTopics(Array.isArray(initialData.topics) ? initialData.topics : []);
      setQuestionsAsked(Array.isArray(initialData.questionsAsked) ? initialData.questionsAsked : (Array.isArray(initialData.questions) ? initialData.questions.map(q => typeof q === 'string' ? q : q.title || q.question) : []));
      if (Array.isArray(initialData.rounds) && initialData.rounds.length > 0) {
        setRounds(
          initialData.rounds.map((r, idx) => ({
            roundNumber: r.roundNumber || idx + 1,
            roundName: r.roundName || r.name || `Round ${idx + 1}`,
            roundType: r.roundType || r.type || 'Technical',
            difficulty: r.difficulty || 'Medium',
            duration: r.duration || 60,
            description: r.description || '',
            questions: Array.isArray(r.questions) ? r.questions : [],
            tips: r.tips || r.keyTips || ''
          }))
        );
      }
    } else {
      setCompanyName('');
      setJobTitle('');
      setExperienceTitle('');
      setOverallDifficulty('Medium');
      setExperienceType('Full-time');
      setInterviewMode('Online');
      setResult('Selected');
      setOverallExperience('');
      setPreparationTips('');
      setIsAnonymous(false);
      setSkills(['Java', 'DSA', 'SQL']);
      setTopics(['Binary Trees', 'Dynamic Programming']);
      setQuestionsAsked([]);
      setRounds([
        {
          roundNumber: 1,
          roundName: 'Online Assessment',
          roundType: 'Technical',
          difficulty: 'Medium',
          duration: 60,
          description: 'Online coding challenge on HackerRank / LeetCode style platform.',
          questions: ['Reverse a Linked List in K-groups', 'SQL join query'],
          tips: 'Practice speed and test edge cases.'
        }
      ]);
    }
  }, [initialData, isOpen]);

  // Skill tag add/remove
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Topic tag add/remove
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  // Question add/remove
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (questionInput.trim()) {
      setQuestionsAsked([...questionsAsked, questionInput.trim()]);
      setQuestionInput('');
    }
  };

  const handleRemoveQuestion = (idxToRemove) => {
    setQuestionsAsked(questionsAsked.filter((_, idx) => idx !== idxToRemove));
  };

  // Round management
  const handleAddRound = () => {
    const nextNumber = rounds.length + 1;
    setRounds([
      ...rounds,
      {
        roundNumber: nextNumber,
        roundName: `Round ${nextNumber} (Technical)`,
        roundType: 'Technical',
        difficulty: 'Medium',
        duration: 60,
        description: '',
        questions: [],
        tips: ''
      }
    ]);
  };

  const handleRemoveRound = (idx) => {
    if (rounds.length <= 1) {
      addToast({
        title: 'Validation Error',
        message: 'At least 1 interview round is recommended.',
        type: 'warning'
      });
      return;
    }
    const updated = rounds.filter((_, i) => i !== idx).map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setRounds(updated);
  };

  const handleRoundChange = (idx, field, value) => {
    const updated = [...rounds];
    updated[idx][field] = value;
    setRounds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      addToast({ title: 'Missing Information', message: 'Please specify the company name.', type: 'error' });
      return;
    }
    if (!jobTitle.trim()) {
      addToast({ title: 'Missing Information', message: 'Please specify the role/job title.', type: 'error' });
      return;
    }
    if (!experienceTitle.trim()) {
      addToast({ title: 'Missing Information', message: 'Please provide a descriptive experience title.', type: 'error' });
      return;
    }

    const payload = {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      experienceTitle: experienceTitle.trim(),
      overallDifficulty,
      experienceType,
      interviewMode,
      result,
      overallExperience: overallExperience.trim(),
      preparationTips: preparationTips.trim(),
      skills,
      topics,
      questionsAsked,
      rounds,
      isAnonymous
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Interview Experience' : 'Share Interview Experience'}
      subtitle="Help other candidates by sharing your interview process, questions asked, and preparation advice."
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Role & Company Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon, Google, Microsoft, Startup"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Title / Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. SDE-1, Backend Engineer, Product Manager"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Experience Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={experienceTitle}
              onChange={(e) => setExperienceTitle(e.target.value)}
              placeholder="e.g. Amazon SDE-1 Campus Placement Interview Experience"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={overallDifficulty}
                onChange={(e) => setOverallDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Very Hard">Very Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={experienceType}
                onChange={(e) => setExperienceType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Placement">Campus Placement</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mode
              </label>
              <select
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Result
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
              >
                <option value="Selected">Selected / Offered</option>
                <option value="Rejected">Rejected</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Pending">Pending</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Narrative & Preparation Tips */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Overall Experience & Preparation</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Overall Experience Summary
            </label>
            <textarea
              rows={3}
              value={overallExperience}
              onChange={(e) => setOverallExperience(e.target.value)}
              placeholder="Give a high-level overview of the interview process, rounds, and your overall candidate experience..."
              className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preparation Tips & Strategies
            </label>
            <textarea
              rows={3}
              value={preparationTips}
              onChange={(e) => setPreparationTips(e.target.value)}
              placeholder="What preparation resources, timelines, or practice advice helped you the most? What should candidates avoid?"
              className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Section 3: Skills & Topics Tags */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Skills & Topics Tested
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Skills */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Skills / Technologies
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                  placeholder="Add skill (e.g. Java, SQL)..."
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-xl"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Topics Covered
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic(e))}
                  placeholder="Add topic (e.g. Graphs, LLD)..."
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-xl"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(t)}
                      className="text-indigo-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Specific Questions Asked */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Questions Encountered
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion(e))}
              placeholder="e.g. Design a Rate Limiter, Reverse a Linked List..."
              className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-xl"
            >
              Add Question
            </button>
          </div>

          <div className="space-y-1.5">
            {questionsAsked.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 text-xs"
              >
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {idx + 1}. {q}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(idx)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Rounds Breakdown */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Interview Rounds Breakdown ({rounds.length})</span>
            </h3>

            <button
              type="button"
              onClick={handleAddRound}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Round</span>
            </button>
          </div>

          <div className="space-y-3">
            {rounds.map((round, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    Round {round.roundNumber}
                  </span>
                  {rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRound(idx)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove Round"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Round Name
                    </label>
                    <input
                      type="text"
                      value={round.roundName}
                      onChange={(e) => handleRoundChange(idx, 'roundName', e.target.value)}
                      placeholder="e.g. Technical Round 1 (Data Structures)"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={round.duration}
                      onChange={(e) => handleRoundChange(idx, 'duration', Number(e.target.value))}
                      placeholder="60"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Round Description & Questions Asked
                  </label>
                  <textarea
                    rows={2}
                    value={round.description}
                    onChange={(e) => handleRoundChange(idx, 'description', e.target.value)}
                    placeholder="Describe what was asked in this round..."
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Author Privacy Settings */}
        <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Share Anonymously</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When checked, your name and profile will be hidden and displayed as "Anonymous Candidate".
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Experience' : 'Publish Experience'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
