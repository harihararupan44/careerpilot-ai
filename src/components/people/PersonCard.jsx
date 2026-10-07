import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Send,
  UserCheck,
  Briefcase,
  ArrowRight,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import SkillBadge from '../common/SkillBadge';

export default function PersonCard({ person, onRequestGuidance }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const personId = person.id || person.userId || person._id;
  const achievementText = person.placementJourney?.preparationDuration
    ? `Got placed after preparing for ${person.placementJourney.preparationDuration}`
    : person.headline || person.achievementSummary || (person.bio ? `"${person.bio.slice(0, 75)}..."` : 'Software Engineering Career Journey');

  return (
    <div className="flex flex-col justify-between p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-600/80 transition-all duration-200 group">
      <div className="space-y-3">
        {/* Row 1: Avatar, Name, Role & Company */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-700 transition-all"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm items-center justify-center shadow-xs ${
                person.avatar ? 'hidden' : 'flex'
              }`}
            >
              {getInitials(person.name)}
            </div>
            {person.availableForGuidance && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
                title="Available for Guidance"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              onClick={() => personId && navigate(`/people/${personId}`)}
              className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {person.name}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
              {person.role || person.targetRole || 'Software Engineer'} • <span className="text-indigo-600 dark:text-indigo-400 font-bold">{person.company || person.placementStatus || 'Student'}</span>
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate mt-0.5">
              <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{person.college || 'Engineering'}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Placement / Achievement Headline */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2 font-medium">
          {achievementText}
        </div>

        {/* Row 3: Key Skills */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {person.skills?.slice(0, 4).map((skill) => (
            <SkillBadge key={skill} name={skill} type="neutral" />
          ))}
          {person.skills?.length > 4 && (
            <span className="text-[10px] text-slate-400 font-semibold self-center px-1">
              +{person.skills.length - 4}
            </span>
          )}
        </div>

        {/* Row 4: Guidance Availability Badge */}
        <div className="pt-0.5">
          {person.availableForGuidance ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for guidance</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <span>Currently unavailable</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => personId && navigate(`/people/${personId}`)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>

        <button
          onClick={() => onRequestGuidance?.(person)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Request Guidance</span>
        </button>
      </div>
    </div>
  );
}
