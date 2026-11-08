import React from 'react';
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

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const [category, productResult] = await Promise.all([
    storeService.getCategoryBySlug(slug),
    storeService.getProducts({ category: slug, limit: 24 }),
  ]);

  if (!category) {
    notFound();
  }

  const { products } = productResult;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-neutral-400 mb-6">
          <Link href="/categories" className="inline-flex items-center space-x-1 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-semibold">{category.name}</span>
        </div>

        {/* Category Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 text-white min-h-[220px] sm:min-h-[280px] flex items-end p-6 sm:p-10 mb-10 border border-[#e8e6e3]">
          {category.imageUrl && (
            <div className="absolute inset-0 z-0">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-1">
              CATEGORY ARCHIVE
            </span>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              {category.description ||
                `Discover our collection of ${category.name.toLowerCase()}, designed with high-grade materials and sartorial discernment.`}
            </p>
          </div>
        </div>

        {/* Products in this category */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#e8e6e3]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-800">
            {products.length} {products.length === 1 ? 'Piece' : 'Pieces'} Available
          </h2>
          <Link
            href={`/products?category=${category.slug}`}
            className="text-xs font-semibold text-[#ff4600] hover:underline"
          >
            Apply Filters &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#e8e6e3] rounded-xl p-8">
            <p className="text-sm text-neutral-600">
              No garments currently listed in this category archive.
            </p>
            <div className="mt-4">
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#ff4600] rounded hover:bg-[#e03e00] transition-colors"
              >
                Explore All Products
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
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
