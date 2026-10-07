import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Zap,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import FitScore from '../common/FitScore';
import { formatDate } from '../../utils/formatters';

export default function ApplicationTable({
  applications,
  onStatusChange,
  onDelete,
}) {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!applications.length) {
    return null;
  }

  const statuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  return (
    <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-3.5 px-4 sm:px-6">Company & Role</th>
            <th className="py-3.5 px-4">Fit Score</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 hidden md:table-cell">Location & Salary</th>
            <th className="py-3.5 px-4 hidden sm:table-cell">Timeline / Attention</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
          {applications.map((app) => {
            const hasInterview = app.status === 'Interview' && app.interviewDate;

            return (
              <tr
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                {/* Company & Role */}
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={app.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
                      alt={app.company}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {app.company}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate font-normal">
                        {app.jobTitle}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Fit Score */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <FitScore score={app.fitScore} size="compact" />
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={app.status} size="sm" />
                </td>

                {/* Location & Salary */}
                <td className="py-3.5 px-4 hidden md:table-cell">
                  <div className="text-xs">
                    <div className="text-slate-700 dark:text-slate-200 truncate">{app.location}</div>
                    <div className="text-slate-400 text-[11px] truncate">{app.salary || 'Negotiable'}</div>
                  </div>
                </td>

                {/* Timeline / Attention */}
                <td className="py-3.5 px-4 hidden sm:table-cell text-xs">
                  {hasInterview ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                      <Zap className="w-3 h-3 text-amber-600" />
                      <span>Interview: {formatDate(app.interviewDate)}</span>
                    </div>
                  ) : app.status === 'Offer' ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                      <span>🎉 Offer in Hand</span>
                    </div>
                  ) : app.status === 'Rejected' ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      <span>AI Feedback Ready</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatDate(app.applicationDate || app.deadline)}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {app.status === 'Interview' && (
                      <button
                        onClick={() => navigate(`/interview/${app.id}`)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                      >
                        Prep
                      </button>
                    )}
                    {app.status === 'Rejected' && (
                      <button
                        onClick={() => navigate(`/rejection/${app.id}`)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                      >
                        Analyze
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
