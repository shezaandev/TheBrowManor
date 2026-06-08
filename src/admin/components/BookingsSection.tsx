/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Calendar, Clock, Phone, Mail, Sparkles, Check, X, 
  AlertCircle, RefreshCw, Trash2, CheckCircle2, AlertTriangle, 
  Settings, CalendarDays, ExternalLink, HelpCircle
} from 'lucide-react';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  addons?: string;
  date: string;
  startTime: string;
  duration: string;
  totalDuration?: number;
  totalPrice: number;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  calendarSyncStatus: 'synced' | 'pending' | 'failed';
  googleCalendarEventId: string;
  createdAt: any;
}

export default function BookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{ 
    status: string; 
    calendarId: string; 
    appUrl: string;
    apiNeedsEnablement?: boolean;
    apiEnablementUrl?: string;
    apiStatusMessage?: string;
  } | null>(null);
  const [syncingNow, setSyncingNow] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled' | 'sync_failed'>('all');

  useEffect(() => {
    // 1. Load sync status from the backend Diagnostic API
    fetch('/api/sync-status')
      .then(res => res.json())
      .then(data => setSyncStatus(data))
      .catch(err => console.error('Error fetching sync status:', err));

    // 2. Real-time subscription to the bookings collection
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          ...data,
          status: data.status || 'confirmed',
          calendarSyncStatus: data.calendarSyncStatus || 'pending',
          googleCalendarEventId: data.googleCalendarEventId || '',
        } as Booking);
      });
      setBookings(list);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const triggerForceSync = async () => {
    setSyncingNow(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/sync-calendar', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Sync complete! Block events updated successfully.');
      } else {
        setStatusMessage(`Sync error: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`Network error during sync: ${e.message}`);
    } finally {
      setSyncingNow(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const retryBookingSync = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        calendarSyncStatus: 'pending',
        // Clear previous event ID to force a fresh creation attempt
        googleCalendarEventId: ''
      });
    } catch (e: any) {
      console.error('Error retrying booking sync:', e);
    }
  };

  const handleCancelBooking = async (bookingId: string, googleCalendarEventId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will remove the event from Google Calendar and notify the systems.')) {
      return;
    }
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        calendarSyncStatus: 'pending' // Let the server delete of the event trigger automatically
      });
    } catch (e: any) {
      console.error('Error cancelling booking:', e);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking entirely from the database? (Note: If it was synced, deletion will also automatically trigger deletion on Google Calendar).')) {
      return;
    }
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await deleteDoc(bookingRef);
    } catch (e: any) {
      console.error('Error deleting booking:', e);
    }
  };

  // Filter lists
  const filteredBookings = bookings.filter(b => {
    if (filter === 'active') return b.status === 'confirmed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    if (filter === 'sync_failed') return b.calendarSyncStatus === 'failed';
    return true;
  });

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return dateObj.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* 1. HEADER SECTION & DIAGNOSTIC CONFIG */}
      <div className="bg-white rounded-xl border border-cream-dark/20 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sage/10 rounded-lg text-sage">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h2 className="serif text-xl sm:text-2xl text-charcoal font-semibold">Bookings & Sync Manager</h2>
            </div>
            <p className="text-xs text-charcoal/60 max-w-2xl leading-relaxed">
              Track and manage client bookings in real-time. Confirmed website bookings are automatically pushed onto your Google Calendar.
              Additionally, any blocks or general events created directly on your Google Calendar will synchronize automatically onto this booking site.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 self-start lg:self-center">
            <button
              onClick={triggerForceSync}
              disabled={syncingNow}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage-dark disabled:bg-sage/40 text-white font-medium text-xs font-sans rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer duration-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingNow ? 'animate-spin' : ''}`} />
              <span>{syncingNow ? 'Syncing...' : 'Sync Calendar Blocks'}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Status banner */}
        <div className="mt-6 pt-6 border-t border-cream-dark/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-charcoal/70 uppercase tracking-wider text-[10px]">Google Auth Status:</span>
              {syncStatus?.status === 'active' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Setup Required
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-charcoal/70 uppercase tracking-wider text-[10px]">Active Calendar:</span>
              <span className="font-mono text-charcoal/60 bg-cream/35 px-2 py-0.5 rounded border border-cream-dark/15 text-[11px]">
                {syncStatus?.calendarId || 'primary'}
              </span>
            </div>
          </div>
          
          {statusMessage && (
            <div className="px-4 py-1.5 bg-sage/10 text-sage border border-sage/20 rounded-md font-medium text-xs animate-fade-in">
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* 1b. CALENDAR API ENABLEMENT CRITICAL NOTICE BLOCK */}
      {syncStatus?.apiNeedsEnablement && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 sm:p-6 animate-fade-in text-charcoal shadow-3xs space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 rounded-lg text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-sm sm:text-md text-amber-900 font-sans">
                Google Calendar API is not activated
              </h3>
              <p className="text-xs text-amber-800/80 leading-relaxed max-w-3xl">
                Confirmed web bookings cannot be automatically synced or updated because the **Google Calendar API** is not enabled in your Google Cloud platform project. 
                Please enable it to complete the two-way integration pipeline.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 pt-1 pl-12">
            <a
              href={syncStatus.apiEnablementUrl || 'https://console.developers.google.com/apis/library/calendar-json.googleapis.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all duration-200"
            >
              <span>Enable Google Calendar API</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            
            <button
              onClick={triggerForceSync}
              disabled={syncingNow}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold text-xs rounded-lg transition-all duration-200 cursor-pointer"
            >
              {syncingNow ? 'Verifying...' : 'Verify & Retry Now'}
            </button>
          </div>
        </div>
      )}

      {/* 2. FILTER NAV BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-dark/20 pb-4">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-cream-dark/15 shadow-3xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium font-sans tracking-wide transition-all cursor-pointer ${
              filter === 'all' ? 'bg-sage text-white shadow-3xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium font-sans tracking-wide transition-all cursor-pointer ${
              filter === 'active' ? 'bg-sage text-white shadow-3xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium font-sans tracking-wide transition-all cursor-pointer ${
              filter === 'cancelled' ? 'bg-sage text-white shadow-3xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('sync_failed')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium font-sans tracking-wide transition-all cursor-pointer ${
              filter === 'sync_failed' ? 'bg-rose-500 text-white shadow-3xs' : 'text-charcoal/60 hover:text-charcoal-light'
            }`}
          >
            Failed Syncs ({bookings.filter(b => b.calendarSyncStatus === 'failed').length})
          </button>
        </div>
      </div>

      {/* 3. BOOKINGS CARDS / TABLE GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm font-sans font-medium text-charcoal/50 bg-white rounded-xl border border-cream-dark/15">
          <RefreshCw className="w-8 h-8 text-sage animate-spin" />
          <span>Refreshing appointment lists...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-cream-dark/15 p-6 space-y-3">
          <Calendar className="w-10 h-10 text-cream-dark" />
          <h3 className="serif text-md font-semibold text-charcoal">No bookings match the filter</h3>
          <p className="text-xs text-charcoal/50 max-w-sm font-sans">
            There are currently no matching booking records logged in the database. When users select a slot, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredBookings.map((b) => {
            const isCancelled = b.status === 'cancelled';
            return (
              <div 
                key={b.id} 
                className={`bg-white rounded-xl border ${
                  isCancelled ? 'border-cream-dark/20 opacity-70 bg-cream/10' : 'border-cream-dark/20 hover:border-sage/40 hover:shadow-xs'
                } p-5 sm:p-6 transition-all duration-300 relative flex flex-col justify-between`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-cream-dark/15 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="serif text-md font-semibold text-charcoal">{b.clientName}</span>
                        {isCancelled ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded-xs rounded">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider rounded-xs rounded">
                            Confirmed
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-charcoal-light/60 mt-1 block">ID: {b.id.slice(0, 8)}...</span>
                    </div>
                    
                    {/* Sync Status Badge */}
                    <div className="text-right">
                      {b.calendarSyncStatus === 'synced' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider">
                          <Check className="w-2.5 h-2.5" /> Synced
                        </span>
                      ) : b.calendarSyncStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-150 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Pending
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle className="w-2.5 h-2.5" /> Sync Failed
                          </span>
                          {!isCancelled && (
                            <button
                              onClick={() => retryBookingSync(b.id)}
                              className="text-[10px] font-sans font-bold text-sage hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-2.5 h-2.5" /> Retry Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking content details */}
                  <div className="space-y-3.5 mb-6 text-xs text-charcoal/80">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-rose shrink-0" />
                      <div>
                        <span className="font-semibold">{b.serviceName}</span>
                        {b.addons && b.addons !== 'None' && (
                          <span className="text-charcoal-light block text-[11px] mt-0.5">Addons: {b.addons}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-cream/15 p-3 rounded-lg border border-cream-dark/10">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sage shrink-0" />
                        <span className="font-medium truncate">{formatDate(b.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sage shrink-0" />
                        <span className="font-medium">{b.startTime} <span className="text-[10px] text-charcoal-light">({b.duration})</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <a href={`tel:${b.clientPhone}`} className="flex items-center gap-2 hover:text-sage hover:underline">
                        <Phone className="w-3.5 h-3.5 text-charcoal/40" />
                        <span>{b.clientPhone}</span>
                      </a>
                      <a href={`mailto:${b.clientEmail}`} className="flex items-center gap-2 hover:text-sage hover:underline truncate">
                        <Mail className="w-3.5 h-3.5 text-charcoal/40" />
                        <span className="truncate">{b.clientEmail}</span>
                      </a>
                    </div>

                    {b.notes && b.notes !== 'None' && (
                      <div className="bg-cream-dark/10 p-3 rounded-lg border-l-2 border-cream-dark mt-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/40 block mb-1">Client Notes:</span>
                        <p className="font-serif italic text-charcoal-light leading-relaxed">{b.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer / Actions panel */}
                <div className="border-t border-cream-dark/15 pt-4 mt-auto flex items-center justify-between gap-3 text-xs bg-cream/5 -mx-5 -mb-5 p-4 rounded-b-xl border-t bg-white">
                  <span className="font-sans font-bold text-sage">Total Cost: A${b.totalPrice}</span>
                  
                  <div className="flex items-center gap-2">
                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(b.id, b.googleCalendarEventId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-red-750 font-medium tracking-wide bg-red-50 hover:bg-red-100 border border-rose-200 rounded-md transition-all cursor-pointer text-[11px]"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBooking(b.id)}
                      className="p-2 text-charcoal/40 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-transparent rounded-md transition-all cursor-pointer"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
