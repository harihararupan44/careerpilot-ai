import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ApplicationProvider } from './context/ApplicationContext';
import { GuidanceProvider } from './context/GuidanceContext';

import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ExplorePeople from './pages/ExplorePeople';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import CareerGuidance from './pages/CareerGuidance';
import ResumeIntelligence from './pages/ResumeIntelligence';
import JobIntelligence from './pages/JobIntelligence';
import JobDetail from './pages/JobDetail';
import ApplicationTracker from './pages/ApplicationTracker';
import ApplicationDetail from './pages/ApplicationDetail';
import RejectionAnalysis from './pages/RejectionAnalysis';
import InterviewPrep from './pages/InterviewPrep';
import InterviewExperiences from './pages/InterviewExperiences';
import InterviewExperienceDetail from './pages/InterviewExperienceDetail';
import MockInterview from './pages/MockInterview';
import CareerAnalytics from './pages/CareerAnalytics';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ApplicationProvider>
            <GuidanceProvider>
              <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Main App Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/explore" element={<ExplorePeople />} />
                  <Route path="/people/:id" element={<PublicProfile />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/companies/:id" element={<CompanyDetail />} />
                  <Route path="/guidance" element={<CareerGuidance />} />
                  <Route path="/interviews" element={<InterviewExperiences />} />
                  <Route path="/interviews/:id" element={<InterviewExperienceDetail />} />
                  <Route path="/resume" element={<ResumeIntelligence />} />
                  <Route path="/jobs" element={<JobIntelligence />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />
                  <Route path="/applications" element={<ApplicationTracker />} />
                  <Route path="/applications/:id" element={<ApplicationDetail />} />
                  <Route path="/rejection/:id" element={<RejectionAnalysis />} />
                  <Route path="/interview/:id" element={<InterviewPrep />} />
                  <Route path="/mock-interview/:id" element={<MockInterview />} />
                  <Route path="/analytics" element={<CareerAnalytics />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* Fallback to Dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
            </GuidanceProvider>
          </ApplicationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
