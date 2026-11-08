import React, { Suspense } from 'react';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { HeroSection } from '@/features/store/home/components/HeroSection';
import { TickerStrip } from '@/features/store/home/components/TickerStrip';
import { CuratedArchives, CuratedArchivesSkeleton } from '@/features/store/home/components/CuratedArchives';
import { FeaturedCollection, FeaturedCollectionSkeleton } from '@/features/store/home/components/FeaturedCollection';
import { EditorialBanner } from '@/features/store/home/components/EditorialBanner';
import { EditorialQuote } from '@/features/store/home/components/EditorialQuote';
import { BrandManifesto } from '@/features/store/home/components/BrandManifesto';
import { AtelierNewsletter } from '@/features/store/home/components/AtelierNewsletter';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Top Announcement Ribbon */}
      <AnnouncementBar />

      {/* 2. Primary Navigation Header with Search */}
      <Navbar />

      <main className="flex-1">
        {/* 3. Hero Section */}
        <HeroSection />

        {/* 4. Editorial Ticker Strip */}
        <TickerStrip />

        {/* 5. Curated Archives Categories */}
        <Suspense fallback={<CuratedArchivesSkeleton />}>
          <CuratedArchives />
        </Suspense>

        {/* 6. Featured Collection */}
        <Suspense fallback={<FeaturedCollectionSkeleton />}>
          <FeaturedCollection />
        </Suspense>

        {/* 7. Mid-Page Editorial Feature & Value Props */}
        <EditorialBanner />

        {/* 8. Editorial Testimonial Quote */}
        <EditorialQuote />

        {/* 9. Brand Manifesto & Accordions */}
        <BrandManifesto />

        {/* 10. Atelier Membership Newsletter */}
        <AtelierNewsletter />
      </main>

      {/* 11. Main Footer */}
      <Footer />

      {/* 12. Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
