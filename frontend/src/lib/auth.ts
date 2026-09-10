import { useState, useEffect } from 'react';
import { User, api } from './api';

export function saveAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prelegal_token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('prelegal_token');
  }
  return null;
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('prelegal_token');
    localStorage.removeItem('prelegal_user');
  }
}

export function saveCurrentUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prelegal_user', JSON.stringify(user));
  }
}

export function getCurrentUserLocal(): User | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('prelegal_user');
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = getCurrentUserLocal();
    if (local) setUser(local);

    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then((u) => {
          setUser(u);
          saveCurrentUser(u);
        })
        .catch(() => {
          clearAuthToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    clearAuthToken();
    setUser(null);
    window.location.href = '/';
  };

  return { user, loading, logout };
}
