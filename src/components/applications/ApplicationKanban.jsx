import React, { useState } from 'react';
import ApplicationCard from './ApplicationCard';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import { getStatusConfig } from '../../utils/formatters';

export default function ApplicationKanban({
  applications,
  onStatusChange,
  onDelete,
  onOpenAddModal,
}) {
  const [activeMobileColumn, setActiveMobileColumn] = useState('all');

  const columns = [
    { id: 'Saved', title: 'Saved' },
    { id: 'Applied', title: 'Applied' },
    { id: 'Assessment', title: 'Assessment' },
    { id: 'Interview', title: 'Interview' },
    { id: 'Offer', title: 'Offer' },
    { id: 'Rejected', title: 'Rejected' },
    { id: 'Withdrawn', title: 'Withdrawn' },
  ];

  // Filter columns for mobile if a single column is selected
  const displayedColumns = activeMobileColumn === 'all'
    ? columns
    : columns.filter((c) => c.id.toLowerCase() === activeMobileColumn.toLowerCase());

  return (
    <div className="space-y-4">
      {/* Mobile-Only Stage Selector Tabs */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          onClick={() => setActiveMobileColumn('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            activeMobileColumn === 'all'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Stages ({applications.length})
        </button>

        {columns.map((col) => {
          const count = applications.filter((a) => a.status.toLowerCase() === col.id.toLowerCase()).length;
          const statusConfig = getStatusConfig(col.id);
          const isSelected = activeMobileColumn.toLowerCase() === col.id.toLowerCase();

          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileColumn(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
              <span>{col.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isSelected ? 'bg-white/20 dark:bg-slate-900/20 text-current' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[60vh] scroll-smooth">
        {displayedColumns.map((col) => {
          const colApps = applications.filter(
            (a) => a.status.toLowerCase() === col.id.toLowerCase()
          );
          const statusConfig = getStatusConfig(col.id);

          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-72 sm:w-80 flex flex-col bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 max-h-[82vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor}`} />
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {col.title}
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {colApps.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenAddModal?.(col.id)}
                  title={`Add application to ${col.title}`}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                {colApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))}

                {/* Empty State per Column */}
                {colApps.length === 0 && (
                  <div className="py-8 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/30">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      No applications here yet
                    </p>
                    <button
                      onClick={() => onOpenAddModal?.(col.id)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add application</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
