import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Sparkles,
  ArrowUpDown,
  X,
  Filter,
  SlidersHorizontal,
  Compass,
  CheckCircle2
} from 'lucide-react';
import PersonCard from '../components/people/PersonCard';
import PeopleFilters from '../components/people/PeopleFilters';
import RequestGuidanceModal from '../components/people/RequestGuidanceModal';
import EmptyState from '../components/common/EmptyState';
import { mockPeople } from '../data/mockPeople';
import { useAuth } from '../context/AuthContext';
import { peopleApi } from '../services/api';

export default function ExplorePeople() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedPersonForGuidance, setSelectedPersonForGuidance] = useState(null);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [dbPeople, setDbPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const initialFilters = {
    company: 'All',
    role: 'All',
    skill: 'All',
    experienceLevel: 'All',
    onlyAvailable: false
  };

  const [filters, setFilters] = useState(initialFilters);

  // Load public profiles from backend MongoDB
  React.useEffect(() => {
    let isMounted = true;
    const fetchPeople = async () => {
      if (!isAuthenticated) return;
      try {
        setIsLoading(true);
        const res = await peopleApi.getPeople({ limit: 50 });
        if (res.success && Array.isArray(res.people) && res.people.length > 0 && isMounted) {
          setDbPeople(res.people);
        }
      } catch (err) {
        console.warn('Could not load community people from backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPeople();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // Combined dataset: backend profiles prioritized, merged with mockPeople for rich discovery
  const allPeople = useMemo(() => {
    if (dbPeople.length > 0) {
      // Merge unique people
      const dbIds = new Set(dbPeople.map(p => p.id));
      const filteredMock = mockPeople.filter(p => !dbIds.has(p.id));
      return [...dbPeople, ...filteredMock];
    }
    return mockPeople;
  }, [dbPeople]);

  const quickSearchChips = [
    'Software Engineer',
    'Product Manager',
    'Data Analyst',
    'Amazon',
    'Google',
    'Java',
    'React',
    'Python'
  ];

  // Extract unique options for filter dropdowns
  const companies = useMemo(() => Array.from(new Set(allPeople.map(p => p.company).filter(Boolean))).sort(), [allPeople]);
  const roles = useMemo(() => Array.from(new Set(allPeople.map(p => p.role || p.targetRole).filter(Boolean))).sort(), [allPeople]);
  const skillsList = useMemo(() => {
    const all = allPeople.flatMap(p => p.skills || []);
    return Array.from(new Set(all.filter(Boolean))).sort();
  }, [allPeople]);
  const experienceLevels = useMemo(() => Array.from(new Set(allPeople.map(p => p.experienceLevel).filter(Boolean))), [allPeople]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
    if (filters.experienceLevel !== 'All') count++;
    if (filters.onlyAvailable) count++;
    return count;
  }, [filters]);

  // Search & Filter Pipeline
  const filteredPeople = useMemo(() => {
    let results = allPeople.filter((person) => {
      // 1. Text Search matching name, company, role, skills, college
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = person.name?.toLowerCase().includes(query);
        const companyMatch = person.company?.toLowerCase().includes(query);
        const roleMatch = (person.role || person.targetRole)?.toLowerCase().includes(query);
        const collegeMatch = person.college?.toLowerCase().includes(query);
        const skillMatch = person.skills?.some(s => s.toLowerCase().includes(query));

        if (!nameMatch && !companyMatch && !roleMatch && !collegeMatch && !skillMatch) {
          return false;
        }
      }

      // 2. Dropdown Filters
      if (filters.company !== 'All' && person.company !== filters.company) return false;
      if (filters.role !== 'All' && (person.role || person.targetRole) !== filters.role) return false;
      if (filters.skill !== 'All' && !person.skills?.includes(filters.skill)) return false;
      if (filters.experienceLevel !== 'All' && person.experienceLevel !== filters.experienceLevel) return false;
      if (filters.onlyAvailable && !person.availableForGuidance) return false;

      return true;
    });

    // 3. Sorting
    if (sortBy === 'experience') {
      results.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    } else if (sortBy === 'recent') {
      results.sort((a, b) => new Date(b.addedDate || 0) - new Date(a.addedDate || 0));
    } else if (sortBy === 'guidance') {
      results.sort((a, b) => {
        if (a.availableForGuidance === b.availableForGuidance) {
          return (b.guidanceCount || 0) - (a.guidanceCount || 0);
        }
        return a.availableForGuidance ? -1 : 1;
      });
    }

    return results;
  }, [allPeople, searchTerm, filters, sortBy]);

  const handleOpenGuidanceModal = (person) => {
    setSelectedPersonForGuidance(person);
    setIsGuidanceModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Explore People
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Learn from people who have already achieved the career goals you're targeting.
          </p>
        </div>
      </div>

      {/* 2. Primary Prominent Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by role, company, skill, or name..."
            className="w-full pl-12 pr-10 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 font-medium transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick-Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 shrink-0">
            Quick search:
          </span>
          {quickSearchChips.map((chip) => {
            const isSelected = searchTerm.toLowerCase() === chip.toLowerCase();
            return (
              <button
                key={chip}
                onClick={() => setSearchTerm(isSelected ? '' : chip)}
                className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Compact Filters Section */}
      <div className="hidden lg:block">
        <PeopleFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          companies={companies}
          roles={roles}
          skillsList={skillsList}
          experienceLevels={experienceLevels}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Mobile Filter Toggle & Controls */}
      <div className="lg:hidden flex items-center justify-between gap-2">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
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
            <option value="guidance">Most Available</option>
            <option value="experience">Most Experienced</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Expandable Mobile Filters Sheet */}
      {showMobileFilters && (
        <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs animate-in fade-in">
          <PeopleFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            companies={companies}
            roles={roles}
            skillsList={skillsList}
            experienceLevels={experienceLevels}
            activeFilterCount={activeFilterCount}
            isMobileModal={true}
            onCloseMobile={() => setShowMobileFilters(false)}
          />
        </div>
      )}

      {/* 4. Results Header: Count & Sorting (Desktop) */}
      <div className="hidden lg:flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'} found
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <option value="recommended">Recommended</option>
            <option value="guidance">Most Available for Guidance</option>
            <option value="experience">Most Experienced</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* 5. People Cards Grid */}
      {filteredPeople.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No people found"
          description="Try clearing your search query or adjusting your filters to discover matching profiles."
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPeople.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onRequestGuidance={handleOpenGuidanceModal}
            />
          ))}
        </div>
      )}

      {/* 6. Guidance Request Modal */}
      <RequestGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        person={selectedPersonForGuidance}
      />
    </div>
  );
}
