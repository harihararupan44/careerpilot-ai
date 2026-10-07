import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { mockUser } from '../data/mockUser';

const AuthContext = createContext(null);

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
            // Merge DB user with mockUser template to provide rich mock profile attributes (avatar, college, etc.)
            const fullUserProfile = {
              ...mockUser,
              ...data.user,
              id: data.user.id || mockUser.id,
              name: data.user.name || mockUser.name,
              email: data.user.email || mockUser.email,
              role: data.user.role || mockUser.role
            };
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
        const fullUser = {
          ...mockUser,
          ...data.user,
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
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
        const fullUser = {
          ...mockUser,
          ...userData,
          ...data.user,
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
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
