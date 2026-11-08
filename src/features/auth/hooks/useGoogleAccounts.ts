'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'modora_google_accounts';

export interface GoogleAccount {
  email: string;
  name?: string;
  picture?: string;
}

export function useGoogleAccounts() {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        queueMicrotask(() => setAccounts(parsed));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist to localStorage whenever accounts change
  const saveAccounts = useCallback(
    (next: GoogleAccount[]) => {
      setAccounts(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
    },
    []
  );

  // Add a new account (called after successful Google login)
  const addAccount = useCallback(
    (account: GoogleAccount) => {
      setAccounts((prev) => {
        const exists = prev.some((a) => a.email === account.email);
        if (exists) return prev;
        const updated = [account, ...prev].slice(0, 5); // Keep last 5
        saveAccounts(updated);
        return updated;
      });
    },
    [saveAccounts]
  );

  // Remove an account
  const removeAccount = useCallback(
    (email: string) => {
      setAccounts((prev) => {
        const updated = prev.filter((a) => a.email !== email);
        saveAccounts(updated);
        return updated;
      });
    },
    [saveAccounts]
  );

  return { accounts, addAccount, removeAccount };
}
