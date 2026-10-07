import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Layers,
  Users,
  UserCheck,
  Briefcase,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X
} from 'lucide-react';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/api';

export default function Notifications() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 15
      };
      if (onlyUnread) {
        params.isRead = false;
      }
      if (filterType !== 'ALL') {
        params.type = filterType;
      }

      const res = await notificationApi.getNotifications(params);
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      addToast({
        title: 'Error',
        message: error.message || 'Failed to load notifications',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page, onlyUnread, filterType, addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n._id === id || n.id === id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      addToast({
        title: 'Marked as Read',
        message: 'Notification marked as read',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        message: error.message || 'Failed to update notification',
        type: 'error'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      addToast({
        title: 'All Caught Up',
        message: 'All notifications marked as read',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        message: error.message || 'Failed to mark all as read',
        type: 'error'
      });
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
      addToast({
        title: 'Deleted',
        message: 'Notification removed',
        type: 'info'
      });
      fetchNotifications();
    } catch (error) {
      addToast({
        title: 'Error',
        message: error.message || 'Failed to delete notification',
        type: 'error'
      });
    }
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    try {
      await notificationApi.deleteAllRead();
      addToast({
        title: 'Cleared',
        message: 'All read notifications deleted',
        type: 'info'
      });
      fetchNotifications();
    } catch (error) {
      addToast({
        title: 'Error',
        message: error.message || 'Failed to clear read notifications',
        type: 'error'
      });
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id || notif.id);
    }

    if (notif.relatedEntityType === 'Application') {
      if (notif.relatedEntityId) {
        navigate(`/applications/${notif.relatedEntityId}`);
      } else {
        navigate('/applications');
      }
    } else if (notif.relatedEntityType === 'Interview') {
      if (notif.relatedEntityId) {
        navigate(`/interview/${notif.relatedEntityId}`);
      } else {
        navigate('/interviews');
      }
    } else if (notif.relatedEntityType === 'GuidanceRequest') {
      navigate('/guidance');
    } else if (notif.relatedEntityType === 'Connection') {
      navigate('/explore');
    } else if (notif.relatedEntityType === 'Job') {
      navigate(notif.relatedEntityId ? `/jobs/${notif.relatedEntityId}` : '/jobs');
    } else if (notif.relatedEntityType === 'Resume') {
      navigate('/resume');
    } else if (notif.relatedEntityType === 'Company') {
      navigate(notif.relatedEntityId ? `/companies/${notif.relatedEntityId}` : '/companies');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'APPLICATION_STATUS':
      case 'APPLICATION_DEADLINE':
      case 'APPLICATION_FOLLOWUP':
        return <Layers className="w-5 h-5 text-blue-500" />;
      case 'INTERVIEW_UPCOMING':
      case 'INTERVIEW_STATUS':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'GUIDANCE_REQUEST':
      case 'GUIDANCE_ACCEPTED':
      case 'GUIDANCE_REJECTED':
      case 'GUIDANCE_COMPLETED':
        return <UserCheck className="w-5 h-5 text-purple-500" />;
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
      case 'CONNECTION_REJECTED':
        return <Users className="w-5 h-5 text-indigo-500" />;
      case 'AI_RESULT':
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor((now - date) / (1000 * 60)));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filterTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'APPLICATION_STATUS', label: 'Applications' },
    { id: 'INTERVIEW_UPCOMING', label: 'Interviews' },
    { id: 'GUIDANCE_REQUEST', label: 'Guidance' },
    { id: 'CONNECTION_REQUEST', label: 'Connections' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Notifications & Reminders
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Stay updated with your career activities, interviews, deadlines, and community requests.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.some((n) => n.isRead) && (
            <button
              onClick={handleDeleteAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                filterType === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setOnlyUnread(!onlyUnread);
            setPage(1);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            onlyUnread
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          {onlyUnread ? 'Showing Unread Only' : 'Show Unread Only'}
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            You're all caught up!
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {onlyUnread || filterType !== 'ALL'
              ? 'No notifications match your current filter selection.'
              : 'You have no new notifications right now. Important application updates and reminders will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const notifId = notif._id || notif.id;
            return (
              <div
                key={notifId}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  !notif.isRead
                    ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-xs hover:border-indigo-400'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      !notif.isRead
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          !notif.isRead
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {notif.title}
                      </span>

                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}

                      {notif.priority === 'HIGH' && (
                        <span className="px-2 py-0.2 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          HIGH
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notif.createdAt)}
                      </span>

                      {notif.relatedEntityType && notif.relatedEntityType !== 'None' && (
                        <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-medium">
                          View {notif.relatedEntityType}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notifId, e)}
                      title="Mark as read"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDeleteNotification(notifId, e)}
                    title="Delete notification"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
