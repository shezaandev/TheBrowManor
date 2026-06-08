import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SERVICES } from '../../data';
import { Service } from '../../types';
import InlineForm from './InlineForm';
import ConfirmDelete from './ConfirmDelete';
import DraggableList from './DraggableList';
import { GripVertical, Plus, Edit2, AlertCircle, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Service Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'core' | 'addon' | 'signature' | 'lash'>('core');
  const [popular, setPopular] = useState(false);
  const [bookable, setBookable] = useState(true);

  // Edit Service Form State
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDuration, setEditDuration] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<'core' | 'addon' | 'signature' | 'lash'>('core');
  const [editPopular, setEditPopular] = useState(false);
  const [editBookable, setEditBookable] = useState(true);

  const resetAddForm = () => {
    setName('');
    setPrice(0);
    setDuration('');
    setDescription('');
    setCategory('core');
    setPopular(false);
    setBookable(true);
    setFormError(null);
    setIsAdding(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !duration.trim() || !description.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (price < 0) {
      setFormError('Price cannot be negative.');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'services'), {
        name: name.trim(),
        price: Number(price),
        duration: duration.trim(),
        description: description.trim(),
        category,
        popular,
        bookable,
        order: services.length + 1,
        createdAt: serverTimestamp(),
      });

      resetAddForm();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error occurred creating service.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item: Service) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price);
    setEditDuration(item.duration);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditPopular(!!item.popular);
    setEditBookable(item.bookable !== false);
    setFormError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormError(null);
  };

  const handleUpdate = async (itemId: string) => {
    setFormError(null);

    if (!editName.trim() || !editDuration.trim() || !editDescription.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (editPrice < 0) {
      setFormError('Price cannot be negative.');
      return;
    }

    setIsLoading(true);
    try {
      const itemRef = doc(db, 'services', itemId);
      await updateDoc(itemRef, {
        name: editName.trim(),
        price: Number(editPrice),
        duration: editDuration.trim(),
        description: editDescription.trim(),
        category: editCategory,
        popular: editPopular,
        bookable: editBookable,
        updatedAt: serverTimestamp(),
      });

      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error occurred updating service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'services', itemId));

      // Re-index remaining services
      const remaining = services.filter((item) => item.id !== itemId);
      const batch = writeBatch(db);
      remaining.forEach((item, idx) => {
        batch.update(doc(db, 'services', item.id), { order: idx + 1 });
      });
      await batch.commit();
    } catch (err: any) {
      console.warn((err && err.message) || err);
    }
  };

  const handleReorder = async (newItems: any[]) => {
    try {
      const batch = writeBatch(db);
      newItems.forEach((item, idx) => {
        batch.update(doc(db, 'services', item.id), { order: idx + 1 });
      });
      await batch.commit();
    } catch (err: any) {
      console.warn((err && err.message) || err);
    }
  };

  const handlePrepopulateDefaults = async () => {
    if (!window.confirm('Are you sure you want to restore all original menu default treatments to the database? This is helpful if your database list is currently blank.')) {
      return;
    }

    setIsLoading(true);
    setFormError(null);
    setSuccessMsg(null);

    try {
      const batch = writeBatch(db);
      
      // Delete existing ones to avoid confusion and have a clean state
      for (const item of services) {
        batch.delete(doc(db, 'services', item.id));
      }

      // Add default ones with specific orders
      SERVICES.forEach((s, idx) => {
        const itemRef = doc(collection(db, 'services'));
        batch.set(itemRef, {
          name: s.name,
          price: s.price,
          duration: s.duration,
          description: s.description,
          category: s.category,
          popular: !!s.popular,
          bookable: s.bookable !== false,
          order: idx + 1,
        });
      });

      await batch.commit();
      setSuccessMsg('Default treatment menu successfully restored!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFormError('Failed to restore defaults: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="services-section" className="scroll-mt-24 space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl sm:text-3xl text-charcoal font-light">Services & Pricing Menu</h2>
          <p className="text-sm text-charcoal-light/75 mt-1">
            Edit, add, delete, or reorder salon services. Changes reflect immediately on client booking and pricing lists.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrepopulateDefaults}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-cream-dark hover:bg-cream-light/45 text-charcoal-light text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>Restore Defaults</span>
          </button>
          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <p className="text-xs font-sans text-sage bg-sage/5 border border-sage/10 px-3.5 py-2.5 rounded-xs animate-fade-in w-fit">
          {successMsg}
        </p>
      )}

      {/* ACCORDION FORM FOR ADDING ITEM */}
      <InlineForm isOpen={isAdding} onClose={resetAddForm} title="Create Salon Service">
        <form onSubmit={handleCreate} className="space-y-4 max-w-xl font-sans text-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Service Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Brow Wax & Custom tint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Price (A$)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g., 55"
                value={price === 0 ? '' : price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Duration (e.g., &quot;45 min&quot; or &quot;1 hr 10 min&quot;)</label>
              <input
                type="text"
                required
                placeholder="e.g., 45 min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Description</label>
            <textarea
              required
              rows={3}
              placeholder="Provide a delightful, clear explanation of the treatment care and client experience."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden font-sans text-sm resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Category Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden text-sm"
              >
                <option value="core">core — Brow Artistry</option>
                <option value="signature">signature — The Signature Experience</option>
                <option value="lash">lash — Lash Enhancements</option>
                <option value="addon">addon — Luxury Indulgences</option>
              </select>
            </div>

            <div className="flex flex-col justify-center gap-3 pt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded-xs border-cream-dark/60 text-sage focus:ring-sage"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-light">Feature as &quot;Popular&quot;</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bookable}
                  onChange={(e) => setBookable(e.target.checked)}
                  className="rounded-xs border-cream-dark/60 text-sage focus:ring-sage"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-light font-sans">Bookable (uncheck for Coming Soon)</span>
              </label>
            </div>
          </div>

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
              onClick={resetAddForm}
              className="px-4 py-2 border border-cream-dark/60 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs hover:bg-cream-light cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoading ? 'Uploading...' : 'Submit'}</span>
            </button>
          </div>
        </form>
      </InlineForm>

      {/* DRAGGABLE REORDER LIST FOR SERVICES */}
      <div id="services-reorder-container" className="space-y-4">
        <DraggableList
          items={services}
          onReorder={handleReorder}
          renderItem={(item, idx, dragHandlers) => {
            const isEditing = editingId === item.id;
            return (
              <div className="bg-white border border-cream-dark/50 rounded-xs p-4 flex flex-col gap-4 shadow-3xs relative">
                
                {/* DEFAULT READ ROW */}
                {!isEditing && (
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      
                      {/* drag handle */}
                      <button
                        type="button"
                        {...dragHandlers}
                        className="p-1 text-charcoal-light/40 hover:text-charcoal cursor-grab active:cursor-grabbing self-center"
                      >
                        <GripVertical className="w-5 h-5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-serif text-lg text-charcoal font-normal leading-tight">{item.name}</h4>
                          {item.popular && (
                            <span className="text-[9px] bg-rose/10 border border-rose/25 text-rose rounded-full px-2 py-0.5 font-sans font-bold uppercase tracking-widest">
                              Popular
                            </span>
                          )}
                          <span className={`text-[9px] border rounded-full px-2 py-0.5 font-sans font-semibold uppercase tracking-wider ${
                            item.category === 'core' ? 'bg-sage/10 border-sage/20 text-sage'
                            : item.category === 'signature' ? 'bg-rose/10 border-rose/25 text-rose bg-rose/5'
                            : item.category === 'lash' ? 'bg-charcoal/5 border-charcoal/10 text-charcoal/60'
                            : 'bg-cream-dark/20 border-cream-dark/30 text-charcoal-light'
                          }`}>
                            {item.category === 'core' ? 'Brow Artistry'
                             : item.category === 'signature' ? 'Signature Experience'
                             : item.category === 'lash' ? 'Lash Enhancement'
                             : 'Luxury Indulgence'}
                          </span>
                          {item.bookable === false && (
                            <span className="text-[9px] bg-charcoal/10 border border-charcoal/20 text-charcoal/50 rounded-full px-2 py-0.5 font-sans font-bold uppercase tracking-widest pl-1">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-light/80 mt-1 lines-clamp-2 max-w-xl font-light">{item.description}</p>
                        <div className="flex items-center gap-4 text-[11px] font-sans text-charcoal-light/60 mt-1.5 font-semibold">
                          <span>Duration: <strong className="text-charcoal-light">{item.duration}</strong></span>
                          <span>•</span>
                          <span>Price: <strong className="text-rose">A${item.price}</strong></span>
                        </div>
                      </div>

                    </div>

                    {/* edit operation triggers */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs border border-sage text-sage hover:bg-sage/5 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <ConfirmDelete
                        onDelete={() => handleDeleteService(item.id)}
                        title="Delete"
                      />
                    </div>
                  </div>
                )}

                {/* EDITING MODE EXPANDED */}
                {isEditing && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(item.id);
                    }}
                    className="p-1 space-y-4 text-sm max-w-xl font-sans"
                  >
                    <div className="flex items-center justify-between border-b border-cream-dark/30 pb-2 mb-2">
                      <span className="font-serif font-light text-md text-charcoal">Edit: {item.name}</span>
                      <button type="button" onClick={cancelEdit} className="text-xs text-charcoal-light hover:text-charcoal uppercase">
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Service Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Price (A$)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={editPrice === 0 ? '' : editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Duration</label>
                        <input
                          type="text"
                          required
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className="w-full px-3 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Description</label>
                      <textarea
                        required
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden text-sm font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Category Type</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as any)}
                          className="w-full px-3 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden text-sm"
                        >
                          <option value="core">core — Brow Artistry</option>
                          <option value="signature">signature — The Signature Experience</option>
                          <option value="lash">lash — Lash Enhancements</option>
                          <option value="addon">addon — Luxury Indulgences</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-center gap-3 pt-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editPopular}
                            onChange={(e) => setEditPopular(e.target.checked)}
                            className="rounded-xs border-cream-dark/60 text-sage focus:ring-sage"
                          />
                          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-light">Feature as &quot;Popular&quot;</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editBookable}
                            onChange={(e) => setEditBookable(e.target.checked)}
                            className="rounded-xs border-cream-dark/60 text-sage focus:ring-sage"
                          />
                          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-light font-sans">Bookable (uncheck for Coming Soon)</span>
                        </label>
                      </div>
                    </div>

                    {formError && (
                      <div className="p-2.5 bg-rose/5 border border-rose/10 text-rose rounded-xs text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={cancelEdit}
                        className="px-3 py-1.5 border border-cream-dark/60 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs hover:bg-cream-light cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-5 py-1.5 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                )}

              </div>
            );
          }}
        />
      </div>

    </section>
  );
}
