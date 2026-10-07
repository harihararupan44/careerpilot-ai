import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Sparkles,
  Bot,
  CheckSquare,
  Square,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Lightbulb,
  ExternalLink,
  Users,
  Send,
  MessageSquare
} from 'lucide-react';
import Card from '../components/common/Card';
import FitScore from '../components/common/FitScore';
import SkillBadge from '../components/common/SkillBadge';
import CountdownTimer from '../components/interviews/CountdownTimer';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import { useApplications } from '../context/ApplicationContext';
import { useGuidance } from '../context/GuidanceContext';
import { useAuth } from '../context/AuthContext';
import { interviewApi, interviewQuestionApi, peopleApi, interviewExperienceApi } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function InterviewPrep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getApplicationById } = useApplications();
  const { sendGuidanceRequest } = useGuidance();

  const application = getApplicationById(id) || {
    id: id || '',
    company: 'Target Company',
    jobTitle: 'Software Engineer',
    interviewDate: null,
    round: 'Technical Interview Round',
    fitScore: 85,
  };

  const [activeCategory, setActiveCategory] = useState('technical');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [checklistState, setChecklistState] = useState([
    { id: 'c1', text: 'Test camera, microphone, and internet connection', completed: false },
    { id: 'c2', text: 'Review company tech stack and recent engineering blogs', completed: false },
    { id: 'c3', text: 'Prepare 3 STAR stories for behavioral questions', completed: false },
    { id: 'c4', text: 'Have 2 thoughtful questions ready for the interviewer', completed: false }
  ]);
  const [selectedPersonForGuidance, setSelectedPersonForGuidance] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [dbQuestions, setDbQuestions] = useState([]);
  const [dbInterview, setDbInterview] = useState(null);
  const [communityPeople, setCommunityPeople] = useState([]);
  const [communityExperiences, setCommunityExperiences] = useState([]);

  // Load questions and interview prep data from backend API
  React.useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      try {
        const [qRes, peopleRes, expRes] = await Promise.allSettled([
          interviewQuestionApi.getQuestions({ limit: 50 }),
          peopleApi.getPeople({ limit: 10 }),
          interviewExperienceApi.getExperiences({ limit: 10 })
        ]);

        if (qRes.status === 'fulfilled' && qRes.value?.success && Array.isArray(qRes.value.questions)) {
          if (isMounted) setDbQuestions(qRes.value.questions);
        }
        if (peopleRes.status === 'fulfilled' && peopleRes.value?.success) {
          const pList = Array.isArray(peopleRes.value.data) ? peopleRes.value.data : (Array.isArray(peopleRes.value.people) ? peopleRes.value.people : []);
          if (isMounted) setCommunityPeople(pList);
        }
        if (expRes.status === 'fulfilled' && expRes.value?.success && Array.isArray(expRes.value.data)) {
          if (isMounted) setCommunityExperiences(expRes.value.data);
        }

        // Try fetching interview if id is a MongoDB ObjectId
        if (id && id.length === 24 && isAuthenticated) {
          try {
            const iRes = await interviewApi.getInterviewById(id);
            if (iRes.success && iRes.interview && isMounted) {
              setDbInterview(iRes.interview);
            }
          } catch (err) {
            // Handled
          }
        }
      } catch (err) {
        console.warn('Could not load interview prep data from backend:', err);
      }
    };
    loadBackendData();
    return () => { isMounted = false; };
  }, [id, isAuthenticated]);

  const prepData = useMemo(() => {
    return {
      company: dbInterview?.company || application.company || 'Target Company',
      role: dbInterview?.jobTitle || application.jobTitle || 'Software Engineer',
      round: dbInterview?.interviewType ? `${dbInterview.interviewType} Interview Round` : (application.round || 'Technical Interview Round'),
      interviewDate: dbInterview?.scheduledDate || application.interviewDate || null,
      topicsToRevise: [
        { topic: 'System Design & Architecture', importance: 'High', notes: 'Review rate limiters and distributed caching patterns.' },
        { topic: 'Data Structures & Algorithms', importance: 'High', notes: 'Focus on graphs, dynamic programming, and hash maps.' },
        { topic: 'Behavioral STAR Scenarios', importance: 'Medium', notes: 'Prepare leadership and teamwork conflict examples.' }
      ]
    };
  }, [dbInterview, application]);

  // Relevant alumni who interviewed at this company
  const relevantPeople = useMemo(() => {
    const directMatches = communityPeople.filter(
      (p) => p.company?.toLowerCase() === prepData.company?.toLowerCase()
    );
    if (directMatches.length > 0) return directMatches.slice(0, 3);
    return communityPeople.slice(0, 3);
  }, [prepData.company, communityPeople]);

  // Related interview experiences for this company
  const relatedExperiences = useMemo(() => {
    const directMatches = communityExperiences.filter(
      (e) => e.company?.toLowerCase() === prepData.company?.toLowerCase()
    );
    if (directMatches.length > 0) return directMatches.slice(0, 3);
    return communityExperiences.slice(0, 3);
  }, [prepData.company, communityExperiences]);

  const toggleChecklist = (cId) => {
    setChecklistState((prev) => {
      const updated = prev.map((item) => (item.id === cId ? { ...item, completed: !item.completed } : item));
      const completedCount = updated.filter(i => i.completed).length;
      const progress = Math.round((completedCount / updated.length) * 100);
      if (isAuthenticated && dbInterview?.id) {
        interviewApi.updatePreparationProgress(dbInterview.id, progress).catch(() => {});
      }
      return updated;
    });
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
      mentorCompany: selectedPersonForGuidance?.company || prepData.company,
      mentorAvatar: selectedPersonForGuidance?.avatar,
      targetCompany: newRequestData.targetCompany || prepData.company,
      targetRole: newRequestData.targetRole || prepData.role,
      topics: newRequestData.topics,
      message: newRequestData.message
    });
  };

  // Group backend questions by category with fallbacks
  const questionsMap = useMemo(() => {
    if (dbQuestions && dbQuestions.length > 0) {
      return {
        technical: dbQuestions.filter(q => q.category === 'Technical').map(q => ({
          question: q.question,
          hint: q.sampleAnswer,
          keyPoints: q.tips && q.tips.length > 0 ? q.tips : ['Explain time and space complexity', 'Demonstrate clear edge case handling']
        })),
        hr: dbQuestions.filter(q => q.category === 'Behavioral' || q.category === 'HR').map(q => ({
          question: q.question,
          hint: q.sampleAnswer,
          keyPoints: q.tips && q.tips.length > 0 ? q.tips : ['Use STAR technique', 'Highlight collaborative problem solving']
        })),
        resume: dbQuestions.filter(q => q.category === 'Managerial' || q.category === 'General').map(q => ({
          question: q.question,
          hint: q.sampleAnswer,
          keyPoints: q.tips && q.tips.length > 0 ? q.tips : ['Emphasize measurable project outcomes', 'State your individual contribution']
        })),
        project: dbQuestions.filter(q => q.category === 'Technical' || q.category === 'Managerial').slice(0, 4).map(q => ({
          question: q.question,
          hint: q.sampleAnswer,
          keyPoints: q.tips && q.tips.length > 0 ? q.tips : ['Outline architectural tradeoffs', 'Discuss reliability and failure modes']
        }))
      };
    }

    return {
      technical: [
        {
          question: 'How do you design a scalable caching tier for high-concurrency microservices?',
          hint: 'Discuss Redis/Memcached cluster topologies, cache invalidation strategies (write-through, cache-aside), and thundering herd mitigations.',
          keyPoints: ['Cache eviction policies (LRU/LFU)', 'TTL strategies and stale-while-revalidate', 'Handling cache penetration with bloom filters']
        },
        {
          question: 'Explain the difference between optimistic and pessimistic locking in database transactions.',
          hint: 'Contrast version numbering checks during commit against immediate row-level exclusive locks.',
          keyPoints: ['Use cases for optimistic locking in high-read systems', 'Deadlock detection in pessimistic locking', 'Isolation levels (Read Committed vs Serializable)']
        }
      ],
      hr: [
        {
          question: 'Describe a situation where you had a disagreement with a team member on technical approach. How did you resolve it?',
          hint: 'Use the STAR method. Focus on data-driven evaluation, objective benchmarks, and alignment on project deliverables.',
          keyPoints: ['Focus on shared goals and business impact', 'Propose a quick spike or prototype to compare metrics', 'Commit fully once a team decision was finalized']
        },
        {
          question: 'Tell me about a time you had to meet a tight deadline with changing requirements.',
          hint: 'Highlight prioritization, active stakeholder communication, and iterative scoping.',
          keyPoints: ['Identify MVP requirements vs nice-to-haves', 'Frequent async progress updates to stakeholders', 'Maintain code quality without technical debt shortcuts']
        }
      ],
      resume: [
        {
          question: 'Walk me through the most technically challenging component in your recent project.',
          hint: 'Clearly explain the problem statement, why existing solutions were insufficient, and your architectural solution.',
          keyPoints: ['Explain data flows and component interactions', 'Highlight throughput/latency improvements with metrics', 'Reflect on lessons learned and what you would do differently']
        }
      ],
      project: [
        {
          question: 'How do you ensure end-to-end reliability and observability in your application services?',
          hint: 'Cover structured logging, distributed tracing (OpenTelemetry), and health probe alerting.',
          keyPoints: ['Correlation IDs across service boundaries', 'SLOs, SLIs, and alert threshold configuration', 'Graceful degradation and fallback mechanisms']
        }
      ]
    };
  }, [dbQuestions]);

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

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <button
        onClick={() => navigate(`/applications/${application.id}`)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Application</span>
      </button>

      {/* Hero Banner with Countdown and Launch AI Mock Interview */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Prep Hub • {prepData.round}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            {prepData.company} Interview Preparation
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1">
            Role: {prepData.role} • Date: {formatDate(prepData.interviewDate)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <CountdownTimer targetDate={prepData.interviewDate} />
          
          <button
            onClick={() => navigate(`/mock-interview/${application.id}`)}
            className="flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Mock Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two Column Prep Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Revision Topics */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            title="High-Priority Revision Topics"
            subtitle="Extracted from role requirements & recent company interview logs"
          >
            <div className="space-y-3">
              {prepData.topicsToRevise?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {item.topic}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        item.importance === 'High'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      {item.importance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (8 cols): Question Bank */}
        <div className="lg:col-span-8 space-y-6">
          <Card title="Tailored Interview Question Bank">
            <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              {[
                { id: 'technical', label: 'Technical & System Design' },
                { id: 'hr', label: 'Behavioral & Culture' },
                { id: 'resume', label: 'Resume Deep Dive' },
                { id: 'project', label: 'Architecture & Projects' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedQuestion(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {questionsMap[activeCategory]?.map((q, idx) => {
                const isExpanded = expandedQuestion === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-all"
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                      className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {q.question}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in">
                        {q.hint && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                            <span className="font-semibold block mb-0.5">💡 Strategy & Hint:</span>
                            <p>{q.hint}</p>
                          </div>
                        )}

                        {q.keyPoints && (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                              Key Points to Mention:
                            </span>
                            <ul className="space-y-1 pl-1">
                              {q.keyPoints.map((pt, pIdx) => (
                                <li key={pIdx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Interactive One-Day-Before Checklist */}
          <Card
            title="One-Day-Before Interview Checklist"
            subtitle="Interactive checklist to ensure a seamless interview day"
          >
            <div className="space-y-2.5">
              {checklistState.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <span className={`text-xs sm:text-sm ${item.completed ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Community Feature: Learn From Previous Candidates */}
      <div className="p-6 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Learn From Previous Candidates</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real interview reports, high-frequency questions, and advice from candidates who cleared rounds at {prepData.company}.
            </p>
          </div>
          <button
            onClick={() => navigate('/interviews')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-auto"
          >
            All Experiences →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Related Interview Experiences */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Related Interview Experiences</span>
            </h3>
            <div className="space-y-3">
              {relatedExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {exp.role}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${getDifficultyColor(
                        exp.difficulty
                      )}`}
                    >
                      {exp.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {exp.summary}
                  </p>
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{exp.year || '2024'}</span>
                    <button
                      onClick={() => navigate(`/interviews/${exp.id}`)}
                      className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Read Experience</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Common Questions & Preparation Tips */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span>Common Questions & Preparation Tips</span>
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 text-xs space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Candidate Preparation Tip</span>
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  "Practice coding on a plain text editor without syntax autocompletion. Explain your thought process out loud before writing a single line of code."
                </p>
              </div>

              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 text-xs space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Frequently Asked Technical Question</span>
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  "Given a stream of incoming events, design a sliding window rate limiter that supports atomic increments and low-latency response times."
                </p>
              </div>

              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40 text-xs space-y-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Behavioral STAR Tip</span>
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  "Prepare 3 distinct project conflict stories that emphasize data-driven resolution and user-centric decision making."
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Relevant Alumni Mentors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Relevant Alumni Mentors</span>
            </h3>
            <div className="space-y-3">
              {relevantPeople.map((person) => (
                <div
                  key={person.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate(`/people/${person.id}`)}
                        className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer truncate"
                      >
                        {person.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {person.role} @ {person.company}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700">
                    <button
                      onClick={() => navigate(`/people/${person.id}`)}
                      className="px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-center transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleOpenGuidance(person)}
                      className="px-2 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-center transition-all shadow-xs"
                    >
                      Request Guidance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
