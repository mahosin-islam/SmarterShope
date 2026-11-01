import React from 'react';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { HeroSection } from '@/components/store/HeroSection';
import { TickerStrip } from '@/components/store/TickerStrip';
import { CuratedArchives } from '@/components/store/CuratedArchives';
import { FeaturedCollection } from '@/components/store/FeaturedCollection';
import { EditorialBanner } from '@/components/store/EditorialBanner';
import { NewArrivalsSection } from '@/components/store/NewArrivalsSection';
import { EditorialQuote } from '@/components/store/EditorialQuote';
import { BrandManifesto } from '@/components/store/BrandManifesto';
import { AtelierNewsletter } from '@/components/store/AtelierNewsletter';
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
        <CuratedArchives />

        {/* 6. Featured Collection */}
        <FeaturedCollection />

        {/* 7. Mid-Page Editorial Feature & Value Props */}
        <EditorialBanner />

        {/* 8. New Arrivals Drop 01 */}
        <NewArrivalsSection />

        {/* 9. Editorial Testimonial Quote */}
        <EditorialQuote />

        {/* 10. Brand Manifesto & Accordions */}
        <BrandManifesto />

        {/* 11. Atelier Membership Newsletter */}
        <AtelierNewsletter />
      </main>

      {/* 12. Main Footer */}
      <Footer />

      {/* 13. Mobile Bottom Navigation (fixed on small viewports) */}
      <MobileBottomNav />
    </div>
  );
}
