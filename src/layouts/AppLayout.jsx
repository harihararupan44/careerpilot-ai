import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import ToastContainer from '../components/common/Toast';
import AddApplicationModal from '../components/applications/AddApplicationModal';
import { useApplications } from '../context/ApplicationContext';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalStatus, setAddModalStatus] = useState('Applied');
  const { addApplication } = useApplications();
  const { isAuthenticated, loading } = useAuth();

  const handleOpenAddModal = (initialStatus = 'Applied') => {
    setAddModalStatus(typeof initialStatus === 'string' ? initialStatus : 'Applied');
    setIsAddModalOpen(true);
  };

  // Loading state while checking token verification
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Initializing CareerPilot session...
          </span>
        </div>
      </div>
    );
  }

  // Redirect to /login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar / Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAddModal={() => handleOpenAddModal('Applied')}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ onOpenAddModal: handleOpenAddModal }} />
          </div>
        </main>
      </div>

      {/* Global Add Application Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialStatus={addModalStatus}
        onAdd={addApplication}
      />

      {/* Global Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
