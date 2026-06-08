/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, getDoc, getDocs, setDoc, 
  updateDoc, deleteDoc, onSnapshot, query, where 
} from 'firebase/firestore';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse json bodies
app.use(express.json());

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

let db: any;
try {
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
  console.log('Firebase initialized successfully in server backend.');
} catch (error) {
  console.error('Error initializing Firebase on server:', error);
}

// Initialize Google Calendar Client
let oauth2Client: any = null;
let calendar: any = null;

// Self-diagnostic state for API enablement
let calendarApiNeedsEnablement = false;
let calendarApiEnablementUrl = '';
let calendarApiStatusMessage = '';

function extractErrorMessage(error: any): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  
  let msg = error.message || '';
  if (error.response?.data?.error?.message) {
    msg += ' ' + error.response.data.error.message;
  }
  if (Array.isArray(error.errors)) {
    msg += ' ' + error.errors.map((e: any) => e.message).join(' ');
  }
  return msg;
}

function handleCalendarError(error: any, context: string) {
  const errMsg = extractErrorMessage(error);
  console.error(`[${context}] Google Calendar Error:`, errMsg);
  
  if (
    errMsg.includes('Google Calendar API has not been used') || 
    errMsg.includes('disabled') || 
    errMsg.includes('accessNotConfigured') ||
    errMsg.includes('not been used in project')
  ) {
    calendarApiNeedsEnablement = true;
    calendarApiStatusMessage = 'Google Calendar API has not been activated in your Google Cloud Project yet.';
    
    // Extract the console enablement link if available
    const urlMatch = errMsg.match(/https:\/\/console\.developers\.google\.com\/[^\s\)"]*/);
    if (urlMatch) {
      calendarApiEnablementUrl = urlMatch[0];
    } else {
      calendarApiEnablementUrl = 'https://console.developers.google.com/apis/library/calendar-json.googleapis.com';
    }
    console.log(`[Diagnostic Info] Determined that Google Calendar API must be enabled. URL: ${calendarApiEnablementUrl}`);
  } else {
    calendarApiStatusMessage = errMsg || 'Unknown Calendar API error.';
  }
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  try {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    console.log('Google Calendar client successfully initialized.');
  } catch (err) {
    console.error('Error initializing Google Calendar client:', err);
  }
} else {
  console.warn('Google OAuth environment variables are missing. Calendar integration is in setup mode.');
}

// ----------------------------------------------------
// TIME & DURATION UTILS
// ----------------------------------------------------

function parseTimeToMinutes(timeStr: string): number {
  // Convert standard studio time slot like "9:00 am" or "12:30 pm" to minutes since midnight
  const match = timeStr.trim().toLowerCase().match(/^(\d+):?(\d+)?\s*(am|pm)$/);
  if (!match) return 9 * 60; // fallback: 9:00 AM
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];
  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function parseDurationToMinutes(durationStr: string): number {
  // Convert strings like "45 min" or "1 hr 15 min" or "60 mins" to minutes
  let minutes = 0;
  const hrMatch = durationStr.match(/(\d+)\s*(hr|hour)/i);
  const minMatch = durationStr.match(/(\d+)\s*(min)/i);
  if (hrMatch) minutes += parseInt(hrMatch[1], 10) * 60;
  if (minMatch) minutes += parseInt(minMatch[1], 10);
  if (!hrMatch && !minMatch) {
    const justNum = durationStr.match(/^(\d+)$/);
    if (justNum) minutes = parseInt(justNum[1], 10);
    else minutes = 45; // default fallback
  }
  return minutes;
}

function getBrisbaneTodayStr(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Australia/Brisbane',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const part of parts) {
    map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day}`;
}

function formatToBrisbaneISO(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Australia/Brisbane',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    map[part.type] = part.value;
  }
  
  let hour = map.hour;
  if (hour === '24') {
    hour = '00';
  }
  
  return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}:${map.second}+10:00`;
}

function combineDateAndTime(dateStr: string, timeStr: string): string {
  // Combines YYYY-MM-DD and "9:00 am" in Brisbane timezone (UTC+10) format
  if (!dateStr) {
    dateStr = getBrisbaneTodayStr();
  }
  
  if (!timeStr) {
    timeStr = '9:00 am';
  }

  const cleanTime = String(timeStr).trim().toLowerCase();
  
  // Try 12-hour AM/PM first
  const timeMatch = cleanTime.match(/^(\d+):?(\d+)?\s*(am|pm)$/);
  let hours = 9;
  let minutes = 0;
  
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
  } else {
    // Try 24-hour HH:MM format
    const time24Match = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
    if (time24Match) {
      hours = parseInt(time24Match[1], 10);
      minutes = parseInt(time24Match[2], 10);
    }
  }
  
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  
  return `${dateStr}T${paddedHours}:${paddedMinutes}:00+10:00`;
}

function addMinutesToISO(isoStr: string, minutesToAdd: number): string {
  const dateObj = new Date(isoStr);
  if (isNaN(dateObj.getTime())) {
    const fallback = new Date();
    const endMs = fallback.getTime() + minutesToAdd * 60 * 1000;
    return formatToBrisbaneISO(new Date(endMs));
  }
  
  const endMs = dateObj.getTime() + minutesToAdd * 60 * 1000;
  return formatToBrisbaneISO(new Date(endMs));
}

function isSlotOverlapping(slotStr: string, eventStart: moment.Moment, eventEnd: moment.Moment): boolean {
  const brisbaneIso = eventStart.clone().tz('Australia/Brisbane').format();
  const datePart = brisbaneIso.slice(0, 10);
  
  const slotIsoStr = combineDateAndTime(datePart, slotStr);
  const slotMom = moment.tz(slotIsoStr, 'Australia/Brisbane');
  
  return slotMom.isSameOrAfter(eventStart) && slotMom.isBefore(eventEnd);
}

// ----------------------------------------------------
// SYNC LOGIC: GOOGLE CALENDAR TO FIRESTORE BLOCKS
// ----------------------------------------------------

async function getMasterTimeSlots(): Promise<string[]> {
  const defaultSlots = [
    '9:00 am', '10:00 am', '11:15 am', '12:30 pm', 
    '1:45 pm', '3:00 pm', '4:15 pm', '5:30 pm'
  ];
  if (!db) return defaultSlots;
  try {
    const docRef = doc(db, 'availabilitySettings', 'config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.timeSlots && Array.isArray(data.timeSlots) && data.timeSlots.length > 0) {
        return data.timeSlots.map(s => String(s));
      }
    }
  } catch (error) {
    console.error('Error fetching master time slots:', error);
  }
  return defaultSlots;
}

async function rebuildBlockedSlotsForDate(dateKey: string) {
  if (!db || !calendar) return;
  try {
    const startOfDay = new Date(`${dateKey}T00:00:00+10:00`).toISOString();
    const endOfDay = new Date(`${dateKey}T23:59:59+10:00`).toISOString();
    
    const res = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
      timeZone: 'Australia/Brisbane',
    });
    
    const events = res.data.items || [];
    
    // Fetch all confirmed bookings across ALL of Firestore
    const bookingsSnap = await getDocs(
      query(
        collection(db, 'bookings'),
        where('status', '==', 'confirmed')
      )
    );
    
    const confirmedSlotsOnDate: string[] = [];
    const bookingReasons: string[] = [];
    
    bookingsSnap.forEach((bDoc) => {
      const bObj = bDoc.data();
      const bDate = bObj.date || bObj.selectedDate || bObj.appointmentDate;
      if (bDate === dateKey) {
        const bSlot = bObj.startTime || bObj.time || bObj.slot || bObj.appointmentTime || bObj.selectedTime;
        if (bSlot) {
          confirmedSlotsOnDate.push(bSlot);
          const cName = bObj.clientName || bObj.customerName || 'Client';
          const sName = bObj.serviceName || bObj.coreName || 'Service';
          bookingReasons.push(`Booked — ${cName} (${sName})`);
        }
      }
    });

    const masterSlots = await getMasterTimeSlots();
    
    let isFullDayBlocked = false;
    let primaryManualBlockId = '';
    const googleCalendarEventIdsList: string[] = [];
    const manualSlotsSet = new Set<string>();
    const calendarReasons: string[] = [];
    
    for (const event of events) {
      const isBooking = !!event.summary?.includes(' — ');
      if (!isBooking) {
        googleCalendarEventIdsList.push(event.id!);
        if (!primaryManualBlockId) {
          primaryManualBlockId = event.id!;
        }
        
        const summary = event.summary || 'Blocked from Google Calendar';
        calendarReasons.push(summary);
        
        if (event.start?.date) {
          isFullDayBlocked = true;
        } else if (event.start?.dateTime) {
          const startMom = moment.tz(event.start.dateTime, 'Australia/Brisbane');
          const endMom = moment.tz(event.end!.dateTime!, 'Australia/Brisbane');
          
          for (const slot of masterSlots) {
            if (isSlotOverlapping(slot, startMom, endMom)) {
              manualSlotsSet.add(slot);
            }
          }
        }
      }
    }
    
    const blockedDocRef = doc(db, 'blockedDates', dateKey);
    const mergedSlotsSet = new Set<string>([
      ...confirmedSlotsOnDate,
      ...Array.from(manualSlotsSet)
    ]);
    const mergedSlots = Array.from(mergedSlotsSet);
    
    const allReasons = [...bookingReasons, ...calendarReasons];
    const combinedReason = allReasons.length > 0 ? allReasons.join('; ') : 'Blocked';
    
    if (isFullDayBlocked) {
      await setDoc(blockedDocRef, {
        date: dateKey,
        reason: combinedReason,
        blockedSlots: [],
        source: primaryManualBlockId ? 'google_calendar' : null,
        googleCalendarEventId: primaryManualBlockId || null,
        googleCalendarEventIds: googleCalendarEventIdsList,
        createdAt: new Date().toISOString()
      });
      console.log(`[Diagnostic] Fully blocked ${dateKey} in Firestore. Reason: ${combinedReason}`);
    } else if (mergedSlots.length > 0) {
      await setDoc(blockedDocRef, {
        date: dateKey,
        reason: combinedReason,
        blockedSlots: mergedSlots,
        source: primaryManualBlockId ? 'google_calendar' : null,
        googleCalendarEventId: primaryManualBlockId || null,
        googleCalendarEventIds: googleCalendarEventIdsList,
        createdAt: new Date().toISOString()
      });
      console.log(`[Diagnostic] Blocked slots: ${mergedSlots.join(', ')} for date ${dateKey}. Reason: ${combinedReason}`);
    } else {
      await deleteDoc(blockedDocRef);
      console.log(`[Diagnostic] Cleared all blocks for date ${dateKey} in Firestore.`);
    }
  } catch (error) {
    handleCalendarError(error, `rebuildBlockedSlotsForDate for ${dateKey}`);
  }
}

async function syncGoogleCalendarToFirestore() {
  if (!db || !calendar) return;
  try {
    const syncDocRef = doc(db, 'availabilitySettings', 'syncInfo');
    const syncDoc = await getDoc(syncDocRef);
    let lastSyncTime = syncDoc.exists() ? syncDoc.data().lastSyncTime : null;
    
    const updatedMin = lastSyncTime || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    
    const res = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      updatedMin: updatedMin,
      showDeleted: true,
      singleEvents: true,
      timeZone: 'Australia/Brisbane',
    });
    
    const events = res.data.items || [];
    console.log(`Synchronizing ${events.length} changed events from Google Calendar.`);
    
    const datesToRebuild = new Set<string>();
    
    // Find active bookings
    const activeBookingEventIds = new Set<string>();
    const bookingsSnap = await getDocs(collection(db, 'bookings'));
    bookingsSnap.forEach(b => {
      const data = b.data();
      if (data.googleCalendarEventId) {
        activeBookingEventIds.add(data.googleCalendarEventId);
      }
    });
    
    for (const event of events) {
      if (activeBookingEventIds.has(event.id!)) {
        continue; // skip our bookings
      }
      
      let dateKey = '';
      if (event.start?.date) {
        dateKey = event.start.date;
      } else if (event.start?.dateTime) {
        const startMom = moment.tz(event.start.dateTime, 'Australia/Brisbane');
        dateKey = startMom.format('YYYY-MM-DD');
      }
      
      // Always scan blockedDates to find if this event was previously registered on any date
      try {
        const blockedDatesSnap = await getDocs(collection(db, 'blockedDates'));
        blockedDatesSnap.forEach(dDoc => {
          const dData = dDoc.data();
          const idList = dData.googleCalendarEventIds || [];
          if (dData.googleCalendarEventId === event.id || idList.includes(event.id)) {
            datesToRebuild.add(dDoc.id);
          }
        });
      } catch (scanErr) {
        console.error('[Sync Engine] Error scanning blockedDates for matching event ID:', scanErr);
      }
      
      if (dateKey && event.status !== 'cancelled' && event.status !== 'deleted') {
        datesToRebuild.add(dateKey);
      }
    }
    
    for (const dateKey of datesToRebuild) {
      await rebuildBlockedSlotsForDate(dateKey);
    }
    
    await setDoc(syncDocRef, { lastSyncTime: new Date().toISOString() }, { merge: true });
    console.log('Google Calendar sync completed successfully.');
  } catch (error) {
    handleCalendarError(error, 'syncGoogleCalendarToFirestore');
  }
}

// ----------------------------------------------------
// GOOGLE CALENDAR ACTIONS: WEB CREATED BOOKINGS
// ----------------------------------------------------

async function createGoogleCalendarEvent(bookingId: string, booking: any) {
  if (!db || !calendar) return;
  
  // 1. Log the full booking document passed in for clear end-to-end debugging
  console.log(`[Google Calendar Sync Engine] Processing booking ID: ${bookingId}. Full payload:`, JSON.stringify(booking, null, 2));

  try {
    // 2. Resolve booking date using multiple possible stored field keys (for backwards compatibility/variant schemas)
    const resolvedDate = booking.date || booking.selectedDate || booking.appointmentDate;
    
    // 3. Resolve booking start time using multiple possible stored field keys
    const resolvedStartTime = booking.startTime || booking.time || booking.slot || booking.appointmentTime || booking.selectedTime;

    // 4. Validate existence of date & start time before requesting the Google Calendar API
    if (!resolvedDate || !resolvedStartTime) {
      const errorMsg = `Sync skipped: Missing either date (${resolvedDate}) or start time (${resolvedStartTime}). Ensure these values are defined on the booking document.`;
      console.warn(`[Google Calendar Sync Engine] ${errorMsg}`);
      
      const bookingDocRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingDocRef, {
        calendarSyncStatus: 'failed',
        syncNotes: errorMsg
      });
      return;
    }

    // 5. Calculate combined event duration in minutes
    const durationMin = booking.totalDuration 
      ? Number(booking.totalDuration) 
      : parseDurationToMinutes(booking.duration || '45 min');
      
    // 6. Formulate precise start and end ISO strings with UTC+10 (Brisbane) offset
    const startISO = combineDateAndTime(resolvedDate, resolvedStartTime);
    const endISO = addMinutesToISO(startISO, durationMin);
    
    console.log(`[Google Calendar Sync Engine] Event timings mapped: Start: ${startISO}, Duration: ${durationMin}m, End: ${endISO}`);

    const title = `${booking.serviceName || 'Lash appointment'} — ${booking.clientName || 'Client'}`;
    const description = `Phone: ${booking.clientPhone || 'N/A'}
Email: ${booking.clientEmail || 'N/A'}
Service: ${booking.serviceName || 'N/A'}
Addons: ${booking.addons && booking.addons !== 'None' ? booking.addons : 'None'}
Price: A$${booking.totalPrice || 0}
Notes: ${booking.notes || 'None'}
Internal ID: ${bookingId}
Status: Confirmed`;

    const res = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: startISO,
          timeZone: 'Australia/Brisbane',
        },
        end: {
          dateTime: endISO,
          timeZone: 'Australia/Brisbane',
        },
        colorId: '10', // Sage green = 10
        status: 'confirmed',
      },
    });
    
    const eventId = res.data.id;
    const bookingDocRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingDocRef, {
      googleCalendarEventId: eventId,
      calendarSyncStatus: 'synced',
      syncNotes: 'Successfully synced to Google Calendar'
    });
    console.log(`Synced booking ${bookingId} with calendar event ID: ${eventId}`);
  } catch (error: any) {
    handleCalendarError(error, `createGoogleCalendarEvent for booking ${bookingId}`);
    try {
      const bookingDocRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingDocRef, {
        calendarSyncStatus: 'failed',
        syncNotes: extractErrorMessage(error) || 'Failed to communicate with Google Calendar API.'
      });
    } catch (updateErr) {}
  }
}

async function deleteGoogleCalendarEvent(bookingId: string, eventId: string) {
  if (!db || !calendar) return;
  try {
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: eventId,
    });
    console.log(`Deleted Google Calendar event ${eventId} for booking ${bookingId}`);
    
    try {
      const bookingDocRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingDocRef, {
        googleCalendarEventId: '',
        calendarSyncStatus: 'synced',
      });
    } catch (e) {}
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`Google Calendar event ${eventId} already deleted from calendar.`);
      try {
        const bookingDocRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingDocRef, {
          googleCalendarEventId: '',
          calendarSyncStatus: 'synced',
        });
      } catch (e) {}
    } else {
      handleCalendarError(error, `deleteGoogleCalendarEvent for event ${eventId}`);
    }
  }
}

// ----------------------------------------------------
// SERVICE TRIGGERS & LISTENERS
// ----------------------------------------------------

function startFirestoreBookingListener() {
  if (!db) {
    console.warn('DB not set up. Skipping bookings listener.');
    return;
  }
  
  const bookingsCol = collection(db, 'bookings');
  onSnapshot(bookingsCol, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      const bookingData = change.doc.data();
      const bookingId = change.doc.id;
      
      const resolvedDate = bookingData.date || bookingData.selectedDate || bookingData.appointmentDate;
      if (resolvedDate) {
        console.log(`[Firestore Listener] Booking change detected. Rebuilding blocks for date: ${resolvedDate}`);
        await rebuildBlockedSlotsForDate(resolvedDate);
      }
      
      if (change.type === 'added') {
        if (bookingData.calendarSyncStatus === 'pending' && !bookingData.googleCalendarEventId) {
          console.log(`New pending booking found: ${bookingId}. Syncing...`);
          await createGoogleCalendarEvent(bookingId, bookingData);
        }
      } else if (change.type === 'modified') {
        if (bookingData.status === 'cancelled' && bookingData.googleCalendarEventId && bookingData.calendarSyncStatus !== 'synced') {
          console.log(`Booking ${bookingId} cancelled. Removing event...`);
          await deleteGoogleCalendarEvent(bookingId, bookingData.googleCalendarEventId);
        }
      } else if (change.type === 'removed') {
        if (bookingData.googleCalendarEventId) {
          console.log(`Booking ${change.doc.id} deleted. Removing event...`);
          await deleteGoogleCalendarEvent(change.doc.id, bookingData.googleCalendarEventId);
        }
      }
    }
  }, (error) => {
    console.error('Error in bookings Firestore listener:', error);
  });
}

function startRetryScheduler() {
  // Run retry process every 15 minutes
  setInterval(async () => {
    if (!db) return;
    try {
      console.log('Running scheduled sync retry scheduler (every 15 min)...');
      const bookingsCol = collection(db, 'bookings');
      const q = query(bookingsCol, where('calendarSyncStatus', '==', 'failed'));
      const snap = await getDocs(q);
      
      snap.forEach(async (docSnap) => {
        const bookingId = docSnap.id;
        const bookingData = docSnap.data();
        console.log(`Retrying sync for booking ${bookingId}`);
        await createGoogleCalendarEvent(bookingId, bookingData);
      });
    } catch (err) {
      console.error('Error in retry scheduler:', err);
    }
  }, 15 * 60 * 1000);
}

// ----------------------------------------------------
// WEBHOOK RENEWAL ENGINE (GOOGLE WATCH CALENDAR)
// ----------------------------------------------------

async function registerCalendarWebhook() {
  if (!calendar || !process.env.APP_URL) {
    console.warn('Webhook registration skipped. App URL or Google credentials not ready.');
    return;
  }
  try {
    const channelId = `in-bloom-watch-${Date.now()}`;
    const webhookEndpoint = `${process.env.APP_URL.trim().replace(/\/$/, '')}/api/calendar-webhook`;
    console.log(`Registering watch webhook for: ${webhookEndpoint}`);
    
    const res = await calendar.events.watch({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: webhookEndpoint,
        token: 'SECURE_WATCH_TOKEN_IN_BLOOM',
        expiration: String(Date.now() + 1000 * 60 * 60 * 24 * 7), // Max 7 Days expiration
      },
    });
    
    console.log(`Webhook channels registered successfully. Channel ID: ${res.data.id}, Resource ID: ${res.data.resourceId}`);
  } catch (error) {
    handleCalendarError(error, 'registerCalendarWebhook');
  }
}

function startWebhookRenewalScheduler() {
  // Renew the webhook channel every 6 days (expires every 7 days max)
  setInterval(async () => {
    console.log('Running automatic webhook renewal scheduler...');
    await registerCalendarWebhook();
  }, 6 * 24 * 60 * 60 * 1000);
}

// ----------------------------------------------------
// BACKEND API ENDPOINTS
// ----------------------------------------------------

// Health check and sync status diagnostic route
app.get('/api/sync-status', (req, res) => {
  const isConfigured = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
  
  res.json({
    status: isConfigured ? 'active' : 'not_configured',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary (default)',
    appUrl: process.env.APP_URL || 'not_set',
    apiNeedsEnablement: calendarApiNeedsEnablement,
    apiEnablementUrl: calendarApiEnablementUrl,
    apiStatusMessage: calendarApiStatusMessage
  });
});

// Force calendar synchronization manually
app.post('/api/sync-calendar', async (req, res) => {
  try {
    console.log('User triggered manual calendar sync...');
    await syncGoogleCalendarToFirestore();
    res.json({ success: true, message: 'Sync triggered successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Google Push Notification Webhook Destination
app.post('/api/calendar-webhook', async (req, res) => {
  const token = req.headers['x-goog-channel-token'];
  if (token !== 'SECURE_WATCH_TOKEN_IN_BLOOM') {
    console.warn(`Unauthorized watch token signature: ${token}`);
    return res.status(401).send('Unauthorized Token signature.');
  }

  // Google triggers webhook ping. Respond with 200 immediately
  res.status(200).send('OK Received.');

  const state = req.headers['x-goog-resource-state'];
  console.log(`Received secure calendar push signal. Resource state: ${state}`);
  
  if (state === 'exists' || state === 'sync') {
    await syncGoogleCalendarToFirestore();
  }
});

// Startup routines
function startGoogleCalendarPolling() {
  console.log('[Sync Engine] Starting 60-second Google Calendar polling...');
  setInterval(async () => {
    try {
      console.log('[Sync Engine] 60-second polling: Syncing Google Calendar to Firestore...');
      await syncGoogleCalendarToFirestore();
    } catch (err) {
      console.error('[Sync Engine] Error in 1-minute poller:', err);
    }
  }, 60 * 1000);
}

async function initSyncEngine() {
  if (db) {
    startFirestoreBookingListener();
    startRetryScheduler();
  }
  if (calendar) {
    await registerCalendarWebhook();
    startWebhookRenewalScheduler();
    startGoogleCalendarPolling();
    // Do initial sync on boot to captures offline changes
    await syncGoogleCalendarToFirestore();
  }
}

// Initialize Vite Dev Server or Production Static Bundles
async function startServer() {
  // Initialize endpoints/listeners on launch
  initSyncEngine();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`In Bloom Server running on http://localhost:${PORT}`);
  });
}

startServer();
