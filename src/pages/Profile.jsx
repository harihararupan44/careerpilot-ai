import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Award,
  Globe,
  FolderGit2,
  Share2,
  MapPin,
  FileText,
  Edit3,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  Briefcase,
  Target,
  Sparkles,
  Loader2
} from 'lucide-react';
import Card from '../components/common/Card';
import SkillBadge from '../components/common/SkillBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { profileApi } from '../services/api';
import { mockUser } from '../data/mockUser';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Local candidate profile state
  const [profileData, setProfileData] = useState(() => ({
    name: user?.name || mockUser.name,
    email: user?.email || mockUser.email,
    role: user?.role || mockUser.role,
    phone: mockUser.phone || '',
    college: mockUser.college || '',
    degree: mockUser.degree || '',
    branch: 'Computer Science & Engineering',
    graduationYear: 2026,
    gpa: mockUser.gpa || '3.86 / 4.00',
    location: mockUser.location || 'Boston, MA',
    bio: mockUser.bio || '',
    avatar: user?.avatar || mockUser.avatar,
    github: mockUser.github || '',
    linkedin: mockUser.linkedin || '',
    portfolio: mockUser.portfolio || '',
    targetRole: 'Software Engineer',
    skills: mockUser.skills || [],
    projects: mockUser.projects || [],
    openToGuidance: false,
    guidanceTopics: ['DSA', 'Placement Preparation', 'Resume Review'],
    guidanceBio: '',
    guidanceExperience: '',
    preferredGuidanceMode: 'Online'
  }));

  // Fetch live profile from backend on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await profileApi.getProfile();
        if (isMounted && response && response.success) {
          const liveUser = response.user || {};
          const liveProfile = response.profile || {};

          setProfileData((prev) => ({
            ...prev,
            name: liveUser.name || prev.name,
            email: liveUser.email || prev.email,
            role: liveUser.role || prev.role,
            phone: liveProfile.phone !== undefined ? liveProfile.phone : prev.phone,
            college: liveProfile.college || prev.college,
            degree: liveProfile.degree || prev.degree,
            branch: liveProfile.branch || prev.branch,
            graduationYear: liveProfile.graduationYear || prev.graduationYear,
            location: liveProfile.location || prev.location,
            bio: liveProfile.bio || prev.bio,
            github: liveProfile.github || prev.github,
            linkedin: liveProfile.linkedin || prev.linkedin,
            portfolio: liveProfile.portfolio || prev.portfolio,
            targetRole: liveProfile.targetRole || prev.targetRole,
            openToGuidance: Boolean(liveProfile.openToGuidance),
            guidanceTopics:
              Array.isArray(liveProfile.guidanceTopics) && liveProfile.guidanceTopics.length > 0
                ? liveProfile.guidanceTopics
                : prev.guidanceTopics,
            guidanceBio: liveProfile.guidanceBio || prev.guidanceBio,
            guidanceExperience: liveProfile.guidanceExperience || prev.guidanceExperience,
            preferredGuidanceMode: liveProfile.preferredGuidanceMode || 'Online',
            skills:
              Array.isArray(liveProfile.skills) && liveProfile.skills.length > 0
                ? liveProfile.skills.map((s) => (typeof s === 'string' ? { name: s, category: 'Technical' } : s))
                : prev.skills,
            projects:
              Array.isArray(liveProfile.projects) && liveProfile.projects.length > 0
                ? liveProfile.projects.map((p, idx) => ({
                    id: p._id || p.id || `proj-${idx}`,
                    title: p.title || 'Project',
                    description: p.description || '',
                    tags: p.technologies || p.tags || [],
                    link: p.githubUrl || p.link || '',
                    demo: p.liveUrl || p.demo || ''
                  }))
                : prev.projects
          }));
        }
      } catch (error) {
        console.warn('Profile fetch fallback to local session:', error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate profile completion percentage based on filled fields
  const completionPercentage = useMemo(() => {
    const checkFields = [
      Boolean(profileData.name),
      Boolean(profileData.college),
      Boolean(profileData.degree),
      Boolean(profileData.graduationYear),
      Boolean(profileData.location),
      Boolean(profileData.bio),
      Array.isArray(profileData.skills) && profileData.skills.length > 0,
      Boolean(profileData.targetRole),
      Boolean(profileData.github || profileData.linkedin),
      Array.isArray(profileData.projects) && profileData.projects.length > 0
    ];

    const filledCount = checkFields.filter(Boolean).length;
    return Math.round((filledCount / checkFields.length) * 100);
  }, [profileData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Prepare payload for backend API
      const payload = {
        name: profileData.name,
        phone: profileData.phone,
        college: profileData.college,
        degree: profileData.degree,
        branch: profileData.branch,
        graduationYear: profileData.graduationYear ? Number(profileData.graduationYear) : null,
        location: profileData.location,
        bio: profileData.bio,
        targetRole: profileData.targetRole,
        github: profileData.github,
        linkedin: profileData.linkedin,
        portfolio: profileData.portfolio,
        openToGuidance: profileData.openToGuidance,
        guidanceTopics: profileData.guidanceTopics,
        guidanceBio: profileData.guidanceBio,
        guidanceExperience: profileData.guidanceExperience,
        preferredGuidanceMode: profileData.preferredGuidanceMode,
        skills: profileData.skills?.map((s) => (typeof s === 'object' ? s.name : s)),
        projects: profileData.projects?.map((p) => ({
          title: p.title,
          description: p.description,
          technologies: p.tags || p.technologies || [],
          githubUrl: p.link || p.githubUrl || '',
          liveUrl: p.demo || p.liveUrl || ''
        }))
      };

      const result = await profileApi.updateProfile(payload);

      if (result && result.success) {
        updateUserProfile({
          name: profileData.name,
          college: profileData.college,
          degree: profileData.degree,
          graduationYear: profileData.graduationYear,
          location: profileData.location
        });

        addToast({
          title: 'Profile Updated',
          message: 'Your candidate details have been saved to your career profile.',
          type: 'success'
        });
        setIsEditing(false);
      }
    } catch (error) {
      addToast({
        title: 'Save Failed',
        message: error.message || 'Could not save profile changes. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const skillName = newSkill.trim();

    // Prevent duplicate skills
    const exists = profileData.skills?.some(
      (s) => (typeof s === 'object' ? s.name : s).toLowerCase() === skillName.toLowerCase()
    );

    if (exists) {
      addToast({
        title: 'Skill Exists',
        message: `${skillName} is already listed on your profile.`,
        type: 'info'
      });
      return;
    }

    const updatedSkills = [
      ...(profileData.skills || []),
      { name: skillName, category: 'Technical Skills', level: 'Advanced' }
    ];

    setProfileData((prev) => ({
      ...prev,
      skills: updatedSkills
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = profileData.skills?.filter((s) => {
      const name = typeof s === 'object' ? s.name : s;
      return name !== skillToRemove;
    });

    setProfileData((prev) => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header Hero */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={profileData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={profileData?.name || 'User'}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {profileData?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                {profileData?.targetRole || 'Software Engineer'} • Class of {profileData?.graduationYear || '2026'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {profileData?.college} • {profileData?.degree} {profileData?.branch ? `(${profileData?.branch})` : ''}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profileData?.email}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profileData?.location}</span>
              {profileData?.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profileData?.phone}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          {/* Profile Completion Pill */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-bold text-slate-500">Profile Strength</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {completionPercentage}% Completed
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode Form */
        <Card title="Edit Candidate Career Profile" subtitle="Update your profile information stored securely on CareerPilot">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">College / University</label>
                <input
                  type="text"
                  value={profileData.college}
                  onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree</label>
                <input
                  type="text"
                  value={profileData.degree}
                  onChange={(e) => setProfileData({ ...profileData, degree: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Branch / Major</label>
                <input
                  type="text"
                  value={profileData.branch}
                  onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Graduation Year</label>
                <input
                  type="number"
                  min="1950"
                  max="2100"
                  value={profileData.graduationYear || ''}
                  onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Job Role</label>
              <input
                type="text"
                value={profileData.targetRole}
                onChange={(e) => setProfileData({ ...profileData, targetRole: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Software Development Engineer, Frontend Engineer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Career Bio / Summary</label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
                placeholder="Brief summary of your background, career interests, and goals..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={profileData.github}
                  onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                  placeholder="https://github.com/your-username"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Portfolio Website</label>
                <input
                  type="text"
                  value={profileData.portfolio}
                  onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                  placeholder="https://yourportfolio.dev"
                />
              </div>
            </div>

            {/* Career Guidance Preferences */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Career Guidance & Mentorship Preferences
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Allow junior peers and students to discover your profile on /guidance and request placement advice.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.openToGuidance}
                    onChange={(e) => setProfileData({ ...profileData, openToGuidance: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Open to Career Guidance
                  </span>
                </label>
              </div>

              {profileData.openToGuidance && (
                <div className="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Guidance Topics (comma separated)
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(profileData.guidanceTopics)
                            ? profileData.guidanceTopics.join(', ')
                            : profileData.guidanceTopics || ''
                        }
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            guidanceTopics: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          })
                        }
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                        placeholder="e.g. Java, DSA, Placement Preparation, Resume Review"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Preferred Guidance Mode
                      </label>
                      <select
                        value={profileData.preferredGuidanceMode || 'Online'}
                        onChange={(e) => setProfileData({ ...profileData, preferredGuidanceMode: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                      >
                        <option value="Online">Online (Video / Chat)</option>
                        <option value="Offline">Offline (Campus / In-Person)</option>
                        <option value="Both">Both Online & Offline</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Guidance Experience (Mentorship Background)
                    </label>
                    <input
                      type="text"
                      value={profileData.guidanceExperience || ''}
                      onChange={(e) => setProfileData({ ...profileData, guidanceExperience: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                      placeholder="e.g. Software Engineer placement preparation, mentored 15+ juniors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Guidance Bio / What You Can Help With
                    </label>
                    <textarea
                      rows={2}
                      value={profileData.guidanceBio || ''}
                      onChange={(e) => setProfileData({ ...profileData, guidanceBio: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
                      placeholder="e.g. I can help students prepare for Java and DSA problem patterns..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* Career Guidance Status Card in View Mode */}
      <Card
        title="Career Guidance & Mentorship Status"
        subtitle="Manage whether peers and juniors can find you on /guidance to request placement advice"
        action={
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Guidance</span>
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Availability:</span>
              {profileData.openToGuidance ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Open to Career Guidance (Active Guide)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <span>Not Currently Accepting Requests</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Preferred Mode: <strong className="text-slate-800 dark:text-slate-200">{profileData.preferredGuidanceMode || 'Online'}</strong>
            </div>
          </div>

          {profileData.openToGuidance ? (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Mentorship Topics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(profileData.guidanceTopics) && profileData.guidanceTopics.length > 0
                    ? profileData.guidanceTopics
                    : ['DSA', 'Placement Preparation', 'Resume Review']
                  ).map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {profileData.guidanceExperience && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Mentorship Background / Experience:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{profileData.guidanceExperience}</p>
                </div>
              )}

              {profileData.guidanceBio && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Guidance Bio / Summary:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{profileData.guidanceBio}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enable "Open to Career Guidance" in profile edit mode to appear as a guidance provider on the Career Guidance page for other users.
            </p>
          )}
        </div>
      </Card>

      {/* Social & Portfolio Links Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href={profileData?.github || '#'}
          target={profileData?.github ? '_blank' : '_self'}
          rel="noreferrer"
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3 hover:border-indigo-400 transition-colors"
        >
          <FolderGit2 className="w-5 h-5 text-slate-700 dark:text-slate-200 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate">GitHub Profile</span>
            <span className="text-[11px] text-slate-400 truncate block">
              {profileData?.github || 'Not specified'}
            </span>
          </div>
        </a>

        <a
          href={profileData?.linkedin || '#'}
          target={profileData?.linkedin ? '_blank' : '_self'}
          rel="noreferrer"
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3 hover:border-indigo-400 transition-colors"
        >
          <Share2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate">LinkedIn</span>
            <span className="text-[11px] text-slate-400 truncate block">
              {profileData?.linkedin || 'Not specified'}
            </span>
          </div>
        </a>

        <a
          href={profileData?.portfolio || '#'}
          target={profileData?.portfolio ? '_blank' : '_self'}
          rel="noreferrer"
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3 hover:border-indigo-400 transition-colors"
        >
          <Globe className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate">Portfolio Website</span>
            <span className="text-[11px] text-slate-400 truncate block">
              {profileData?.portfolio || 'Not specified'}
            </span>
          </div>
        </a>
      </div>

      {/* Skills Showcase */}
      <Card
        title="Technical Skills & Competencies"
        subtitle="Used by AI Job Intelligence to evaluate matching scores"
        action={
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Rust)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          {profileData?.skills?.map((s, idx) => {
            const skillName = typeof s === 'object' && s !== null ? s.name : String(s);
            return (
              <div key={`${skillName}-${idx}`} className="group relative inline-flex items-center">
                <SkillBadge name={skillName} type="matched" />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skillName)}
                    className="ml-1 p-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove skill"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Projects Showcase */}
      <Card title="Featured Projects">
        <div className="space-y-4">
          {profileData?.projects?.map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{proj.title}</h4>
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    View Code →
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{proj.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(proj.tags || proj.technologies)?.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
