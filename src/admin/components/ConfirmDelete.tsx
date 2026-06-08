import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteProps {
  onDelete: () => Promise<void> | void;
  title?: string;
  className?: string;
}

export default function ConfirmDelete({ onDelete, title = "Delete", className = "" }: ConfirmDeleteProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div id="confirm-delete-action" className="flex items-center gap-3 bg-rose/5 border border-rose/20 p-2.5 rounded-xs w-full justify-between animate-fade-in">
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertTriangle className="w-4 h-4 text-rose shrink-0" />
          <span className="text-[11px] font-sans text-charcoal truncate">Are you sure? This cannot be undone.</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setIsConfirming(false)}
            className="px-2.5 py-1 bg-cream-light hover:bg-cream border border-cream-dark/60 text-charcoal text-xs font-sans font-semibold rounded-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-2.5 py-1 bg-rose/90 hover:bg-rose text-cream text-xs font-sans font-semibold rounded-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider rounded-xs border border-rose text-rose hover:bg-rose/5 transition-all cursor-pointer ${className}`}
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>{title}</span>
    </button>
  );
}
