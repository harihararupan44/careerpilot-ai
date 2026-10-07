import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-500">
      <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
    </div>
  );
}
