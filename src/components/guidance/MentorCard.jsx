import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Send,
  UserCheck,
  Briefcase,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import SkillBadge from '../common/SkillBadge';

export default function MentorCard({ person, mentor, onRequestGuidance }) {
  const guide = mentor || person || {};
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayTopics =
    Array.isArray(guide.guidanceTopics) && guide.guidanceTopics.length > 0
      ? guide.guidanceTopics
      : [
          'DSA',
          'Resume Review',
          'Technical Interview',
          'Placement Preparation'
        ];

  const skills = Array.isArray(guide.skills) ? guide.skills : [];

  return (
    <div className="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 group">
      <div className="space-y-4">
        {/* Header: Avatar, Name, Role @ Company & Availability Badge */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            {guide.avatar ? (
              <img
                src={guide.avatar}
                alt={guide.name || 'Mentor'}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-400/40 transition-all"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-base items-center justify-center shadow-xs ${
                guide.avatar ? 'hidden' : 'flex'
              }`}
            >
              {getInitials(guide.name)}
            </div>
            {guide.availableForGuidance && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs"
                title="Available for Guidance"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              onClick={() => (guide.id || guide.userId || guide._id) && navigate(`/people/${guide.id || guide.userId || guide._id}`)}
              className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {guide.name || 'Anonymous Mentor'}
            </h3>

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
              {guide.role || 'Software Engineer'}{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                @ {guide.company || 'Tech Company'}
              </span>
            </p>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{guide.college || 'Engineering College'}</span>
            </div>
          </div>
        </div>

        {/* Availability Status Badge */}
        <div>
          {guide.availableForGuidance ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Guidance</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <span>Currently Busy</span>
            </span>
          )}
        </div>

        {/* Guidance Topics ("Can help with: ...") */}
        <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/70 dark:border-indigo-900/40 space-y-1">
          <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 block">
            Can help with:
          </span>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {displayTopics.join(' · ')}
          </p>
        </div>

        {/* Core Skills */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill) => (
              <SkillBadge key={skill} name={skill} type="neutral" />
            ))}
            {skills.length > 5 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-400">
                +{skills.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Request Guidance & View Profile */}
      <div className="grid grid-cols-2 gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => (guide.id || guide.userId || guide._id) && navigate(`/people/${guide.id || guide.userId || guide._id}`)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-colors cursor-pointer"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => onRequestGuidance && onRequestGuidance(guide)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Request Guidance</span>
        </button>
      </div>
    </div>
  );
}
