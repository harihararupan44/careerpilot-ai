import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, profileApi } from '../services/api';

const AuthContext = createContext(null);

const buildFullUser = (authUser, profile) => {
  if (!authUser) return null;
  return {
    id: authUser.id || authUser._id,
    _id: authUser.id || authUser._id,
    name: authUser.name || 'User',
    email: authUser.email || '',
    role: authUser.role || 'student',
    phone: profile?.phone || '',
    college: profile?.college || '',
    degree: profile?.degree || '',
    branch: profile?.branch || '',
    graduationYear: profile?.graduationYear || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    targetRole: profile?.targetRole || 'Software Engineer',
    careerInterests: profile?.careerInterests || [],
    github: profile?.github || '',
    linkedin: profile?.linkedin || '',
    portfolio: profile?.portfolio || '',
    projects: profile?.projects || [],
    profileVisibility: profile?.profileVisibility || 'Public',
    careerStatus: profile?.careerStatus || 'Actively Looking',
    avatar: profile?.avatar || '',
    openToGuidance: Boolean(profile?.openToGuidance),
    guidanceTopics: profile?.guidanceTopics || [],
    guidanceBio: profile?.guidanceBio || '',
    guidanceExperience: profile?.guidanceExperience || '',
    preferredGuidanceMode: profile?.preferredGuidanceMode || 'Online'
  };
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('careerpilot_token');
    if (savedToken && !savedToken.startsWith('demo_jwt_token_') && savedToken !== 'undefined' && savedToken !== 'null') {
      return savedToken;
    }
    return null;
  });
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('careerpilot_token');
    const savedUser = localStorage.getItem('careerpilot_user');
    if (savedToken && !savedToken.startsWith('demo_jwt_token_') && savedToken !== 'undefined' && savedToken !== 'null' && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedToken = localStorage.getItem('careerpilot_token');
    return Boolean(savedToken && !savedToken.startsWith('demo_jwt_token_') && savedToken !== 'undefined' && savedToken !== 'null');
  });
  const [loading, setLoading] = useState(true);

  // Hydrate user profile from backend on app load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('careerpilot_token');
      if (savedToken) {
        // Clean up any stale or mock tokens
        if (
          savedToken.startsWith('demo_jwt_token_') ||
          savedToken === 'undefined' ||
          savedToken === 'null'
        ) {
          localStorage.removeItem('careerpilot_token');
          localStorage.removeItem('careerpilot_user');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        try {
          const data = await authApi.getMe();
          if (data && data.success && data.user) {
            let profile = null;
            try {
              const profRes = await profileApi.getProfile();
              if (profRes && profRes.success) {
                profile = profRes.profile;
              }
            } catch (e) {
              // Profile may not exist yet
            }

            const fullUserProfile = buildFullUser(data.user, profile);
            setUser(fullUserProfile);
            localStorage.setItem('careerpilot_user', JSON.stringify(fullUserProfile));
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.warn('Session check note:', error.message);
          // If token verification fails and it is not a network error, clear invalid session
          if (error.statusCode === 401) {
            localStorage.removeItem('careerpilot_token');
            localStorage.removeItem('careerpilot_user');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user via backend API
   */
  const login = async (email, password) => {
    // Standardize demo placeholder password to backend seed password
    const effectivePassword =
      password === '••••••••••••' ? 'demo123' : password;

    try {
      const data = await authApi.login({ email, password: effectivePassword });
      if (data && data.token) {
        localStorage.setItem('careerpilot_token', data.token);
        let profile = null;
        try {
          const profRes = await profileApi.getProfile();
          if (profRes && profRes.success) {
            profile = profRes.profile;
          }
        } catch (e) {}

        const fullUser = buildFullUser(data.user, profile);
        localStorage.setItem('careerpilot_user', JSON.stringify(fullUser));
        setToken(data.token);
        setUser(fullUser);
        setIsAuthenticated(true);
        return { success: true, user: fullUser };
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register user via backend API
   */
  const register = async (userData) => {
    try {
      const data = await authApi.register({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });

      if (data && data.token) {
        localStorage.setItem('careerpilot_token', data.token);
        const fullUser = buildFullUser(data.user, null);
        localStorage.setItem('careerpilot_user', JSON.stringify(fullUser));
        setToken(data.token);
        setUser(fullUser);
        setIsAuthenticated(true);
        return { success: true, user: fullUser };
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user and clear stored token
   */
  const logout = () => {
    localStorage.removeItem('careerpilot_token');
    localStorage.removeItem('careerpilot_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update profile state locally
   */
  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...updatedData
      };
      localStorage.setItem('careerpilot_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
