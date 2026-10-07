import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  valueLabel,
  color = 'indigo',
  size = 'md',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorMap = {
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    amber: 'bg-gradient-to-r from-amber-500 to-amber-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    rose: 'bg-gradient-to-r from-rose-500 to-rose-600',
  };

  const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || valueLabel) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <span>{label}</span>
          <span className="font-semibold">{valueLabel || `${percentage}%`}</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${sizeMap[size] || sizeMap.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[color] || colorMap.indigo}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
