import React from 'react';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { ContactForm } from '@/features/store/contact/ContactForm';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-neutral-50 border-b border-[#e8e6e3] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-2">
            ATELIER CONCIERGE
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Private Enquiry Desk
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-xl mx-auto leading-relaxed">
            Our atelier concierge team is available to assist with bespoke consultations, order inquiries, and tailoring appointments.
          </p>
        </section>

        {/* Main Contact Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left: Contact Information */}
            <aside className="lg:col-span-4 space-y-8">
              <div>
                <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-5">
                  Flagship Showrooms
                </h2>
                <div className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="w-9 h-9 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                        Florence — Main Atelier
                      </h3>
                      <p className="text-xs text-neutral-600 font-light leading-relaxed">
                        Via della Vigna Nuova, 18<br />
                        50123 Florence, Italy
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="w-9 h-9 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-1">
                        Zurich — Nordend Studio
                      </h3>
                      <p className="text-xs text-neutral-600 font-light leading-relaxed">
                        Bahnhofstrasse 83<br />
                        8001 Zürich, Switzerland
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e8e6e3] pt-6 space-y-4">
                <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-4">
                  Direct Contact
                </h2>

                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-0.5">Atelier Line</p>
                    <a href="tel:+39055123456" className="text-xs font-semibold text-neutral-800 hover:text-[#ff4600] transition-colors">
                      +39 055 123 456
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-0.5">Client Concierge</p>
                    <a href="mailto:concierge@modora.com" className="text-xs font-semibold text-neutral-800 hover:text-[#ff4600] transition-colors">
                      concierge@modora.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff3ec] text-[#ff4600] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-0.5">Response Window</p>
                    <p className="text-xs font-semibold text-neutral-800">
                      Mon–Sat, 09:00–19:00 CET<br />
                      <span className="font-light text-neutral-500">Average reply: 4 hours</span>
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right: Inquiry Form */}
            <div className="lg:col-span-8">
              <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-5">
                Compose Your Inquiry
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
