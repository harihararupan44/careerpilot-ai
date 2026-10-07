import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Clock,
  Layers,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { interviewExperiencesApi } from '../../services/api';
import SkillBadge from '../common/SkillBadge';

export default function ExperienceCard({ experience, onReadExperience }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(experience.helpfulCount || 0);
  const [hasLiked, setHasLiked] = useState(Boolean(experience.isHelpful));

  const targetId = experience._id || experience.id;

  useEffect(() => {
    setHelpfulCount(experience.helpfulCount || 0);
    setHasLiked(Boolean(experience.isHelpful));
  }, [experience]);

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

  const handleSave = (e) => {
    e.stopPropagation();
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

  const handleHelpful = async (e) => {
    e.stopPropagation();
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
        setHasLiked(res.helpful);
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

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (experience.author?.id && !experience.author?.isAnonymous) {
      navigate(`/people/${experience.author.id}`);
    }
  };

  const handleRead = () => {
    if (onReadExperience) {
      onReadExperience(experience);
    } else {
      navigate(`/interviews/${targetId}`);
    }
  };

  return (
    <div
      onClick={handleRead}
      className="flex flex-col justify-between p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-600/80 transition-all duration-200 group cursor-pointer"
    >
      <div className="space-y-3">
        {/* Row 1: Company, Role, Year & Difficulty */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {experience.company}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {experience.year}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {experience.role}
            </p>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getDifficultyBadge(
              experience.difficulty
            )}`}
          >
            {experience.difficulty}
          </span>
        </div>

        {/* Row 2: Stats (Rounds & Prep Time) */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{experience.numberOfRounds || 4} rounds</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Prep: {experience.preparationDuration || '5 months'}</span>
          </div>
        </div>

        {/* Row 3: Preparation Summary */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 italic">
          "{experience.summary}"
        </p>

        {/* Row 4: Topics / Tech Badges */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {(experience.technologies || experience.topics || ['DSA', 'Java', 'SQL', 'System Design'])
            .slice(0, 4)
            .map((t) => (
              <SkillBadge key={t} name={t} type="neutral" />
            ))}
        </div>

        {/* Row 5: Author Attribution */}
        {experience.author && (
          <div
            onClick={handleAuthorClick}
            className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
          >
            <img
              src={experience.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
              alt={experience.author.name}
              className="w-4 h-4 rounded-full object-cover shrink-0"
            />
            <span className="truncate">Shared by <strong className="font-semibold text-slate-600 dark:text-slate-300">{experience.author.name}</strong></span>
          </div>
        )}
      </div>

      {/* Row 6: Card Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <button
          onClick={handleRead}
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>Read Experience</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleHelpful}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              hasLiked
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
            title="Mark as helpful"
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{helpfulCount}</span>
          </button>

          <button
            onClick={handleSave}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-600 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save experience'}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
