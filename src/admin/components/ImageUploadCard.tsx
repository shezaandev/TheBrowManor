import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Sparkles, Calendar, RotateCw, Image as ImageIcon } from 'lucide-react';

interface ImageUploadCardProps {
  key?: string;
  idKey: string;
  label: string;
  usageNote: string;
  currentUrl: string;
  updatedAt?: any; // Timestamp or string
  folder: string;
  onUpdate: (url: string) => Promise<void>;
}

export default function ImageUploadCard({
  idKey,
  label,
  usageNote,
  currentUrl,
  updatedAt,
  folder,
  onUpdate
}: ImageUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      // 1. Client-side validation: JPG/PNG only, max 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPG and PNG formats are allowed.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File exceeds the 5MB size limit.');
      }

      // 2. Upload to Cloudinary
      const secureUrl = await uploadToCloudinary(file, folder);

      // 3. Write securely to Firestore using callback
      await onUpdate(secureUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (ts: any) => {
    if (!ts) return 'Original default';
    if (ts.toDate) {
      return ts.toDate().toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
    if (ts instanceof Date) {
      return ts.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
    if (typeof ts === 'string') {
      return new Date(ts).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
    return String(ts);
  };

  return (
    <div id={`site-image-card-${idKey}`} className="bg-white border border-cream-dark/60 rounded-xs p-5 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden">
      {/* Uploading Spinner Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/85 z-20 flex flex-col items-center justify-center space-y-2">
          <RotateCw className="w-8 h-8 text-sage animate-spin" />
          <span className="text-xs font-sans font-medium text-charcoal">Uploading to Cloudinary...</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Aspect Ratio Preview */}
        <div className="aspect-[4/3] bg-cream-light border border-cream-dark/30 rounded-xs overflow-hidden relative flex items-center justify-center">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt={label}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
          ) : (
            <ImageIcon className="w-10 h-10 text-charcoal-light/30" />
          )}
        </div>

        <div>
          <h4 className="font-sans font-semibold text-sm text-charcoal">{label}</h4>
          <p className="text-xs text-charcoal-light/60 mt-0.5">{usageNote}</p>
        </div>
      </div>

      <div className="space-y-4 border-t border-cream/50 pt-3 flex flex-col justify-end">
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-charcoal-light/40">Last Updated</span>
          <span className="text-xs font-mono text-charcoal-light/80">{formatTime(updatedAt)}</span>
        </div>

        {error && (
          <p className="text-[11px] font-sans text-rose bg-rose/5 border border-rose/10 px-2 py-1.5 rounded-xs">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={triggerPicker}
          disabled={isUploading}
          className="w-full text-center py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs border border-sage text-sage hover:bg-sage hover:text-cream transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          Replace Image
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
        />
      </div>
    </div>
  );
}
