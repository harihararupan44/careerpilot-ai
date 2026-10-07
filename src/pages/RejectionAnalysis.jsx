import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Info,
  TrendingDown,
  BookOpen,
  FolderGit2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Bot
} from 'lucide-react';
import Card from '../components/common/Card';
import FitScore from '../components/common/FitScore';
import SkillBadge from '../components/common/SkillBadge';
import ProgressBar from '../components/common/ProgressBar';
import { useApplications } from '../context/ApplicationContext';

export default function RejectionAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getApplicationById } = useApplications();

  const application = getApplicationById(id) || {
    id: 'app-5',
    company: 'Figma',
    jobTitle: 'Software Engineer - Editor Performance',
    fitScore: 74,
    location: 'San Francisco, CA',
    matchingSkills: ['JavaScript', 'TypeScript', 'React', 'WebSockets', 'Git'],
    missingSkills: ['WebAssembly (Wasm)', 'WebGL / Canvas rendering', 'C++ memory management', 'CRDTs'],
  };

  const likelyFactors = [
    {
      factor: 'Niche Graphics & Low-Level Systems Specialization',
      impact: 'High Impact (45% confidence)',
      description: 'Figma editor core requires direct WebAssembly/C++ compilation and WebGL shader programming. Your resume primarily highlighted React and high-level full-stack applications.',
    },
    {
      factor: 'High Volume of Specialized Candidates',
      impact: 'Medium Impact (30% confidence)',
      description: 'Senior and specialized graphics engineering candidates with browser engine internals dominated this application round.',
    },
    {
      factor: 'Resume Keywords Under-Indexed for WebAssembly & CRDTs',
      impact: 'Medium Impact (25% confidence)',
      description: 'ATS parsers look for terms like "Emscripten", "SharedArrayBuffer", or "Collaborative CRDT Algorithms" which were absent on your uploaded PDF.',
    }
  ];

  const recommendedLearning = [
    {
      title: 'WebAssembly & Rust for High-Performance Web Apps',
      platform: 'FreeCodeCamp / Mozilla MDN Docs',
      duration: '8 Hours',
      link: 'https://developer.mozilla.org/en-US/docs/WebAssembly',
      tags: ['Wasm', 'Rust', 'Performance']
    },
    {
      title: 'WebGL & Canvas 2D Fast Rendering Fundamentals',
      platform: 'WebGL Academy / Open-Source Guides',
      duration: '12 Hours',
      link: 'https://webglfundamentals.org',
      tags: ['WebGL', 'GPU Shaders', 'Canvas']
    },
    {
      title: 'Conflict-Free Replicated Data Types (CRDTs) in Practice',
      platform: 'MIT Distributed Systems Reading Group',
      duration: '6 Hours',
      link: 'https://crdt.tech',
      tags: ['CRDTs', 'Distributed State']
    }
  ];

  const recommendedProjects = [
    {
      title: 'CanvasFlow — WebAssembly Vector Canvas Engine',
      description: 'Build a browser-based collaborative drawing board in TypeScript compiled with WebAssembly (Rust/C++) supporting 60 FPS smooth rendering.',
      impact: '+18% Fit Score boost for frontend systems & browser tool roles'
    },
    {
      title: 'SyncState — Real-Time CRDT Collaborative Text Editor',
      description: 'Implement a conflict-free replicated text buffer over WebSockets with zero central authority lock contention.',
      impact: '+15% Fit Score boost for Figma, Notion, and Google Workspace teams'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/applications/${application.id}`)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Application</span>
      </button>

      {/* Mandatory AI Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-bold">AI-Estimated Analysis Disclaimer:</strong> This diagnostic is generated automatically by CareerPilot AI based on job requirements, applicant pool benchmarks, and keyword overlap. It is <strong>NOT</strong> confirmed feedback from {application.company} hiring managers.
        </div>
      </div>

      {/* Header Overview Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold mb-3 border border-rose-200 dark:border-rose-900/50">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Application Status: Rejected (Post-Assessment)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Rejection Diagnosis: {application.company}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Target Role: {application.jobTitle} • Location: {application.location}
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0">
          <FitScore score={application.fitScore} size="circle" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Overlap</span>
            <p className="text-xs text-slate-500 font-medium">74% overall alignment</p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Cols Left (Likely Factors & Skill Gaps), 1 Col Right (Learning & Recovery Plan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Likely Rejection Factors */}
          <Card
            title="Likely Rejection Factors"
            subtitle="Ranked by AI model confidence from JD and resume comparison"
          >
            <div className="space-y-4">
              {likelyFactors.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {idx + 1}. {fact.factor}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[11px] font-bold shrink-0">
                      {fact.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {fact.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Missing Skills & Gaps Identified */}
          <Card title="Skill & Keyword Gaps in Application">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                Crucial Missing Keywords for this Position
              </span>
              <div className="flex flex-wrap gap-2">
                {application.missingSkills?.map((s) => (
                  <SkillBadge key={s} name={s} type="missing" />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                💡 Including evidence of these technologies in your project bullets will prevent future automatic screening rejections.
              </p>
            </div>
          </Card>

          {/* Historical Rejection Patterns */}
          <Card title="Historical Rejection Patterns Across Your Applications">
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Pattern Detected: Low-level Systems & Cloud Infra Gap
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Both of your rejected applications ({application.company} and Microsoft) required low-level systems engineering (Wasm/C++ or Enterprise C#/.NET). In contrast, all 3 of your interview callbacks ({application.company === 'Stripe' ? 'Airbnb' : 'Stripe'}, Datadog, Snowflake) matched your strengths in Distributed Go, React, and Python.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Actionable Recovery Plan */}
        <div className="space-y-6">
          {/* Recommended Learning Paths */}
          <Card
            title="Recommended Free Learning"
            subtitle="Close the specific technical gap"
          >
            <div className="space-y-3">
              {recommendedLearning.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.title}</h5>
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{item.platform}</span>
                    <span className="font-semibold">{item.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Projects to Build */}
          <Card
            title="Recommended Portfolio Projects"
            subtitle="Build proof of competency"
          >
            <div className="space-y-3">
              {recommendedProjects.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.title}</h5>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{p.description}</p>
                  <span className="inline-block text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {p.impact}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
