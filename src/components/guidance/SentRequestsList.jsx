import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  ArrowRight,
  MessageSquare,
  Building2,
  Briefcase,
  Calendar,
  Sparkles,
  Inbox,
  Ban,
  Award
} from 'lucide-react';
import SkillBadge from '../common/SkillBadge';

export default function SentRequestsList({
  requests = [],
  onExploreClick,
  onCancel,
  onComplete
}) {
  const navigate = useNavigate();

  if (requests.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          No guidance requests yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 mb-6">
          You haven't requested mentorship or career guidance from any alumni or professionals yet.
        </p>
        <button
          onClick={onExploreClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <span>Discover Mentors</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Accepted</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
            <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Ban className="w-3.5 h-3.5 text-slate-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Declined</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
            <span>Pending Response</span>
          </span>
        );
    }
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const reqId = req.id || req._id;
        const isPending = req.status === 'Pending';
        const isAccepted = req.status === 'Accepted';

        return (
          <div
            key={reqId}
            className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            {/* Header row: Mentor & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  {req.mentorAvatar ? (
                    <img
                      src={req.mentorAvatar}
                      alt={req.mentorName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm items-center justify-center shadow-xs ${
                      req.mentorAvatar ? 'hidden' : 'flex'
                    }`}
                  >
                    {getInitials(req.mentorName)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      onClick={() => req.mentorId && navigate(`/people/${req.mentorId}`)}
                      className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      {req.mentorName}
                    </h4>
                    {req.mentorId && (
                      <button
                        onClick={() => navigate(`/people/${req.mentorId}`)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {req.mentorRole} <span className="font-semibold text-indigo-600 dark:text-indigo-400">@ {req.mentorCompany}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Sent {req.date || req.dateSent}</span>
                </div>
                {getStatusBadge(req.status)}
              </div>
            </div>

            {/* Target details and Requested Topics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Target Role & Company
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {req.targetRole || 'Software Development'} <span className="text-slate-400">at</span> {req.targetCompany || req.mentorCompany}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Requested Guidance Topics
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {req.topics && req.topics.length > 0 ? (
                    req.topics.map((t) => (
                      <SkillBadge key={t} name={t} type="specialized" />
                    ))
                  ) : req.topic ? (
                    <SkillBadge name={req.topic} type="specialized" />
                  ) : (
                    <span className="text-slate-400 text-xs">General Guidance</span>
                  )}
                </div>
              </div>
            </div>

            {/* User's Message */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Your Message:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{req.message}"
              </p>
            </div>

            {/* Status Note or Next Action */}
            {req.statusNote && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start justify-between gap-3 ${
                  req.status === 'Accepted'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60'
                    : req.status === 'Rejected'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200/60 dark:border-rose-800/60'
                    : req.status === 'Completed'
                    ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-bold block">Status Note:</span>
                  <p className="opacity-90">{req.statusNote}</p>
                </div>
              </div>
            )}

            {/* Actions: Cancel Request (if Pending) / Mark Completed (if Accepted) */}
            {(isPending || isAccepted) && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {isPending && onCancel && (
                  <button
                    type="button"
                    onClick={() => onCancel(reqId)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Request
                  </button>
                )}

                {isAccepted && onComplete && (
                  <button
                    type="button"
                    onClick={() => onComplete(reqId)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
