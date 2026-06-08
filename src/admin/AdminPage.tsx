import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useFirestoreImages } from '../hooks/useFirestoreImages';
import SiteImagesSection from './components/SiteImagesSection';
import GallerySection from './components/GallerySection';
import InstagramSection from './components/InstagramSection';
import ServicesSection from './components/ServicesSection';
import AvailabilitySection from './components/AvailabilitySection';
import BookingsSection from './components/BookingsSection';
import { LogOut, Image, LayoutGrid, Instagram, Sparkles, RefreshCw, Menu, X, CalendarDays, Inbox } from 'lucide-react';

export default function AdminPage() {
  const { siteImages, galleryItems, instagramPosts, instagramUsername, services, loading } = useFirestoreImages();
  const [activeSection, setActiveSection] = useState<'media' | 'services' | 'availability' | 'bookings'>('media');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      const offset = 90; // Space for the top floating sub-nav bar
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-charcoal flex flex-col md:flex-row font-sans">
      
      {/* 1. MOBILE HEADER BAR */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-cream-dark/30 h-16 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-charcoal hover:text-sage transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose/10 flex items-center justify-center rounded-xs border border-rose/15 shrink-0">
            <Sparkles className="w-4 h-4 text-rose" />
          </div>
          <span className="serif text-md font-light text-charcoal">The Brow Manor</span>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* 2. BACKDROP OVERLAY FOR MOBILE SIDEBAR */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-45 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 3. FIXED LEFT SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-cream-dark/30 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Toggle close button inside sidebar on mobile */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1.5 text-charcoal-light/50 hover:text-charcoal transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGO & NAME */}
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose/10 flex items-center justify-center rounded-xs border border-rose/15 shrink-0">
            <Sparkles className="w-5 h-5 text-rose" />
          </div>
          <div>
            <h1 className="serif text-md text-charcoal font-normal leading-none">The Brow Manor</h1>
            <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-rose mt-0.5 block">
              Studio Desk
            </span>
          </div>
        </div>

        <div className="border-b border-cream-dark/30 mx-6 mb-6" />

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 space-y-1.5 px-3">
          {/* Media Manager Tab key */}
          <button
            type="button"
            onClick={() => {
              setActiveSection('media');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full px-5 py-3.5 rounded-md flex items-center gap-3 relative transition-all duration-300 text-left cursor-pointer ${
              activeSection === 'media'
                ? 'bg-sage/10 text-sage font-semibold'
                : 'text-charcoal/60 hover:bg-cream'
            }`}
          >
            {activeSection === 'media' && (
              <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-sage rounded-r" />
            )}
            <LayoutGrid className={`w-4 h-4 ${activeSection === 'media' ? 'text-sage' : 'text-charcoal/50'}`} />
            <span className="font-sans text-xs uppercase tracking-wider">Media Manager</span>
          </button>

          {/* Services Menu Tab key */}
          <button
            type="button"
            onClick={() => {
              setActiveSection('services');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full px-5 py-3.5 rounded-md flex items-center gap-3 relative transition-all duration-300 text-left cursor-pointer ${
              activeSection === 'services'
                ? 'bg-sage/10 text-sage font-semibold'
                : 'text-charcoal/60 hover:bg-cream'
            }`}
          >
            {activeSection === 'services' && (
              <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-sage rounded-r" />
            )}
            <Sparkles className={`w-4 h-4 ${activeSection === 'services' ? 'text-sage' : 'text-charcoal/50'}`} />
            <span className="font-sans text-xs uppercase tracking-wider">Services Menu</span>
          </button>

          {/* Availability Tab key */}
          <button
            type="button"
            onClick={() => {
              setActiveSection('availability');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full px-5 py-3.5 rounded-md flex items-center gap-3 relative transition-all duration-300 text-left cursor-pointer ${
              activeSection === 'availability'
                ? 'bg-sage/10 text-sage font-semibold'
                : 'text-charcoal/60 hover:bg-cream'
            }`}
          >
            {activeSection === 'availability' && (
              <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-sage rounded-r" />
            )}
            <CalendarDays className={`w-4 h-4 ${activeSection === 'availability' ? 'text-sage' : 'text-charcoal/50'}`} />
            <span className="font-sans text-xs uppercase tracking-wider">Availability</span>
          </button>

          {/* Bookings & Sync Tab key */}
          <button
            type="button"
            onClick={() => {
              setActiveSection('bookings');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full px-5 py-3.5 rounded-md flex items-center gap-3 relative transition-all duration-300 text-left cursor-pointer ${
              activeSection === 'bookings'
                ? 'bg-sage/10 text-sage font-semibold'
                : 'text-charcoal/60 hover:bg-cream'
            }`}
          >
            {activeSection === 'bookings' && (
              <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-sage rounded-r" />
            )}
            <Inbox className={`w-4 h-4 ${activeSection === 'bookings' ? 'text-sage' : 'text-charcoal/50'}`} />
            <span className="font-sans text-xs uppercase tracking-wider">Bookings & Sync</span>
          </button>
        </nav>

        {/* USER PROFILE INFO AND LOGOUT */}
        <div className="mt-auto p-6 border-t border-cream-dark/20 bg-cream/15">
          <div className="flex flex-col font-sans mb-4">
            <span className="serif text-xs font-semibold text-charcoal leading-tight">Leticia East</span>
            <span className="text-[10px] text-charcoal-light/60 truncate max-w-[210px] mt-0.5">
              {auth.currentUser?.email || 'shezaanone@gmail.com'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-rose hover:underline transition-all cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-[260px] min-h-screen flex flex-col bg-[#FAF7F2]">
        
        <div className="flex-1 px-4 py-8 sm:px-8 sm:py-10 max-w-7xl w-full mx-auto space-y-10">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <RefreshCw className="w-10 h-10 text-sage animate-spin" />
              <span className="text-sm font-medium tracking-wide text-charcoal-light">
                Loading Studio settings in real-time...
              </span>
            </div>
          ) : (
            <>
              {/* CONTENT FOR MEDIA MANAGER */}
              {activeSection === 'media' && (
                <div className="space-y-12">
                  
                  {/* ANCHOR NAVIGATION BAR */}
                  <div className="sticky top-0 sm:top-4 z-30 bg-[#FAF7F2]/90 backdrop-blur-md py-4 border-b border-cream-dark/25 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => scrollToSection('site-images-section')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal hover:text-sage transition-all bg-white border border-cream-dark/45 rounded-full cursor-pointer hover:border-sage shadow-3xs"
                    >
                      <Image className="w-3.5 h-3.5 text-rose" />
                      <span>Site Images</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('gallery-items-section')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal hover:text-sage transition-all bg-white border border-cream-dark/45 rounded-full cursor-pointer hover:border-sage shadow-3xs"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-sage" />
                      <span>Gallery Items</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('instagram-feed-section')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal hover:text-sage transition-all bg-white border border-cream-dark/45 rounded-full cursor-pointer hover:border-sage shadow-3xs"
                    >
                      <Instagram className="w-3.5 h-3.5 text-rose" />
                      <span>Instagram Feed</span>
                    </button>
                  </div>

                  {/* SITE IMAGES */}
                  <div id="site-images-section" className="scroll-mt-28">
                    <SiteImagesSection siteImages={siteImages} />
                  </div>

                  <div className="border-t border-cream-dark/40" />

                  {/* GALLERY ITEMS */}
                  <div id="gallery-items-section" className="scroll-mt-28">
                    <GallerySection galleryItems={galleryItems} />
                  </div>

                  <div className="border-t border-cream-dark/40" />

                  {/* INSTAGRAM FEED */}
                  <div id="instagram-feed-section" className="scroll-mt-28">
                    <InstagramSection instagramPosts={instagramPosts} instagramUsername={instagramUsername} />
                  </div>

                </div>
              )}

              {/* CONTENT FOR SERVICES MENU */}
              {activeSection === 'services' && (
                <div className="space-y-12 animate-fade-in">
                  <div id="services-section">
                    <ServicesSection services={services} />
                  </div>
                </div>
              )}

              {/* CONTENT FOR AVAILABILITY MANAGER */}
              {activeSection === 'availability' && (
                <div className="animate-fade-in">
                  <AvailabilitySection />
                </div>
              )}

              {/* CONTENT FOR BOOKINGS MANAGER */}
              {activeSection === 'bookings' && (
                <div className="animate-fade-in">
                  <BookingsSection />
                </div>
              )}
            </>
          )}

        </div>

        {/* FOOTER */}
        <footer className="mt-auto bg-white border-t border-cream-dark/20 py-6 text-center text-xs text-charcoal-light/50 font-sans">
          <p>&copy; {new Date().getFullYear()} The Brow Manor — Designed & Managed by Leticia East</p>
        </footer>
      </main>

    </div>
  );
}
