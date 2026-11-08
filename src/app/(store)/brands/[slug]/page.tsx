import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { ProductCard } from '@/features/store/products/components/ProductCard';
import { storeService } from '@/features/store/services/store.service';
import { ArrowLeft } from 'lucide-react';

interface BrandDetailPageProps {
  params: Promise<{ slug: string }>;
}

function BrandDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-4 w-40 bg-neutral-200 rounded" />
      <div className="h-40 bg-neutral-100 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] bg-neutral-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function BrandDetailContent({ params }: BrandDetailPageProps) {
  const { slug } = await params;
  const [brand, productResult] = await Promise.all([
    storeService.getBrandBySlug(slug),
    storeService.getProducts({ brand: slug, limit: 24 }),
  ]);

  if (!brand) {
    notFound();
  }

  const { products } = productResult;

  return (
    <>
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-neutral-400 mb-6">
        <Link href="/brands" className="inline-flex items-center space-x-1 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Ateliers</span>
        </Link>
        <span>/</span>
        <span className="text-neutral-800 font-semibold">{brand.name}</span>
      </div>

      {/* Brand Showcase Header */}
      <div className="border border-[#e8e6e3] rounded-2xl p-6 sm:p-10 mb-10 bg-neutral-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          {brand.logoUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#e8e6e3] bg-white shrink-0">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white border border-[#e8e6e3] flex items-center justify-center font-editorial font-bold text-2xl text-neutral-800 shrink-0">
              {brand.name.charAt(0)}
            </div>
          )}

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-1">
              MASTER WORKSHOP
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-900">
              {brand.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl font-light">
              {brand.description || 'Crafting quintessential garments characterized by tactile elegance and superior durability.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex gap-2">
          <Link
            href={`/products?brand=${brand.slug}`}
            className="inline-flex items-center px-5 py-2.5 bg-[#ff4600] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#e03e00] transition-colors"
          >
            Filter in Catalog
          </Link>
        </div>
      </div>

      {/* Brand Products Grid */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#e8e6e3]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-800">
          {products.length} {products.length === 1 ? 'Garment' : 'Garments'} by {brand.name}
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#e8e6e3] rounded-xl p-8">
          <p className="text-sm text-neutral-600">
            No garments currently available under this specific atelier label.
          </p>
          <div className="mt-4">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#ff4600] rounded hover:bg-[#e03e00] transition-colors"
            >
              Explore Full Archive
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

export default function BrandDetailPage({ params }: BrandDetailPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Suspense fallback={<BrandDetailSkeleton />}>
          <BrandDetailContent params={params} />
        </Suspense>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
