import React, { useState, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import InlineForm from './InlineForm';
import ConfirmDelete from './ConfirmDelete';
import DraggableList from './DraggableList';
import { GripVertical, Plus, Edit2, Check, AlertCircle, Eye, RefreshCw } from 'lucide-react';

interface GalleryItemProps {
  galleryItems: any[];
}

const CATEGORY_MAP = [
  { id: 'lamination', label: 'Brow Lamination' },
  { id: 'sculpt', label: 'Wax & Sculpt' },
  { id: 'tint', label: 'Dye/Tint' },
  { id: 'addon', label: 'Add-on' },
];

export default function GallerySection({ galleryItems }: GalleryItemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add Item States
  const [title, setTitle] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [type, setType] = useState<'single' | 'slider'>('single');
  const [singleImgFile, setSingleImgFile] = useState<File | null>(null);
  const [beforeImgFile, setBeforeImgFile] = useState<File | null>(null);
  const [afterImgFile, setAfterImgFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Item States
  const [editTitle, setEditTitle] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editType, setEditType] = useState<'single' | 'slider'>('single');
  const [editSingleImgFile, setEditSingleImgFile] = useState<File | null>(null);
  const [editBeforeImgFile, setEditBeforeImgFile] = useState<File | null>(null);
  const [editAfterImgFile, setEditAfterImgFile] = useState<File | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Refs for file pickers
  const addSingleRef = useRef<HTMLInputElement>(null);
  const addBeforeRef = useRef<HTMLInputElement>(null);
  const addAfterRef = useRef<HTMLInputElement>(null);
  const editSingleRef = useRef<HTMLInputElement>(null);
  const editBeforeRef = useRef<HTMLInputElement>(null);
  const editAfterRef = useRef<HTMLInputElement>(null);

  const resetAddForm = () => {
    setTitle('');
    setServiceName('');
    setCategories([]);
    setType('single');
    setSingleImgFile(null);
    setBeforeImgFile(null);
    setAfterImgFile(null);
    setFormError(null);
    setIsAdding(false);
  };

  const handleCategoryChange = (catId: string, isChecked: boolean, isEditMode: boolean) => {
    if (isEditMode) {
      if (isChecked) {
        setEditCategories(prev => [...prev, catId]);
      } else {
        setEditCategories(prev => prev.filter(c => c !== catId));
      }
    } else {
      if (isChecked) {
        setCategories(prev => [...prev, catId]);
      } else {
        setCategories(prev => prev.filter(c => c !== catId));
      }
    }
  };

  // Create Gallery Item
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !serviceName.trim()) {
      setFormError('Please provide a title and service name.');
      return;
    }
    if (categories.length === 0) {
      setFormError('Please select at least one beauty category.');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = '';
      let beforeImg = '';
      let afterImg = '';

      if (type === 'single') {
        if (!singleImgFile) {
          throw new Error('Please select an image for single type.');
        }
        imageUrl = await uploadToCloudinary(singleImgFile, 'in-bloom/gallery');
      } else {
        if (!beforeImgFile || !afterImgFile) {
          throw new Error('Please select both before and after images for slider type.');
        }
        beforeImg = await uploadToCloudinary(beforeImgFile, 'in-bloom/gallery');
        afterImg = await uploadToCloudinary(afterImgFile, 'in-bloom/gallery');
      }

      await addDoc(collection(db, 'galleryItems'), {
        title: title.trim(),
        serviceName: serviceName.trim(),
        categories,
        type,
        imageUrl: type === 'single' ? imageUrl : null,
        beforeImg: type === 'slider' ? beforeImg : null,
        afterImg: type === 'slider' ? afterImg : null,
        order: galleryItems.length + 1,
        createdAt: serverTimestamp(),
      });

      resetAddForm();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'An error occurred during create.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditServiceName(item.serviceName);
    setEditCategories(item.categories || []);
    setEditType(item.type || 'single');
    setEditSingleImgFile(null);
    setEditBeforeImgFile(null);
    setEditAfterImgFile(null);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  // Update Gallery Item
  const handleUpdate = async (item: any) => {
    setEditError(null);

    if (!editTitle.trim() || !editServiceName.trim()) {
      setEditError('Title and service name cannot be blank.');
      return;
    }
    if (editCategories.length === 0) {
      setEditError('At least one category must be checked.');
      return;
    }

    setIsLoading(true);
    try {
      let updatedImageUrl = item.imageUrl || '';
      let updatedBeforeImg = item.beforeImg || '';
      let updatedAfterImg = item.afterImg || '';

      if (editType === 'single') {
        if (editSingleImgFile) {
          updatedImageUrl = await uploadToCloudinary(editSingleImgFile, 'in-bloom/gallery');
        }
        updatedBeforeImg = '';
        updatedAfterImg = '';
      } else {
        if (editBeforeImgFile) {
          updatedBeforeImg = await uploadToCloudinary(editBeforeImgFile, 'in-bloom/gallery');
        }
        if (editAfterImgFile) {
          updatedAfterImg = await uploadToCloudinary(editAfterImgFile, 'in-bloom/gallery');
        }
        updatedImageUrl = '';
      }

      const itemRef = doc(db, 'galleryItems', item.id);
      await updateDoc(itemRef, {
        title: editTitle.trim(),
        serviceName: editServiceName.trim(),
        categories: editCategories,
        type: editType,
        imageUrl: editType === 'single' ? updatedImageUrl : null,
        beforeImg: editType === 'slider' ? updatedBeforeImg : null,
        afterImg: editType === 'slider' ? updatedAfterImg : null,
      });

      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      setEditError(err.message || 'Error occurred during save editing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Gallery Item
  const handleDeleteItem = async (itemId: string, index: number) => {
    const docPath = `galleryItems/${itemId}`;
    try {
      await deleteDoc(doc(db, 'galleryItems', itemId));
      
      // Keep indices contiguous
      const remaining = galleryItems.filter(item => item.id !== itemId);
      const batch = writeBatch(db);
      remaining.forEach((item, idx) => {
        batch.update(doc(db, 'galleryItems', item.id), { order: idx + 1 });
      });
      await batch.commit();

    } catch (err: any) {
      console.warn((err && err.message) || err);
    }
  };

  // Perform reorder logic via batch upload
  const handleReorder = async (newItems: any[]) => {
    try {
      const batch = writeBatch(db);
      newItems.forEach((item, idx) => {
        batch.update(doc(db, 'galleryItems', item.id), { order: idx + 1 });
      });
      await batch.commit();
    } catch (err: any) {
      console.warn((err && err.message) || err);
    }
  };

  return (
    <section id="gallery-items-section" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl sm:text-3xl text-charcoal font-light">Gallery Items</h2>
          <p className="text-sm text-charcoal-light/75 mt-1">
            Manage the before/after sliders and single image cards legacy shown in the Gallery page.
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Gallery Item</span>
          </button>
        )}
      </div>

      {/* Accordion Form for Creating Item */}
      <InlineForm isOpen={isAdding} onClose={resetAddForm} title="Create Gallery Item">
        <form onSubmit={handleCreate} className="space-y-5 max-w-xl font-sans text-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Item Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Signature Lamination Refresh"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Service Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Brow Wax, Sculpt, Lamination & Dye/Tint"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Beauty Categories</label>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1">
              {CATEGORY_MAP.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat.id)}
                    onChange={(e) => handleCategoryChange(cat.id, e.target.checked, false)}
                    className="rounded-xs border-cream-dark/60 text-sage focus:ring-sage"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Presentation Type</label>
            <div className="flex gap-4 mt-1">
              <button
                type="button"
                onClick={() => setType('single')}
                className={`px-4 py-2 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  type === 'single'
                    ? 'bg-sage border-sage text-cream'
                    : 'bg-cream-light border-cream-dark/60 text-charcoal'
                }`}
              >
                Single Image Card
              </button>
              <button
                type="button"
                onClick={() => setType('slider')}
                className={`px-4 py-2 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  type === 'slider'
                    ? 'bg-sage border-sage text-cream'
                    : 'bg-cream-light border-cream-dark/60 text-charcoal'
                }`}
              >
                Before/After Slider
              </button>
            </div>
          </div>

          {/* Conditional Image Inputs */}
          <div className="bg-cream-light/35 p-4 rounded-xs border border-cream-dark/40 space-y-4">
            {type === 'single' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Image File</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => addSingleRef.current?.click()}
                    className="px-3 py-1.5 border border-cream-dark/60 text-xs font-sans rounded-xs bg-white text-charcoal hover:bg-cream-light transition-all cursor-pointer"
                  >
                    Select File
                  </button>
                  <span className="text-xs text-charcoal-light truncate max-w-[200px]">
                    {singleImgFile ? singleImgFile.name : 'No image chosen'}
                  </span>
                </div>
                <input
                  type="file"
                  ref={addSingleRef}
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => setSingleImgFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Before Image</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => addBeforeRef.current?.click()}
                      className="px-3 py-1.5 border border-cream-dark/60 text-xs font-sans rounded-xs bg-white text-charcoal hover:bg-cream-light transition-all cursor-pointer"
                    >
                      Select Before
                    </button>
                    <span className="text-xs text-charcoal-light truncate max-w-[120px]">
                      {beforeImgFile ? beforeImgFile.name : 'None'}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={addBeforeRef}
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setBeforeImgFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">After Image</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => addAfterRef.current?.click()}
                      className="px-3 py-1.5 border border-cream-dark/60 text-xs font-sans rounded-xs bg-white text-charcoal hover:bg-cream-light transition-all cursor-pointer"
                    >
                      Select After
                    </button>
                    <span className="text-xs text-charcoal-light truncate max-w-[120px]">
                      {afterImgFile ? afterImgFile.name : 'None'}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={addAfterRef}
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setAfterImgFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              </div>
            )}
            <p className="text-[11px] text-charcoal-light/60">JPG/PNG formats only. Max file size: 5MB.</p>
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
              className="px-4 py-2 border border-cream-dark/60 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs hover:bg-cream-light transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoading ? 'Creating Item...' : 'Submit'}</span>
            </button>
          </div>
        </form>
      </InlineForm>

      {/* Gallery Items Draggable Reorder list */}
      <div id="gallery-items-list-container" className="space-y-4">
        <DraggableList
          items={galleryItems}
          onReorder={handleReorder}
          renderItem={(item, idx, dragHandlers) => {
            const isEditing = editingId === item.id;
            return (
              <div className="bg-white border border-cream-dark/50 rounded-xs p-4 flex flex-col gap-4 shadow-3xs relative">
                {/* Regular content layout */}
                {!isEditing && (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Drag handle */}
                      <button
                        type="button"
                        {...dragHandlers}
                        className="p-1 text-charcoal-light/40 hover:text-charcoal cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-5 h-5" />
                      </button>

                      {/* Display Preview */}
                      <div className="flex gap-1.5 shrink-0">
                        {item.type === 'slider' ? (
                          <>
                            <div className="w-12 h-12 bg-cream rounded-xs border border-cream-dark/25 overflow-hidden">
                              <img src={item.beforeImg} alt="Before" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                            <div className="w-12 h-12 bg-cream rounded-xs border border-cream-dark/25 overflow-hidden">
                              <img src={item.afterImg} alt="After" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                          </>
                        ) : (
                          <div className="w-24 h-12 bg-cream rounded-xs border border-cream-dark/25 overflow-hidden">
                            <img src={item.imageUrl} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-sans font-semibold text-charcoal leading-tight truncate">{item.title}</h4>
                      <p className="text-xs text-charcoal-light/80 font-medium truncate">{item.serviceName}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wide uppercase bg-cream-dark/30 text-charcoal-light/90">
                          {item.type === 'slider' ? 'Slider' : 'Single'}
                        </span>
                        {item.categories?.map((catId: string) => (
                          <span
                            key={catId}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-sage/10 text-sage/90"
                          >
                            {CATEGORY_MAP.find(c => c.id === catId)?.label || catId}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Edit Delete Operations */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs border border-sage text-sage hover:bg-sage/5 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <ConfirmDelete
                        onDelete={() => handleDeleteItem(item.id, idx)}
                        title="Delete"
                      />
                    </div>
                  </div>
                )}

                {/* Expanded Inline Edit Form */}
                {isEditing && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(item);
                    }}
                    className="p-1 space-y-4 text-sm max-w-xl font-sans"
                  >
                    <div className="flex items-center justify-between border-b border-cream-dark/30 pb-2 mb-2">
                      <span className="font-serif font-light text-md text-charcoal">Edit: {item.title}</span>
                      <button type="button" onClick={cancelEdit} className="text-xs text-charcoal-light hover:text-charcoal uppercase">
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Service Name</label>
                      <input
                        type="text"
                        required
                        value={editServiceName}
                        onChange={(e) => setEditServiceName(e.target.value)}
                        className="w-full px-3 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Edit Categories</label>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1">
                        {CATEGORY_MAP.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editCategories.includes(cat.id)}
                              onChange={(e) => handleCategoryChange(cat.id, e.target.checked, true)}
                              className="rounded-xs border-cream-dark/60 text-sage focus:ring-sage"
                            />
                            <span>{cat.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75">Change Presentation Type</label>
                      <div className="flex gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => setEditType('single')}
                          className={`px-3 py-1.5 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            editType === 'single'
                              ? 'bg-sage border-sage text-cream'
                              : 'bg-cream-light border-cream-dark/60 text-charcoal'
                          }`}
                        >
                          Single Image Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditType('slider')}
                          className={`px-3 py-1.5 border rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            editType === 'slider'
                              ? 'bg-sage border-sage text-cream'
                              : 'bg-cream-light border-cream-dark/60 text-charcoal'
                          }`}
                        >
                          Before/After Slider
                        </button>
                      </div>
                    </div>

                    {/* Image modification area */}
                    <div className="bg-cream-light/35 p-3.5 border border-cream-dark/40 rounded-xs space-y-4">
                      {editType === 'single' ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75 text-charcoal">Replace Single Image</label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => editSingleRef.current?.click()}
                              className="px-3 py-1.5 border border-cream-dark/60 text-xs rounded-xs bg-white text-charcoal hover:bg-cream-light cursor-pointer"
                            >
                              Choose Image
                            </button>
                            <span className="text-xs text-charcoal-light truncate max-w-[200px]">
                              {editSingleImgFile ? editSingleImgFile.name : 'Current Image Retained'}
                            </span>
                          </div>
                          <input
                            type="file"
                            ref={editSingleRef}
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => setEditSingleImgFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75 text-charcoal">Replace Before Image</label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => editBeforeRef.current?.click()}
                                className="px-3 py-1.5 border border-cream-dark/60 text-xs rounded-xs bg-white text-charcoal cursor-pointer"
                              >
                                Choose Before
                              </button>
                              <span className="text-xs text-charcoal-light truncate max-w-[120px]">
                                {editBeforeImgFile ? editBeforeImgFile.name : 'Current Image Retained'}
                              </span>
                            </div>
                            <input
                              type="file"
                              ref={editBeforeRef}
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => setEditBeforeImgFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/75 text-charcoal">Replace After Image</label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => editAfterRef.current?.click()}
                                className="px-3 py-1.5 border border-cream-dark/60 text-xs rounded-xs bg-white text-charcoal cursor-pointer"
                              >
                                Choose After
                              </button>
                              <span className="text-xs text-charcoal-light truncate max-w-[120px]">
                                {editAfterImgFile ? editAfterImgFile.name : 'Current Image Retained'}
                              </span>
                            </div>
                            <input
                              type="file"
                              ref={editAfterRef}
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => setEditAfterImgFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {editError && (
                      <div className="p-2.5 bg-rose/5 border border-rose/10 text-rose rounded-xs text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{editError}</span>
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
