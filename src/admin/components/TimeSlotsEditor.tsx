import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DraggableList from './DraggableList';
import ConfirmDelete from './ConfirmDelete';
import { GripVertical, Plus, AlertCircle, RefreshCw, Clock } from 'lucide-react';

const DEFAULT_TIME_SLOTS = [
  '9:00 am', '10:00 am', '11:15 am', '12:30 pm',
  '1:45 pm', '3:00 pm', '4:15 pm', '5:30 pm'
];

export default function TimeSlotsEditor() {
  const [timeSlots, setTimeSlots] = useState<string[]>(DEFAULT_TIME_SLOTS);
  const [loading, setLoading] = useState(true);
  const [newTime, setNewTime] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    // Read config doc containing timeSlots
    const configDocRef = doc(db, 'availabilitySettings', 'config');
    const unsub = onSnapshot(
      configDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.timeSlots)) {
            setTimeSlots(data.timeSlots);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error('onSnapshot failed in TimeSlotsEditor:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const convertTo12HourVal = (time24: string): string => {
    if (!time24) return '';
    const parts = time24.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newTime) {
      setErrorMsg('Please select a valid time.');
      return;
    }

    const formattedTime = convertTo12HourVal(newTime);
    if (!formattedTime) return;

    // Duplication validation
    if (timeSlots.map(t => t.trim().toLowerCase()).includes(formattedTime.trim().toLowerCase())) {
      setErrorMsg('This time slot already exists.');
      return;
    }

    setSaveStatus('saving');
    const updatedSlots = [...timeSlots, formattedTime];
    try {
      await setDoc(doc(db, 'availabilitySettings', 'config'), {
        timeSlots: updatedSlots
      }, { merge: true });
      
      setNewTime('');
      setSaveStatus('saved');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to add slot to Firestore.');
    } finally {
      setSaveStatus('idle');
    }
  };

  const handleDeleteSlot = async (slotToDelete: string) => {
    setErrorMsg(null);
    if (timeSlots.length <= 1) {
      setErrorMsg('You must preserve at least one active timeslot for bookings.');
      return;
    }

    setSaveStatus('saving');
    const updatedSlots = timeSlots.filter(t => t !== slotToDelete);
    try {
      await setDoc(doc(db, 'availabilitySettings', 'config'), {
        timeSlots: updatedSlots
      }, { merge: true });
      setSaveStatus('saved');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to delete time slot.');
    } finally {
      setSaveStatus('idle');
    }
  };

  const handleReorder = async (reorderedItems: string[]) => {
    setSaveStatus('saving');
    try {
      await setDoc(doc(db, 'availabilitySettings', 'config'), {
        timeSlots: reorderedItems
      }, { merge: true });
      setSaveStatus('saved');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to persist rearranged slot list.');
    } finally {
      setSaveStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-cream-dark/50 rounded-xs p-6 flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 text-sage animate-spin mr-2" />
        <span className="text-sm font-sans font-light text-charcoal-light">Loading available time slots...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-cream-dark/50 rounded-xs p-6 space-y-6 shadow-3xs">
      
      {/* SECTION HEADER */}
      <div className="flex justify-between items-center bg-white">
        <div>
          <h3 className="font-serif text-lg text-charcoal font-normal">Schedules & Time Slots</h3>
          <p className="text-xs text-charcoal-light/80 font-light mt-0.5">
            Arrange appointments order. Drag cards to sort chronological hours displayed to the client.
          </p>
        </div>
        {saveStatus === 'saving' && (
          <span className="text-xs font-sans text-charcoal-light/60 flex items-center gap-1.5 font-medium leading-none">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sage" />
            <span>Syncing list...</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose/5 border border-rose/10 text-rose rounded-xs text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* DRAG-AND-DROP DRAGGABLE LIST OF TIMES */}
      <div className="max-w-xl space-y-4">
        
        <DraggableList<string>
          items={timeSlots}
          onReorder={handleReorder}
          renderItem={(item, index, dragProps) => (
            <div
              {...dragProps}
              className="bg-cream-light/20 hover:bg-cream-light/35 border border-cream-dark/50 hover:border-cream-dark p-3 px-4 rounded-xs flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 select-none">
                <div className="cursor-grab active:cursor-grabbing text-charcoal-light/35 hover:text-charcoal-light mr-1">
                  <GripVertical className="w-4 h-4" />
                </div>
                <Clock className="w-4 h-4 text-rose/30 shrink-0" />
                <span className="font-sans font-semibold text-charcoal tracking-wide text-xs uppercase">
                  {item}
                </span>
                <span className="text-[10px] font-sans text-charcoal-light/60 font-light italic ml-2">
                  (Slot #{index + 1})
                </span>
              </div>

              {/* Confirm Delete widget */}
              <div className="shrink-0">
                {timeSlots.length > 1 ? (
                  <ConfirmDelete
                    title=""
                    onDelete={() => handleDeleteSlot(item)}
                    className="p-1 px-2 border-rose-dark/20 text-rose/85 hover:bg-rose/10 bg-white"
                  />
                ) : (
                  <span className="text-[10px] text-charcoal-light/40 italic">Cannot remove</span>
                )}
              </div>
            </div>
          )}
        />

        {/* INLINE FORM ADD SLOT */}
        <form onSubmit={handleAddField} className="flex gap-2 pt-2 items-center max-w-sm">
          <div className="relative flex-1">
            <input
              type="time"
              required
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 border border-cream-dark rounded-xs bg-cream-light/10 text-xs font-sans text-charcoal focus:border-sage focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-sage hover:bg-sage-dark text-cream text-xs uppercase tracking-wider font-bold rounded-xs cursor-pointer select-none transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </form>

      </div>

    </div>
  );
}
