import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function SkillBadge({ name, type = 'neutral', onRemove }) {
  const typeMap = {
    matched: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    missing: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
    neutral: 'bg-slate-100/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60',
    primary: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${typeMap[type] || typeMap.neutral}`}
    >
      {type === 'matched' && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />}
      {type === 'missing' && <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />}
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Remove skill"
        >
          ×
        </button>
      )}
    </span>
  );
}
