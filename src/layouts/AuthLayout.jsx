import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import ToastContainer from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  // If already authenticated, redirect to /dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left / Top Hero Branding Panel */}
      <div className="md:w-1/2 lg:w-5/12 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Brand Logo */}
        <div className="relative z-10">
          <NavLink to="/" className="inline-flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CareerPilot <span className="text-indigo-400">AI</span></span>
          </NavLink>
        </div>

        {/* Main Pitch */}
        <div className="relative z-10 my-8 sm:my-auto max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Copilot for Students</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Supercharge your tech job search from application to offer.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-indigo-200/80 leading-relaxed">
            AI-driven resume intelligence, dynamic job description matching, rejection gap diagnosis, and interactive mock interviews.
          </p>

          {/* Value Props */}
          <div className="mt-8 space-y-3 text-xs sm:text-sm text-indigo-100">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Instant ATS Resume scoring & bullet-point optimization</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Kanban & Table application pipeline with countdown reminders</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>AI-simulated live mock interviews with real-time scoring</span>
            </div>
          </div>
        </div>

        {/* Student Testimonial Quote */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-xs">
          <p className="text-indigo-100 italic">
            "CareerPilot AI helped me identify missing Distributed Systems keywords and prep for my Stripe onsite. Landed my dream new grad offer!"
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">
              AR
            </div>
            <div>
              <p className="font-semibold text-white">Alex Rivera</p>
              <p className="text-[10px] text-indigo-300">CS Senior • Incoming New Grad SWE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right / Bottom Auth Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
