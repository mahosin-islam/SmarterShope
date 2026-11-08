import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { storeService } from '@/features/store/services/store.service';
import { ArrowRight } from 'lucide-react';

export default async function BrandsPage() {
  const brands = await storeService.getBrands();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-2">
            PARTNER ATELIERS
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Master Houses &amp; Ateliers
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
            Collaborating with generational craft workshops across Florence, Zurich, Piedmont, and Copenhagen.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {brands.map((b) => (
            <div
              key={b.id}
              className="group border border-[#e8e6e3] rounded-2xl overflow-hidden bg-white hover:border-[#ff4600] transition-all p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-4 mb-5">
                  {b.logoUrl ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#e8e6e3] shrink-0 bg-neutral-100">
                      <Image
                        src={b.logoUrl}
                        alt={b.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-neutral-100 border border-[#e8e6e3] flex items-center justify-center font-editorial font-bold text-lg text-neutral-800 shrink-0">
                      {b.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h2 className="font-editorial text-2xl font-bold text-neutral-900 group-hover:text-[#ff4600] transition-colors">
                      {b.name}
                    </h2>
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                      Atelier Certified
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light mb-6">
                  {b.description || 'Specializing in timeless artisanal production, hand-selected textiles, and refined silhouettes.'}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href={`/brands/${b.slug}`}
                  className="text-xs font-semibold text-neutral-600 hover:text-[#ff4600] transition-colors"
                >
                  Read Atelier Story
                </Link>

                <Link
                  href={`/products?brand=${b.slug}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#ff4600] group-hover:translate-x-1 transition-transform"
                >
                  <span>Explore Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
