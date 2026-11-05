'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/authContext';
import { authService } from '@/features/auth/services/auth.service';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser: setAuthUser } = useAuth();

  const errorParam = searchParams.get('error');
  const messageParam = searchParams.get('message');
  const redirectTo = searchParams.get('redirect_to');

  const [asyncState, setAsyncState] = useState<{
    status: 'loading' | 'success' | 'error';
    message?: string;
  }>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    async function completeSession() {
      if (errorParam) {
        setAsyncState({
          status: 'error',
          message:
            messageParam ||
            (errorParam === 'access_denied'
              ? 'Access was denied by Google.'
              : errorParam === 'GOOGLE_ACCOUNT_LINK_REQUIRED'
                ? 'An account with this email address was registered using a password. Please log in with your email and password instead.'
                : 'Failed to complete Google authentication.'),
        });
        return;
      }

      try {
        const user = await authService.getMe();
        if (!isMounted) return;

        setAuthUser(user);
        setAsyncState({ status: 'success' });

        setTimeout(() => {
          if (redirectTo && redirectTo.startsWith('/')) {
            router.replace(redirectTo);
          } else {
            router.replace('/');
          }
          router.refresh();
        }, 500);
      } catch (err: unknown) {
        if (!isMounted) return;
        setAsyncState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to retrieve your account profile.',
        });
      }
    }

    void completeSession();

    return () => {
      isMounted = false;
    };
  }, [errorParam, messageParam, redirectTo, router, setAuthUser]);

  const handleOpenLogin = () => {
    router.replace('/');
  };

  const currentMessage = asyncState.message;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        {asyncState.status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#ff4600] mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">Completing Sign-In</h1>
            <p className="text-sm text-gray-500">
              Please wait while we verify your session and establish your login...
            </p>
          </div>
        )}

        {asyncState.status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">Signed In Successfully</h1>
            <p className="text-sm text-gray-500">Redirecting to your destination...</p>
          </div>
        )}

        {asyncState.status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">Authentication Failed</h1>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl text-left leading-relaxed">
              {currentMessage}
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleOpenLogin}
                className="w-full py-3 bg-[#ff4600] hover:bg-[#e03e00] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition"
              >
                Try Again
              </button>

              <Link
                href="/"
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800 transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#ff4600]" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
