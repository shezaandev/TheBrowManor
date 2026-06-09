/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Sparkles, MapPin, CheckCircle, Heart, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { TESTIMONIALS, IMAGES } from '../data';
import { useFirestoreImages } from '../hooks/useFirestoreImages';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
}

export default function HomeView({ setCurrentTab }: HomeViewProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { siteImages, instagramPosts, instagramUsername, services } = useFirestoreImages();

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Try deep linking
    window.location.href = 'instagram://user?username=thebrowmanorr';
    // Fallback to web link
    setTimeout(() => {
      window.open('https://instagram.com/thebrowmanorr', '_blank');
    }, 500);
  };

  // Auto scroll testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Filter 3 popular or signature core services for preview
  const featuredServices = services.filter(s => s.category === 'core').slice(0, 3);


  return (
    <div className="overflow-hidden">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-cream text-charcoal py-20 px-4 sm:px-6 lg:px-12 border-b border-rose-border/20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-border/10 text-rose text-[10px] font-bold tracking-widest uppercase border border-rose-border/20 mx-auto lg:mx-0 w-fit"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>North Lakes & Bongaree, QLD</span>
              </motion.div>

              <div className="space-y-5">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="serif text-5xl sm:text-6xl md:text-7xl lg:text-[84px] leading-[0.95] font-light text-charcoal"
                >
                  Step into{' '}
                  <span className="italic text-rose">The Manor.</span>
                  <br />
                  Leave utterly{' '}
                  <span className="italic text-rose">transformed.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="sans text-sm text-charcoal-light max-w-md mx-auto lg:mx-0 leading-relaxed font-light"
                >
                  No chain. No crowds. No rush. Simply Leticia, her craft, and an unhurried hour devoted entirely to you and your brows.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4"
              >
                <button
                  id="hero-book-now-btn"
                  onClick={() => setCurrentTab('book')}
                  className="bg-rose hover:bg-blush-dark text-cream px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full transform hover:scale-103 active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  Book Now
                </button>
                <button
                  id="hero-view-services-btn"
                  onClick={() => setCurrentTab('services')}
                  className="bg-transparent border border-sage/40 hover:border-sage text-sage px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-sage/5 transform active:scale-95 transition-all cursor-pointer"
                >
                  View Services
                </button>
              </motion.div>
            </div>

            {/* Quick studio details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-8 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-charcoal"
            >
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-widest font-bold text-sage">Location</span>
                <span className="text-sm font-light text-charcoal">
                  Suite 5/5 Discovery Dr, North Lakes
                </span>
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-rose-border/30"></div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-widest font-bold text-sage">Instagram</span>
                <a
                  href="https://www.instagram.com/thebrowmanorr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-light hover:text-rose transition-colors"
                >
                  @thebrowmanorr
                </a>
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-rose-border/30"></div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-widest font-bold text-sage">Artistry By</span>
                <span className="serif italic text-[15px] text-charcoal font-medium">Leticia East</span>
              </div>
            </motion.div>
          </div>

          {/* Right Image Column with Custom Arched hero-mask */}
          <div className="lg:col-span-6 flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[340px] h-[480px]"
            >
              <div className="hero-mask w-full h-[480px] bg-rose-border/10 flex items-center justify-center overflow-hidden border-8 border-white shadow-xl relative z-10 zoom-img-container">
                <img
                  src={siteImages.hero?.url || IMAGES.hero}
                  alt="Beautifully sculpted and dyed brows"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="w-full h-full bg-gradient-to-t from-cream/30 to-transparent absolute inset-0"></div>
              </div>

              {/* Floating Testimonial Card */}
              <div className="relative sm:absolute sm:bottom-12 sm:-left-12 mt-4 sm:mt-0 mx-auto sm:mx-0 max-w-[280px] sm:max-w-[300px] z-20 bg-sage text-white p-5 rounded-2xl shadow-lg transform -rotate-2">
                <div className="flex gap-1 mb-1.5 text-rose-border">★★★★★</div>
                <p className="serif text-xs italic mb-2.5 leading-relaxed">
                  "Leticia is so precise and careful. My brows have never looked so full and natural."
                </p>
                <div className="text-[9px] uppercase tracking-widest font-semibold opacity-90">— Charlotte Thompson</div>
              </div>

              {/* Decorative floating circle image */}
              <div className="absolute top-0 right-0 w-32 h-32 border-4 border-white shadow-md rounded-full -mr-16 -mt-10 overflow-hidden z-20 zoom-img-container">
                <img
                  src={siteImages.secondary?.url || IMAGES.secondary}
                  alt="Brow secondary illustration"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      <div className="organic-divider" />

      {/* 2. STUDIO INTRO */}
      <section className="bg-cream-light py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-sage-pale flex items-center justify-center text-sage">
              <Heart className="w-5 h-5 fill-sage/20" />
            </div>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-light text-charcoal tracking-normal leading-snug">
            This is not your average studio. There are no crowds, no noise, no strangers beside you. There is only Leticia — and the quiet, devoted art of making your brows the finest they have ever been.
          </h2>

          <p className="text-md sm:text-lg text-charcoal-light leading-relaxed max-w-2xl mx-auto font-light">
            The Brow Manor was born from a single, unwavering belief — that every person who sits in Leticia's chair deserves to feel entirely seen, exquisitely cared for, and utterly beautiful. A studio built not for the masses, but for you.
          </p>

          <button
            id="intro-about-btn"
            onClick={() => setCurrentTab('about')}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-rose hover:text-blush-dark border-b-2 border-blush/40 hover:border-blush pb-1 transition-all cursor-pointer"
          >
            Discover The Manor & Meet Leticia
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <div className="organic-divider" />

      {/* 3. FEATURED SERVICES PREVIEW */}
      <section className="bg-cream py-24 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-rose block">
                THE MANOR EXPERIENCE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-sage tracking-wide">
                The Treatment Menu
              </h2>
            </div>
            <div>
              <button
                id="view-all-services-btn"
                onClick={() => setCurrentTab('services')}
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal hover:text-rose transition-colors cursor-pointer"
              >
                View Full Treatment Menu
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service, index) => (
              <div
                key={service.id}
                id={`featured-card-${service.id}`}
                className="boutique-card p-8 flex flex-col justify-between group"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-xs uppercase tracking-widest text-sage font-semibold">
                      {service.duration}
                    </span>
                    {service.popular && (
                      <span className="bg-rose-border/10 text-rose text-[10px] font-bold uppercase py-1 px-3 rounded-full border border-rose-border/20">
                        Best Seller
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="serif text-xl sm:text-2xl font-light leading-tight text-charcoal group-hover:text-rose transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-charcoal-light font-sans leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-rose-border/25 flex justify-between items-center mt-6 relative z-10">
                  <div>
                    <span className="text-[10px] text-sage block uppercase tracking-widest font-bold">Price</span>
                    <span className="serif text-2xl font-semibold text-charcoal">
                      A${service.price}
                    </span>
                  </div>
                  <button
                    id={`preview-book-${service.id}`}
                    onClick={() => setCurrentTab('book')}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-sage group-hover:text-[#495448] hover:underline cursor-pointer"
                  >
                    <span>Book now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <div className="organic-divider" />


      {/* 4. SOCIAL PROOF (TESTIMONIALS SLIDER) */}
      <section className="bg-sage-pale py-24 px-4 text-center border-t border-b border-cream-dark/30 relative">
        <div className="absolute top-10 left-10 text-sage/10 font-serif text-9xl leading-none select-none">“</div>

        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-sage-light">
              Beloved By The Ton
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-charcoal tracking-wide">
              Their Words, Our Greatest Honor
            </h2>
          </div>

          {/* Testimonial Active Slider Card */}
          <div className="min-h-[220px] flex items-center justify-center">
            {TESTIMONIALS.map((t, idx) => {
              if (idx !== activeTestimonial) return null;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-blush-dark text-blush-dark" />
                    ))}
                  </div>

                  <p className="text-lg sm:text-xl font-serif text-charcoal leading-relaxed max-w-2xl mx-auto italic font-light px-4">
                    "{t.content}"
                  </p>

                  <div>
                    <h4 className="font-serif text-md font-semibold text-charcoal">
                      {t.name}
                    </h4>
                    {t.service && (
                      <p className="text-xs text-sage font-sans uppercase tracking-wider mt-1">
                        {t.service}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2 pt-4">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                id={`testimonial-dot-${idx}`}
                aria-label={`Go to testimonial ${idx + 1}`}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeTestimonial === idx ? 'bg-sage w-6' : 'bg-sage-light/35 hover:bg-sage-light/60'
                  }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 5. INSTAGRAM FEED STRIP */}
      <section className="bg-cream py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-rose block">
              Follow Us
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal">
              See our work on Instagram
            </h2>
            <p className="text-xs text-charcoal-light max-w-md mx-auto">
              We invite you to follow @{instagramUsername} for real updates, live availability, and our latest brow transformations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-sans">
            {instagramPosts.slice(0, 6).map((post, idx) => (
              <a
                key={post.id || idx}
                id={`ig-item-${idx + 1}`}
                href="https://instagram.com/thebrowmanorr"
                onClick={handleInstagramClick}
                className="relative group aspect-square bg-cream-dark/30 rounded-xl overflow-hidden border border-rose-border/30 block hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={post.img || post.imageUrl}
                  alt={post.caption || `Brow work example ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-3xs">
                  <Instagram className="w-8 h-8 text-cream transform scale-90 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </a>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://instagram.com/thebrowmanorr"
              onClick={handleInstagramClick}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-transparent border border-rose text-rose hover:bg-rose hover:text-cream text-xs uppercase tracking-[0.15em] font-semibold rounded-full transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow @thebrowmanorr</span>
            </a>
          </div>

        </div>
      </section>

      {/* 6. BOTTOM CONVERTING BANNER */}
      <section className="bg-sage/5 py-24 px-4 text-center border-t border-rose-border/20">
        <div className="max-w-3xl mx-auto space-y-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose block">
            Your Invitation Awaits
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-sage max-w-xl mx-auto leading-tight">
            Shall we reserve your place at The Manor?
          </h2>
          <p className="text-sm sm:text-md text-charcoal-light leading-relaxed max-w-lg mx-auto">
            Appointments at The Manor are intimate and limited — each one reserved with a A$20 deposit that is applied in full toward your treatment. We would be delighted to welcome you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button
              id="bottom-cta-book-btn"
              onClick={() => setCurrentTab('book')}
              className="px-8 py-3.5 bg-rose hover:bg-blush-dark text-cream text-xs uppercase tracking-[0.2em] font-semibold rounded-full shadow-md transition-all whitespace-nowrap cursor-pointer transform active:scale-95"
            >
              Reserve Your Place
            </button>
            <button
              id="bottom-cta-contact-btn"
              onClick={() => setCurrentTab('contact')}
              className="px-8 py-3.5 bg-transparent border border-sage/40 hover:border-sage text-sage text-xs uppercase tracking-[0.2em] font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer transform active:scale-95"
            >
              Send a Message
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
