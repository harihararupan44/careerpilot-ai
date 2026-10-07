import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Award,
  Clock,
  Mic,
  MicOff,
  ArrowLeft,
  Volume2,
  FileCheck,
  Radio
} from 'lucide-react';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import { mockQuestionsBank } from '../data/mockInterviews';
import { useApplications } from '../context/ApplicationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { mockInterviewApi, interviewQuestionApi } from '../services/api';
import confetti from 'canvas-confetti';

export default function MockInterview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getApplicationById } = useApplications();
  const { addToast } = useToast();

  const application = getApplicationById(id) || { company: 'Target Company', jobTitle: 'Software Engineer' };

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState(mockQuestionsBank);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredHistory, setAnsweredHistory] = useState([]);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [timer, setTimer] = useState(0);

  // Speech Recognition state & refs
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Initialize or fetch backend mock interview session
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      if (!isAuthenticated) return;

      try {
        // If `id` is a 24-char ObjectId, try fetching mock interview directly
        if (id && id.length === 24) {
          try {
            const getRes = await mockInterviewApi.getMockInterviewById(id);
            if (getRes.success && getRes.mockInterview && isMounted) {
              setSessionId(getRes.mockInterview.id || getRes.mockInterview._id);
              if (getRes.mockInterview.questions && getRes.mockInterview.questions.length > 0) {
                setQuestions(getRes.mockInterview.questions);
              }
              if (getRes.mockInterview.status === 'Completed') {
                setIsInterviewComplete(true);
                setAnsweredHistory(getRes.mockInterview.questions || []);
              } else if (getRes.mockInterview.status === 'Not Started') {
                await mockInterviewApi.startMockInterview(getRes.mockInterview.id || getRes.mockInterview._id);
              }
              return;
            }
          } catch (e) {
            // Not a direct mock interview ID, proceed to create session for application
          }
        }

        // Fetch question bank to create a new session
        const qRes = await interviewQuestionApi.getQuestions({ limit: 5 });
        let questionList = mockQuestionsBank;
        let questionIds = [];

        if (qRes.success && Array.isArray(qRes.questions) && qRes.questions.length > 0) {
          questionList = qRes.questions.map((q) => ({
            id: q.id || q._id,
            questionId: q.id || q._id,
            question: q.question,
            category: q.category,
            sampleGoodAnswer: q.sampleAnswer || 'Structured response with architectural and trade-off considerations.'
          }));
          questionIds = qRes.questions.map((q) => q.id || q._id);
          if (isMounted) setQuestions(questionList);
        }

        // Create new session in MongoDB
        const createRes = await mockInterviewApi.createMockInterview({
          title: `Mock Interview - ${application.company} (${application.jobTitle})`,
          interviewType: 'Mixed',
          questionIds: questionIds.length > 0 ? questionIds : undefined,
          questions: questionList.map((q) => ({ question: q.question, answer: '' }))
        });

        if (createRes.success && createRes.mockInterview && isMounted) {
          const newSessionId = createRes.mockInterview.id || createRes.mockInterview._id;
          setSessionId(newSessionId);
          await mockInterviewApi.startMockInterview(newSessionId);
        }
      } catch (err) {
        console.warn('Backend mock interview initialization fallback:', err);
      }
    };

    initSession();
    return () => { isMounted = false; };
  }, [id, isAuthenticated, application.company, application.jobTitle]);

  // Session timer
  useEffect(() => {
    if (isInterviewComplete) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isInterviewComplete]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Safely stop speech recognition on question transition or completion
  useEffect(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        recognitionRef.current.abort();
      }
      setIsListening(false);
      setInterimTranscript('');
    }
  }, [currentQuestionIndex, isInterviewComplete]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex] || {
    question: 'Describe a challenging technical project you worked on.',
    category: 'Technical',
    sampleGoodAnswer: 'In my recent project, I designed and optimized full-stack workflows using the STAR technique.'
  };

  /**
   * Browser Speech Recognition handler
   */
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      addToast({
        title: 'Speech Recognition Unavailable',
        message: 'Speech recognition is not supported in this browser. Please try Google Chrome or Edge.',
        type: 'error'
      });
      return;
    }

    if (isListening) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          recognitionRef.current.abort();
        }
      }
      setIsListening(false);
      setInterimTranscript('');
      addToast({
        title: 'Voice Recording Stopped',
        message: 'Speech recognition paused. You can edit your answer manually.',
        type: 'info'
      });
    } else {
      // Start recording
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English priority

        recognition.onstart = () => {
          setIsListening(true);
          setInterimTranscript('');
          addToast({
            title: 'Listening...',
            message: 'Microphone active. Speak your answer clearly.',
            type: 'info'
          });
        };

        recognition.onresult = (event) => {
          let interim = '';
          let finalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          // Append finalized text to existing textarea answer without overwriting
          if (finalChunk) {
            setUserAnswer((prev) => {
              const trimmedPrev = prev ? prev.trim() : '';
              const trimmedFinal = finalChunk.trim();
              if (!trimmedFinal) return prev;
              return trimmedPrev ? `${trimmedPrev} ${trimmedFinal}` : trimmedFinal;
            });
          }

          setInterimTranscript(interim);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error event:', event.error);
          setIsListening(false);
          setInterimTranscript('');

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            addToast({
              title: 'Microphone Permission Denied',
              message: 'Microphone access was denied. Please allow microphone permissions in your browser address bar.',
              type: 'error'
            });
          } else if (event.error === 'audio-capture') {
            addToast({
              title: 'Microphone Error',
              message: 'No microphone was detected on your device.',
              type: 'error'
            });
          } else if (event.error === 'network') {
            addToast({
              title: 'Network Error',
              message: 'Speech recognition network connectivity issue occurred.',
              type: 'error'
            });
          } else if (event.error !== 'no-speech') {
            addToast({
              title: 'Speech Error',
              message: `Recognition issue: ${event.error}`,
              type: 'error'
            });
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to initialize speech recognition:', err);
        setIsListening(false);
        setInterimTranscript('');
        addToast({
          title: 'Microphone Error',
          message: err.message || 'Could not start speech recognition.',
          type: 'error'
        });
      }
    }
  };

  const handleSubmitAnswer = async () => {
    // If currently listening, stop first
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      setInterimTranscript('');
    }

    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const currentQ = currentQuestion;
      const answerRecord = {
        question: currentQ.question || currentQ,
        category: currentQ.category || 'General',
        answer: userAnswer.trim(),
        answeredAt: new Date().toISOString()
      };

      // Persist to backend if session exists
      if (isAuthenticated && sessionId) {
        try {
          await mockInterviewApi.submitMockAnswer(sessionId, {
            questionIndex: currentQuestionIndex,
            questionId: currentQ.questionId || currentQ.id || currentQ._id,
            answer: userAnswer.trim()
          });
        } catch (e) {
          console.warn('Failed to persist answer to backend:', e);
        }
      }

      const updatedHistory = [...answeredHistory, answerRecord];
      setAnsweredHistory(updatedHistory);

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserAnswer('');
        addToast({ title: 'Answer Saved', message: `Question ${currentQuestionIndex + 1} recorded.`, type: 'success' });
      } else {
        // Complete the mock interview session
        if (isAuthenticated && sessionId) {
          try {
            await mockInterviewApi.completeMockInterview(sessionId);
          } catch (e) {
            console.warn('Failed to complete session on backend:', e);
          }
        }
        setIsInterviewComplete(true);
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
        addToast({ title: 'Session Completed!', message: 'All mock interview questions completed.', type: 'success' });
      }
    } catch (e) {
      addToast({ title: 'Submission Error', message: 'Failed to record answer.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimTranscript('');
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setAnsweredHistory([]);
    setIsInterviewComplete(false);
    setTimer(0);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/interview/${id}`)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Session</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formatTimer(timer)}</span>
          </div>
          <span>Question {Math.min(questions.length, currentQuestionIndex + 1)} of {questions.length}</span>
        </div>
      </div>

      {!isInterviewComplete ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <ProgressBar
            value={currentQuestionIndex}
            max={questions.length}
            label={`Mock Interview for ${application.company} (${application.jobTitle})`}
          />

          {/* Interviewer Question Box */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  CareerPilot Interview Session
                </h3>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Category: {currentQuestion.category || 'Technical / Core'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              "{currentQuestion.question}"
            </div>
          </div>

          {/* User Answer Textarea with Real-Time Voice-to-Text */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Answer (Type or Speak)
                </label>
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-200 dark:border-rose-900/60 animate-pulse">
                    <Radio className="w-3 h-3 text-rose-600 animate-spin" />
                    <span>Listening...</span>
                  </span>
                )}
              </div>

              {/* Voice-to-Text Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/50 animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60'
                }`}
                title={isListening ? 'Click to stop speech recognition' : 'Click to start speaking your answer'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Voice Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice to Text</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows="6"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Speak using the microphone or type your answer using STAR or system architecture steps..."
              className="w-full p-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 resize-none leading-relaxed"
            />

            {/* Live unfinalized speech preview strip */}
            {isListening && interimTranscript && (
              <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 italic flex items-center gap-2 animate-in fade-in">
                <Mic className="w-3.5 h-3.5 shrink-0 text-indigo-500 animate-pulse" />
                <span className="truncate">Hearing: "{interimTranscript}"</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserAnswer((prev) => {
                    const sample = currentQuestion.sampleGoodAnswer || 'Here is a model solution demonstrating clear principles.';
                    return prev ? `${prev.trim()} ${sample}` : sample;
                  });
                }}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 underline"
              >
                Insert Sample Model Answer
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !userAnswer.trim()}
                className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Saving Answer...' : currentQuestionIndex + 1 === questions.length ? 'Submit & Finish' : 'Next Question'}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* End of Interview Summary Report */
        <div className="space-y-6 animate-in fade-in">
          <div className="p-8 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl text-center space-y-3 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mock Interview Completed! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md mx-auto">
              You completed all {answeredHistory.length} questions for {application.company}. Session answers are securely stored in your history.
            </p>
            <div className="pt-2">
              <span className="inline-block text-2xl sm:text-3xl font-extrabold text-white">
                {answeredHistory.length} / {questions.length} Questions Answered
              </span>
              <span className="block text-xs font-semibold text-emerald-200 mt-1">Duration: {formatTimer(timer)}</span>
            </div>
          </div>

          {/* Question-by-Question Recorded Responses */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Session Question Log ({answeredHistory.length})
            </h3>

            {answeredHistory.map((item, idx) => (
              <Card key={idx} title={`Question ${idx + 1}: ${item.question}`}>
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <strong className="block text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Your Recorded Response:</span>
                    </strong>
                    <p className="leading-relaxed whitespace-pre-wrap">"{item.answer}"</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Category: {item.category || 'General'}</span>
                    <span>Saved: {new Date(item.answeredAt || Date.now()).toLocaleTimeString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Mock Interview</span>
            </button>

            <button
              onClick={() => navigate(`/interview/${id}`)}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Back to Prep Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
