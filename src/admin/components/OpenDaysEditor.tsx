import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Check, X, RefreshCw, AlertCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon', fullName: 'Monday' },
  { value: 2, label: 'Tue', fullName: 'Tuesday' },
  { value: 3, label: 'Wed', fullName: 'Wednesday' },
  { value: 4, label: 'Thu', fullName: 'Thursday' },
  { value: 5, label: 'Fri', fullName: 'Friday' },
  { value: 6, label: 'Sat', fullName: 'Saturday' },
  { value: 0, label: 'Sun', fullName: 'Sunday' },
];

export default function OpenDaysEditor() {
  const [openDays, setOpenDays] = useState<number[]>([3, 4, 5, 6, 0]);
  const [bufferMinutes, setBufferMinutes] = useState<number>(15);
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // References to keep track of first mounts to skip initial debounce
  const isFirstMount = useRef(true);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load configuration initially
  useEffect(() => {
    async function loadConfig() {
      try {
        const docRef = doc(db, 'availabilitySettings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.openDays)) setOpenDays(data.openDays);
          if (typeof data.bufferMinutes === 'number') setBufferMinutes(data.bufferMinutes);
          if (typeof data.maxBookingsPerSlot === 'number') setMaxBookingsPerSlot(data.maxBookingsPerSlot);
        } else {
          // Document does not exist yet. We can prepopulate default configuration in DB
          await setDoc(docRef, {
            openDays: [3, 4, 5, 6, 0],
            timeSlots: [
              '9:00 am', '10:00 am', '11:15 am', '12:30 pm',
              '1:45 pm', '3:00 pm', '4:15 pm', '5:30 pm'
            ],
            bufferMinutes: 15,
            maxBookingsPerSlot: 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err: any) {
        console.error('Failed to load availability settings:', err);
        setErrorMsg('Could not read settings from Firestore.');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Trigger Save automatically when settings change
  useEffect(() => {
    if (loading) return;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setSaveStatus('saving');
    debounceTimeout.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'availabilitySettings', 'config');
        await setDoc(docRef, {
          openDays,
          bufferMinutes,
          maxBookingsPerSlot,
          updatedAt: serverTimestamp()
        }, { merge: true });

        setSaveStatus('saved');
        // Clear saved indicator after 2 seconds
        setTimeout(() => {
          setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 2000);
      } catch (err: any) {
        console.error('Error auto-saving availability Settings:', err);
        setSaveStatus('error');
        setErrorMsg('Auto-save failed.');
      }
    }, 800);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [openDays, bufferMinutes, maxBookingsPerSlot, loading]);

  const toggleDay = (dayValue: number) => {
    setOpenDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((d) => d !== dayValue);
      } else {
        return [...prev, dayValue].sort((a, b) => a - b);
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white border border-cream-dark/50 rounded-xs p-6 flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 text-sage animate-spin mr-2" />
        <span className="text-sm font-sans font-light text-charcoal-light">Loading open hours configuration...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-cream-dark/50 rounded-xs p-6 space-y-6 shadow-3xs">
      
      {/* HEADER ROW WITH STATUS FEEDBACK */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg text-charcoal font-normal">Open Days & Hours</h3>
          <p className="text-xs text-charcoal-light/80 font-light mt-0.5">
            Select which days of the week the physical studio is open for business.
          </p>
        </div>

        {/* Saved Status Indicators */}
        <div className="h-6">
          {saveStatus === 'saving' && (
            <span className="text-xs font-sans text-charcoal-light/60 flex items-center gap-1.5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sage" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs font-sans text-sage font-bold flex items-center gap-1.5 animate-fade-in-out">
              <Check className="w-4 h-4 text-sage stroke-[2.5]" />
              <span>Saved ✓</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs font-sans text-rose font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>Save error</span>
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-rose bg-rose/5 border border-rose/10 px-3 py-2 rounded-xs">
          {errorMsg}
        </p>
      )}

      {/* DAY CARDS TRIGGER GRID */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal-light">Weekly Calendar Days</label>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const isOpen = openDays.includes(day.value);
            return (
              <button
                key={day.value}
                id={`setting-toggle-day-${day.label}`}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`p-4 rounded-xs border text-left transition-all duration-300 relative select-none cursor-pointer flex flex-col justify-between h-24 ${
                  isOpen
                    ? 'bg-sage/10 border-sage/60 text-sage ring-1 ring-sage/10'
                    : 'bg-cream-light/35 border-cream-dark/60 text-charcoal-light/60 hover:bg-cream-light/50'
                }`}
              >
                <span className="font-serif text-md font-medium">{day.label}</span>
                <div className="flex items-center gap-1">
                  {isOpen ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sage shrink-0 stroke-[2.5]" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-sage">Open</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-charcoal-light/30 shrink-0" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-charcoal-light/40">Closed</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ADDITIONAL SETTINGS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-cream-dark/20 text-sm">
        
        {/* BUFFER TIME */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light">Gap Between Appointments (Buffer)</label>
          <p className="text-xs text-charcoal-light/75 font-light">
            Enforced breathing gap allowed in minutes between consecutive client bookings.
          </p>
          <select
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(Number(e.target.value))}
            className="w-full mt-1.5 px-3.5 py-2.5 border border-cream-dark rounded-xs bg-cream-light/20 focus:border-sage focus:outline-hidden text-charcoal cursor-pointer font-sans"
          >
            <option value={0}>0 minutes — No transition delay</option>
            <option value={15}>15 minutes — Standard buffer</option>
            <option value={30}>30 minutes — Deluxe cleaning buffer</option>
            <option value={45}>45 minutes — Extra extended buffer</option>
            <option value={60}>60 minutes — Extreme sanitary buffer</option>
          </select>
        </div>

        {/* MAXIMUM APPOINTMENTS PER SLOT */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light">Occupancy Capacity Limit (Max Bookings)</label>
          <p className="text-xs text-charcoal-light/75 font-light">
            Limit how many clients can reserve a single slot (1 = standard solo studio practice).
          </p>
          <input
            type="number"
            min="1"
            max="10"
            value={maxBookingsPerSlot}
            onChange={(e) => setMaxBookingsPerSlot(Math.max(1, Math.min(10, Number(e.target.value))))}
            className="w-full mt-1.5 px-3.5 py-2.5 border border-cream-dark rounded-xs bg-cream-light/20 focus:border-sage focus:outline-hidden text-charcoal font-sans"
          />
        </div>

      </div>

    </div>
  );
}
