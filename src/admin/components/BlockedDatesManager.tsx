import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BlockedDate } from '../../types';
import InlineForm from './InlineForm';
import ConfirmDelete from './ConfirmDelete';
import { Calendar, Plus, Edit2, AlertCircle, RefreshCw, X, Check, Lock, Unlock } from 'lucide-react';

const DEFAULT_TIME_SLOTS = [
  '9:00 am', '10:00 am', '11:15 am', '12:30 pm',
  '1:45 pm', '3:00 pm', '4:15 pm', '5:30 pm'
];

export default function BlockedDatesManager() {
  const [blockedItems, setBlockedItems] = useState<BlockedDate[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>(DEFAULT_TIME_SLOTS);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Accordion form state
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [dateStr, setDateStr] = useState('');
  const [reason, setReason] = useState('');
  const [blockType, setBlockType] = useState<'full' | 'partial'>('full');
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);

  // Calculate today in local YYYY-MM-DD
  const getTodayLocalDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayLocalDateStr();

  // Load time slots and subscribe to blocked dates
  useEffect(() => {
    // 1. Fetch config document for slots
    const loadConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'availabilitySettings', 'config'));
        if (snap.exists() && Array.isArray(snap.data().timeSlots)) {
          setTimeSlots(snap.data().timeSlots);
        }
      } catch (err) {
        console.warn('Could not read time slots for blocked date editor:', err);
      }
    };
    loadConfig();

    // 2. Subscribe to blockedDates real-time
    const q = collection(db, 'blockedDates');
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: BlockedDate[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            date: data.date || doc.id,
            reason: data.reason || '',
            blockedSlots: Array.isArray(data.blockedSlots) ? data.blockedSlots : [],
            createdAt: data.createdAt,
          });
        });

        // Sort by date ascending (using local comparison)
        items.sort((a, b) => a.date.localeCompare(b.date));
        setBlockedItems(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('Subscription error for blockedDates:', err);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const resetForm = () => {
    setDateStr('');
    setReason('');
    setBlockType('full');
    setBlockedSlots([]);
    setFormError(null);
    setEditId(null);
    setIsOpen(false);
  };

  const startAddBlock = () => {
    resetForm();
    setIsOpen(true);
  };

  const startEditBlock = (item: BlockedDate) => {
    setDateStr(item.date);
    setReason(item.reason || '');
    setBlockType(item.blockedSlots.length === 0 ? 'full' : 'partial');
    setBlockedSlots(item.blockedSlots);
    setFormError(null);
    setEditId(item.id);
    setIsOpen(true);
  };

  const handleToggleSlot = (slot: string) => {
    setBlockedSlots((prev) => {
      if (prev.includes(slot)) {
        return prev.filter((s) => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!dateStr) {
      setFormError('Please select a date.');
      return;
    }

    if (blockType === 'partial' && blockedSlots.length === 0) {
      setFormError('Please select at least one time slot to block, or switch to "Entire Day".');
      return;
    }

    // If editId is provided, the primary document key is target date. If editing date, deletes old doc
    const finalDocId = dateStr; // Format is YYYY-MM-DD
    setIsLoading(true);

    try {
      const batch = writeBatch(db);

      // If editing and date changed, delete the old document
      if (editId && editId !== finalDocId) {
        batch.delete(doc(db, 'blockedDates', editId));
      }

      // Set new/updated block definition
      batch.set(doc(db, 'blockedDates', finalDocId), {
        date: dateStr,
        reason: reason.trim(),
        blockedSlots: blockType === 'full' ? [] : blockedSlots,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      resetForm();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error occurred storing blocked date.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blockedDates', id));
    } catch (err: any) {
      console.warn('Failed to delete blocked date document:', err);
    }
  };

  // Human date formatting avoiding TZ issues
  const formatBlockDate = (dateString: string) => {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    return dateString;
  };

  // Partition upcoming vs past blocks
  const upcomingBlocks = blockedItems.filter((b) => b.date >= todayStr);
  const pastBlocks = blockedItems.filter((b) => b.date < todayStr);

  if (isLoading) {
    return (
      <div className="bg-white border border-cream-dark/50 rounded-xs p-6 flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 text-sage animate-spin mr-2" />
        <span className="text-sm font-sans font-light text-charcoal-light">Loading blocked calendar events...</span>
      </div>
    );
  }

  return (
    <section id="blocked-dates-section" className="scroll-mt-24 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg text-charcoal font-normal">Blocked Calendar Dates</h3>
          <p className="text-xs text-charcoal-light/80 font-light mt-0.5">
            Temporarily block full days or selected hourly time slots. Blocked times will hide from clients automatically.
          </p>
        </div>
        {!isOpen && (
          <button
            type="button"
            onClick={startAddBlock}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Block a Date</span>
          </button>
        )}
      </div>

      {/* BLOCK DATE ACTIVE ACCORDION FORM */}
      <InlineForm isOpen={isOpen} onClose={resetForm} title={editId ? `Edit Closed Schedule for ${formatBlockDate(editId)}` : 'Block Studio Date / Slot'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl font-sans text-sm text-charcoal">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DATE INPUT */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-light">Select Date</label>
              <input
                type="date"
                required
                min={todayStr}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-cream-dark rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
              />
            </div>

            {/* OPTIONAL REASON */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-light">Reason (e.g. holiday, event) — Optional</label>
              <input
                type="text"
                placeholder="e.g. Public holiday or Personal day"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-cream-dark rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
              />
            </div>
          </div>

          {/* BLOCK TYPE CHOICE */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-light">Block Level Scope</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBlockType('full')}
                className={`px-4 py-2 border rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  blockType === 'full'
                    ? 'bg-sage border-sage text-cream'
                    : 'bg-cream-light border-cream-dark text-charcoal-light hover:bg-cream'
                }`}
              >
                Entire Day Unavailable
              </button>
              <button
                type="button"
                onClick={() => setBlockType('partial')}
                className={`px-4 py-2 border rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  blockType === 'partial'
                    ? 'bg-sage border-sage text-cream'
                    : 'bg-cream-light border-cream-dark text-charcoal-light hover:bg-cream'
                }`}
              >
                Specific Appointment Slots Only
              </button>
            </div>
          </div>

          {/* SPECIFIC SLOTS CHECKBOX SELECTS */}
          {blockType === 'partial' && (
            <div className="p-4 border border-cream-dark/60 rounded-xs bg-cream-light/10 space-y-3 animate-fade-in">
              <span className="block text-xs font-bold uppercase tracking-wider text-charcoal">Select Slots to Disable</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {timeSlots.map((slot) => {
                  const isChecked = blockedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleToggleSlot(slot)}
                      className={`p-2 border text-center transition-all cursor-pointer rounded-xs text-xs select-none ${
                        isChecked
                          ? 'bg-rose/10 border-rose/40 text-rose font-bold'
                          : 'bg-white border-cream-dark/60 text-charcoal-light hover:border-sage'
                      }`}
                    >
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-rose/5 border border-rose/10 text-rose rounded-xs text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={resetForm}
              className="px-4 py-2 border border-cream-dark/60 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs hover:bg-cream-light cursor-pointer text-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{editId ? 'Update Block' : 'Create Block'}</span>
            </button>
          </div>
        </form>
      </InlineForm>

      {/* ITEMS LIST RENDERING */}
      <div className="space-y-4">
        {blockedItems.length === 0 ? (
          <div className="bg-cream-light/20 border border-dashed border-cream-dark/70 rounded-xs p-8 text-center text-charcoal-light/70 font-sans font-light">
            No calendar dates blocked currently. Studio availability is governed solely by the base open days.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* UPCOMING BLOCKS */}
            {upcomingBlocks.length > 0 && (
              <div className="space-y-3">
                <span className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#CFA39F] border-b border-cream-dark/25 pb-1">
                  Active & Upcoming Blocked Dates
                </span>
                <div className="grid grid-cols-1 gap-3">
                  {upcomingBlocks.map((item) => (
                    <div key={item.id} className="bg-white border border-cream-dark/50 rounded-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-3xs">
                      
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 bg-rose/5 flex items-center justify-center rounded-xs shrink-0 border border-rose/15 text-rose self-center">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-serif text-charcoal font-semibold text-md leading-tight">{formatBlockDate(item.date)}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            
                            {/* Reason Tag */}
                            {item.reason && (
                              <span className="text-[10px] bg-charcoal/5 px-2 py-0.5 rounded-full font-semibold text-charcoal-light">
                                {item.reason}
                              </span>
                            )}

                            {/* Block Type tag */}
                            {item.blockedSlots.length === 0 ? (
                              <span className="text-[9px] bg-rose/10 border border-rose/25 text-rose rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">
                                Full Day block
                              </span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 border border-amber-500/25 text-amber-600 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">
                                Partial — {item.blockedSlots.length} slot{item.blockedSlots.length > 1 ? 's' : ''} blocked
                              </span>
                            )}
                          </div>

                          {/* Specific list of slots if partial */}
                          {item.blockedSlots.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {item.blockedSlots.map((s) => (
                                <span key={s} className="text-[10px] font-sans font-medium bg-cream-light border border-cream-dark/60 text-charcoal-light/80 px-2 py-0.5 rounded-xs">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => startEditBlock(item)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs border border-sage text-sage hover:bg-sage/5 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <ConfirmDelete
                          onDelete={() => handleDeleteBlock(item.id)}
                          title="Remove block"
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAST BLOCKS DIVIDER & LIST */}
            {pastBlocks.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="block text-[10px] font-sans font-bold uppercase tracking-widest text-charcoal-light/40 border-b border-cream-dark/20 pb-1">
                  Muted History (Older Blocked Dates)
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {pastBlocks.map((item) => (
                    <div key={item.id} className="bg-[#FAF7F2]/45 border border-cream-dark/30 rounded-xs p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 opacity-60">
                      
                      <div className="flex items-center gap-3">
                        <Unlock className="w-4 h-4 text-charcoal-light/35 shrink-0" />
                        <div>
                          <p className="font-serif text-charcoal-light font-normal text-sm line-through">{formatBlockDate(item.date)}</p>
                          <p className="text-[11px] font-light text-charcoal-light/50">{item.reason || 'Past blocked day'}</p>
                        </div>
                      </div>

                      {/* Simple deletion for past items */}
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(item.id)}
                        className="text-[11px] font-sans font-semibold uppercase tracking-wider text-rose/70 hover:text-rose cursor-pointer self-end sm:self-center transition-colors"
                      >
                        Delete history
                      </button>

                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </section>
  );
}
