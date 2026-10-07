import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Calendar,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Layers
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import FitScore from '../common/FitScore';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

export default function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
}) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const statuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  // Helper to determine urgent attention indicators
  const getAttentionIndicator = () => {
    if (application.status === 'Interview' && application.interviewDate) {
      const interviewDate = new Date(application.interviewDate);
      const now = new Date();
      const diffDays = Math.ceil((interviewDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        type: 'interview',
        label: diffDays > 0 ? `Interview in ${diffDays} day${diffDays === 1 ? '' : 's'}` : 'Interview today',
        bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
        icon: Zap,
        actionUrl: `/interview/${application.id}`,
        actionText: 'Prepare'
      };
    }

    if (application.status === 'Assessment') {
      return {
        type: 'assessment',
        label: 'Assessment in progress',
        bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
        icon: Clock,
        actionUrl: `/applications/${application.id}`,
        actionText: 'Details'
      };
    }

    if (application.status === 'Offer') {
      return {
        type: 'offer',
        label: 'Offer received 🎉',
        bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
        icon: CheckCircle2,
        actionUrl: `/applications/${application.id}`,
        actionText: 'View offer'
      };
    }

    if (application.status === 'Rejected') {
      return {
        type: 'rejected',
        label: 'AI analysis available',
        bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
        icon: Sparkles,
        actionUrl: `/rejection/${application.id}`,
        actionText: 'Analyze'
      };
    }

    if (application.status === 'Applied' && application.applicationDate) {
      const appliedDate = new Date(application.applicationDate);
      const now = new Date();
      const diffDays = Math.floor((now - appliedDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 7) {
        return {
          type: 'followup',
          label: 'Follow-up suggested',
          bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80',
          icon: Clock,
          actionUrl: `/applications/${application.id}`,
          actionText: 'Follow up'
        };
      }
    }

    return null;
  };

  const attention = getAttentionIndicator();

  return (
    <div
      onClick={() => navigate(`/applications/${application.id}`)}
      className="group relative flex flex-col justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-600/80 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200"
    >
      <div>
        {/* Row 1: Company Logo, Name, Fit Score & Options Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={application.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
              alt={application.company}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200/80 dark:ring-slate-700/80 shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {application.company}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                {application.jobTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <FitScore score={application.fitScore} size="compact" showLabel={false} />

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Application Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-30 py-1 text-xs animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/applications/${application.id}`);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    View Details
                  </button>

                  {application.status === 'Interview' && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate(`/interview/${application.id}`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium"
                    >
                      Prepare for Interview
                    </button>
                  )}

                  {application.status === 'Rejected' && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate(`/rejection/${application.id}`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-medium"
                    >
                      Analyze Rejection
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Move Status
                  </div>

                  {statuses.map((s) => (
                    <button
                      key={s}
                      disabled={s.toLowerCase() === application.status.toLowerCase()}
                      onClick={() => {
                        setShowMenu(false);
                        onStatusChange?.(application.id, s);
                      }}
                      className={`w-full text-left px-3 py-1 text-xs ${
                        s.toLowerCase() === application.status.toLowerCase()
                          ? 'text-slate-400 bg-slate-50 dark:bg-slate-800/40 cursor-default font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete?.(application.id);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Application</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Location & Salary */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{application.location}</span>
          </div>
          {application.salary && (
            <div className="flex items-center gap-1 truncate text-slate-600 dark:text-slate-300 font-medium">
              <DollarSign className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{application.salary}</span>
            </div>
          )}
        </div>

        {/* Attention Indicator (if applicable) */}
        {attention && (
          <div className="mt-2.5">
            <div className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-[11px] font-medium ${attention.bg}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <attention.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{attention.label}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(attention.actionUrl);
                }}
                className="text-[10px] font-bold underline hover:opacity-80 shrink-0 ml-2"
              >
                {attention.actionText}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Date & Status Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-1 truncate">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{formatDate(application.applicationDate || application.deadline)}</span>
        </div>
        <StatusBadge status={application.status} size="sm" />
      </div>
    </div>
  );
}
