'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppUser } from '@/lib/types';
import type { StoredSession } from '@/lib/session';
import { saveSession, loadSession, clearSession as clearStoredSession } from '@/lib/session';
import { fetchCurrentUser } from '@/lib/api/auth';

interface AuthContextValue {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setSession: (session: StoredSession) => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    const stored = loadSession();
    if (!stored) {
      setLoading(false);
      return;
    }
    setUser(stored.user);
    setToken(stored.token);
    try {
      const latestUser = await fetchCurrentUser(stored.token);
      setUser(latestUser);
      saveSession({ token: stored.token, user: latestUser });
      setError(null);
    } catch (err) {
      console.error('[AuthProvider] Failed to refresh user', err);
      clearStoredSession();
      setUser(null);
      setToken(null);
      setError('Session expired. Please sign in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const setSession = useCallback((session: StoredSession) => {
    saveSession(session);
    setUser(session.user);
    setToken(session.token);
    setError(null);
  }, []);

  const signOut = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const latestUser = await fetchCurrentUser(token);
      setUser(latestUser);
      saveSession({ token, user: latestUser });
      setError(null);
    } catch (err) {
      console.error('[AuthProvider] refreshUser failed', err);
      signOut();
    } finally {
      setLoading(false);
    }
  }, [token, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      error,
      setSession,
      signOut,
      refreshUser,
    }),
    [user, token, loading, error, setSession, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

