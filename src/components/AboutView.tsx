/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles, MapPin, Smile, Percent, Gift, Star } from 'lucide-react';
import { IMAGES } from '../data';
import { useFirestoreImages } from '../hooks/useFirestoreImages';

interface AboutViewProps {
  setCurrentTab: (tab: string) => void;
}

export default function AboutView({ setCurrentTab }: AboutViewProps) {
  const { siteImages } = useFirestoreImages();

  return (
    <div className="bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Intro Grid: Photo & Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-3/4 rounded-sm overflow-hidden shadow-xl border-4 border-cream-light zoom-img-container">
              {/* Inner frame */}
              <div className="absolute inset-2 border border-sage/20 pointer-events-none z-10" />
              <img
                src={siteImages.leticia?.url || IMAGES.leticia}
                alt="Portrait of Leticia East"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-cream/95 backdrop-blur-xs px-4 py-3 border border-cream-dark/40 shadow-md rounded-xs text-center">
                <span className="block font-serif text-lg font-medium text-charcoal">Leticia East</span>
                <span className="block text-[10px] uppercase font-sans tracking-widest text-[#CFA39F] font-bold mt-0.5">Founder & Head Stylist</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#CFA39F] block">
                Meet Your Stylist
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-charcoal tracking-wide leading-tight">
                Leticia didn't open a salon. She built The Manor.
              </h1>
            </div>

            <p className="text-sm sm:text-base text-charcoal-light leading-relaxed font-light">
              No two faces are the same. No two brow appointments are either. Leticia studies your bone structure, your natural hair flow, and your personal style — then creates something entirely, beautifully yours.
            </p>
            
            <p className="text-sm sm:text-base text-charcoal-light leading-relaxed font-light">
              That's why I created <span className="font-serif italic font-medium text-sage">The Brow Manor</span> — a private, professional treatment space in North Lakes, with select appointments also available in Bongaree by request. I wanted to design a space where clients can fully unwind and receive elevated, precision brow treatments without the chaotic buzz of standard salons.
            </p>

            <blockquote className="border-l-4 border-[#E5C3C0] pl-4 py-1 italic font-serif text-charcoal text-md leading-relaxed">
              "Your face is a unique canvas. I don't believe in massive cookie-cutter templates. I study your underlying skeletal geometry, hair flow, and personal vibes to lift and balance your features naturally."
            </blockquote>

            <div className="bg-cream-dark/35 p-6 rounded-xs border border-cream-dark/70 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal hover:text-rose transition-colors">
                <MapPin className="w-4.5 h-4.5 text-sage" />
                <span>LEVEL ONE, SUITE 5/5 DISCOVERY DR, NORTH LAKES QLD 4509</span>
              </div>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Our private, professional treatment studio is strictly by appointment only. We cater to one client at a time, ensuring you receive 100% of our care, focus, and precision styling treatments during your booked session.
              </p>
            </div>

            <div className="text-sm font-sans text-charcoal-light flex flex-wrap items-center gap-2 pt-2">
              <span>Follow my work on Instagram:</span>
              <a 
                href="https://www.instagram.com/thebrowmanorr/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-rose text-rose font-semibold transition-colors"
              >
                @thebrowmanorr
              </a>
            </div>

            <div className="flex pt-4">
              <button
                id="about-book-now-btn"
                onClick={() => setCurrentTab('book')}
                className="px-8 py-3.5 bg-rose hover:bg-blush-dark text-cream font-sans text-xs uppercase tracking-wider font-semibold rounded-sm shadow-md transition-all cursor-pointer"
              >
                Schedule An Appointment
              </button>
            </div>
          </div>

        </div>

        <div className="organic-divider" />

        {/* Studio Values Section */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#CFA39F]">Our Core Foundation</span>
            <h2 className="font-serif text-3xl font-light text-charcoal">Studio Values</h2>
            <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
              We hold ourselves to an uncompromising standard, ensuring every brow transformation is an exquisite, safe, and deeply satisfying experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1: Precision mapping */}
            <div className="boutique-card p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose/10 text-rose flex items-center justify-center mx-auto relative z-10">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-charcoal relative z-10">Precision Symmetry</h3>
              <p className="text-sm text-charcoal-light font-sans font-light leading-relaxed relative z-10">
                Rather than imposing generic templates, Leticia maps your brows to your unique bone structure, achieving a tailored symmetry that lifts and frames your eyes with natural grace.
              </p>
            </div>

            {/* Value 2: Dedicated care */}
            <div className="boutique-card p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF1EF] text-blush-dark flex items-center justify-center mx-auto relative z-10">
                <Heart className="w-5 h-5 fill-blush/20" />
              </div>
              <h3 className="font-serif text-xl font-medium text-charcoal relative z-10">Luxurious Comfort</h3>
              <p className="text-sm text-charcoal-light font-sans font-light leading-relaxed relative z-10">
                Every element of your visit is carefully curated. From hypoallergenic, rose-infused wax and soothing under-eye collagen treatments to calming organic tea and gentle aromatherapy, we offer a tranquil haven.
              </p>
            </div>

            {/* Value 3: Personalized attention */}
            <div className="boutique-card p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose/10 text-rose flex items-center justify-center mx-auto relative z-10">
                <Smile className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-charcoal relative z-10">Personalized Service</h3>
              <p className="text-sm text-charcoal-light font-sans font-light leading-relaxed relative z-10">
                As we receive only one guest at a time, your desires are our sole priority. We take the time to discuss your brow history, explore reference images, and cultivate an absolute plan for your brows.
              </p>
            </div>
          </div>
        </div>

        <div className="organic-divider" />

        {/* 3. COZY TREATMENT TIMELINE ILLUSTRATED */}
        <div className="bg-[#FAF7F2] p-8 sm:p-16 rounded-sm border border-cream-dark/70 text-center space-y-8">
          <h3 className="font-serif text-2xl sm:text-3xl font-light text-charcoal">
            The Brow Manor Experience
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-xl mx-auto leading-relaxed">
            First time booking? Here is what you can expect when you arrive at The Brow Manor in North Lakes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-left pt-6">
            <div className="space-y-2">
              <span className="text-lg font-serif italic text-blush-dark font-semibold">01. Arrive Relaxed</span>
              <p className="text-xs text-charcoal-light leading-relaxed font-light">
                Arrive exactly at your scheduled time, alone, with clean skin. Settle into our comfortable treatment bed while soft ambient acoustics ease your mind.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-serif italic text-blush-dark font-semibold">02. Bespoke Mapping</span>
              <p className="text-xs text-charcoal-light leading-relaxed font-light">
                We study your natural hair growth patterns, facial proportions, and bone structure to blueprint a custom symmetrical design tailored exclusively to you.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-serif italic text-blush-dark font-semibold">03. Precise Sculpting</span>
              <p className="text-xs text-charcoal-light leading-relaxed font-light">
                Leticia performs our signature high-precision sculpting. Elevate your treatment with a luxurious scalp massage or hydrating hydrogel lip mask.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-lg font-serif italic text-blush-dark font-semibold">04. The Reveal</span>
              <p className="text-xs text-charcoal-light leading-relaxed font-light">
                Review your exquisite, newly refined brows in the hand-glass. Receive a complimentary nourishing brow oil and customized aftercare guide.
              </p>
            </div>
          </div>
        </div>

        {/* Loyalty Rewards Section */}
        <div id="loyalty-rewards-section" className="space-y-12 pt-12 border-t border-cream-dark/50">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#CFA39F]">Rewarding Beautiful Consistency</span>
            <h2 className="font-serif text-3xl font-light text-charcoal">Loyalty Rewards Program</h2>
            <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
              We love celebrating our returning clients. To show our gratitude for your continued trust in our sanctuary, we've designed an effortless rewards program to keep your brows perfectly sculpted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Visit 1-4 accumulation */}
            <div className="bg-cream-light/60 p-6 rounded-sm border border-cream-dark/40 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-charcoal">01. Visit & Earn</h3>
                <p className="text-xs sm:text-sm text-charcoal-light font-sans font-light leading-relaxed">
                  Every treatment you book automatically secures progress on your digital loyalty card. No physical stamps required.
                </p>
              </div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-charcoal-light/60 font-semibold">Step 1 — Earn on every visit</span>
            </div>

            {/* 5th Visit reward */}
            <div className="bg-cream-light/60 p-6 rounded-sm border border-cream-dark/40 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF1EF] text-[#CFA39F] flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-charcoal">02. 5th Visit Discount</h3>
                <p className="text-xs sm:text-sm text-charcoal-light font-sans font-light leading-relaxed">
                  Enjoy <span className="font-semibold text-charcoal">15% OFF</span> any high-precision sculpt, tint, shadow, or gorgeous brow lamination on your fifth salon visit.
                </p>
              </div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#CFA39F] font-bold">15% Off treatment</span>
            </div>

            {/* 10th Visit Reward */}
            <div className="bg-[#FAF7F2] p-6 rounded-sm border-2 border-rose/30 flex flex-col justify-between space-y-4 shadow-3xs relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose text-cream text-[9px] uppercase font-sans font-bold tracking-widest px-3 py-1 rounded-bl-sm">
                Elite
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-charcoal">03. 10th Visit Celebration</h3>
                <p className="text-xs sm:text-sm text-charcoal-light font-sans font-light leading-relaxed">
                  Celebrate your tenth visit with <span className="font-semibold text-charcoal">25% OFF</span> your total service, plus a complimentary soothing treatment upgrade.
                </p>
              </div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-rose font-bold">25% Off + Custom Gift</span>
            </div>

            {/* Referral Perk */}
            <div className="bg-cream-light/60 p-6 rounded-sm border border-cream-dark/40 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-charcoal">04. Refer a Friend</h3>
                <p className="text-xs sm:text-sm text-charcoal-light font-sans font-light leading-relaxed">
                  Share the love! When a referred friend books their first sculpt with Leticia, you both receive a <span className="font-semibold text-charcoal">$10 credit</span>.
                </p>
              </div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-charcoal-light/60 font-semibold">$10 Credit for both</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
