import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Clock,
  Layers,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  Check,
  Share2,
  ArrowRight,
  Bot,
  Heart,
  ThumbsUp,
  AlertTriangle,
  Code2,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Info,
  Compass,
  Flame,
  Send,
  UserCheck,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { mockInterviewExperiences } from '../data/mockInterviewExperiences';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { interviewExperiencesApi } from '../services/api';
import SkillBadge from '../components/common/SkillBadge';
import EmptyState from '../components/common/EmptyState';
import ExperienceCard from '../components/interviews/ExperienceCard';
import CreateExperienceModal from '../components/interviews/CreateExperienceModal';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';

export default function InterviewExperienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated, user: currentUser } = useAuth();

  const [experience, setExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load experience data from API or fallback
  const loadExperience = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await interviewExperiencesApi.getExperience(id);
      if (res.success && res.data) {
        setExperience(res.data);
        setHelpfulCount(res.data.helpfulCount || 0);
        setIsHelpful(Boolean(res.data.isHelpful));
        setSelectedRoundIndex(0);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Could not load experience from backend API, checking fallback:', err);
    }

    // Fallback lookup
    const fallback = mockInterviewExperiences.find((e) => e.id === id || e._id === id);
    if (fallback) {
      setExperience(fallback);
      setHelpfulCount(fallback.helpfulCount || 100);
      setIsHelpful(false);
      setSelectedRoundIndex(0);
    } else {
      setExperience(null);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadExperience();
  }, [loadExperience]);

  const targetId = experience?._id || experience?.id || id;

  if (isLoading) {
    return (
      <div className="min-w-0 max-w-7xl mx-auto space-y-6 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Loading interview experience...
        </p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-w-0 max-w-5xl mx-auto space-y-6 py-6">
        <button
          onClick={() => navigate('/interviews')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interview Experiences</span>
        </button>

        <div className="py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center shadow-xs">
          <EmptyState
            title="Interview Experience Not Found"
            subtitle="The interview experience you are looking for does not exist or may have been moved."
            icon={FileQuestion}
          />
          <div className="mt-6">
            <button
              onClick={() => navigate('/interviews')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Experiences</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Related experiences
  const relatedExperiences = mockInterviewExperiences
    .filter((e) => e.id !== targetId && e._id !== targetId)
    .slice(0, 3);

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'hard':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'very hard':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'medium':
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const handleSave = () => {
    if (isSaved) {
      setIsSaved(false);
      addToast({
        title: 'Removed from saved.',
        message: `${experience.company || experience.companyName} (${experience.role || experience.jobTitle}) removed from bookmarks.`,
        type: 'info'
      });
    } else {
      setIsSaved(true);
      addToast({
        title: 'Interview experience saved.',
        message: `${experience.company || experience.companyName} (${experience.role || experience.jobTitle}) saved to your bookmarks.`,
        type: 'success'
      });
    }
  };

  const handleHelpful = async () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign in Required',
        message: 'Please log in to mark experiences as helpful.',
        type: 'info'
      });
      return;
    }

    try {
      const res = await interviewExperiencesApi.toggleHelpful(targetId);
      if (res.success) {
        setIsHelpful(res.helpful);
        setHelpfulCount(res.helpfulCount);
        addToast({
          title: res.helpful ? 'Marked as helpful.' : 'Removed helpful mark.',
          message: res.helpful ? 'Thank you for your feedback!' : 'Feedback updated.',
          type: res.helpful ? 'success' : 'info'
        });
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.message || 'Could not update helpful vote.',
        type: 'error'
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      title: 'Link copied.',
      message: 'Interview experience URL copied to your clipboard.',
      type: 'success'
    });
  };

  const handleEditSubmit = async (payload) => {
    try {
      const res = await interviewExperiencesApi.updateExperience(targetId, payload);
      if (res.success && res.data) {
        setExperience(res.data);
        addToast({
          title: 'Interview Experience Updated!',
          message: 'Your changes have been saved.',
          type: 'success'
        });
      }
    } catch (err) {
      addToast({
        title: 'Update Error',
        message: err.message || 'Could not update experience.',
        type: 'error'
      });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this interview experience? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await interviewExperiencesApi.deleteExperience(targetId);
      if (res.success) {
        addToast({
          title: 'Experience Deleted',
          message: 'Your interview experience has been removed.',
          type: 'success'
        });
        navigate('/interviews');
      }
    } catch (err) {
      addToast({
        title: 'Delete Error',
        message: err.message || 'Could not delete interview experience.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-w-0 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/interviews')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Interview Experiences</span>
        </button>

        <div className="flex items-center gap-2">
          {experience.isOwner && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
                title="Edit Experience"
              >
                <Edit className="w-3.5 h-3.5 text-indigo-500" />
                <span>Edit</span>
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/80 rounded-xl transition-colors shadow-2xs"
                title="Delete Experience"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
            title="Share Experience"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleHelpful}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
              isHelpful
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Helpful ({helpfulCount})</span>
          </button>

          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. TOP HEADER HERO */}
      <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                <Building2 className="w-3.5 h-3.5" />
                <span>{experience.company || experience.companyName}</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold">• {experience.year}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyBadge(experience.difficulty || experience.overallDifficulty)}`}>
                Difficulty: {experience.difficulty || experience.overallDifficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {experience.verdict || (experience.result === 'Selected' ? 'Offered' : experience.result) || 'Offered'}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {experience.title || experience.experienceTitle || `${experience.company || experience.companyName} ${experience.role || experience.jobTitle} Interview Experience`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {experience.summary || experience.overallExperience || experience.interviewProcess}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 md:pt-0">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rounds</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                {experience.numberOfRounds || experience.rounds?.length || 4} Rounds
              </span>
            </div>
          </div>
        </div>

        {/* Author Link Pill */}
        {experience.author && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div
              onClick={() => experience.author?.id && !experience.author?.isAnonymous && navigate(`/people/${experience.author.id}`)}
              className={`flex items-center gap-2.5 ${!experience.author?.isAnonymous && experience.author?.id ? 'cursor-pointer hover:text-indigo-600' : ''} transition-colors`}
            >
              <img
                src={experience.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                alt={experience.author.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Experience shared by <strong className={!experience.author?.isAnonymous ? 'underline underline-offset-2' : ''}>{experience.author.name}</strong> {!experience.author?.isAnonymous && experience.author?.company ? `(${experience.author.role} @ ${experience.author.company})` : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span>Prep Duration: <strong>{experience.preparationDuration || '5 months'}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interview Details, Timeline & Questions (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SELECTION PROCESS TIMELINE */}
          {experience.rounds && experience.rounds.length > 0 && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Selection Process & Rounds</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Round-by-round interview stages, format, and evaluation criteria.
                </p>
              </div>

              {/* Visual Round Timeline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {experience.rounds.map((round, idx) => {
                  const isSelected = selectedRoundIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedRoundIndex(idx)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-950 dark:text-indigo-200 shadow-xs ring-2 ring-indigo-500/10'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        Round {idx + 1}
                      </span>
                      <h4 className="font-bold text-xs truncate">
                        {round.name?.split(':')[0] || `Round ${idx + 1}`}
                      </h4>
                      <span className="text-[10px] text-slate-400 block truncate mt-1">
                        {round.duration || '60 mins'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Round Details Box */}
              {experience.rounds[selectedRoundIndex] && (
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {experience.rounds[selectedRoundIndex].name}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {experience.rounds[selectedRoundIndex].duration || '45-60 mins'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {experience.rounds[selectedRoundIndex].description}
                  </p>

                  {experience.rounds[selectedRoundIndex].keyTopics && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Topics Assessed:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {experience.rounds[selectedRoundIndex].keyTopics.map((topic, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* QUESTIONS ASKED */}
          {experience.questions && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  <span>Questions Asked in Interview</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Actual coding, system design, and behavioral questions encountered by candidate.
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-3 pt-1">
                {Array.isArray(experience.questions) ? (
                  experience.questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {typeof q === 'string' ? q : q.title || q.question}
                          </h4>
                          {q.approach && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              <strong>Approach / Strategy:</strong> {q.approach}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  Object.entries(experience.questions).map(([category, qList], cIdx) => (
                    <div key={cIdx} className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {category} Questions
                      </h4>
                      <div className="space-y-2">
                        {(Array.isArray(qList) ? qList : []).map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 text-xs text-slate-800 dark:text-slate-200"
                          >
                            <span className="font-semibold">{qIdx + 1}. </span>
                            <span>{typeof q === 'string' ? q : q.title || q.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* HOW THEY PREPARED */}
          {experience.preparationStrategy && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>How They Prepared</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Resources, timeline, and study methodology.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {experience.preparationStrategy}
              </div>
            </div>
          )}

          {/* TIPS & WHAT I WOULD DO DIFFERENTLY */}
          {(experience.tips || experience.mistakesToAvoid) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* What Helped */}
              <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>What Helped Most</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {(Array.isArray(experience.tips)
                    ? experience.tips
                    : [
                        'Practicing LeetCode top 150 problems by pattern.',
                        'Speaking thoughts out loud during live coding.',
                        'Using STAR format for behavioral questions.'
                      ]
                  ).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What I Would Do Differently */}
              <div className="p-5 bg-amber-50/40 dark:bg-amber-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/40 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>What I Would Do Differently</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {(Array.isArray(experience.mistakesToAvoid)
                    ? experience.mistakesToAvoid
                    : [
                        'Should have spent more time reviewing SQL query optimizations.',
                        'Need to test edge cases before telling interviewer code is complete.',
                        'Revise OS paging and virtual memory basics earlier.'
                      ]
                  ).map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Topics, Author & Similar Experiences (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* TOPICS COVERED */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Topics Covered
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(experience.technologies || experience.topics || ['DSA', 'Java', 'SQL', 'System Design', 'HR']).map(
                (topic) => (
                  <SkillBadge key={topic} name={topic} type="neutral" />
                )
              )}
            </div>
          </div>

          {/* AUTHOR CARD */}
          {experience.author && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Author & Guide
              </h3>

              <div className="flex items-center gap-3">
                <img
                  src={experience.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt={experience.author.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <h4
                    onClick={() => experience.author?.id && !experience.author?.isAnonymous && navigate(`/people/${experience.author.id}`)}
                    className={`font-bold text-sm text-slate-900 dark:text-slate-100 ${!experience.author?.isAnonymous && experience.author?.id ? 'hover:text-indigo-600 cursor-pointer' : ''} truncate`}
                  >
                    {experience.author.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {experience.author.isAnonymous
                      ? 'Community Contributor'
                      : `${experience.author.role || 'Software Engineer'} @ ${experience.author.company || experience.company || experience.companyName}`}
                  </p>
                </div>
              </div>

              {!experience.author.isAnonymous && experience.author.id && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => navigate(`/people/${experience.author.id}`)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition-colors text-center"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => setIsGuidanceModalOpen(true)}
                    className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs text-center flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Request Guidance</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SIMILAR INTERVIEW EXPERIENCES */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Similar Experiences
              </h3>
              <button
                onClick={() => navigate('/interviews')}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {relatedExperiences.map((exp) => {
                const expId = exp._id || exp.id;
                return (
                  <div
                    key={expId}
                    onClick={() => navigate(`/interviews/${expId}`)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {exp.company || exp.companyName} • {exp.role || exp.jobTitle}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        {exp.year}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {exp.summary || exp.overallExperience}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      <span>{exp.numberOfRounds || exp.rounds?.length || 4} Rounds</span>
                      <span className="flex items-center gap-0.5 hover:underline">
                        <span>Read</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={experience.author}
      />

      {/* Edit Experience Modal */}
      <CreateExperienceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={experience}
        isEditing={true}
      />
    </div>
  );
}
