import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  MapPin,
  Sparkles,
  Send,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  UserPlus,
  Check,
  ArrowLeft,
  ExternalLink,
  Code2,
  Award,
  BookOpen,
  Clock,
  Target,
  ChevronRight,
  MessageSquare,
  Share2,
  Globe,
  CheckCircle2,
  Layers,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import SkillBadge from '../components/common/SkillBadge';
import PersonCard from '../components/people/PersonCard';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import InterviewExperienceModal from '../components/people/InterviewExperienceModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useGuidance } from '../context/GuidanceContext';
import { peopleApi } from '../services/api';

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated, user: currentUser } = useAuth();
  const { sendGuidanceRequest } = useGuidance();

  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [connectionState, setConnectionState] = useState({ status: 'none', connectionId: null });
  const [person, setPerson] = useState(null);
  const [similarPeopleList, setSimilarPeopleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Load public profile and connection status from backend
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch public profile
        const res = await peopleApi.getPublicProfile(id);
        if (res && res.success && res.person && isMounted) {
          setPerson(res.person);
        } else if (res && res.data && isMounted) {
          setPerson(res.data);
        }

        // 2. Fetch connection status if authenticated
        if (isAuthenticated) {
          try {
            const statusRes = await peopleApi.getConnectionStatus(id);
            if (statusRes && statusRes.success && isMounted) {
              setConnectionState({
                status: statusRes.status,
                connectionId: statusRes.connectionId
              });
            }
          } catch (e) {
            console.warn('Status check note:', e.message);
          }
        }

        // 3. Load similar people
        try {
          const simRes = await peopleApi.getPeople({ limit: 4 });
          const list = Array.isArray(simRes.data) ? simRes.data : (Array.isArray(simRes.people) ? simRes.people : []);
          if (isMounted) {
            setSimilarPeopleList(list.filter(p => (p.id || p._id) !== id).slice(0, 3));
          }
        } catch (simErr) {
          console.warn('Similar people note:', simErr.message);
        }
      } catch (err) {
        console.warn('Could not load profile from backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfileData();
    return () => { isMounted = false; };
  }, [id, isAuthenticated]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-w-0 max-w-7xl mx-auto space-y-6 py-16 flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Loading profile...
        </p>
      </div>
    );
  }

  // Invalid profile fallback
  if (!person) {
    return (
      <div className="min-w-0 max-w-5xl mx-auto space-y-6 py-6">
        <button
          onClick={() => navigate('/explore')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore People</span>
        </button>

        <div className="py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <UserX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Profile not found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Sorry, we couldn't find this career profile.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore People</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Connection Actions
  const handleConnectAction = async () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign in Required',
        message: 'Please log in to connect with peers.',
        type: 'info'
      });
      return;
    }

    const currentStatus = connectionState.status;

    try {
      if (currentStatus === 'none' || currentStatus === 'rejected') {
        // Send connection request
        const res = await peopleApi.connect(person.id || person.userId || id);
        if (res.success) {
          setConnectionState({
            status: 'pending_sent',
            connectionId: res.connection?.id || res.connection?._id
          });
          addToast({
            title: 'Connection Request Sent',
            message: `Your connection request has been sent to ${person.name}.`,
            type: 'success'
          });
        }
      } else if (currentStatus === 'pending_sent') {
        // Cancel pending sent request
        if (connectionState.connectionId) {
          await peopleApi.cancelRequest(connectionState.connectionId);
        }
        setConnectionState({ status: 'none', connectionId: null });
        addToast({
          title: 'Request Cancelled',
          message: `Connection request to ${person.name} was cancelled.`,
          type: 'info'
        });
      } else if (currentStatus === 'pending_received') {
        // Accept pending received request
        if (connectionState.connectionId) {
          await peopleApi.acceptRequest(connectionState.connectionId);
        }
        setConnectionState({ status: 'connected', connectionId: connectionState.connectionId });
        addToast({
          title: 'Connection Accepted',
          message: `You are now connected with ${person.name}!`,
          type: 'success'
        });
      } else if (currentStatus === 'connected') {
        // Remove connection
        await peopleApi.removeConnection(connectionState.connectionId || person.id || id);
        setConnectionState({ status: 'none', connectionId: null });
        addToast({
          title: 'Connection Removed',
          message: `Connection with ${person.name} was removed.`,
          type: 'info'
        });
      }
    } catch (err) {
      addToast({
        title: 'Connection Error',
        message: err.message || 'Could not process connection action.',
        type: 'error'
      });
    }
  };

  const handleRejectReceived = async () => {
    try {
      if (connectionState.connectionId) {
        await peopleApi.rejectRequest(connectionState.connectionId);
      }
      setConnectionState({ status: 'none', connectionId: null });
      addToast({
        title: 'Request Rejected',
        message: 'Connection request rejected.',
        type: 'info'
      });
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.message || 'Could not reject request.',
        type: 'error'
      });
    }
  };

  // Handle Save Profile toggle
  const handleSaveProfile = () => {
    if (isSaved) {
      setIsSaved(false);
      addToast({
        title: 'Profile removed.',
        message: `${person.name}'s profile was removed from your saved list.`,
        type: 'info'
      });
    } else {
      setIsSaved(true);
      addToast({
        title: 'Profile saved.',
        message: `${person.name}'s profile has been saved to your bookmarks.`,
        type: 'success'
      });
    }
  };

  // Handle Share Profile
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      title: 'Link copied.',
      message: 'Profile URL copied to your clipboard.',
      type: 'success'
    });
  };

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // 3 Related people for "People With Similar Career Paths"
  const similarPeople = similarPeopleList;

  const headline =
    person.headline ||
    person.achievementSummary ||
    (person.bio ? `"${person.bio.slice(0, 120)}..."` : 'Placed through structured preparation and technical mentorship.');

  return (
    <div className="min-w-0 max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Navigation Bar / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/explore')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Explore People</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
            title="Share Profile"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleSaveProfile}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. COMPACT PROFILE HEADER */}
      <div className="p-5 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            <div className="relative shrink-0">
              {person.avatar ? (
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xl items-center justify-center shadow-xs ${
                  person.avatar ? 'hidden' : 'flex'
                }`}
              >
                {getInitials(person.name)}
              </div>
              {person.availableForGuidance && (
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
                  title="Available for Guidance"
                />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {person.name}
                </h1>
                {person.availableForGuidance ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Available for guidance</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <span>Currently unavailable</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {person.role} at <span className="text-indigo-600 dark:text-indigo-400 font-bold">{person.company}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{person.college}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{person.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 pt-2 md:pt-0">
            {connectionState.status !== 'self' && (
              <>
                {connectionState.status === 'pending_received' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConnectAction}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-98 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={handleRejectReceived}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-98"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-500" />
                      <span>Decline</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectAction}
                    className={`flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-98 shadow-2xs ${
                      connectionState.status === 'connected'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 group'
                        : connectionState.status === 'pending_sent'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 group'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {connectionState.status === 'connected' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500 group-hover:hidden" />
                        <UserX className="w-3.5 h-3.5 text-rose-500 hidden group-hover:inline" />
                        <span className="group-hover:hidden">Connected</span>
                        <span className="hidden group-hover:inline">Remove Connection</span>
                      </>
                    ) : connectionState.status === 'pending_sent' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-500 group-hover:hidden" />
                        <UserX className="w-3.5 h-3.5 text-rose-500 hidden group-hover:inline" />
                        <span className="group-hover:hidden">Request Sent</span>
                        <span className="hidden group-hover:inline">Cancel Request</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setIsGuidanceModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Guidance</span>
            </button>
          </div>
        </div>

        {/* Short Achievement Headline */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
          "{headline}"
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Story & Achievements (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CAREER JOURNEY TIMELINE */}
          {person.careerJourney && person.careerJourney.length > 0 && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Career Journey</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Milestones and preparation path from college to placement.
                </p>
              </div>

              {/* Step Timeline */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {person.careerJourney.map((step, idx) => {
                  const isCurrent = step.status === 'current' || idx === person.careerJourney.length - 1;
                  return (
                    <div key={idx} className="relative group">
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 border-white dark:border-slate-900 ring-2 ring-indigo-100 dark:ring-indigo-950 shadow-xs'
                            : 'bg-emerald-500 border-white dark:border-slate-900'
                        }`}
                      >
                        {isCurrent ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        ) : (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        )}
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {step.title}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {step.description}
                        </p>
                        {step.keyAchievement && (
                          <div className="pt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{step.keyAchievement}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CAREER ACHIEVEMENT / HOW I GOT PLACED */}
          {person.placementJourney && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span>Career Achievement & Placement</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Selection criteria and preparation breakdown.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company</span>
                  <span className="font-bold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                    {person.placementJourney.company || person.company}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Role</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {person.placementJourney.role || person.role}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Preparation Duration</span>
                  <span className="font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                    {person.placementJourney.preparationDuration || '6 Months'}
                  </span>
                </div>
              </div>

              {person.placementJourney.selectionProcess && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                    Selection Process
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {person.placementJourney.selectionProcess}
                  </p>
                </div>
              )}

              {person.placementJourney.preparationStrategy && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 text-[10px] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Preparation Strategy</span>
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {person.placementJourney.preparationStrategy}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SKILLS SECTION */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Skills Matrix</span>
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                {person.skills?.length || 0} skills
              </span>
            </div>

            {person.skillsByCategory ? (
              <div className="space-y-3 pt-1">
                {person.skillsByCategory.languages && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Programming Languages
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {person.skillsByCategory.languages.map((s) => (
                        <SkillBadge key={s} name={s} type="primary" />
                      ))}
                    </div>
                  </div>
                )}

                {person.skillsByCategory.frameworks && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Frameworks & Technologies
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {person.skillsByCategory.frameworks.map((s) => (
                        <SkillBadge key={s} name={s} type="neutral" />
                      ))}
                    </div>
                  </div>
                )}

                {person.skillsByCategory.fundamentals && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      CS Fundamentals
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {person.skillsByCategory.fundamentals.map((s) => (
                        <SkillBadge key={s} name={s} type="matched" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {person.skills?.map((s) => (
                  <SkillBadge key={s} name={s} type="neutral" />
                ))}
              </div>
            )}
          </div>

          {/* PROJECTS SECTION */}
          {person.projects && person.projects.length > 0 && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span>Projects</span>
                </h2>
                <span className="text-xs text-slate-400 font-semibold">
                  {person.projects.length} featured
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {person.projects.map((project, idx) => {
                  const title = project.title || project.name || `Project ${idx + 1}`;
                  const techs = Array.isArray(project.technologies)
                    ? project.technologies
                    : Array.isArray(project.techStack)
                    ? project.techStack
                    : [];
                  const githubUrl = project.githubUrl || project.github;
                  const demoUrl = project.liveUrl || project.demo;

                  return (
                    <div
                      key={project.id || project._id || idx}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {githubUrl && (
                            <a
                              href={githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                            >
                              <Code2 className="w-3 h-3" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {demoUrl && (
                            <a
                              href={demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Demo</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      {techs.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {techs.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INTERVIEW EXPERIENCES */}
          {person.interviewExperiences && person.interviewExperiences.length > 0 && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>Interview Experiences</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real candidate accounts and round strategy shared by {person.name}.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/interviews')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline hidden sm:block"
                >
                  View all experiences →
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {person.interviewExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {exp.title || `${exp.role} Interview Experience`}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {exp.company} • {exp.role} • {exp.year || exp.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {exp.verdict || 'Offered'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Difficulty: {exp.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {exp.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {exp.numberOfRounds || exp.rounds?.length || 4} Rounds
                      </span>
                      <button
                        onClick={() => {
                          setSelectedExperience(exp);
                          setIsExperienceModalOpen(true);
                        }}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>Read Experience</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Guidance, Links & Similar People (1 col) */}
        <div className="space-y-6">
          {/* SECTION: HOW I CAN HELP (GUIDANCE) */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>How I Can Help</span>
              </h3>
              {person.availableForGuidance ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Available</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <span>Unavailable</span>
                </span>
              )}
            </div>

            {person.availableForGuidance ? (
              <>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Available for 1:1 guidance on placement prep, technical interview roadmaps, and resume reviews.
                </p>

                {person.guidanceTopics && person.guidanceTopics.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Guidance Topics:
                    </h4>
                    <div className="space-y-1.5">
                      {person.guidanceTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsGuidanceModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Guidance</span>
                </button>
              </>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-1.5">
                <AlertCircle className="w-5 h-5 mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Currently unavailable for guidance
                </p>
                <p className="text-[11px] text-slate-400">
                  {person.name} is currently focusing on internal projects.
                </p>
              </div>
            )}
          </div>

          {/* PROFESSIONAL LINKS */}
          {((person.socials?.linkedin || person.linkedin) || (person.socials?.github || person.github) || person.portfolio) && (
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Professional Links
              </h3>
              <div className="space-y-2">
                {(person.socials?.linkedin || person.linkedin) && (
                  <a
                    href={person.socials?.linkedin || person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      <span>LinkedIn</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}

                {(person.socials?.github || person.github) && (
                  <a
                    href={person.socials?.github || person.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>GitHub</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}

                {person.portfolio && (
                  <a
                    href={person.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Portfolio</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* PEOPLE WITH SIMILAR CAREER PATHS */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Similar Career Paths
            </h3>

            <div className="space-y-3">
              {similarPeople.map((simPerson) => (
                <PersonCard
                  key={simPerson.id || simPerson.userId || simPerson._id}
                  person={simPerson}
                  onRequestGuidance={(p) => navigate(`/people/${p.id || p.userId || p._id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={person}
        onSubmitRequest={async (newRequestData) => {
          await sendGuidanceRequest(newRequestData);
        }}
      />

      {/* Interview Experience Modal */}
      <InterviewExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => {
          setIsExperienceModalOpen(false);
          setSelectedExperience(null);
        }}
        experience={selectedExperience}
        personName={person.name}
      />
    </div>
  );
}
