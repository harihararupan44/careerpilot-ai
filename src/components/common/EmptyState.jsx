import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description,
  subtitle,
  actionText,
  onAction,
}) {
  const displayDescription = subtitle || description || 'Try adjusting your filters or search terms to find what you are looking for.';
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
        {displayDescription}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
