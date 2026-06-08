import React from 'react';
import OpenDaysEditor from './OpenDaysEditor';
import BlockedDatesManager from './BlockedDatesManager';
import TimeSlotsEditor from './TimeSlotsEditor';
import { CalendarDays, Clock, Lock } from 'lucide-react';

export default function AvailabilitySection() {
  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      const offset = 95; // Account for the sticky filter strip
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-12">
      
      {/* FLOATING SUB-NAVBAR CHIPS */}
      <div className="sticky top-0 sm:top-4 z-30 bg-[#FAF7F2]/90 backdrop-blur-md py-4 border-b border-cream-dark/25 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => scrollToSection('open-days-scroll-mt')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal hover:text-sage transition-all bg-white border border-cream-dark/45 rounded-full cursor-pointer hover:border-sage shadow-3xs"
        >
          <CalendarDays className="w-3.5 h-3.5 text-rose" />
          <span>Open Days & Hours</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('blocked-dates-scroll-mt')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal hover:text-sage transition-all bg-white border border-cream-dark/45 rounded-full cursor-pointer hover:border-sage shadow-3xs"
        >
          <Lock className="w-3.5 h-3.5 text-sage" />
          <span>Blocked Dates</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('time-slots-scroll-mt')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal hover:text-sage transition-all bg-white border border-cream-dark/45 rounded-full cursor-pointer hover:border-sage shadow-3xs"
        >
          <Clock className="w-3.5 h-3.5 text-rose" />
          <span>Time Slots</span>
        </button>
      </div>

      {/* SECTION 1: OPEN DAYS & HOURS */}
      <div id="open-days-scroll-mt" className="scroll-mt-28">
        <OpenDaysEditor />
      </div>

      <div className="border-t border-cream-dark/35" />

      {/* SECTION 2: BLOCKED DATES */}
      <div id="blocked-dates-scroll-mt" className="scroll-mt-28">
        <BlockedDatesManager />
      </div>

      <div className="border-t border-cream-dark/35" />

      {/* SECTION 3: TIME SLOTS */}
      <div id="time-slots-scroll-mt" className="scroll-mt-28">
        <TimeSlotsEditor />
      </div>

    </div>
  );
}
