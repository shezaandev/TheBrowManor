import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface InlineFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InlineForm({ isOpen, onClose, title, children }: InlineFormProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="inline-accordion-form"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden mb-6 border border-cream-dark/60 bg-white rounded-xs"
        >
          <div className="p-5 sm:p-6 border-b border-cream-dark/30 flex justify-between items-center bg-cream-light/30">
            <h3 className="font-serif text-lg text-charcoal font-normal">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-sans tracking-wide text-charcoal-light/60 hover:text-charcoal uppercase cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="p-5 sm:p-6 bg-white">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
