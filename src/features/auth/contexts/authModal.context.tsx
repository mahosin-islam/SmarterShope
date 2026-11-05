'use client';

// AuthModalContext — global state to open/close the auth modal from anywhere (e.g., Navbar).

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type AuthModalTab = 'login' | 'register';

interface AuthModalContextValue {
  isOpen: boolean;
  activeTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  switchTab: (tab: AuthModalTab) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthModalTab>('login');

  const openAuthModal = useCallback((tab: AuthModalTab = 'login') => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchTab = useCallback((tab: AuthModalTab) => {
    setActiveTab(tab);
  }, []);

  const value = useMemo<AuthModalContextValue>(
    () => ({ isOpen, activeTab, openAuthModal, closeAuthModal, switchTab }),
    [isOpen, activeTab, openAuthModal, closeAuthModal, switchTab],
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used inside <AuthModalProvider>');
  return ctx;
}
