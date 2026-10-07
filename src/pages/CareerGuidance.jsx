import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserCheck,
  Sparkles,
  ArrowUpDown,
  X,
  Compass,
  CheckCircle2,
  Inbox,
  Filter,
  Users,
  Send,
  UserPlus,
  HelpCircle,
  Briefcase,
  Loader2
} from 'lucide-react';
import MentorCard from '../components/guidance/MentorCard';
import GuidanceFilters from '../components/guidance/GuidanceFilters';
import SentRequestsList from '../components/guidance/SentRequestsList';
import ReceivedRequestsList from '../components/guidance/ReceivedRequestsList';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import EmptyState from '../components/common/EmptyState';
import { useGuidance } from '../context/GuidanceContext';
import { useAuth } from '../context/AuthContext';
import { guidanceApi } from '../services/api';

export default function CareerGuidance() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('mentors'); // 'mentors' | 'sent' | 'received'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'name' | 'guidanceCount'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Backend state
  const [dbPeople, setDbPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    sentRequests = [],
    receivedRequests = [],
    sendGuidanceRequest,
    acceptReceivedRequest,
    rejectReceivedRequest,
    cancelSentRequest,
    completeRequest
  } = useGuidance();

  const initialFilters = {
    company: 'All',
    role: 'All',
    skill: 'All',
    topic: 'All',
    availability: 'All' // 'All' | 'Available' | 'Busy'
  };

  const [filters, setFilters] = useState(initialFilters);

  const topicDiscoveryChips = [
    'Interview Preparation',
    'Resume Review',
    'DSA',
    'Projects',
    'Placement Strategy',
    'Java',
    'React',
    'Career Planning'
  ];

  // Fetch guidance people from backend
  const fetchPeople = useCallback(async () => {
    if (!isAuthenticated) {
      setDbPeople([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const params = { limit: 50 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filters.topic !== 'All') params.topic = filters.topic;
      if (filters.skill !== 'All') params.skills = filters.skill;
      if (filters.role !== 'All') params.targetRole = filters.role;
      if (filters.company !== 'All') params.company = filters.company;

      const res = await guidanceApi.getGuidancePeople(params);
      if (res.success && Array.isArray(res.data)) {
        setDbPeople(res.data);
      } else {
        setDbPeople([]);
      }
    } catch (err) {
      console.warn('Could not fetch guidance people from backend:', err.message);
      setDbPeople([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, searchTerm, filters]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Real backend MongoDB people dataset
  const peopleList = useMemo(() => {
    return Array.isArray(dbPeople) ? dbPeople : [];
  }, [dbPeople]);

  // Extract unique options for filter dropdowns safely
  const companies = useMemo(() => {
    return Array.from(new Set(peopleList.map((p) => p?.company || p?.placementStatus).filter(Boolean))).sort();
  }, [peopleList]);

  const roles = useMemo(() => {
    return Array.from(new Set(peopleList.map((p) => p?.role || p?.targetRole).filter(Boolean))).sort();
  }, [peopleList]);

  const skillsList = useMemo(() => {
    const all = peopleList.flatMap((p) => (Array.isArray(p?.skills) ? p.skills : []));
    return Array.from(new Set(all.filter(Boolean))).sort();
  }, [peopleList]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.company !== 'All') count++;
    if (filters.role !== 'All') count++;
    if (filters.skill !== 'All') count++;
    if (filters.topic !== 'All') count++;
    if (filters.availability !== 'All') count++;
    return count;
  }, [filters]);

  // Filter & Sort pipeline for mentors
  const filteredMentors = useMemo(() => {
    let results = peopleList.filter((person) => {
      if (!person) return false;

      // 1. Text Search matching name, company, role, skills, guidanceTopics
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (person.name || '').toLowerCase().includes(query);
        const matchesCompany = (person.company || person.placementStatus || '').toLowerCase().includes(query);
        const matchesRole = (person.role || person.targetRole || '').toLowerCase().includes(query);
        const matchesSkills = Array.isArray(person.skills) && person.skills.some((s) => (s || '').toLowerCase().includes(query));
        const matchesTopics = Array.isArray(person.guidanceTopics) && person.guidanceTopics.some((t) => (t || '').toLowerCase().includes(query));

        if (!matchesName && !matchesCompany && !matchesRole && !matchesSkills && !matchesTopics) {
          return false;
        }
      }

      // 2. Dropdown Filters
      const personComp = person.company || person.placementStatus || '';
      if (filters.company !== 'All' && personComp !== filters.company) return false;

      const personRole = person.role || person.targetRole || '';
      if (filters.role !== 'All' && personRole !== filters.role) return false;

      if (filters.skill !== 'All' && !(Array.isArray(person.skills) && person.skills.includes(filters.skill))) return false;

      if (filters.topic !== 'All') {
        const personTopics = Array.isArray(person.guidanceTopics) ? person.guidanceTopics : [];
        const hasTopic = personTopics.some((t) =>
          (t || '').toLowerCase().includes(filters.topic.toLowerCase())
        );
        if (!hasTopic) return false;
      }
      if (filters.availability === 'Available' && !person.availableForGuidance) return false;
      if (filters.availability === 'Busy' && person.availableForGuidance) return false;

      return true;
    });

    // 3. Sorting
    if (sortBy === 'guidanceCount') {
      results.sort((a, b) => (b.guidanceCount || 0) - (a.guidanceCount || 0));
    } else if (sortBy === 'name') {
      results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      // 'recommended' - prioritize availableForGuidance and then guidanceCount
      results.sort((a, b) => {
        if (a.availableForGuidance && !b.availableForGuidance) return -1;
        if (!a.availableForGuidance && b.availableForGuidance) return 1;
        return (b.guidanceCount || 0) - (a.guidanceCount || 0);
      });
    }

    return results;
  }, [peopleList, searchTerm, filters, sortBy]);

  const handleOpenGuidanceModal = (person) => {
    if (!person) return;
    setSelectedMentor(person);
    setIsGuidanceModalOpen(true);
  };

  const handleGuidanceSubmit = async (newRequestData) => {
    if (!selectedMentor) return;

    await sendGuidanceRequest({
      mentorId: selectedMentor.id || selectedMentor._id || selectedMentor.userId,
      mentorName: selectedMentor.name,
      mentorRole: selectedMentor.role || selectedMentor.targetRole,
      mentorCompany: selectedMentor.company || selectedMentor.placementStatus,
      mentorAvatar: selectedMentor.avatar,
      targetCompany: newRequestData?.targetCompany || selectedMentor.company,
      targetRole: newRequestData?.targetRole || selectedMentor.role,
      topics: newRequestData?.topics,
      message: newRequestData?.message
    });
    setIsGuidanceModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Career Guidance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect with people who can help you prepare for your target role.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('mentors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mentors'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Explore Guides</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sent ({sentRequests?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Received ({receivedRequests?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* 2. EXPLORE GUIDES VIEW */}
      {activeTab === 'mentors' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search Bar & Topic Discovery Chips */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mentors by role, company, skill, or topic..."
                className="w-full pl-12 pr-10 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 font-medium transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* "Looking for help with?" Quick Topic Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 shrink-0">
                Looking for help with:
              </span>
              {topicDiscoveryChips.map((topic) => {
                const isSelected =
                  searchTerm.toLowerCase() === topic.toLowerCase() ||
                  filters.topic.toLowerCase() === topic.toLowerCase();
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSearchTerm('');
                        handleFilterChange('topic', 'All');
                      } else {
                        setSearchTerm(topic);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <GuidanceFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              companies={companies}
              roles={roles}
              skillsList={skillsList}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Mobile Filter Toggle & Controls */}
          <div className="lg:hidden flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </button>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <option value="recommended">Recommended</option>
                <option value="guidanceCount">Most Active</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 animate-in fade-in">
              <GuidanceFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                companies={companies}
                roles={roles}
                skillsList={skillsList}
                activeFilterCount={activeFilterCount}
                isMobileModal={true}
                onCloseMobile={() => setShowMobileFilters(false)}
              />
            </div>
          )}

          {/* Results Summary & Sorting (Desktop) */}
          <div className="hidden lg:flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <UserCheck className="w-4 h-4 text-indigo-500" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  {filteredMentors.length}
                </strong>{' '}
                {filteredMentors.length === 1 ? 'guide' : 'guides'} available
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <option value="recommended">Recommended</option>
                <option value="guidanceCount">Most Active</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Mentor Cards Grid / Loading */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Loading career guidance providers...
              </p>
            </div>
          ) : filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor.id || mentor._id || mentor.userId}
                  person={mentor}
                  mentor={mentor}
                  onRequestGuidance={handleOpenGuidanceModal}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No career guidance providers found"
              description="Try another role, company, skill, or topic."
              actionText="Clear Filters"
              onAction={handleClearFilters}
            />
          )}
        </div>
      )}

      {/* 3. SENT REQUESTS VIEW */}
      {activeTab === 'sent' && (
        <div className="animate-in fade-in duration-200">
          <SentRequestsList
            requests={sentRequests}
            onExploreClick={() => setActiveTab('mentors')}
            onCancel={cancelSentRequest}
            onComplete={completeRequest}
          />
        </div>
      )}

      {/* 4. RECEIVED REQUESTS VIEW */}
      {activeTab === 'received' && (
        <div className="animate-in fade-in duration-200">
          <ReceivedRequestsList
            requests={receivedRequests}
            onAccept={acceptReceivedRequest}
            onReject={rejectReceivedRequest}
            onComplete={completeRequest}
          />
        </div>
      )}

      {/* Guidance Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={selectedMentor}
        onSubmitRequest={handleGuidanceSubmit}
      />
    </div>
  );
}
