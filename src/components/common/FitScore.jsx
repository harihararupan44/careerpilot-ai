import React from 'react';
import { getFitScoreBadge } from '../../utils/formatters';

export default function FitScore({ score, size = 'md', showLabel = true }) {
  const badge = getFitScoreBadge(score);

  if (size === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-md border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}>
        <span>{score}%</span>
        {showLabel && <span className="text-[10px] opacity-80 font-normal">Match</span>}
      </span>
    );
  }

  if (size === 'circle') {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={badge.ringColor}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-800 dark:text-slate-100">
          {score}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}>
        {score}%
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${badge.textColor}`}>
          {badge.text}
        </span>
      )}
    </div>
  );
}
