import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, doc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import InlineForm from './InlineForm';
import ConfirmDelete from './ConfirmDelete';
import DraggableList from './DraggableList';
import { GripVertical, Plus, Edit2, AlertCircle, RefreshCw, Instagram } from 'lucide-react';

interface InstagramSectionProps {
  instagramPosts: any[];
  instagramUsername: string;
}

export default function InstagramSection({ instagramPosts, instagramUsername }: InstagramSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingUsername, setEditingUsername] = useState(instagramUsername);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditingUsername(instagramUsername);
  }, [instagramUsername]);

  const resetAddForm = () => {
    setImgFile(null);
    setFormError(null);
    setIsAdding(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!imgFile) {
      setFormError('Please select a square showcase photo.');
      return;
    }

    setIsLoading(true);
    try {
      const secureUrl = await uploadToCloudinary(imgFile, 'in-bloom/instagram');

      await addDoc(collection(db, 'instagramPosts'), {
        img: secureUrl,
        order: instagramPosts.length + 1,
        createdAt: serverTimestamp(),
      });

      resetAddForm();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error occurred creating mock post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUsername(true);
    setUsernameSuccess(false);
    try {
      await setDoc(doc(db, 'siteImages', 'instagramUsername'), {
        username: editingUsername.trim().replace(/^@/, ''),
        updatedAt: serverTimestamp(),
      });
      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError('Failed to save username: ' + err.message);
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'instagramPosts', postId));

      // Re-index remaining posts
      const remaining = instagramPosts.filter(item => item.id !== postId);
      const batch = writeBatch(db);
      remaining.forEach((item, idx) => {
        batch.update(doc(db, 'instagramPosts', item.id), { order: idx + 1 });
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
        batch.update(doc(db, 'instagramPosts', item.id), { order: idx + 1 });
      });
      await batch.commit();
    } catch (err: any) {
      console.warn((err && err.message) || err);
    }
  };

  return (
    <section id="instagram-feed-section" className="scroll-mt-24 space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl sm:text-3xl text-charcoal font-light">Instagram Feed</h2>
          <p className="text-sm text-charcoal-light/75 mt-1">
            These photos appear in the Instagram feed across the website.
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Post</span>
          </button>
        )}
      </div>

      {/* 2. INSTAGRAM USERNAME SETTINGS */}
      <div className="bg-white border border-cream-dark/60 rounded-xs p-5 shadow-3xs space-y-4">
        <div>
          <h4 className="font-sans font-semibold text-sm text-charcoal flex items-center gap-2">
            <Instagram className="w-4 h-4 text-rose" />
            <span>Instagram Username Settings</span>
          </h4>
          <p className="text-xs text-charcoal-light/60 mt-1">
            Setting the global username automatically updates follow links and post URLs on the homepage and gallery.
          </p>
        </div>

        <form onSubmit={handleSaveUsername} className="flex items-end gap-3 max-w-md">
          <div className="flex-1 space-y-1.5 font-sans">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-charcoal-light/80">Instagram Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light/45 text-sm font-semibold select-none">@</span>
              <input
                type="text"
                required
                placeholder="examplebrand"
                value={editingUsername}
                onChange={(e) => setEditingUsername(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2 border border-cream-dark/60 rounded-xs bg-cream-light/35 focus:border-sage focus:outline-hidden text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingUsername}
            className="px-5 py-2.5 bg-sage hover:bg-sage-dark text-cream text-xs font-sans font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 h-[38px] shrink-0"
          >
            {isSavingUsername && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSavingUsername ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>

        {usernameSuccess && (
          <p className="text-[11px] font-sans text-sage bg-sage/5 border border-sage/10 px-3 py-1.5 rounded-xs w-fit animate-fade-in">
            Settings saved successfully!
          </p>
        )}
      </div>

      {/* ADD DIALOG */}
      <InlineForm isOpen={isAdding} onClose={resetAddForm} title="Upload Instagram Photo">
        <form onSubmit={handleCreate} className="space-y-5 max-w-xl font-sans text-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-light/85">Post Picture</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 border border-cream-dark/60 text-xs font-sans rounded-xs bg-white text-charcoal hover:bg-cream hover:border-charcoal transition-all cursor-pointer"
              >
                Select Square Photo
              </button>
              <span className="text-xs text-charcoal-light truncate max-w-[200px]">
                {imgFile ? imgFile.name : 'No image chosen'}
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setImgFile(e.target.files?.[0] || null)}
              className="hidden"
            />
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

      {/* FEED LIST */}
      <div id="instagram-drag-wrapper">
        <DraggableList
          items={instagramPosts}
          onReorder={handleReorder}
          renderItem={(post, idx, dragHandlers) => (
            <InstagramPostRow
              key={post.id || idx}
              post={post}
              dragHandlers={dragHandlers}
              onDelete={() => handleDeletePost(post.id)}
            />
          )}
        />
      </div>
    </section>
  );
}

interface InstagramPostRowProps {
  key?: any;
  post: any;
  dragHandlers: any;
  onDelete: () => any;
}

function InstagramPostRow({ post, dragHandlers, onDelete }: InstagramPostRowProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPG and PNG formats are allowed.');
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File exceeds the 5MB size limit.');
      }

      const secureUrl = await uploadToCloudinary(file, 'in-bloom/instagram');

      const postRef = doc(db, 'instagramPosts', post.id);
      await updateDoc(postRef, { img: secureUrl });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to replace image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-cream-dark/50 rounded-xs p-5 shadow-3xs relative flex flex-col gap-4">
      {isUploading && (
        <div className="absolute inset-0 bg-white/85 z-20 flex flex-col items-center justify-center space-y-1">
          <RefreshCw className="w-5 h-5 text-sage animate-spin" />
          <span className="text-[10px] font-sans font-medium text-charcoal">Replacing photo...</span>
        </div>
      )}

      {/* TOP HEADER ROW OF THE ITEM */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            type="button"
            {...dragHandlers}
            className="p-1 text-charcoal-light/40 hover:text-charcoal cursor-grab active:cursor-grabbing self-center shrink-0"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-cream-dark/20 rounded-xs border border-cream-dark/30 shrink-0 overflow-hidden relative">
            <img src={post.img} alt="Post" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-light/65">Instagram Photo</p>
            {error && <p className="text-xs text-rose mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs border border-sage text-sage hover:bg-sage/5 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Replace Photo</span>
          </button>
          <ConfirmDelete onDelete={onDelete} />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
