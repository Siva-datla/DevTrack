import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear auth state and storage
  const clearAuth = useCallback(() => {
    localStorage.removeItem('devtrack_access_token');
    localStorage.removeItem('devtrack_refresh_token');
    setUser(null);
    setError(null);
  }, []);

  // Save tokens to storage
  const saveTokens = (tokens) => {
    if (tokens?.accessToken) {
      localStorage.setItem('devtrack_access_token', tokens.accessToken);
    }
    if (tokens?.refreshToken) {
      localStorage.setItem('devtrack_refresh_token', tokens.refreshToken);
    }
  };

  // Load current user profile on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('devtrack_access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          clearAuth();
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid token:', err.message);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for custom logout event triggered by API interceptor
    const handleLogoutEvent = () => clearAuth();
    window.addEventListener('devtrack:logout', handleLogoutEvent);
    return () => window.removeEventListener('devtrack:logout', handleLogoutEvent);
  }, [clearAuth]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        saveTokens(res.data.tokens);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Invalid credentials';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await authApi.register(name, email, password);
      if (res.success && res.data) {
        saveTokens(res.data.tokens);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    const refreshToken = localStorage.getItem('devtrack_refresh_token');
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
    }
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
