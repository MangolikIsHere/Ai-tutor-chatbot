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

function getManualName(email: string): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(`manual_name_${email.toLowerCase()}`) || '';
}

function getNeuralUserDisplayName(): string {
  if (typeof window === 'undefined') return '';
  try {
    const neuralUser = JSON.parse(window.localStorage.getItem('neural_user') || '{}');
    return neuralUser.displayName || '';
  } catch {
    return '';
  }
}

export function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest';

  // 1. stored displayName
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }

  // 2. manually saved signup name
  const manualName = getManualName(user.email);
  if (manualName && manualName.trim().length > 0) {
    return manualName.trim();
  }

  // 3. Neural User
  const neuralName = getNeuralUserDisplayName();
  if (neuralName && neuralName.trim().length > 0) {
    return neuralName.trim();
  }

  // 4. email local part prettified
  const localPart = user.email.split('@')[0] ?? '';
  const pretty = localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

  return pretty || 'Guest';
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
