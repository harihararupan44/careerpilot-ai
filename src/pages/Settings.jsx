import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import Card from '../components/common/Card';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState({
    interviewReminders: true,
    weeklyDigest: true,
    rejectionInsights: true,
    scoreUpdates: true,
  });

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    addToast({ title: 'Preferences Updated', message: 'Notification settings saved.', type: 'info' });
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "careerpilot_data_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({ title: 'Data Exported', message: 'Downloaded JSON backup of your tracked pipeline.', type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Account & App Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize notifications, theme preferences, privacy settings, and data exports.
        </p>
      </div>

      {/* Theme Settings */}
      <Card title="Interface Theme" subtitle="Switch between modern light and dark modes">
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                Current Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <span className="text-[11px] text-slate-500">Optimized contrast and eye ergonomics</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card title="Notification Preferences" subtitle="Manage alerts for upcoming interviews & deadlines">
        <div className="space-y-3">
          {[
            { key: 'interviewReminders', title: 'Interview Countdown Alerts', desc: 'Notify 24 hours and 1 hour before scheduled interviews' },
            { key: 'rejectionInsights', title: 'Rejection Analysis Reports', desc: 'Generate instant AI gap diagnosis when an application moves to Rejected' },
            { key: 'weeklyDigest', title: 'Weekly Pipeline Digest', desc: 'Weekly email summary of callback rates and high-fit job matches' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">{item.title}</span>
                <span className="text-[11px] text-slate-500">{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={() => handleToggleNotification(item.key)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy & Data Management */}
      <Card title="Privacy & Data Management" subtitle="Your data is stored locally and securely">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">Export All Pipeline Data</span>
              <span className="text-[11px] text-slate-500">Download a complete JSON archive of your applications, notes, and fit scores</span>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-white dark:bg-slate-900 border rounded-xl hover:bg-indigo-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
