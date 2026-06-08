import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, ArrowRight, Instagram, Image as ImageIcon, Heart, MessageCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { IMAGES } from '../data';
import { useFirestoreImages } from '../hooks/useFirestoreImages';

interface GalleryViewProps {
  setCurrentTab: (tab: string) => void;
}

interface GalleryItem {
  id: string;
  title: string;
  serviceName: string;
  categories: string[]; // 'lamination', 'sculpt', 'tint', 'addon'
  imageUrl?: string;
  beforeImg?: string;
  afterImg?: string;
  isSlider?: boolean;
}

const FILTER_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'lamination', label: 'Brow Lamination' },
  { id: 'sculpt', label: 'Wax & Sculpt' },
  { id: 'tint', label: 'Dye/Tint' },
  { id: 'addon', label: 'Add-ons' }
];

export default function GalleryView({ setCurrentTab }: GalleryViewProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const { galleryItems, instagramPosts, instagramUsername, loading } = useFirestoreImages();

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Try deep linking
    window.location.href = 'instagram://user?username=thebrowmanorr';
    // Fallback to web link
    setTimeout(() => {
      window.open('https://instagram.com/thebrowmanorr', '_blank');
    }, 500);
  };

  const filteredItems = galleryItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.categories?.includes(activeFilter);
  });


  return (
    <div className="bg-cream min-h-screen py-16 sm:py-24">
      
      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-border/10 text-rose border border-rose-border/20 rounded-full text-xs font-bold tracking-widest uppercase">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Before & After Showcase</span>
        </div>
        <h1 className="serif text-4xl sm:text-5xl md:text-6xl font-light text-charcoal tracking-tight leading-tight">
          The results speak <span className="text-rose italic">for themselves</span>
        </h1>
        <p className="sans text-sm sm:text-base text-charcoal-light leading-relaxed max-w-2xl mx-auto font-light">
          Every set of brows you see here belongs to a real client who walked in, trusted Leticia, and left transformed. Results speak louder than words.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-center overflow-x-auto pb-4 scrollbar-none">
          <div className="flex gap-3 bg-white/50 p-1.5 rounded-full border border-rose-border/20 shadow-xs">
            {FILTER_PILLS.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={`px-6 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-rose text-white shadow-xs'
                      : 'border border-rose-border/25 text-charcoal-light hover:text-rose hover:border-rose/55'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PHOTO GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse font-sans">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="w-full bg-white border border-rose-border/15 p-4 rounded-xl space-y-4 h-[320px]">
                <div className="aspect-[4/3] w-full bg-cream-dark/15 rounded-xl" />
                <div className="h-4 bg-cream-dark/15 rounded-xs w-2/3" />
                <div className="h-3 bg-cream-dark/15 rounded-xs w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start animate-fade-in"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                {item.isSlider ? (
                  <BeforeAfterSlider
                    beforeImg={item.beforeImg!}
                    afterImg={item.afterImg!}
                    title={item.title}
                    service={item.serviceName}
                    onBook={() => setCurrentTab('book')}
                  />
                ) : (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl group shadow-xs border border-rose-border/20 bg-white">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-104"
                    />
                    
                    {/* Dark gradient and details overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/70 via-charcoal-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <h4 className="serif text-white text-lg font-light leading-snug">{item.title}</h4>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="sans text-[10px] text-rose uppercase tracking-widest font-semibold">{item.serviceName}</span>
                        <button
                          onClick={() => setCurrentTab('book')}
                          className="text-[11px] text-white hover:text-rose uppercase tracking-wider font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Book this ↗
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        )}
      </div>       {/* INSTAGRAM LIVE FEED INTEGRATION */}
      <section id="instagram-sanctuary-feed" className="bg-white/40 py-20 border-y border-rose-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
          
          <div className="space-y-2 max-w-3xl mx-auto">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-rose block">
              FOLLOW ALONG
            </span>
            <h2 className="serif text-2xl sm:text-3xl text-charcoal font-light leading-snug">
              📷 Follow{' '}
              <a 
                href="https://instagram.com/thebrowmanorr" 
                onClick={handleInstagramClick}
                className="hover:text-rose transition-colors font-medium border-b border-transparent hover:border-rose/30 pb-0.5"
              >
                @thebrowmanorr
              </a>{' '}
              for the latest results
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-4 px-1 scrollbar-thin scrollbar-thumb-rose-border/30 scrollbar-track-transparent snap-x snap-mandatory justify-start sm:justify-center">
            {instagramPosts.map((post, idx) => (
              <a
                key={post.id || idx}
                href="https://instagram.com/thebrowmanorr"
                onClick={handleInstagramClick}
                className="relative shrink-0 w-48 sm:w-56 aspect-square rounded-xl overflow-hidden border border-rose-border/15 shadow-3xs group snap-start block"
              >
                <img
                  src={post.img || post.imageUrl}
                  alt="Brow artistry results"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-3xs">
                  <Instagram className="w-8 h-8 text-cream opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* CLOSING CTA BANNER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-28 space-y-8">
        <h2 className="serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight text-charcoal">
          Love what you see? <br />
          <span className="text-rose italic">Your brows are next.</span>
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => setCurrentTab('book')}
            className="w-full sm:w-auto bg-rose text-cream px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold rounded-full shadow-md hover:bg-blush-dark transform active:scale-95 transition-all cursor-pointer text-center"
          >
            Book your appointment
          </button>
          <button
            onClick={() => setCurrentTab('services')}
            className="w-full sm:w-auto bg-transparent border border-sage/45 text-sage hover:border-sage px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold rounded-full transform active:scale-95 transition-all cursor-pointer text-center"
          >
            View services & pricing &rarr;
          </button>
        </div>
      </div>

    </div>
  );
}

interface BeforeAfterSliderProps {
  beforeImg: string;
  afterImg: string;
  title: string;
  service: string;
  onBook: () => void;
}

function BeforeAfterSlider({ beforeImg, afterImg, title, service, onBook }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl group shadow-xs border border-rose-border/20 bg-white">
      {/* After Image (Background) */}
      <img 
        src={afterImg} 
        alt={`${title} - After`} 
        referrerPolicy="no-referrer"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover select-none"
      />
      
      {/* Before Image (Foreground overlay with Clip-Path) */}
      <img 
        src={beforeImg} 
        alt={`${title} - Before`} 
        referrerPolicy="no-referrer"
        loading="lazy"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        className="absolute inset-0 w-full h-full object-cover select-none"
      />

      {/* Vertical Slider divider line and indicator */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-rose-border flex items-center justify-center pointer-events-none select-none">
          <span className="text-[10px] font-bold text-sage">↔</span>
        </div>
      </div>

      {/* Before / After labels */}
      <span className="absolute bottom-3 left-3 px-2 py-1 bg-charcoal/60 text-white rounded-md text-[10px] uppercase tracking-widest z-10 select-none">Before</span>
      <span className="absolute bottom-3 right-3 px-2 py-1 bg-sage/85 text-white rounded-md text-[10px] uppercase tracking-widest z-10 select-none">After</span>

      {/* Draggable transparent input slider overlay */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderPos} 
        onChange={(e) => setSliderPos(Number(e.target.value))} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-25" 
      />

      {/* Absolute Header Overlay on hover */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 text-left">
        <h4 className="serif text-white text-lg font-light leading-snug">{title}</h4>
        <div className="flex justify-between items-center mt-1">
          <span className="sans text-[10px] text-rose uppercase tracking-widest font-semibold">{service}</span>
          <button 
            type="button"
            onClick={onBook}
            className="text-[11px] text-white hover:text-rose uppercase tracking-wider font-bold transition-colors cursor-pointer relative z-30"
          >
            Book this ↗
          </button>
        </div>
      </div>
    </div>
  );
}
