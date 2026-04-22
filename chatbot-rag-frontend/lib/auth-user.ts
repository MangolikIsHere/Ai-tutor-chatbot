'use client';

import { useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

const AUTH_USER_STORAGE_KEY = 'rag_auth_user';
const AUTH_USER_EVENT = 'rag-auth-user-changed';

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed?.email || typeof parsed.email !== 'string') return null;
    return {
      email: parsed.email,
      displayName: parsed.displayName ?? null,
      photoURL: parsed.photoURL ?? null,
    };
  } catch {
    return null;
  }
}

function dispatchAuthUserEvent(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AuthUser | null>(AUTH_USER_EVENT, { detail: user }));
}

export function setStoredAuthUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;

  if (!user) {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    dispatchAuthUserEvent(null);
    return;
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  dispatchAuthUserEvent(user);
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  return parseStoredUser(window.localStorage.getItem(AUTH_USER_STORAGE_KEY));
}

export function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Neural User';
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }

  const localPart = user.email.split('@')[0] ?? '';
  const pretty = localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

  return pretty || 'Neural User';
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readFromStorage = () => {
      setUser(getStoredAuthUser());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== AUTH_USER_STORAGE_KEY) return;
      readFromStorage();
    };

    const onAuthUserChanged = () => {
      readFromStorage();
    };

    readFromStorage();
    window.addEventListener('storage', onStorage);
    window.addEventListener(AUTH_USER_EVENT, onAuthUserChanged);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(AUTH_USER_EVENT, onAuthUserChanged);
    };
  }, []);

  const displayName = useMemo(() => getDisplayName(user), [user]);

  return { user, displayName };
}
