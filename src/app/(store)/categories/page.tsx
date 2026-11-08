import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { storeService } from '@/features/store/services/store.service';
import { ArrowUpRight } from 'lucide-react';

export default async function CategoriesPage() {
  const categories = await storeService.getCategories();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-2">
            ATELIER ARCHIVES
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Curated Categories
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
            Every department reflects our commitment to noble textiles, sculptural lines, and timeless wardrobe architecture.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-[#e8e6e3] bg-neutral-100 flex flex-col aspect-[4/5] hover:shadow-xl transition-all duration-500"
            >
              {/* Background Image */}
              <div className="relative w-full h-full">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Category Info Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between text-white">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-300 block mb-1">
                    {cat.itemCount ? `${cat.itemCount} Pieces` : 'Collection'}
                  </span>
                  <h2 className="font-editorial text-2xl font-bold tracking-tight">
                    {cat.name}
                  </h2>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#ff4600] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-5 h-5 stroke-[2]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
