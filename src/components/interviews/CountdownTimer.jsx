import React, { useState, useEffect } from 'react';
import { getCountdownTime } from '../../utils/dateUtils';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ targetDate, compact = false }) {
  const [time, setTime] = useState(() => getCountdownTime(targetDate));

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      setTime(getCountdownTime(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || time.isPast) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
        <Clock className="w-3.5 h-3.5" />
        <span>Interview Concluded</span>
      </span>
    );
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
        <Clock className="w-3 h-3" />
        <span>{time.days}d {time.hours}h {time.minutes}m</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-xl border border-amber-200 dark:border-amber-900/50">
      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
      <div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
          Interview In
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 shadow-2xs">{time.days}d</span>
          <span>:</span>
          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 shadow-2xs">{time.hours}h</span>
          <span>:</span>
          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 shadow-2xs">{time.minutes}m</span>
          <span>:</span>
          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 shadow-2xs text-amber-600 dark:text-amber-400">{time.seconds}s</span>
        </div>
      </div>
    </div>
  );
}
