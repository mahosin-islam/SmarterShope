import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { storeService } from '@/features/store/services/store.service';
import { ProductDetailInteractive } from '@/features/store/products/components/ProductDetailInteractive';
import { ProductCard } from '@/features/store/products/components/ProductCard';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await storeService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await storeService.getFeaturedProducts();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-neutral-400 mb-6">
          <Link href="/products" className="inline-flex items-center space-x-1 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to catalog</span>
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-neutral-900 transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-800 font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* Interactive Product Details (Gallery + Actions) */}
        <ProductDetailInteractive product={product} />

        {/* Detailed Description & Accordions */}
        <section className="mt-16 pt-12 border-t border-[#e8e6e3] grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <h2 className="font-editorial text-2xl font-bold text-neutral-900 mb-3">
              Craftsmanship &amp; Provenance
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed font-light">
              {product.description ||
                'Every stitch in this garment represents the intersection of generational textile mastery and modern contemporary aesthetics. Formulated for longevity, tactile comfort, and subtle authority.'}
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <details className="group border border-[#e8e6e3] rounded-xl p-4 open:bg-neutral-50/50 transition-colors">
              <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-xs sm:text-sm uppercase tracking-wider text-neutral-900">
                <span>01. Composition &amp; Materiality</span>
                <ChevronDown className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                Crafted from 100% natural fiber sourcing. Virgin wool woven in Biella, Italy, lined with cupro silk. Fastened with genuine buffalo horn buttons and reinforced bar-tacks at high-stress points.
              </div>
            </details>

            <details className="group border border-[#e8e6e3] rounded-xl p-4 open:bg-neutral-50/50 transition-colors">
              <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-xs sm:text-sm uppercase tracking-wider text-neutral-900">
                <span>02. Sartorial Care Instructions</span>
                <ChevronDown className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                Delicate dry clean only with eco-solvents. Do not tumble dry. Steam press at low temperatures to revive fiber elasticity. Store on broad wooden hangers inside the provided breathable cotton garment bag.
              </div>
            </details>

            <details className="group border border-[#e8e6e3] rounded-xl p-4 open:bg-neutral-50/50 transition-colors">
              <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-xs sm:text-sm uppercase tracking-wider text-neutral-900">
                <span>03. Atelier Shipping &amp; Exchange Terms</span>
                <ChevronDown className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                Orders are dispatched from our central hub within 24 hours. Complimentary carbon-neutral express courier. Return or exchange within 30 days of receipt in original condition with intact seals.
              </div>
            </details>
          </div>
        </section>

        {/* Customer Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#e8e6e3]">
            <h2 className="font-editorial text-2xl font-bold text-neutral-900 mb-6">
              Verified Client Impressions ({product.reviews.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 border border-[#e8e6e3] rounded-xl bg-neutral-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-neutral-800">
                      {rev.user ? `${rev.user.firstName || 'Client'} ${rev.user.lastName || ''}` : 'Verified Client'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-amber-500 text-xs mb-2">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {rev.comment || 'Exceptional craftsmanship and bespoke fit.'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Curated Recommendations / Related Products */}
        <section className="mt-16 pt-12 border-t border-[#e8e6e3]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#ff4600] block mb-1">
                COMPLEMENTARY PIECES
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900">
                You May Also Admire
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#ff4600] hover:text-[#e03e00] tracking-wider uppercase"
            >
              View Full Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
