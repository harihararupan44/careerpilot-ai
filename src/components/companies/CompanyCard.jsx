import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  MessageSquare,
  Briefcase,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import SkillBadge from '../common/SkillBadge';

export default function CompanyCard({ company, onToggleSave }) {
  const navigate = useNavigate();
  // Ensure we use the real MongoDB _id as primary identifier
  const companyId = company._id || company.id;

  const handleNavigate = () => {
    console.log("Selected company:", company);
    console.log("Company ID:", companyId);
    navigate(`/companies/${companyId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'hard':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800';
      case 'medium-hard':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800';
      case 'medium':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800';
    }
  };

  const popularRoles = company.popularRoles || company.specializations || [];
  const commonSkills = company.commonSkills || company.skills || [];

  return (
    <div className="flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 group">
      <div className="space-y-4">
        {/* Header: Logo, Name, Industry, Hiring Type & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div 
              onClick={handleNavigate}
              className="w-13 h-13 rounded-2xl bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-200/80 dark:border-slate-700/80 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs cursor-pointer"
            >
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full rounded-xl bg-indigo-600 text-white font-extrabold text-base items-center justify-center ${
                  company.logo ? 'hidden' : 'flex'
                }`}
              >
                {company.name?.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="min-w-0">
              <h3
                onClick={handleNavigate}
                className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {company.name}
              </h3>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                {company.industry || 'Technology'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(company)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  company.isSaved
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600'
                }`}
                title={company.isSaved ? 'Remove from Saved' : 'Save Company'}
              >
                {company.isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyColor(
                company.difficulty
              )}`}
            >
              {company.difficulty || 'Medium'}
            </span>
          </div>
        </div>

        {/* Short Description */}
        {company.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {company.description}
          </p>
        )}

        {/* Stats Row: People Count, Interview Experiences Count, & Job Openings */}
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-indigo-100/70 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[9px] uppercase font-bold block truncate">Alumni</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold text-[11px] block truncate">
                {company.peopleCount || 0}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-violet-100/70 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[9px] uppercase font-bold block truncate">Interviews</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold text-[11px] block truncate">
                {company.interviewExperienceCount || 0}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[9px] uppercase font-bold block truncate">Jobs</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold text-[11px] block truncate">
                {company.jobCount || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Popular Roles */}
        {popularRoles.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span>Popular Roles:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularRoles.slice(0, 3).map((role) => (
                <span
                  key={role}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  {role}
                </span>
              ))}
              {popularRoles.length > 3 && (
                <span className="px-2 py-1 text-[10px] font-bold text-slate-400">
                  +{popularRoles.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Common Skills */}
        {commonSkills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Common Skills:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {commonSkills.slice(0, 5).map((skill) => (
                <SkillBadge key={skill} name={skill} type="neutral" />
              ))}
              {commonSkills.length > 5 && (
                <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                  +{commonSkills.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Button: View Details */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleNavigate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs group-hover:shadow-md cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
