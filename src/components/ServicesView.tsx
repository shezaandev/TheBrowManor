/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Clock, Compass, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useFirestoreImages } from '../hooks/useFirestoreImages';

interface ServicesViewProps {
  setCurrentTab: (tab: string) => void;
}

export default function ServicesView({ setCurrentTab }: ServicesViewProps) {
  const { services } = useFirestoreImages();
  const browServices = services.filter((s) => s.category === 'core');
  const signatureServices = services.filter((s) => s.category === 'signature');
  const lashServices = services.filter((s) => s.category === 'lash');
  const addonServices = services.filter((s) => s.category === 'addon');

  return (
    <div className="bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-border/10 text-rose border border-rose-border/20 rounded-full text-xs font-bold tracking-widest uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Treatment Menu</span>
          </div>
          <h1 className="serif text-4xl sm:text-5xl font-light text-charcoal tracking-tight leading-tight">
            The Brow Manor <span className="text-rose italic">Treatment Menu</span>
          </h1>
          <p className="sans text-sm sm:text-base text-charcoal-light leading-relaxed max-w-2xl mx-auto font-light">
            Every treatment at The Brow Manor is an act of quiet devotion — crafted around your face, your hair, your lifestyle. Premium products. Unhurried time. Precision artistry that speaks entirely for itself.
          </p>
        </div>

        {/* 1. BROW ARTISTRY */}
        <div className="space-y-10">
          <div className="border-b border-rose-border/30 pb-3 max-w-[280px]">
            <h2 className="serif text-2xl sm:text-3xl font-light text-sage tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose shrink-0" />
              <span>Brow Artistry</span>
            </h2>
            <p className="text-[10px] font-sans text-rose uppercase tracking-[0.2em] font-bold mt-1">Sculpting, Tints & Laminations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {browServices.map((service) => (
              <div 
                key={service.id}
                id={`core-service-${service.id}`}
                className="boutique-card p-8 flex flex-col justify-between group"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="serif text-xl sm:text-2xl font-light text-charcoal group-hover:text-rose transition-colors leading-tight">
                      {service.name}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="serif text-2xl font-semibold text-sage">
                        A${service.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-sans text-sage font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose" />
                      <span>{service.duration}</span>
                    </div>
                    <span>•</span>
                    <span className="uppercase tracking-widest text-[9px] bg-rose-border/10 border border-rose-border/20 px-2.5 py-1 rounded-full text-rose">Standard Treatment</span>
                  </div>

                  <p className="text-sm text-charcoal-light leading-relaxed font-light sans">
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-rose-border/20 mt-6 flex justify-between items-center bg-transparent relative z-10">
                  <span className="text-[11px] text-charcoal-light/70 italic font-mono">Includes a full brow mapping consultation</span>
                  <button
                    id={`book-service-btn-${service.id}`}
                    onClick={() => setCurrentTab('book')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-rose hover:bg-blush-dark text-cream text-[10px] uppercase font-bold tracking-[0.2em] rounded-full transition-all cursor-pointer transform active:scale-95 shadow-xs"
                  >
                    <span>Book now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. THE SIGNATURE EXPERIENCE */}
        <div className="space-y-10">
          <div className="border-b border-rose-border/30 pb-3 max-w-[280px]">
            <h2 className="serif text-2xl sm:text-3xl font-light text-sage tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose shrink-0" />
              <span>The Signature Experience</span>
            </h2>
            <p className="text-[10px] font-sans text-rose uppercase tracking-[0.2em] font-bold mt-1">The Manor's Most Elevated Treatments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {signatureServices.map((service) => (
              <div 
                key={service.id}
                id={`signature-service-${service.id}`}
                className="boutique-card p-8 flex flex-col justify-between group"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="serif text-xl sm:text-2xl font-light text-charcoal group-hover:text-rose transition-colors leading-tight">
                      {service.name}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="serif text-2xl font-semibold text-sage">
                        A${service.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-sans text-sage font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose" />
                      <span>{service.duration}</span>
                    </div>
                    <span>•</span>
                    <span className="uppercase tracking-widest text-[9px] bg-rose-border/20 border border-rose/30 px-2.5 py-1 rounded-full text-rose font-semibold bg-rose/10">SIGNATURE</span>
                  </div>

                  <p className="text-sm text-charcoal-light leading-relaxed font-light sans">
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-rose-border/20 mt-6 flex justify-between items-center bg-transparent relative z-10">
                  <span className="text-[11px] text-charcoal-light/70 italic font-mono">Includes brow + lash treatment</span>
                  <button
                    id={`book-signature-btn-${service.id}`}
                    onClick={() => setCurrentTab('book')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-rose hover:bg-blush-dark text-cream text-[10px] uppercase font-bold tracking-[0.2em] rounded-full transition-all cursor-pointer transform active:scale-95 shadow-xs"
                  >
                    <span>Book now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. LASH ENHANCEMENTS */}
        <div className="space-y-10">
          <div className="border-b border-rose-border/30 pb-3 max-w-[280px]">
            <h2 className="serif text-2xl sm:text-3xl font-light text-sage tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose shrink-0" />
              <span>Lash Enhancements</span>
            </h2>
            <p className="text-[10px] font-sans text-rose uppercase tracking-[0.2em] font-bold mt-1">Coming Soon to The Manor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lashServices.map((service) => (
              <div 
                key={service.id}
                id={`lash-service-${service.id}`}
                className="boutique-card p-8 flex flex-col justify-between group opacity-85 relative"
              >
                {/* COMING SOON ribbon/badge in top right */}
                <div className="absolute top-4 right-4 bg-charcoal/5 border border-rose px-2.5 py-1 rounded-full text-rose text-[9px] font-bold uppercase tracking-widest relative z-10">
                  COMING SOON
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="serif text-xl sm:text-2xl font-light text-charcoal leading-tight pr-20">
                      {service.name}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="serif text-2xl font-semibold text-sage/60">
                        A${service.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-sans text-sage/70 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose/65" />
                      <span>{service.duration}</span>
                    </div>
                    <span>•</span>
                    <span className="uppercase tracking-widest text-[9px] bg-charcoal/5 border border-charcoal/10 px-2.5 py-1 rounded-full text-charcoal/50">STANDARD TREATMENT</span>
                  </div>

                  <p className="text-sm text-charcoal-light/80 leading-relaxed font-light sans">
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-rose-border/20 mt-6 flex justify-between items-center bg-transparent relative z-10">
                  <span className="text-[11px] text-charcoal-light/60 italic font-mono">Launching at The Brow Manor soon</span>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal/5 border border-charcoal/10 text-charcoal/40 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full">
                    <span>✦ COMING SOON</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. LUXURY INDULGENCES */}
        <div className="space-y-10">
          <div className="border-b border-rose-border/30 pb-3 max-w-[280px]">
            <h2 className="serif text-2xl sm:text-3xl font-light text-sage tracking-wide flex items-center gap-2">
              <Compass className="w-5 h-5 text-rose shrink-0" />
              <span>Luxury Indulgences</span>
            </h2>
            <p className="text-[10px] font-sans text-rose uppercase tracking-[0.2em] font-bold mt-1">Indulge & Elevate Your Experience</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addonServices.map((service) => (
              <div 
                key={service.id}
                id={`addon-service-${service.id}`}
                className="boutique-card p-6 flex flex-col justify-between group"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="serif text-lg font-light text-charcoal group-hover:text-rose transition-colors leading-tight min-h-[48px]">
                      {service.name}
                    </h3>
                    <span className="serif text-lg font-semibold text-sage shrink-0">
                      A${service.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-sage italic">
                    <Clock className="w-3.5 h-3.5 text-rose" />
                    <span>{service.duration} session</span>
                  </div>

                  <p className="text-xs text-charcoal-light leading-relaxed font-light line-clamp-4 sans">
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-rose-border/20 mt-6 flex justify-between items-center relative z-10">
                  <span className="text-[9px] font-bold text-rose uppercase tracking-widest">Add to your treatment</span>
                  <button 
                    id={`book-addon-${service.id}`}
                    onClick={() => setCurrentTab('book')}
                    className="text-xs font-bold text-rose hover:text-blush-dark hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. POLICY REMINDER BANNER */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-rose-border/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="serif text-3xl font-light text-charcoal leading-tight">
              Booking Policy <span className="text-rose italic">Notice</span>
            </h3>
            <p className="text-sm font-sans text-charcoal-light leading-relaxed font-light">
              A flat A$20 non-refundable deposit is required to secure your appointment at The Manor. This deposit is applied in full toward your treatment on the day. We kindly ask that you review our studio policies before reserving your place.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-wrap justify-start lg:justify-end gap-3">
            <button
              id="services-policies-btn"
              onClick={() => setCurrentTab('policies')}
              className="px-6 py-3.5 bg-transparent border border-rose-border hover:border-rose text-charcoal text-xs uppercase tracking-[0.15em] font-semibold rounded-full transition-all cursor-pointer text-center transform active:scale-95"
            >
              Read Policies
            </button>
            <button
              id="services-book-now-btn"
              onClick={() => setCurrentTab('book')}
              className="px-6 py-3.5 bg-rose hover:bg-blush-dark text-cream text-xs uppercase tracking-[0.15em] font-semibold rounded-full transition-all cursor-pointer text-center transform active:scale-95 shadow-sm"
            >
              Reserve Your Treatment
            </button>
          </div>
        </div>

        {/* 6. LOWER CONTACT PROMPT */}
        <div className="text-center bg-sage/5 py-16 px-4 rounded-2xl border border-rose-border/30">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-rose-border/10 border border-rose-border/20 flex items-center justify-center text-rose">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="serif text-2xl font-light text-charcoal">
              Not certain which treatment is right for you?
            </h3>
            <p className="text-sm text-charcoal-light leading-relaxed sans font-light">
              If you have particular brow concerns, a history of scarring, previous chemical treatments, or simply wish for Leticia's personal guidance before booking — do reach out. She would be delighted to assist you in selecting the treatment most befitting of your brows.
            </p>
            <div className="pt-2">
              <button 
                id="services-contact-btn"
                onClick={() => setCurrentTab('contact')}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose hover:bg-blush-dark text-cream text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full shadow-md transition-all cursor-pointer transform active:scale-95"
              >
                Send Leticia a Message
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
