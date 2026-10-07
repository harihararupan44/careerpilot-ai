import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Bot,
  ShieldAlert,
  Edit3,
  CheckCircle2,
  Clock,
  FileText,
  Save,
  Trash2,
  Users,
  BookOpen,
  ArrowRight,
  Send,
  Sparkles,
  Video,
  AlertCircle
} from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';
import { useGuidance } from '../context/GuidanceContext';
import { applicationApi } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import FitScore from '../components/common/FitScore';
import SkillBadge from '../components/common/SkillBadge';
import Card from '../components/common/Card';
import CountdownTimer from '../components/interviews/CountdownTimer';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import { mockPeople } from '../data/mockPeople';
import { mockInterviewExperiences } from '../data/mockInterviewExperiences';
import { formatDate } from '../utils/formatters';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getApplicationById, mapBackendAppToView, updateNotes, changeStatus, deleteApplication } = useApplications();
  const { sendGuidanceRequest } = useGuidance();

  const contextApp = getApplicationById(id);
  const [liveApp, setLiveApp] = useState(null);
  const application = liveApp || contextApp;

  const [notes, setNotes] = useState(application?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [selectedPersonForGuidance, setSelectedPersonForGuidance] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Fetch latest application data from API on mount / ID change
  useEffect(() => {
    let isMounted = true;
    const fetchLatestApp = async () => {
      if (!id || String(id).startsWith('app-')) return;
      try {
        const res = await applicationApi.getApplicationById(id);
        if (res?.success && res?.application && isMounted) {
          const mapped = mapBackendAppToView ? mapBackendAppToView(res.application) : res.application;
          setLiveApp(mapped);
          if (res.application.notes) {
            setNotes(res.application.notes);
          }
        }
      } catch (err) {
        console.warn('Could not fetch single application detail directly from API, using context fallback:', err);
      }
    };

    fetchLatestApp();
    return () => {
      isMounted = false;
    };
  }, [id, mapBackendAppToView]);

  // Keep notes state synced when application changes
  useEffect(() => {
    if (application?.notes !== undefined) {
      setNotes(application.notes || '');
    }
  }, [application?.notes]);

  // Relevant people matching application company or general role
  const relevantPeople = useMemo(() => {
    if (!application) return [];
    const directMatches = mockPeople.filter(
      (p) => p.company?.toLowerCase() === application.company?.toLowerCase()
    );
    if (directMatches.length > 0) return directMatches.slice(0, 3);

    // If company not direct match, provide matching role/skills alumni
    return mockPeople.slice(0, 3);
  }, [application]);

  // Related interview experiences matching company
  const relatedExperiences = useMemo(() => {
    if (!application) return [];
    const directMatches = mockInterviewExperiences.filter(
      (e) => e.company?.toLowerCase() === application.company?.toLowerCase()
    );
    if (directMatches.length > 0) return directMatches.slice(0, 3);

    // Fallback to top related experiences
    return mockInterviewExperiences.slice(0, 3);
  }, [application]);

  if (!application) {
    return (
      <div className="min-w-0 max-w-5xl mx-auto space-y-6 py-6">
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Application Tracker</span>
        </button>

        <div className="py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Application Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            The application you are trying to view does not exist or has been removed.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/applications')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Application Tracker</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveNotes = () => {
    updateNotes(application.id || application._id, notes);
    setIsEditingNotes(false);
    if (liveApp) {
      setLiveApp(prev => ({ ...prev, notes }));
    }
  };

  const handleStatusChange = (newStatus) => {
    changeStatus(application.id || application._id, newStatus);
    if (liveApp) {
      setLiveApp(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleOpenGuidance = (person) => {
    setSelectedPersonForGuidance(person);
    setIsGuidanceModalOpen(true);
  };

  const handleGuidanceSubmit = (newRequestData) => {
    sendGuidanceRequest({
      mentorId: selectedPersonForGuidance?.id,
      mentorName: selectedPersonForGuidance?.name,
      mentorRole: selectedPersonForGuidance?.role,
      mentorCompany: selectedPersonForGuidance?.company || application.company,
      mentorAvatar: selectedPersonForGuidance?.avatar,
      targetCompany: newRequestData.targetCompany || application.company,
      targetRole: newRequestData.targetRole || application.jobTitle,
      topics: newRequestData.topics,
      message: newRequestData.message
    });
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'hard':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'medium-hard':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'medium':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  const formatInterviewDate = (d) => {
    if (!d) return 'Date TBD';
    try {
      return new Date(d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return formatDate(d);
    }
  };

  const formatInterviewTime = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const statuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
  const hasInterview = Boolean(application.status === 'Interview' || application.scheduledDate || application.interviewDate);
  const interviewScheduledDate = application.scheduledDate || application.interviewDate || null;

  return (
    <div className="space-y-6">
      {/* Back Button & Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status Changer Dropdown */}
          <select
            value={application.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {application.status === 'Interview' && (
            <button
              onClick={() => navigate(`/interview/${application.id || application._id}`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Prepare for Interview</span>
            </button>
          )}

          {application.status === 'Rejected' && (
            <button
              onClick={() => navigate(`/rejection/${application.id || application._id}`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Analyze Rejection</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={application.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
              alt={application.company}
              className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {application.jobTitle}
                </h1>
                <StatusBadge status={application.status} size="sm" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                {application.company}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {application.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> {application.salary}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Applied on {formatDate(application.appliedDate || application.applicationDate)}
                </span>
                {interviewScheduledDate && (
                  <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                    <Clock className="w-3.5 h-3.5" /> Interview: {formatInterviewDate(interviewScheduledDate)} {formatInterviewTime(interviewScheduledDate) && `at ${formatInterviewTime(interviewScheduledDate)}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FitScore score={application.fitScore} size="circle" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Left Details, Right Timeline/Interview/Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Skills Match & JD */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Breakdown */}
          <Card title="Skills Compatibility Diagnosis">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                  Matching Skills ({application.matchingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {application.matchingSkills?.map((s) => (
                    <SkillBadge key={s} name={s} type="matched" />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-2">
                  Missing Skills ({application.missingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {application.missingSkills?.map((s) => (
                    <SkillBadge key={s} name={s} type="missing" />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Job Description */}
          <Card title="Job Description & Responsibilities">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {application.jobDescription}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Interview Details, Timeline & Notes */}
        <div className="space-y-6">
          {/* Dedicated Interview Details Card */}
          {hasInterview && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-500" />
                  <span>Interview Details</span>
                </div>
              }
              action={
                interviewScheduledDate ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    {application.interviewStatus || 'Upcoming'}
                  </span>
                ) : null
              }
            >
              <div className="space-y-4">
                {interviewScheduledDate ? (
                  <>
                    {/* Date & Time Highlight Box */}
                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>{formatInterviewDate(interviewScheduledDate)}</span>
                        </div>
                        {formatInterviewTime(interviewScheduledDate) && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{formatInterviewTime(interviewScheduledDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                        <span className="text-slate-500 dark:text-slate-400">Interview Type:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 px-2 py-0.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs border border-amber-200/60 dark:border-amber-900/40">
                          {application.interviewType || 'Technical'} Round
                        </span>
                      </div>

                      {(application.interviewLocation || application.location) && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Location / Platform:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate max-w-[170px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{application.interviewLocation || application.location}</span>
                          </span>
                        </div>
                      )}

                      {application.meetingUrl && (
                        <div className="pt-2">
                          <a
                            href={application.meetingUrl.startsWith('http') ? application.meetingUrl : `https://${application.meetingUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Video Meeting</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Live Countdown */}
                    <CountdownTimer targetDate={interviewScheduledDate} />

                    {/* Preparation Action Button */}
                    <button
                      onClick={() => navigate(`/interview/${application.id || application._id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/80 rounded-xl border border-amber-300 dark:border-amber-800 transition-all shadow-xs"
                    >
                      <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Prepare for This Interview</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </>
                ) : (
                  /* If status is Interview but scheduledDate is missing/empty */
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Interview Not Scheduled Yet
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Application status is set to Interview. Specific scheduled date and time will appear here once confirmed.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/interview/${application.id || application._id}`)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Start AI Practice Session</span>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Application Timeline */}
          <Card title="Application Timeline">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {application.timeline?.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${item.status?.includes('Interview') ? 'bg-amber-500' : 'bg-indigo-600'} ring-4 ring-white dark:ring-slate-900`} />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.status}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Editable Notes Section */}
          <Card
            title="Candidate Notes"
            action={
              isEditingNotes ? (
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )
            }
          >
            {isEditingNotes ? (
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
              />
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "{notes || 'No notes added yet. Click edit to record recruiter names, interview insights, or follow-up dates.'}"
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Community Feature 1: Learn From People Who Got This Role */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Learn From People Who Got This Role</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Alumni and engineers at {application.company} who achieved the role you are targeting.
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline hidden sm:block"
          >
            Explore All People →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relevantPeople.map((person) => (
            <div
              key={person.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h4
                      onClick={() => navigate(`/people/${person.id}`)}
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer truncate"
                    >
                      {person.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {person.role} <span className="font-semibold text-indigo-600 dark:text-indigo-400">@ {person.company}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {person.college}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {person.skills?.slice(0, 3).map((s) => (
                    <SkillBadge key={s} name={s} type="neutral" />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <button
                  onClick={() => navigate(`/people/${person.id}`)}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-200 rounded-xl text-center transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleOpenGuidance(person)}
                  className="px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center transition-all shadow-xs"
                >
                  Request Guidance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Feature 2: Related Interview Experiences */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Related Interview Experiences</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Read real candidate accounts, assessment rounds, and preparation strategies for {application.company}.
            </p>
          </div>
          <button
            onClick={() => navigate('/interviews')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline hidden sm:block"
          >
            All Experiences →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedExperiences.map((exp) => (
            <div
              key={exp.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      onClick={() => navigate(`/interviews/${exp.id}`)}
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer"
                    >
                      {exp.role}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {exp.company} • {exp.year}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${getDifficultyColor(
                      exp.difficulty
                    )}`}
                  >
                    {exp.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {exp.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {exp.numberOfRounds ? `${exp.numberOfRounds} Rounds` : '4 Rounds'}
                </span>
                <button
                  onClick={() => navigate(`/interviews/${exp.id}`)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Read Experience</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidance Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={selectedPersonForGuidance}
        onSubmitRequest={handleGuidanceSubmit}
      />
    </div>
  );
}
