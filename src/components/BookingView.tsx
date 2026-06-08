/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { 
  Calendar, Clock, DollarSign, Phone, Mail, Sparkles, Check, 
  ChevronRight, ChevronLeft, AlertCircle, Info, Heart, Instagram, MapPin 
} from 'lucide-react';
import { useFirestoreImages } from '../hooks/useFirestoreImages';
import { useAvailability } from '../hooks/useAvailability';
import { Service } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const parseDurationToMinutes = (durationStr: string): number => {
  let minutes = 0;
  const hrMatch = durationStr.match(/(\d+)\s*(hr|hour|h)/i);
  const minMatch = durationStr.match(/(\d+)\s*(min|m)/i);
  if (hrMatch) minutes += parseInt(hrMatch[1], 10) * 60;
  if (minMatch) minutes += parseInt(minMatch[1], 10);
  if (!hrMatch && !minMatch) {
    const justNum = durationStr.match(/^(\d+)$/);
    if (justNum) minutes = parseInt(justNum[1], 10);
    else minutes = 45;
  }
  return minutes;
};

export default function BookingView() {
  const { services } = useFirestoreImages();
  const { openDays, timeSlots: dbTimeSlots, blockedDates, loading: avLoading } = useAvailability();


  const getFirstAvailableDate = () => {
    const today = new Date();
    const temp = new Date(today);
    for (let i = 0; i < 30; i++) {
      const dayIndex = temp.getDay();
      if (dayIndex !== 1 && dayIndex !== 2) {
        return `${temp.getFullYear()}-${String(temp.getMonth() + 1).padStart(2, '0')}-${String(temp.getDate()).padStart(2, '0')}`;
      }
      temp.setDate(temp.getDate() + 1);
    }
    return '';
  };

  const formatRawDate = (rawDateStr: string) => {
    if (!rawDateStr) return null;
    const parts = rawDateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      dayName: days[dateObj.getDay()],
      formatted: dateObj.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
    };
  };

  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<'north-lakes' | 'bongaree' | null>(null);
  const [selectedCore, setSelectedCore] = useState<Service | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    agreePolicies: false,
    agreeSolo: false,
    agreePreCare: false
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Available core & add-ons lists
  const bookableServices = services.filter(
    (s) => (s.category === 'core' || s.category === 'signature') && s.bookable !== false
  );
  const addonServices = services.filter(s => s.category === 'addon');

  const [navMonthOffset, setNavMonthOffset] = useState(0);

  const getDisplayedYearMonth = (offset: number) => {
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return {
      year: target.getFullYear(),
      month: target.getMonth(), // 0-indexed
      name: target.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
    };
  };

  const getDatesForCurrentMonth = () => {
    const { year, month } = getDisplayedYearMonth(navMonthOffset);
    const dates = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get number of days in the target year/month
    const numDays = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let d = 1; d <= numDays; d++) {
      const checkDate = new Date(year, month, d);
      checkDate.setHours(0, 0, 0, 0);
      const dayIndex = checkDate.getDay();
      const rawDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const isPast = checkDate < today;
      const isClosed = !openDays.includes(dayIndex);
      const isBlocked = !!(blockedDates[rawDate] && blockedDates[rawDate].blockedSlots.length === 0);
      
      dates.push({
        raw: rawDate,
        dayNum: d,
        dayName: days[dayIndex],
        formatted: checkDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
        isPast,
        isClosed,
        isBlocked
      });
    }
    return dates;
  };

  const datesAvailable = getDatesForCurrentMonth();

  const isSelectedInNavMonth = (() => {
    if (!selectedDate) return false;
    const { year, month } = getDisplayedYearMonth(navMonthOffset);
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return false;
    return parseInt(parts[0], 10) === year && (parseInt(parts[1], 10) - 1) === month;
  })();

  // Active time slots filtered by selected date partial blocks
  const activeBlock = blockedDates[selectedDate];
  const timeSlots = dbTimeSlots.filter(
    (slot) => !activeBlock || !activeBlock.blockedSlots.includes(slot)
  );

  // Clear selected time if it becomes blocked on the new selected date or is no longer valid
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const activeBlock = blockedDates[selectedDate];
      const isBlocked = !!activeBlock && (activeBlock.blockedSlots.length === 0 || activeBlock.blockedSlots.includes(selectedTime));
      if (isBlocked) {
        setSelectedTime('');
      }
    }
  }, [selectedDate, blockedDates, selectedTime]);

  // Auto-set the first available open date when settings resolve
  useEffect(() => {
    if (selectedDate) return; // Do NOT override if a date is already selected by the user!
    if (!avLoading && openDays.length > 0) {
      const today = new Date();
      const temp = new Date(today);
      for (let i = 0; i < 45; i++) {
        const dayIndex = temp.getDay();
        const rawDate = `${temp.getFullYear()}-${String(temp.getMonth() + 1).padStart(2, '0')}-${String(temp.getDate()).padStart(2, '0')}`;
        
        const isClosed = !openDays.includes(dayIndex);
        const isBlocked = !!(blockedDates[rawDate] && blockedDates[rawDate].blockedSlots.length === 0);
        
        if (!isClosed && !isBlocked) {
          setSelectedDate(rawDate);
          break;
        }
        temp.setDate(temp.getDate() + 1);
      }
    }
  }, [avLoading, openDays, blockedDates, selectedDate]);

  // Logic to toggle selected addons
  const handleToggleAddon = (addon: Service) => {
    setSelectedAddons(prev => {
      const exists = prev.find(item => item.id === addon.id);
      if (exists) {
        return prev.filter(item => item.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  // Cost calculations
  const corePrice = selectedCore ? selectedCore.price : 0;
  const addonsPrice = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const totalCost = corePrice + addonsPrice;

  const handleNextStep = () => {
    if (step === 1 && !selectedCore) return;
    if (step === 3 && (!selectedDate || !selectedTime)) return;
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isCheckbox = type === 'checkbox';
    
    setClientInfo(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const isFormValid = () => {
    return (
      clientInfo.name.trim() !== '' &&
      clientInfo.email.trim() !== '' &&
      clientInfo.phone.trim() !== '' &&
      clientInfo.agreePolicies &&
      clientInfo.agreeSolo &&
      clientInfo.agreePreCare
    );
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const selectedDateFormatted = formatRawDate(selectedDate);
    const dateLabel = selectedDateFormatted
      ? `${selectedDateFormatted.dayName}, ${selectedDateFormatted.formatted}`
      : selectedDate;

    const addonsLabel = selectedAddons.length > 0
      ? selectedAddons.map(a => a.name).join(', ')
      : 'None';

    try {
      // 1. Calculate combined duration in minutes
      const coreMin = selectedCore ? parseDurationToMinutes(selectedCore.duration) : 45;
      const addonsMin = selectedAddons.reduce((sum, item) => sum + parseDurationToMinutes(item.duration), 0);
      const totalDurationMinutes = coreMin + addonsMin;

      // 2. Write booking to Firestore bookings collection
      await addDoc(collection(db, 'bookings'), {
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
        serviceName: selectedCore?.name ?? '',
        addons: addonsLabel,
        date: selectedDate, // standard formatted YYYY-MM-DD
        startTime: selectedTime,
        duration: `${totalDurationMinutes} min`,
        totalDuration: totalDurationMinutes,
        totalPrice: totalCost,
        notes: clientInfo.notes || 'None',
        status: 'confirmed',
        calendarSyncStatus: 'pending', // Triggers backend Express listener to sync to Google Calendar
        googleCalendarEventId: '',
        createdAt: serverTimestamp()
      });
      console.log('Successfully saved booking to Firestore database.');
    } catch (saveError) {
      console.error('Error in saving booking document to Firestore:', saveError);
    }

    try {
      await emailjs.send(
        'service_gi2b928',
        'template_fmy0f5y',
        {
          client_name: clientInfo.name,
          client_email: clientInfo.email,
          client_phone: clientInfo.phone,
          service: selectedCore?.name ?? '',
          addons: addonsLabel,
          date: dateLabel,
          time: selectedTime,
          total: `A$${totalCost}`,
          deposit: 'A$20',
          remaining: `A$${totalCost - 20}`,
          notes: clientInfo.notes || 'None',
        },
        'xs287kRgirxEW_Dcz'
      );
      console.log('Booking email sent successfully');
    } catch (error) {
      console.error('EmailJS booking error:', error);
    }

    setBookingConfirmed(true);
  };

  const handleResetWizard = () => {
    setStep(1);
    setSelectedLocation(null);
    setSelectedCore(null);
    setSelectedAddons([]);
    setSelectedDate('');
    setSelectedTime('');
    setClientInfo({
      name: '',
      email: '',
      phone: '',
      notes: '',
      agreePolicies: false,
      agreeSolo: false,
      agreePreCare: false
    });
    setBookingConfirmed(false);
  };

  return (
    <div className="bg-cream py-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* POLICIES AND NOTICES REVELATION - Standardized */}
        {!bookingConfirmed && selectedLocation === 'north-lakes' && (
          <div className="bg-[#FAF0EE] rounded-sm border border-[#F5EAE8] p-6 mb-10 space-y-4 shadow-xs">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5.5 h-5.5 text-blush-dark shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-serif text-[#2D2D2A] font-semibold text-base">Key Policies & Deposit Notification</h3>
                <p className="text-xs text-charcoal-light leading-relaxed">
                  A **A$20 non-refundable deposit** is required to secure your booking. This will be safely applied to your final bill on the day of treatment.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs border-t border-blush/25">
              <div className="space-y-0.5">
                <span className="font-bold text-charcoal block">Punctuality Reminder</span>
                <span className="text-charcoal-light font-light leading-relaxed">Arrive on time — more than 10 mins late forfeits your deposit & slot.</span>
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-charcoal block">Private Studio Space</span>
                <span className="text-charcoal-light font-light leading-relaxed">Please arrive alone. No guests, children, or pets in the treatment room.</span>
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-charcoal block font-sans">Pre-care Adherence</span>
                <span className="text-charcoal-light font-light leading-relaxed">Follow pre-care guidelines strictly to secure skin safety & flawless dye tinting.</span>
              </div>
            </div>
          </div>
        )}

        {/* BOOKING WIZARD */}
        {bookingConfirmed ? (
          /* CONFIRMED SCREEN */
          <div className="bg-cream-light border border-cream-dark/60 rounded-sm p-8 sm:p-12 shadow-xl text-center space-y-8 animate-fade-in">
            <div className="w-16 h-16 bg-blush-light rounded-full flex items-center justify-center text-rose mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#CFA39F] block">Booking Request Received!</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-charcoal tracking-wide">
                Your Reservation Has Been Received
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-light max-w-lg mx-auto">
                Thank you for choosing The Brow Manor. Leticia will review your reservation and be in touch shortly to confirm your appointment details.
              </p>
            </div>

            {/* Receipt details */}
            <div className="bg-[#FAF7F2] p-6 rounded-xs border border-cream-dark/60 max-w-md mx-auto text-left space-y-4">
              <div className="border-b border-cream-dark pb-3 text-center">
                <span className="font-serif font-semibold text-charcoal tracking-wider uppercase text-xs">Booking Slip</span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Client:</span>
                  <span className="font-semibold text-charcoal">{clientInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Phone:</span>
                  <span className="font-semibold text-charcoal">{clientInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Treatment:</span>
                  <span className="font-semibold text-charcoal text-right">{selectedCore?.name}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Add-ons:</span>
                    <span className="font-semibold text-charcoal text-right">
                      {selectedAddons.map(a => a.name).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Scheduled Time:</span>
                  <span className="font-semibold text-sage text-right">
                    {(() => {
                      const f = formatRawDate(selectedDate);
                      return f ? `${f.dayName}, ${f.formatted}` : selectedDate;
                    })()} @ {selectedTime}
                  </span>
                </div>
                <div className="border-t border-cream-dark/60 pt-3 space-y-1.5 font-sans">
                  <div className="flex justify-between font-semibold">
                    <span>Total Appointment Value:</span>
                    <span>A${totalCost}</span>
                  </div>
                  <div className="flex justify-between text-xs text-charcoal-light">
                    <span>Booking Deposit (due on confirmation):</span>
                    <span className="font-semibold text-charcoal">A$20</span>
                  </div>
                  <div className="flex justify-between text-xs text-sage font-bold border-t border-cream-dark/30 pt-2">
                    <span>Remaining Balance Day Of:</span>
                    <span>A${totalCost - 20}</span>
                  </div>
                  <p className="text-[10px] text-charcoal-light font-light leading-relaxed pt-1 border-t border-cream-dark/20 mt-1">
                    * A non-refundable A$20 deposit will be arranged by Leticia upon confirmation. This amount will be fully adjusted against your total on the day of your appointment.
                  </p>
                </div>
              </div>
            </div>

            {/* Post booking instructions */}
            <div className="text-xs text-charcoal-light leading-relaxed max-w-md mx-auto space-y-2 font-light">
              <p className="font-semibold text-charcoal">📍 Address Reveal Policy:</p>
              <p>
                Your appointment is at The Brow Manor, Level One, Suite 5/5 Discovery Dr, North Lakes QLD 4509. Leticia will confirm your booking shortly and share any parking details you may require.
              </p>
              <p>
                Need to reschedule? Please let Leticia know at least 24 hours in advance at <span className="font-bold text-charcoal">+61 416 423 758</span> or email <span className="font-bold text-charcoal">leticiaeast04@gmail.com</span> to rollover your deposit.
              </p>
            </div>

            <div className="pt-4">
              <button
                id="reset-booking-wizard-btn1"
                onClick={handleResetWizard}
                className="px-6 py-3 bg-rose hover:bg-blush-dark text-cream text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-colors cursor-pointer"
              >
                RESERVE ANOTHER TREATMENT
              </button>
            </div>
          </div>
        ) : selectedLocation === null || selectedLocation === 'bongaree' ? (
          <div className="space-y-6">
            <div className="bg-cream-light border border-cream-dark/60 rounded-sm shadow-xl p-6 sm:p-10 space-y-8 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose/10 text-rose rounded-full text-xs font-semibold tracking-wider uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>Select Your Location</span>
                </div>
                <h3 className="font-serif text-2xl font-light text-charcoal">Where would you like to book?</h3>
                <p className="text-xs text-charcoal-light max-w-md mx-auto">Online booking is available for our North Lakes studio. Bongaree appointments are by request only — please contact Leticia directly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* North Lakes Option */}
                <button
                  onClick={() => setSelectedLocation('north-lakes')}
                  className="group text-left p-6 rounded-sm border-2 border-cream-dark/40 hover:border-rose bg-cream hover:bg-rose/5 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-rose font-sans">Main Studio</span>
                    <span className="text-xs bg-rose/10 text-rose px-2 py-0.5 rounded-full font-semibold">Online Booking ✓</span>
                  </div>
                  <h4 className="font-serif text-xl font-light text-charcoal group-hover:text-rose transition-colors">North Lakes</h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">Level One, Suite 5/5 Discovery Dr, North Lakes QLD 4509</p>
                  <p className="text-xs text-charcoal-light">Thursday – Saturday, 8am – 8pm</p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose">
                      Book Online →
                    </span>
                  </div>
                </button>

                {/* Bongaree Option */}
                <button
                  onClick={() => setSelectedLocation('bongaree')}
                  className="group text-left p-6 rounded-sm border-2 border-cream-dark/40 hover:border-charcoal/30 bg-cream hover:bg-cream-dark/10 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-charcoal-light font-sans">By Request</span>
                    <span className="text-xs bg-charcoal/10 text-charcoal-light px-2 py-0.5 rounded-full font-semibold">Contact Only</span>
                  </div>
                  <h4 className="font-serif text-xl font-light text-charcoal">Bongaree</h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">Bribie Island — home appointments available by request only</p>
                  <p className="text-xs text-charcoal-light">Flexible days upon arrangement with Leticia</p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-light">
                      Contact Leticia →
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {selectedLocation === 'bongaree' && (
              <div className="bg-cream-light border border-cream-dark/60 rounded-sm shadow-xl p-6 sm:p-10 space-y-6 text-center animate-fade-in">
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl font-light text-charcoal">Bongaree Appointments</h3>
                  <p className="text-sm text-charcoal-light leading-relaxed max-w-md mx-auto">Bongaree appointments are available by request only. Please contact Leticia directly via Instagram DM or email to arrange your visit. She would be delighted to accommodate you.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <a
                    href="https://www.instagram.com/thebrowmanorr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose hover:bg-blush-dark text-cream text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-colors cursor-pointer"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram DM
                  </a>
                  <a
                    href="mailto:leticiaeast04@gmail.com"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-rose text-rose hover:bg-rose/10 text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </a>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-xs text-charcoal-light hover:text-charcoal underline cursor-pointer transition-colors"
                >
                  ← Go back and choose a different location
                </button>
              </div>
            )}
          </div>
        ) : (
          /* STEP FLOW WIZARD BUILD */
          <div className="bg-cream-light border border-cream-dark/60 rounded-sm shadow-xl p-6 sm:p-10 space-y-8 animate-fade-in">
            
            {/* Steps Indicator Bar */}
            <div className="flex justify-between items-center pb-6 border-b border-cream-dark/60 text-xs text-charcoal-light font-sans overflow-x-auto min-w-full">
              <div className={`shrink-0 flex items-center gap-1.5 pb-2 ${step >= 1 ? 'text-rose font-bold border-b-2 border-rose pb-2' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-cream-dark/40 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Core Sculpt</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              <div className={`shrink-0 flex items-center gap-1.5 pb-2 ${step >= 2 ? 'text-rose font-bold border-b-2 border-rose pb-2' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-cream-dark/40 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Add-ons</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              <div className={`shrink-0 flex items-center gap-1.5 pb-2 ${step >= 3 ? 'text-rose font-bold border-b-2 border-rose pb-2' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-cream-dark/40 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Date & Time</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              <div className={`shrink-0 flex items-center gap-1.5 pb-2 ${step >= 4 ? 'text-rose font-bold border-b-2 border-rose pb-2' : ''}`}>
                <span className="w-5 h-5 rounded-full bg-cream-dark/40 flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Consent & Details</span>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-[10px] text-charcoal-light hover:text-charcoal underline cursor-pointer transition-colors"
                type="button"
              >
                ← Change location
              </button>
            </div>

            {/* STEP 1: CHOOSE CORE SERVICE */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-light text-charcoal">Select Your Treatment</h3>
                  <p className="text-xs text-charcoal-light">Please select your primary treatment. Luxury indulgences may be added in the next step.</p>
                  <p className="text-xs text-charcoal-light/70 italic pt-1">
                    Lash services coming soon — contact Leticia to join the waitlist.
                  </p>
                </div>

                <div className="space-y-4">
                  {bookableServices.map((service) => {
                    const isSelected = selectedCore?.id === service.id;
                    return (
                      <button
                        key={service.id}
                        id={`wizard-select-core-${service.id}`}
                        onClick={() => setSelectedCore(service)}
                        className={`w-full text-left p-5 rounded-xs border transition-all flex justify-between items-center gap-4 cursor-pointer focus:outline-hidden ${
                          isSelected 
                            ? 'bg-[#EDF1EC] border-rose ring-2 ring-rose/50 shadow-xs' 
                            : 'bg-cream-light border-cream-dark/60 hover:border-blush-dark/40'
                        }`}
                      >
                        <div className="space-y-1.5 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-medium text-charcoal text-md sm:text-lg">
                              {service.name}
                            </span>
                            {service.popular && (
                              <span className="bg-blush-light text-blush-dark text-[8.5px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full font-sans">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-light font-light leading-relaxed line-clamp-2">
                            {service.description}
                          </p>
                          <span className="block text-[10px] font-semibold text-sage-light uppercase tracking-wider font-sans">
                            Duration: {service.duration} Included
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-serif text-lg sm:text-xl font-bold text-charcoal block">A${service.price}</span>
                          <div className={`mt-2 w-5 h-5 rounded-full border flex items-center justify-center mx-auto ${isSelected ? 'bg-rose text-cream border-rose' : 'border-charcoal/20 bg-cream'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOMIZE WITH ADDONS */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-light text-charcoal">Elevate Your Experience</h3>
                  <p className="text-xs text-charcoal-light">Enhance your visit with one of The Manor's luxury indulgences — each one a small act of devotion to yourself.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addonServices.map((addon) => {
                    const isSelected = selectedAddons.some(item => item.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        id={`wizard-select-addon-${addon.id}`}
                        onClick={() => handleToggleAddon(addon)}
                        className={`text-left p-5 rounded-xs border transition-all flex flex-col justify-between cursor-pointer focus:outline-hidden ${
                          isSelected 
                            ? 'bg-[#EDF1EC] border-rose ring-2 ring-rose/50 shadow-xs' 
                            : 'bg-cream-light border-cream-dark/60 hover:border-blush-dark/40'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-serif font-medium text-charcoal text-base leading-tight">
                              {addon.name}
                            </span>
                            <span className="font-serif font-bold text-charcoal shrink-0">A${addon.price}</span>
                          </div>
                          <p className="text-xs text-charcoal-light font-light leading-relaxed min-h-[48px]">
                            {addon.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-cream-dark/30 mt-4 flex justify-between items-center w-full">
                          <span className="text-[10px] uppercase text-sans tracking-wide text-charcoal-light">{addon.duration}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-rose text-cream border-rose' : 'border-charcoal/20 bg-cream'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: DATE & TIME CHOOSE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-light text-charcoal">Select Date & Time</h3>
                  <p className="text-xs text-charcoal-light">Thursday through Saturday are set studio days at The Brow Manor, North Lakes. Other days may be available upon request — please contact Leticia directly to arrange.</p>
                </div>

                <div className="space-y-6">
                  {/* Month Navigation Bar */}
                  <div className="flex items-center justify-between py-2 border-b border-cream-dark/40 pb-4">
                    <button
                      type="button"
                      id="prev-month-btn"
                      onClick={() => setNavMonthOffset(prev => Math.max(0, prev - 1))}
                      disabled={navMonthOffset === 0}
                      className={`w-10 h-10 flex items-center justify-center bg-transparent border rounded-xs transition-all ${
                        navMonthOffset === 0
                          ? 'border-charcoal/10 text-charcoal/30 cursor-not-allowed opacity-50'
                          : 'border-charcoal/30 hover:border-charcoal text-charcoal hover:bg-cream cursor-pointer'
                      }`}
                    >
                      ‹
                    </button>
                    <span className="font-serif text-lg text-charcoal font-medium">
                      {getDisplayedYearMonth(navMonthOffset).name}
                    </span>
                    <button
                      type="button"
                      id="next-month-btn"
                      onClick={() => setNavMonthOffset(prev => prev + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-transparent border border-charcoal/30 hover:border-charcoal text-charcoal hover:bg-cream cursor-pointer rounded-xs transition-all"
                    >
                      ›
                    </button>
                  </div>

                  {/* Calendar Dates Grid */}
                  <div className="space-y-2.5">
                    <span className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal">Available Days</span>
                    
                    {avLoading ? (
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 text-center">
                        {/* Day headers placeholder */}
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                          <div key={idx} className="text-[10px] font-sans font-semibold uppercase tracking-widest text-charcoal-light/65 py-1">{day}</div>
                        ))}
                        {[...Array(35)].map((_, i) => (
                          <div key={i} className="animate-pulse bg-charcoal/5 border border-cream-dark/35 rounded-xs h-16 sm:h-20" />
                        ))}
                      </div>
                    ) : (() => {
                      const { year, month } = getDisplayedYearMonth(navMonthOffset);
                      const firstDayOfWeek = new Date(year, month, 1).getDay();
                      const numDaysInMonth = new Date(year, month + 1, 0).getDate();
                      const lastDayOfWeek = new Date(year, month, numDaysInMonth).getDay();
                      
                      const emptyPrefix = Array.from({ length: firstDayOfWeek });
                      const emptySuffix = Array.from({ length: 6 - lastDayOfWeek });

                      const today = new Date();
                      const todayRawStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                      const weekdays = [
                        { label: 'Sunday', short: 'SUN', letter: 'S' },
                        { label: 'Monday', short: 'MON', letter: 'M' },
                        { label: 'Tuesday', short: 'TUE', letter: 'T' },
                        { label: 'Wednesday', short: 'WED', letter: 'W' },
                        { label: 'Thursday', short: 'THU', letter: 'T' },
                        { label: 'Friday', short: 'FRI', letter: 'F' },
                        { label: 'Saturday', short: 'SAT', letter: 'S' }
                      ];

                      return (
                        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                          {/* Day headers */}
                          {weekdays.map((wd) => (
                            <div key={wd.label} className="text-center py-2 text-[10px] font-sans font-semibold tracking-wider text-charcoal/70 uppercase">
                              <span className="hidden sm:inline">{wd.short}</span>
                              <span className="inline sm:hidden">{wd.letter}</span>
                            </div>
                          ))}

                          {/* Empty prefix cells for proper alignment */}
                          {emptyPrefix.map((_, i) => (
                            <div 
                              key={`empty-prefix-${i}`} 
                              className="bg-transparent border border-transparent aspect-square flex items-center justify-center min-h-[4.5rem] sm:min-h-[5.5rem]" 
                            />
                          ))}

                          {/* Actual day cells */}
                          {datesAvailable.map((date) => {
                            const isSelected = selectedDate === date.raw;
                            const isToday = date.raw === todayRawStr;
                            const isDisabled = date.isPast || date.isClosed || date.isBlocked;
                            
                            return (
                              <button
                                key={date.raw}
                                id={`wizard-select-date-${date.raw}`}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => !isDisabled && setSelectedDate(date.raw)}
                                className={`relative flex flex-col items-center justify-center p-1 border rounded-xs transition-colors duration-200 focus:outline-hidden aspect-square min-h-[4.5rem] sm:min-h-[5.5rem] ${
                                  isSelected
                                    ? 'bg-white border-2 border-rose shadow-md text-white'
                                    : date.isPast
                                      ? 'bg-cream-dark/5 border-cream-dark/15 text-charcoal-light/35 cursor-not-allowed opacity-[0.45]'
                                      : date.isClosed
                                        ? 'bg-[#EFECE8] border border-cream-dark/20 text-charcoal-light/30 cursor-not-allowed opacity-[0.45]'
                                        : date.isBlocked
                                          ? 'bg-rose/5 border border-rose/15 text-rose/75 cursor-not-allowed'
                                          : 'bg-cream-light border-cream-dark/60 hover:bg-rose/10 hover:border-rose cursor-pointer text-charcoal'
                                }`}
                              >
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-rose text-cream font-bold'
                                    : isToday
                                      ? 'border-2 border-rose text-rose font-semibold'
                                      : ''
                                }`}>
                                  <span className="text-xs sm:text-xs md:text-sm">{date.dayNum}</span>
                                </div>

                                {date.isBlocked && (
                                  <span className="block text-[8px] sm:text-[9.5px] uppercase tracking-wider text-rose/95 font-bold mt-1 max-w-full truncate">Unavailable</span>
                                )}
                                {date.isClosed && !date.isPast && (
                                  <span className="block text-[8px] sm:text-[9.5px] uppercase tracking-wider text-[#93938E] font-semibold mt-1 max-w-full truncate">Closed</span>
                                )}
                              </button>
                            );
                          })}

                          {/* Empty suffix cells for proper alignment */}
                          {emptySuffix.map((_, i) => (
                            <div 
                              key={`empty-suffix-${i}`} 
                              className="bg-transparent border border-transparent aspect-square flex items-center justify-center min-h-[4.5rem] sm:min-h-[5.5rem]" 
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Time slots grid */}
                  {selectedDate && isSelectedInNavMonth && (
                    <div className="space-y-2.5 animate-fade-in">
                      <span className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal">Available Time Slots</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {avLoading ? (
                          [...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-charcoal/5 border border-cream-dark/45 rounded-xs h-12" />
                          ))
                        ) : dbTimeSlots.length === 0 ? (
                          <div className="col-span-full py-6 text-center border border-dashed border-cream-dark/60 rounded-xs text-xs font-sans text-charcoal-light italic bg-cream-light/10">
                            No appointment times available for the selected date.
                          </div>
                        ) : (
                          dbTimeSlots.map((time) => {
                            const isSelected = selectedTime === time;
                            const isBlocked = !!activeBlock && (activeBlock.blockedSlots.length === 0 || activeBlock.blockedSlots.includes(time));
                            return (
                              <button
                                key={time}
                                id={`wizard-select-time-${time.replace(' ', '')}`}
                                type="button"
                                onClick={() => {
                                  if (isBlocked) return;
                                  setSelectedTime(time);
                                }}
                                disabled={isBlocked}
                                className={`p-3 rounded-xs border text-center transition-all focus:outline-hidden text-xs sm:text-sm font-sans flex items-center justify-between px-3 gap-1.5 ${
                                  isBlocked 
                                    ? 'opacity-45 cursor-not-allowed pointer-events-none bg-neutral-200 text-neutral-500 border-neutral-300'
                                    : isSelected 
                                      ? 'bg-rose text-cream border-rose shadow-md font-bold cursor-pointer' 
                                      : 'bg-cream-light border-cream-dark/60 hover:border-rose cursor-pointer'
                                }`}
                                style={isBlocked ? { opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none', background: '#eaeaea' } : undefined}
                              >
                                <span>{time}</span>
                                {isBlocked && (
                                  <span className="text-[10.5px] uppercase font-semibold text-neutral-500 shrink-0">Booked</span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: CONSENT & DETAILS */}
            {step === 4 && (
              <form onSubmit={handleConfirmReservation} className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-light text-charcoal">Secure Your Place at The Manor</h3>
                  <p className="text-xs text-charcoal-light">Enter your details and accept The Manor's studio terms to complete your reservation.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="client-name">
                      Full Name *
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      name="name"
                      required
                      value={clientInfo.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah Thompson"
                      className="w-full bg-cream border border-cream-dark focus:border-sage px-3.5 py-2.5 rounded-xs text-xs sm:text-sm focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="client-email">
                      Email Address *
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      name="email"
                      required
                      value={clientInfo.email}
                      onChange={handleInputChange}
                      placeholder="e.g. sarah@gmail.com"
                      className="w-full bg-cream border border-cream-dark focus:border-sage px-3.5 py-2.5 rounded-xs text-xs sm:text-sm focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="client-phone">
                      Mobile Number *
                    </label>
                    <input
                      id="client-phone"
                      type="tel"
                      name="phone"
                      required
                      value={clientInfo.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +61 412 345 678"
                      className="w-full bg-cream border border-cream-dark focus:border-sage px-3.5 py-2.5 rounded-xs text-xs sm:text-sm focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="client-notes">
                    SPECIAL REQUESTS, SCARRING OR SKIN CONCERNS
                  </label>
                  <textarea
                    id="client-notes"
                    name="notes"
                    rows={2}
                    value={clientInfo.notes}
                    onChange={handleInputChange}
                    placeholder="Share any brow history, skin sensitivities, or styling preferences with Leticia..."
                    className="w-full bg-cream border border-cream-dark focus:border-sage px-3.5 py-2.5 rounded-xs text-xs sm:text-sm focus:outline-hidden"
                  />
                </div>

                {/* Policies consents checkboxes */}
                <div className="bg-[#FAF7F2] p-5 rounded-xs border border-cream-dark/60 space-y-4 text-xs sm:text-sm">
                  <span className="block font-serif font-semibold text-charcoal uppercase tracking-wider text-[11px] border-b border-cream-dark/60 pb-2">Mandatory Booking Consents</span>
                  
                  <div className="space-y-3.5">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        id="agreePolicies-chk"
                        type="checkbox"
                        name="agreePolicies"
                        checked={clientInfo.agreePolicies}
                        onChange={handleInputChange}
                        className="mt-0.5 w-4 h-4 rounded-xs border border-charcoal accent-rose shrink-0"
                      />
                      <span className="text-charcoal-light font-light leading-snug">
                        I agree to The Manor's <span className="font-semibold text-charcoal">A$20 non-refundable deposit policy</span>. I understand this deposit applies toward my treatment, and that cancelling within 24 hours or failing to attend will result in forfeiture.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        id="agreeSolo-chk"
                        type="checkbox"
                        name="agreeSolo"
                        checked={clientInfo.agreeSolo}
                        onChange={handleInputChange}
                        className="mt-0.5 w-4 h-4 rounded-xs border border-charcoal accent-rose shrink-0"
                      />
                      <span className="text-charcoal-light font-light leading-snug">
                        I agree to The Manor's <span className="font-semibold text-charcoal">Arrive Alone policy</span>. I understand this is a private, professional treatment space and cannot accommodate guests, children, or animals.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        id="agreePreCare-chk"
                        type="checkbox"
                        name="agreePreCare"
                        checked={clientInfo.agreePreCare}
                        onChange={handleInputChange}
                        className="mt-0.5 w-4 h-4 rounded-xs border border-charcoal accent-rose shrink-0"
                      />
                      <span className="text-charcoal-light font-light leading-snug">
                        I confirm that I have read and agree to follow all <span className="font-semibold text-charcoal">Pre-Care Guidelines</span> (no makeup on brow area, retinol and tanner pauses, etc.) for my safety.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="confirm-reservation-booking-btn"
                    type="submit"
                    disabled={!isFormValid()}
                    className={`w-full py-4 rounded-xs font-sans text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 shadow-md ${
                      isFormValid() 
                        ? 'bg-rose hover:bg-blush-dark text-cream cursor-pointer' 
                        : 'bg-cream-dark text-charcoal-light/45 cursor-not-allowed border border-cream-dark'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Submit Booking Request</span>
                  </button>
                  {!isFormValid() && (
                    <p className="text-[10px] text-center text-red-700/80 mt-2 italic font-light font-sans">
                      * Please complete all contact fields and tick all three mandatory booking consents to unlock the reservation button.
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* Navigation buttons */}
            {!bookingConfirmed && (
              <div className="flex justify-between items-center pt-8 border-t border-cream-dark/60 mt-10">
                {step > 1 ? (
                  <button
                    id="wizard-back-btn"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-transparent hover:bg-cream border border-charcoal/30 hover:border-charcoal text-charcoal text-xs uppercase tracking-wider font-semibold rounded-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    id="wizard-continue-btn"
                    onClick={handleNextStep}
                    disabled={step === 1 && !selectedCore}
                    className={`px-6 py-2.5 rounded-xs text-xs uppercase tracking-wider font-semibold shadow-xs transition-all flex items-center gap-1 ${
                      step === 1 && !selectedCore 
                        ? 'bg-cream-dark text-charcoal-light/45 cursor-not-allowed' 
                        : 'bg-rose hover:bg-blush-dark text-cream cursor-pointer'
                    }`}
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            )}

          </div>
        )}

        {/* Live Bill Tally Sidebar / Summary Panel */}
        {!bookingConfirmed && selectedCore && (
          <div className="mt-8 bg-[#FAF7F2] p-5 rounded-sm border border-cream-dark/80 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#CFA39F] tracking-widest block">Live Treatment Tally</span>
              <p className="text-sm font-light text-charcoal-light">
                <span className="font-semibold text-charcoal">{selectedCore.name}</span>
                {selectedAddons.length > 0 && ` + ${selectedAddons.map(a => a.name).join(', ')}`}
              </p>
            </div>
            <div className="sm:text-right text-xs sm:text-sm font-sans space-y-1">
              <div className="flex sm:justify-end justify-between gap-5 font-light">
                <span>Subtotal Value:</span>
                <span className="font-semibold text-charcoal">A${totalCost}</span>
              </div>
              <div className="flex sm:justify-end justify-between gap-5 font-semibold text-md text-sage">
                <span>Deposit Required Today:</span>
                <span>A$20.00</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT FALLBACK SECTION */}
        <div className="mt-16 text-center border-t border-cream-dark/50 pt-12 space-y-4">
          <p className="text-xs sm:text-sm text-charcoal-light font-medium">
            Questions before booking? DM me on{' '}
            <a 
              href="https://www.instagram.com/thebrowmanorr/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline text-rose hover:text-rose-dark"
            >
              Instagram
            </a>{' '}
            <a 
              href="https://www.instagram.com/thebrowmanorr/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-rose hover:text-rose-dark"
            >
              @thebrowmanorr
            </a>
          </p>
          <p className="text-xs text-charcoal-light pt-2">
            Experiencing booking failures? Prefer booking directly with Leticia?
          </p>
          <div className="flex justify-center flex-wrap gap-6 text-xs font-semibold text-sage">
            <a href="tel:+61416423758" className="flex items-center gap-1.5 hover:underline">
              <Phone className="w-4 h-4" />
              <span>+61 416 423 758</span>
            </a>
            <a href="mailto:leticiaeast04@gmail.com" className="flex items-center gap-1.5 hover:underline break-all">
              <Mail className="w-4 h-4" />
              <span>leticiaeast04@gmail.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
