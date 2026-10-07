import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Search,
  Sparkles,
  ArrowUpDown,
  X,
  Compass,
  Users,
  MessageSquare,
  Briefcase,
  Loader2,
  Plus,
  Bookmark
} from 'lucide-react';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyFilters from '../components/companies/CompanyFilters';
import EmptyState from '../components/common/EmptyState';
import { companyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Companies() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'popular' | 'interviews' | 'people' | 'latest'
  
  const initialFilters = {
    industry: 'All',
    role: 'All',
    hiringType: 'All'
  };

  const [filters, setFilters] = useState(initialFilters);

  const suggestedSearches = [
    'Amazon',
    'Google',
    'Microsoft',
    'TCS',
    'Infosys',
    'Accenture',
    'Zoho',
    'Wipro'
  ];

  // Fetch companies from backend
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        limit: 50,
        sort: sortBy
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filters.industry !== 'All') params.industry = filters.industry;
      if (filters.role !== 'All') params.role = filters.role;
      if (filters.hiringType !== 'All') params.companyType = filters.hiringType;

      const res = await companyApi.getCompanies(params);
      if (res.success && Array.isArray(res.data)) {
        setCompanies(res.data);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.warn('Could not load companies from backend:', err.message);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filters, sortBy]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Extract unique options for filter dropdowns
  const industries = useMemo(() => {
    const list = companies.map((c) => c.industry).filter(Boolean);
    const defaults = ['E-Commerce & Cloud Infrastructure', 'Internet, AI & Cloud Technologies', 'Cloud & Enterprise Software', 'IT Services & Consulting', 'SaaS & Business Productivity Software', 'Fintech & Payment Gateway Infrastructure'];
    return Array.from(new Set([...list, ...defaults])).sort();
  }, [companies]);

  const roles = useMemo(() => {
    const all = companies.flatMap((c) => c.popularRoles || c.specializations || []);
    return Array.from(new Set(all.filter(Boolean))).sort();
  }, [companies]);

  const hiringTypes = useMemo(() => {
    const list = companies.map((c) => c.companyType || c.hiringType).filter(Boolean);
    const defaults = ['Product-Based', 'Service-Based', 'Enterprise SaaS', 'Public', 'Private', 'Startup'];
    return Array.from(new Set([...list, ...defaults])).sort();
  }, [companies]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.industry !== 'All') count++;
    if (filters.role !== 'All') count++;
    if (filters.hiringType !== 'All') count++;
    return count;
  }, [filters]);

  // Save / Bookmark Toggle
  const handleToggleSave = async (company) => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign in Required',
        message: 'Please log in to save companies to your bookmarks.',
        type: 'info'
      });
      return;
    }

    const compId = company.id || company._id || company.slug;
    const currentlySaved = Boolean(company.isSaved);

    try {
      if (currentlySaved) {
        await companyApi.unsaveCompany(compId);
        setCompanies((prev) =>
          prev.map((c) => (c.id === compId || c._id === compId ? { ...c, isSaved: false } : c))
        );
        addToast({
          title: 'Company Removed',
          message: `${company.name} was removed from your saved companies.`,
          type: 'info'
        });
      } else {
        await companyApi.saveCompany(compId);
        setCompanies((prev) =>
          prev.map((c) => (c.id === compId || c._id === compId ? { ...c, isSaved: true } : c))
        );
        addToast({
          title: 'Company Saved',
          message: `${company.name} has been added to your saved bookmarks.`,
          type: 'success'
        });
      }
    } catch (err) {
      addToast({
        title: 'Action Error',
        message: err.message || 'Could not update saved company status.',
        type: 'error'
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Directory & Placement Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Explore Companies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Discover companies, alumni working there, popular hiring roles, common skills, and real interview experiences.
          </p>
        </div>
      </div>

      {/* Search Bar & Quick Suggestion Chips */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search company names (e.g., Amazon, Google, TCS, Zoho)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-medium placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
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

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Popular Companies:
          </span>
          {suggestedSearches.map((comp) => {
            const isSelected = searchTerm.toLowerCase() === comp.toLowerCase();
            return (
              <button
                key={comp}
                type="button"
                onClick={() => setSearchTerm(isSelected ? '' : comp)}
                className={`shrink-0 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {comp}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Component */}
      <CompanyFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        industries={industries}
        roles={roles}
        hiringTypes={hiringTypes}
        activeFilterCount={activeFilterCount}
      />

      {/* Results Header & Sort Bar */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-semibold text-slate-600 dark:text-slate-400">
          Showing{' '}
          <strong className="text-slate-900 dark:text-slate-100">
            {companies.length}
          </strong>{' '}
          {companies.length === 1 ? 'company' : 'companies'}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-700 dark:text-slate-300 focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="name">Name (A-Z)</option>
            <option value="popular">Most Popular</option>
            <option value="people">Most Alumni</option>
            <option value="interviews">Most Interview Experiences</option>
            <option value="latest">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Company Cards Grid / Loading State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Loading companies...
          </p>
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id || company._id || company.slug}
              company={company}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No companies found"
          description="We couldn't find any companies matching your search or filter criteria. Try resetting filters."
          icon={Building2}
          actionLabel="Reset All Filters"
          onAction={handleClearFilters}
        />
      )}
    </div>
  );
}
