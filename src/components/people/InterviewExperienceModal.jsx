import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Check,
  Briefcase
} from 'lucide-react';

export default function InterviewExperienceModal({ isOpen, onClose, experience, personName }) {
  const navigate = useNavigate();

  if (!experience) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={experience.title}
      subtitle={`Shared by ${personName || 'Candidate'} • ${experience.company} • ${experience.role}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Banner summary */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                {experience.company}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {experience.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                <Check className="w-3.5 h-3.5" />
                <span>{experience.verdict}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                Difficulty: {experience.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{experience.date}</span>
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Rating: {experience.overallRating} / 5.0</span>
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-3">
            {experience.summary}
          </p>
        </div>

        {/* Detailed Rounds */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interview Rounds Breakdown</span>
          </h4>

          <div className="space-y-3">
            {experience.rounds?.map((round, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h5 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {round.name}
                    </h5>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{round.outcome}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                  {round.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaways & Advice */}
        {experience.keyTakeaways && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                  Key Advice & Takeaways
                </h5>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                  {experience.keyTakeaways}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/interview/app-1');
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Practice for this Role</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

