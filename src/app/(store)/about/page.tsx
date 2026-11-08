import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { Sparkles, Scissors, Globe2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-neutral-900 text-white py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1600&auto=format&fit=crop"
              alt="Atelier Tailoring Process"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-3">
              THE MODORA HERITAGE
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Quiet Authority.<br />Enduring Form.
            </h1>
            <p className="text-sm sm:text-lg text-neutral-300 font-light max-w-2xl mx-auto leading-relaxed">
              Founded on the belief that true luxury lies in uncompromising materials, intentional tailoring, and garments built to outlast fleeting seasons.
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block">
                OUR PHILOSOPHY
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-neutral-900 font-bold leading-tight">
                Architecting the modern wardrobe with artisanal reverence.
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                In an era dominated by hyper-accelerated cycles and synthetic ubiquity, MODORA exists as a counter-movement. We partner with generational family-owned mills in Biella and Tuscan leather ateliers who regard tailoring as an architectural science.
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                Each silhouette begins with raw natural fiber: high-twist virgin wools, long-staple Egyptian cottons, and vegetable-tanned hides that patina with personal history rather than degrade.
              </p>

              <div className="pt-4 flex items-center space-x-6 text-neutral-800">
                <div>
                  <div className="font-editorial text-3xl font-bold text-[#ff4600]">100%</div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-0.5">Traceable Sourcing</div>
                </div>
                <div className="h-8 w-px bg-neutral-200" />
                <div>
                  <div className="font-editorial text-3xl font-bold text-[#ff4600]">4</div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-0.5">Partner Ateliers</div>
                </div>
                <div className="h-8 w-px bg-neutral-200" />
                <div>
                  <div className="font-editorial text-3xl font-bold text-[#ff4600]">&infin;</div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-0.5">Timeless Design</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#e8e6e3] shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop"
                alt="Modora Master Tailoring"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Pillars / Values Grid */}
        <section className="bg-neutral-50 py-16 sm:py-24 border-y border-[#e8e6e3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-2">
                FOUR CORNERSTONES
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                How We Formulate Every Piece
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#e8e6e3] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
                  <Scissors className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-neutral-900">Bespoke Geometry</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Hand-draped chest canvases and floating shoulder pads that mold naturally to your posture over time.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e8e6e3] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-neutral-900">Noble Textiles</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Pure Merino wools, Mulberry silks, and Scottish tweeds milled without microplastics or synthetic blending.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e8e6e3] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
                  <Globe2 className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-neutral-900">Fair Atelier Wages</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Direct master craftsman compensation far above European living wage benchmarks, preserving historic artisanal trades.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e8e6e3] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-neutral-900">Generational Lifespan</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Reinforced seam allowances that permit full tailoring adjustments and repairs for decades of wear.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Experience the Distinction
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto mb-8">
            Explore our curated catalog of hand-finished tailoring, footwear, knitwear, and leather goods.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-lg shadow-md hover:shadow-orange-600/30 transition-all"
          >
            <span>Explore The Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
