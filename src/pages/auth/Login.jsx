import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('alex.rivera@university.edu');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast({
        title: 'Missing Fields',
        message: 'Please enter both email address and password.',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      addToast({
        title: `Welcome back, ${result.user?.name || 'Alex'}!`,
        message: 'Successfully signed into CareerPilot AI.',
        type: 'success'
      });
      navigate('/dashboard');
    } catch (error) {
      addToast({
        title: 'Sign In Failed',
        message: error.message || 'Invalid email or password.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('alex.rivera@university.edu', 'demo123');
      addToast({
        title: 'Demo Session Initialized',
        message: 'Logged in as MIT Computer Science Senior (Alex Rivera)',
        type: 'success'
      });
      navigate('/dashboard');
    } catch (error) {
      addToast({
        title: 'Sign In Failed',
        message: error.message || 'Unable to start demo session.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Sign In
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Access your AI career dashboard, tracked applications, and interview prep.
        </p>
      </div>

      {/* 1-Click Demo Login Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Evaluation Mode
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              One-click instant login with pre-populated rich mock applications & resume data.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
        >
          <span>1-Click Demo Student Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-slate-50 dark:bg-slate-950 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
          or continue with email
        </span>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              placeholder="alex.rivera@university.edu"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>Keep me logged in</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-60"
        >
          {isLoading ? 'Signing In...' : 'Sign In with Email'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account yet?{' '}
        <NavLink to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          Create Student Account
        </NavLink>
      </p>
    </div>
  );
}
