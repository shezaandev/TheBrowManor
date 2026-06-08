/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, 
  Clock, Users, Ban, HelpCircle, Heart, PhoneCall, ChevronRight
} from 'lucide-react';
import { POLICY_ITEMS } from '../data';

interface PoliciesViewProps {
  setCurrentTab: (tab: string) => void;
}

export default function PoliciesView({ setCurrentTab }: PoliciesViewProps) {
  // Map index or category to custom style or icon for variation
  const getIcon = (id: string) => {
    switch(id) {
      case 'p-deposit': return <Sparkles className="w-6 h-6 text-blush-dark" />;
      case 'p-timing': return <Clock className="w-6 h-6 text-sage" />;
      case 'p-guests': return <Users className="w-6 h-6 text-[#566455]" />;
      case 'p-cxl': return <Clock className="w-6 h-6 text-[#CFA39F]" />;
      case 'p-noshow': return <ShieldAlert className="w-6 h-6 text-red-700/80" />;
      case 'p-refunds': return <Ban className="w-6 h-6 text-charcoal-light" />;
      default: return <HelpCircle className="w-6 h-6 text-sage" />;
    }
  };

  return (
    <div className="bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blush-light text-blush-dark rounded-full text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>The Brow Manor Standards</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal tracking-wide">
            Our Studio Covenants
          </h1>
          <p className="text-sm sm:text-base text-charcoal-light leading-relaxed max-w-2xl mx-auto font-light">
            To ensure all clients receive the absolute highest standard of care, focus, and hygiene at The Brow Manor, we request that you agree to the following policies before booking your appointment.
          </p>
        </div>

        {/* Warning Callout Box */}
        <div className="bg-[#FAF0EE] border border-[#F5EAE8] px-6 py-5 rounded-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-4xl mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8 text-[#CFA39F] shrink-0" />
          <div className="space-y-1">
            <h4 className="font-serif text-charcoal font-semibold text-md">In Pursuit of Perfection</h4>
            <p className="text-xs text-charcoal-light leading-relaxed max-w-2xl">
              Reserving your appointment confirms you have read, understood, and fully accepted all deposit thresholds, cancellation terms, and pre-treatment care steps. If you have any exceptional questions, do contact Leticia before reserving.
            </p>
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POLICY_ITEMS.map((policy) => (
            <div 
              key={policy.id} 
              id={`policy-item-${policy.id}`}
              className="bg-cream-light p-8 rounded-sm border border-cream-dark/50 hover:border-blush-dark/35 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-[#FAF1EF] rounded-xs">
                    {getIcon(policy.id)}
                  </div>
                  <span className="text-[10px] uppercase font-mono text-sage-light tracking-wide font-semibold">Active Policy</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-light text-charcoal">
                    {policy.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed font-light">
                    {policy.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-cream-dark/35 mt-6 flex items-center justify-between text-[11px] text-sage font-semibold uppercase tracking-wider">
                <span>Fully Binding Rule</span>
                <ChevronRight className="w-4 h-4 text-sage-light" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Booking call-to-action */}
        <div className="bg-sage-pale p-8 sm:p-12 text-center rounded-sm border border-sage-light/25 space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-cream-light text-sage flex items-center justify-center">
              <Heart className="w-5 h-5 fill-sage/10 text-sage" />
            </div>
          </div>
          <h3 className="font-serif text-2xl font-light text-[#2F3E32]">
            Thank you for respecting the sanctity of our studio.
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed max-w-2xl mx-auto font-light">
            Maintaining a private, professional sanctuary allows us to deliver an exceptional, tranquil treatment with undivided attention. Your cooperation ensures a lovely, serene experience for all. Leticia looks forward to welcoming you soon.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <button
              id="policies-contact-btn"
              onClick={() => setCurrentTab('contact')}
              className="px-6 py-3 bg-transparent border border-sage/45 hover:border-sage text-sage text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer"
            >
              Have questions? Consult FAQs
            </button>
            <button
              id="policies-book-btn"
              onClick={() => setCurrentTab('book')}
              className="px-6 py-3 bg-rose hover:bg-blush-dark text-cream text-xs uppercase tracking-wider font-semibold rounded-sm shadow-md transition-all cursor-pointer"
            >
              Agree & Book Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
