import React, { Suspense } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { ProductCard } from '@/features/store/products/components/ProductCard';
import { storeService } from '@/features/store/services/store.service';
import { Filter, SlidersHorizontal, X } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: 'createdAt' | 'basePrice' | 'title';
    sortOrder?: 'asc' | 'desc';
    featured?: string;
    page?: string;
  }>;
}

function ProductsPageSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="border-b border-[#e8e6e3] pb-6">
        <div className="h-4 w-32 bg-neutral-200 rounded mb-3" />
        <div className="h-8 w-64 bg-neutral-200 rounded mb-2" />
        <div className="h-4 w-48 bg-neutral-100 rounded" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-60 shrink-0 space-y-4">
          <div className="h-5 w-28 bg-neutral-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-7 bg-neutral-100 rounded" />
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/5] bg-neutral-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category;
  const brand = params.brand;
  const search = params.search;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';
  const featured = params.featured === 'true';

  const [categories, result, brands] = await Promise.all([
    storeService.getCategories(),
    storeService.getProducts({
      page,
      limit: 16,
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      featured,
    }),
    storeService.getBrands(),
  ]);

  const { products, meta } = result;

  const activeCategory = categories.find((c) => c.slug === category);
  const activeBrand = brands.find((b) => b.slug === brand);

  return (
    <>
      {/* Header Breadcrumb & Title */}
      <div className="border-b border-[#e8e6e3] pb-6 mb-8">
        <nav className="text-xs uppercase tracking-wider text-neutral-400 mb-2 flex items-center space-x-2">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="text-neutral-900 font-semibold">Catalog</Link>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-[#ff4600] font-semibold">{activeCategory.name}</span>
            </>
          )}
          {activeBrand && (
            <>
              <span>/</span>
              <span className="text-[#ff4600] font-semibold">{activeBrand.name}</span>
            </>
          )}
          {search && (
            <>
              <span>/</span>
              <span className="text-[#ff4600] font-semibold">&ldquo;{search}&rdquo;</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-neutral-900 font-bold tracking-tight">
              {activeCategory ? activeCategory.name : activeBrand ? activeBrand.name : search ? `Search: "${search}"` : 'All Garments & Accessories'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
              {meta.total} {meta.total === 1 ? 'piece' : 'pieces'} found in archive.
            </p>
          </div>

          {/* Quick Sort Links */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-400 uppercase tracking-wider text-[11px]">Sort:</span>
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <Link
                href={`/products?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(brand ? { brand } : {}),
                  ...(search ? { search } : {}),
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                }).toString()}`}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  sortBy === 'createdAt' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(brand ? { brand } : {}),
                  ...(search ? { search } : {}),
                  sortBy: 'basePrice',
                  sortOrder: 'asc',
                }).toString()}`}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  sortBy === 'basePrice' && sortOrder === 'asc' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Price: Low &rarr; High
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(brand ? { brand } : {}),
                  ...(search ? { search } : {}),
                  sortBy: 'basePrice',
                  sortOrder: 'desc',
                }).toString()}`}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  sortBy === 'basePrice' && sortOrder === 'desc' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Price: High &rarr; Low
              </Link>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(category || brand || search || featured) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Filters:</span>
            {category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                Category: {activeCategory?.name || category}
                <Link href={`/products?${new URLSearchParams({ ...(brand ? { brand } : {}), ...(search ? { search } : {}) }).toString()}`} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </Link>
              </span>
            )}
            {brand && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                Brand: {activeBrand?.name || brand}
                <Link href={`/products?${new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}) }).toString()}`} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </Link>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                Query: &ldquo;{search}&rdquo;
                <Link href={`/products?${new URLSearchParams({ ...(category ? { category } : {}), ...(brand ? { brand } : {}) }).toString()}`} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </Link>
              </span>
            )}
            {featured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#fff3ec] text-[#ff4600]">
                Featured Edition
                <Link href="/products" className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </Link>
              </span>
            )}
            <Link href="/products" className="text-xs text-[#ff4600] hover:underline font-medium ml-2">
              Clear all
            </Link>
          </div>
        )}
      </div>

      {/* Content Layout: Categories Strip & Product Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Categories Filter */}
        <aside className="w-full lg:w-60 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Categories
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href={`/products?${new URLSearchParams({ ...(brand ? { brand } : {}), ...(search ? { search } : {}) }).toString()}`}
                  className={`block py-1.5 px-2.5 rounded transition-colors ${
                    !category ? 'bg-[#ff4600] text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  All Categories
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}${brand ? `&brand=${brand}` : ''}`}
                    className={`block py-1.5 px-2.5 rounded transition-colors ${
                      category === c.slug ? 'bg-[#ff4600] text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands Filter */}
          {brands.length > 0 && (
            <div className="pt-6 border-t border-neutral-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
                Ateliers &amp; Brands
              </h3>
              <ul className="space-y-1.5 text-xs">
                {brands.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/products?brand=${b.slug}${category ? `&category=${category}` : ''}`}
                      className={`block py-1.5 px-2.5 rounded transition-colors ${
                        brand === b.slug ? 'bg-[#ff4600] text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#e8e6e3] rounded-2xl p-8">
              <Filter className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-editorial font-semibold text-neutral-800">No pieces found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                We could not find any products matching your specific selection. Try broadening your criteria.
              </p>
              <div className="mt-5">
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#ff4600] rounded hover:bg-[#e03e00] transition-colors"
                >
                  View All Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsContent searchParams={searchParams} />
        </Suspense>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
