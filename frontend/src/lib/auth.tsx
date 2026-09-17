'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, api } from './api';

const TOKEN_KEY = 'prelegal_token';
const USER_KEY = 'prelegal_user';
const AUTH_EVENT = 'jurisdraft-auth-state-change';

export function saveAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  }
}

export function saveCurrentUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  }
}

export function getCurrentUserLocal(): User | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize local storage state into React state
  const syncFromStorage = useCallback(() => {
    const localToken = getAuthToken();
    const localUser = getCurrentUserLocal();
    setToken(localToken);
    setUser(localUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const liveUser = await api.getMe();
      setUser(liveUser);
      saveCurrentUser(liveUser);
    } catch (err) {
      clearAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();
    refreshUser();

    // Listen for cross-window / cross-tab storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        syncFromStorage();
      }
    };

    // Listen for custom in-app auth events
    const handleAuthEvent = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(AUTH_EVENT, handleAuthEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(AUTH_EVENT, handleAuthEvent);
    };
  }, [syncFromStorage, refreshUser]);

  const login = useCallback((newToken: string, newUser: User) => {
    saveAuthToken(newToken);
    saveCurrentUser(newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  // Fallback for any standalone caller outside of provider tree
  const [fallbackUser, setFallbackUser] = useState<User | null>(getCurrentUserLocal);
  const [fallbackLoading, setFallbackLoading] = useState(true);

  useEffect(() => {
    if (context) return; // provider handles it
    const u = getCurrentUserLocal();
    setFallbackUser(u);
    setFallbackLoading(false);

    const onAuthEvent = () => {
      setFallbackUser(getCurrentUserLocal());
    };
    window.addEventListener(AUTH_EVENT, onAuthEvent);
    return () => window.removeEventListener(AUTH_EVENT, onAuthEvent);
  }, [context]);

  if (context) {
    return context;
  }

  return {
    user: fallbackUser,
    token: getAuthToken(),
    loading: fallbackLoading,
    login: (token: string, user: User) => {
      saveAuthToken(token);
      saveCurrentUser(user);
      setFallbackUser(user);
    },
    logout: () => {
      clearAuthToken();
      setFallbackUser(null);
      window.location.href = '/';
    },
    refreshUser: async () => {},
  };
}
