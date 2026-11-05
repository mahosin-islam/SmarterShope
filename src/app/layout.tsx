import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/features/auth/contexts/authContext';
import { AuthModalProvider } from '@/features/auth/contexts/authModal.context';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { GoogleOneTap } from '@/features/auth/components/GoogleOneTap';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MODORA — Minimalist European Luxury & Artisanal Wardrobe',
  description:
    'Qualitative tailoring and artisanal wardrobe foundations. Fluid monochromes, tailored coats, and curated archives.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AuthModalProvider>
            {children}
            {/* AuthModal rendered at root so it works on every page */}
            <AuthModal />
            {/* Google One Tap prompt for visitors */}
            <GoogleOneTap />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
