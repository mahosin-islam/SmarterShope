'use client';

import { useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/authContext';
import { useAuthModal } from '@/features/auth/contexts/authModal.context';
import { authService } from '@/features/auth/services/auth.service';
import { useGoogleAccounts } from '@/features/auth/hooks/useGoogleAccounts';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            prompt_parent_id?: string;
            itp_support?: boolean;
          }) => void;
          prompt: (
            momentCallback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
              getDismissedReason: () => string;
            }) => void
          ) => void;
          cancel: () => void;
        };
      };
    };
    googleTriggerPrompt?: () => void;
  }
}

export function GoogleOneTap() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setUser } = useAuth();
  const { isOpen: isModalOpen, openAuthModal, switchTab } = useAuthModal();
  const { addAccount } = useGoogleAccounts();
  const isInitializedRef = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const pathname = usePathname();

  const isAuthPage = ['/login', '/register', '/forgot-password', '/auth/callback'].includes(
    pathname
  );

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      if (!response.credential) return;

      try {
        const user = await authService.googleOneTap(response.credential);
        setUser(user);

        // Remember the email for one-click chips on landing page
        if (user.email) {
          addAccount({ email: user.email });
        }

        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          router.push('/admin/dashboard');
        }
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google One Tap sign-in failed.';
        if (
          message.includes('GOOGLE_ACCOUNT_LINK_REQUIRED') ||
          message.toLowerCase().includes('password')
        ) {
          switchTab('login');
          openAuthModal();
        }
      }
    },
    [setUser, router, switchTab, openAuthModal, addAccount]
  );

  // Initialize Google One Tap exactly once. Only initialize — do NOT auto-call prompt()
  // on page load, because FedCM get() throws NetworkError when no Google session exists.
  // The prompt is triggered manually via window.googleTriggerPrompt() from Navbar chips.
  useEffect(() => {
    if (!clientId || typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    if (isInitializedRef.current) {
      return;
    }

    if (isAuthenticated || isLoading || isModalOpen || isAuthPage) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
      });

      isInitializedRef.current = true;
    } catch {
      // Graceful fallback if initialize throws
    }
  }, [clientId, isAuthenticated, isLoading, isModalOpen, isAuthPage, handleCredentialResponse]);

  // Expose a global trigger so Navbar chips can open the Google account chooser.
  // This is called after a chip click; prompt() will show previously used accounts.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.googleTriggerPrompt = () => {
      if (!clientId || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            // No session or opt_out — silently handled
          } else if (notification.isDismissedMoment()) {
            // User dismissed — silently handled
          }
        });
      } catch {
        // Silently handle FedCM errors
      }
    };

    return () => {
      delete (window as unknown as { googleTriggerPrompt?: () => void }).googleTriggerPrompt;
    };
  }, [clientId]);

  // On unmount, cancel any pending Google request.
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch {
          // Ignore — cancellation during navigation is expected
        }
      }
    };
  }, []);

  // Never render UI if already authenticated — Script stays mounted
  if (isAuthenticated) {
    return null;
  }

  return (
    <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
  );
}
