import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarCheck, Leaf, MapPin, Sparkles, Heart, 
  ChevronDown, HelpCircle, CheckCircle, Shield, Sparkle
} from 'lucide-react';
import { IMAGES } from '../data';
import { useFirestoreImages } from '../hooks/useFirestoreImages';

interface FirstVisitViewProps {
  setCurrentTab: (tab: string) => void;
}

interface TimelineStep {
  number: string;
  title: string;
  description: React.ReactNode;
  icon: React.ComponentType<any>;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    number: '01',
    title: 'Book online',
    description: 'Choose your service and select a time that suits you. A $20 deposit is required to secure your spot – this comes off your final price on the day.',
    icon: CalendarCheck
  },
  {
    number: '02',
    title: 'Pre-care preparation',
    description: 'In the days leading up to your appointment, avoid fake tan, retinol, BH & AHA creams near your brows. For best results, avoid plucking, waxing, or trimming for 6 weeks before.',
    icon: Leaf
  },
  {
    number: '03',
    title: 'Arrival',
    description: (
      <span>
        Head to Level One, Suite 5/5 Discovery Dr, North Lakes QLD 4509 at your appointment time. Please arrive alone unless you've discussed otherwise with Leticia. If you're more than 10 minutes late, your appointment may be forfeited.
      </span>
    ),
    icon: MapPin
  },
  {
    number: '04',
    title: 'Your service',
    description: 'Leticia will begin with a thoughtful consultation to understand your brow goals, face shape, and personal aesthetic. Then simply sit back and surrender to the experience — your appointment runs 30 minutes to 2 hours depending on your chosen treatment. Luxury indulgences are available to elevate your session further.',
    icon: Sparkles
  },
  {
    number: '05',
    title: 'Leaving & aftercare',
    description: 'You will leave The Manor with your complimentary brow nourishing oil and a full aftercare guide — your devoted companion for the weeks ahead. Follow the guidance faithfully and your results shall last 6–8 weeks in their full, beautiful glory.',
    icon: Heart
  }
];

const WHAT_TO_EXPECT = [
  {
    title: 'The studio',
    description: 'A private, professional treatment studio designed to make you feel entirely at ease — calm, unhurried, and cared for from the moment you arrive.',
    icon: Shield
  },
  {
    title: 'The consultation',
    description: 'Every appointment begins with a brow chat. Leticia takes the time to understand your face shape, goals, and any concerns before touching your brows.',
    icon: Sparkles
  },
  {
    title: 'The result',
    description: "You'll leave with brows that are shaped, defined, and completely you. Leticia won't stop until you love the outcome.",
    icon: CheckCircle
  }
];

const FAQS = [
  {
    question: 'Do I need to prepare anything before my appointment?',
    answer: 'Yes! Check the Pre & Aftercare page for the full pre-care guide. Key points: no makeup/moisturisers on brows 24hrs before, no fake tan or retinol 72hrs before, and no brow grooming/tweezing for 6 weeks prior for the absolute best sculpting potential.'
  },
  {
    question: 'What is the $20 deposit?',
    answer: "The deposit secures your booking and is non-refundable. It's deducted from your final service price on the day of treatment. If you cancel or rearrange with at least 24 hours notice, the progress can happily be applied to your rescheduled appointment slot."
  },
  {
    question: 'Can I bring someone with me?',
    answer: 'Please arrive alone to keep the studio environment quiet, calm and ensure you receive the private boutique experience you deserve. If you have exceptional circumstances, please discuss this with Leticia before booking.'
  },
  {
    question: 'How long will my appointment take?',
    answer: 'It depends on your service – from 30 minutes for a signature Brow Wax & Sculpt up to 1 hr 20 mins for the premium Brow Wax, Sculpt, Lamination & Dye/Tint package. Check our Treatment Menu for exact durations.'
  },
  {
    question: "I've never had brow lamination before — what should I know?",
    answer: "Don't worry! Leticia will explain the full process during your personal consultation and answer any questions. Setting natural brow hairs is a non-invasive, beautifully gentle treatment that lifts and styles hair follicles into custom place for an instantly full appearance."
  },
  {
    question: 'What if I need to cancel?',
    answer: 'Please cancel at least 24 hours before your scheduled appointment to retain your deposit (which is then carried over to a rescheduled session). Late-notice cancellations or no-shows forfeit the deposit and will restrict future booking privileges.'
  },
  {
    question: 'How long do results last?',
    answer: 'Brow lamination typically lasts 6–8 weeks with correct hydrating spoolie care. Regular hybrid tinting lasts 3–6 weeks depending on skin type, oils, and aftercare routines.'
  }
];

export default function FirstVisitView({ setCurrentTab }: FirstVisitViewProps) {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const { siteImages } = useFirestoreImages();

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="bg-cream min-h-screen">
      
      {/* HERO SECTION WITH SOOTHING BACKGROUND */}
      <section className="relative py-20 sm:py-28 px-4 flex items-center justify-center overflow-hidden border-b border-rose-border/20">
        {/* Soft background visual representing studio aesthetic */}
        <div className="absolute inset-0 bg-radial-gradient from-cream-light via-cream to-cream opacity-90 z-0"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-[0.06] z-0" 
          style={{ backgroundImage: `url(${siteImages.cozyStudio?.url || IMAGES.cozyStudio})` }}
        ></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1 text-rose font-bold uppercase tracking-widest text-xs">
            <Sparkle className="w-3.5 h-3.5 fill-current" />
            <span>New Client Guide</span>
          </div>
          <h1 className="serif text-4xl sm:text-5xl md:text-6xl font-light text-charcoal leading-tight tracking-tight">
            Welcome — here's everything <br className="hidden sm:block" />
            <span className="text-rose italic">you need to know</span>
          </h1>
          <p className="sans text-sm sm:text-base text-charcoal-light max-w-2xl mx-auto leading-relaxed font-light italic">
            Never had brows done before? Perfect — Leticia loves a fresh start. Your first visit is more than a treatment. It's a conversation, a consultation, and a completely personalised experience. First-timers always leave wondering why they waited so long.
          </p>
        </div>
      </section>

      {/* STEP-BY-STEP JOURNEY */}
      <section className="py-20 sm:py-28 px-4 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-16 sm:mb-24">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose block">Your Experience</span>
          <h2 className="serif text-3xl sm:text-4xl font-light text-charcoal tracking-tight">
            The Step-by-Step Journey
          </h2>
          <p className="sans text-xs text-charcoal-light font-light max-w-sm mx-auto">
            From the initial online reservation to walking out of your session glowing.
          </p>
        </div>

        {/* Vertical Timeline Stack */}
        <div className="relative border-l border-rose-border/30 pl-8 sm:pl-12 space-y-16 max-w-2xl mx-auto">
          {TIMELINE_STEPS.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative group">
                
                {/* Micro circle bullet on border */}
                <div className="absolute -left-[41px] sm:-left-[57px] top-1 w-6 h-6 rounded-full bg-cream border border-rose-border flex items-center justify-center text-rose z-10 shadow-3xs group-hover:bg-rose group-hover:text-white transition-all duration-300">
                  <IconComponent className="w-3 h-3" />
                </div>

                <div className="space-y-3">
                  {/* Huge Muted Step Number on Background */}
                  <div className="absolute right-0 top-0 text-7xl sm:text-8xl font-serif text-rose/5 font-bold pointer-events-none select-none select-none z-0">
                    {step.number}
                  </div>
                  
                  <div className="flex items-center gap-2.5 relative z-10 text-left">
                    <span className="sans text-[11px] font-bold tracking-widest text-sage uppercase">Step {step.number}</span>
                    <h3 className="serif text-xl sm:text-2xl text-charcoal font-semibold leading-none">{step.title}</h3>
                  </div>
                  
                  <p className="sans text-sm text-charcoal-light leading-relaxed font-light relative z-10 max-w-xl text-left">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHAT TO EXPECT 3-CARD GRID */}
      <section className="bg-sage/5 py-20 sm:py-28 px-4 border-y border-rose-border/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose block">Studio Philosophy</span>
            <h2 className="serif text-3xl sm:text-4xl font-light text-charcoal tracking-tight">
              What to Expect at The Brow Manor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHAT_TO_EXPECT.map((item, id) => {
              const CardIcon = item.icon;
              return (
                <div 
                  key={id}
                  className="bg-white p-8 sm:p-10 rounded-2xl border border-rose-border/30 shadow-3xs hover:shadow-xs transition-all space-y-5 text-left flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-rose-border/10 border border-rose-border/15 flex items-center justify-center text-rose">
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <h3 className="serif text-xl font-light text-charcoal">
                      {item.title}
                    </h3>
                    <p className="sans text-sm text-charcoal-light leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW CLIENT FAQS ACCORDION */}
      <section className="py-20 sm:py-28 px-4 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-border/10 border border-rose-border/15 text-rose mb-2">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose block">FAQ Accordion</span>
          <h2 className="serif text-3xl sm:text-4xl font-light text-charcoal tracking-tight">
            New Client Questions Answered
          </h2>
          <p className="sans text-xs text-charcoal-light max-w-md mx-auto font-light">
            Allow us to put your mind at ease. Below, you will find answers to those queries most frequently voiced by our first-time guests.
          </p>
        </div>

        {/* Elegant Accordion Stack */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {FAQS.map((faq, index) => {
            const isOpen = openFAQIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-rose-border/20 overflow-hidden shadow-3xs transition-all duration-300 hover:border-rose/50"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 focus:outline-hidden cursor-pointer"
                >
                  <span className="serif text-base sm:text-lg font-light text-charcoal-dark leading-snug">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="shrink-0 text-rose"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-7 text-sm text-charcoal-light leading-relaxed sans font-light border-t border-rose-border/15 pt-4 text-left">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CLOSING CTA CONTAINER */}
      <section className="bg-white border-t border-rose-border/20 py-20 sm:py-28 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="serif text-3xl sm:text-4xl md:text-5xl font-light text-charcoal leading-tight">
            Ready to book your <br className="hidden sm:block" />
            <span className="text-rose italic">first appointment?</span>
          </h2>
          <p className="sans text-sm text-charcoal-light leading-relaxed font-light max-w-md mx-auto">
            Leticia looks forward to welcoming you to The Manor and crafting brows that are truly, uniquely yours. We invite you to secure your reservation at your earliest convenience.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setCurrentTab('book')}
              className="w-full sm:w-auto bg-rose text-cream px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold rounded-full shadow-md hover:bg-blush-dark transform active:scale-95 transition-all text-center cursor-pointer"
            >
              RESERVE YOUR APPOINTMENT
            </button>
            <button
              onClick={() => setCurrentTab('contact')}
              className="w-full sm:w-auto bg-transparent border border-sage/45 text-sage hover:border-sage px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold rounded-full transform active:scale-95 transition-all text-center cursor-pointer"
            >
              SEND US A MESSAGE
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
