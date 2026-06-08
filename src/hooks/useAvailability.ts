import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BlockedDate } from '../types';

const DEFAULT_OPEN_DAYS = [3, 4, 5, 6, 0]; // Wed, Thu, Fri, Sat, Sun
const DEFAULT_TIME_SLOTS = [
  '9:00 am',
  '10:00 am',
  '11:15 am',
  '12:30 pm',
  '1:45 pm',
  '3:00 pm',
  '4:15 pm',
  '5:30 pm'
];

export function useAvailability() {
  const [openDays, setOpenDays] = useState<number[]>(DEFAULT_OPEN_DAYS);
  const [timeSlots, setTimeSlots] = useState<string[]>(DEFAULT_TIME_SLOTS);
  const [bufferMinutes, setBufferMinutes] = useState<number>(15);
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState<number>(1);
  const [blockedDates, setBlockedDates] = useState<Record<string, { reason: string; blockedSlots: string[] }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolvedSettings = false;
    let resolvedBlocked = false;

    const checkComplete = () => {
      if (resolvedSettings && resolvedBlocked) {
        setLoading(false);
      }
    };

    // 1. Listen to settings document
    const configDocRef = doc(db, 'availabilitySettings', 'config');
    const unsubSettings = onSnapshot(
      configDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.openDays)) setOpenDays(data.openDays);
          if (Array.isArray(data.timeSlots)) setTimeSlots(data.timeSlots);
          if (typeof data.bufferMinutes === 'number') setBufferMinutes(data.bufferMinutes);
          if (typeof data.maxBookingsPerSlot === 'number') setMaxBookingsPerSlot(data.maxBookingsPerSlot);
        }
        resolvedSettings = true;
        checkComplete();
      },
      (err) => {
        console.warn('availabilitySettings onSnapshot error - using defaults:', err.message);
        resolvedSettings = true;
        checkComplete();
      }
    );

    // 2. Listen to blocked dates collection
    const blockedColRef = collection(db, 'blockedDates');
    const unsubBlocked = onSnapshot(
      blockedColRef,
      (snapshot) => {
        const mapped: Record<string, { reason: string; blockedSlots: string[] }> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Doc ID is typically YYYY-MM-DD
          mapped[doc.id] = {
            reason: data.reason || '',
            blockedSlots: Array.isArray(data.blockedSlots) ? data.blockedSlots : []
          };
        });
        setBlockedDates(mapped);
        resolvedBlocked = true;
        checkComplete();
      },
      (err) => {
        console.warn('blockedDates onSnapshot error - using defaults:', err.message);
        resolvedBlocked = true;
        checkComplete();
      }
    );

    return () => {
      unsubSettings();
      unsubBlocked();
    };
  }, []);

  return {
    openDays,
    timeSlots,
    blockedDates,
    bufferMinutes,
    maxBookingsPerSlot,
    loading
  };
}
