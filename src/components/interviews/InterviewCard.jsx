import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Sparkles, ArrowRight, Bot } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import CountdownTimer from './CountdownTimer';
import FitScore from '../common/FitScore';

export default function InterviewCard({ application }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={application.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
              alt={application.company}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {application.company}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {application.jobTitle}
              </p>
            </div>
          </div>
          <FitScore score={application.fitScore} size="compact" />
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatDate(application.interviewDate)} • {application.interviewRound || 'Technical Onsite'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{application.location}</span>
          </div>
        </div>

        <div className="mt-4">
          <CountdownTimer targetDate={application.interviewDate} />
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(`/mock-interview/${application.id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Mock Practice</span>
        </button>

        <button
          onClick={() => navigate(`/interview/${application.id}`)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl transition-all"
        >
          <span>Prep Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
