/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, ShieldAlert, CalendarRange, Droplets, Ban, 
  HeartPulse, ZapOff, Undo2, CheckCircle2, ShieldCheck, 
  HelpCircle, Eye, RefreshCw, Heart
} from 'lucide-react';
import { PRE_CARE_STEPS, AFTER_CARE_STEPS } from '../data';

// Map icon name string to Lucide component
const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles: Sparkles,
  ShieldAlert: ShieldAlert,
  CalendarRange: CalendarRange,
  Droplets: Droplets,
  Ban: Ban,
  HeartPulse: HeartPulse,
  ZapOff: ZapOff,
  Undo2: Undo2,
};

export default function CareView() {
  const [checkedPre, setCheckedPre] = useState<Record<string, boolean>>({});
  const [checkedAfter, setCheckedAfter] = useState<Record<string, boolean>>({});

  const togglePre = (id: string) => {
    setCheckedPre((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAfter = (id: string) => {
    setCheckedAfter((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAll = () => {
    setCheckedPre({});
    setCheckedAfter({});
  };

  return (
    <div className="bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blush-light text-blush-dark rounded-full text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Sculpt Safety & Longevity</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal tracking-wide">
            Pre & Aftercare Guidelines
          </h1>
          <p className="text-sm sm:text-base text-charcoal-light leading-relaxed max-w-2xl mx-auto font-light">
            Great brows don't end in the studio. The difference between brows that last 2 weeks and brows that last 6 weeks? This page.
          </p>
        </div>

        {/* Master reset indicator */}
        {(Object.values(checkedPre).some(Boolean) || Object.values(checkedAfter).some(Boolean)) && (
          <div className="flex justify-center">
            <button 
              id="reset-checklists-btn"
              onClick={resetAll}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-cream hover:bg-cream-dark text-xs font-semibold text-sage border border-sage-light/35 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Reset My Interactive Checklists</span>
            </button>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* pre-care column */}
          <div className="space-y-8 bg-cream-light p-6 sm:p-8 rounded-sm border border-cream-dark/50 shadow-xs">
            <div className="border-b border-cream-dark pb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#CFA39F]">Before Your Session</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal mt-1">
                Brow Lamination Pre-Care
              </h2>
              <p className="text-xs text-charcoal-light mt-1">Make sure you complete these steps to prepare your skin and hair follicles.</p>
            </div>

            <div className="space-y-6">
              {PRE_CARE_STEPS.map((step) => {
                const IconComponent = iconMap[step.iconName] || HelpCircle;
                const isCompleted = checkedPre[step.id] || false;
                
                return (
                  <button
                    key={step.id}
                    id={`pre-step-btn-${step.id}`}
                    onClick={() => togglePre(step.id)}
                    className={`w-full text-left p-5 rounded-xs border transition-all duration-300 flex items-start gap-4 cursor-pointer focus:outline-hidden ${
                      isCompleted 
                        ? 'bg-rose/5 border-rose/30 shadow-xs scale-98 md:scale-97' 
                        : 'bg-cream-light border-cream-dark/40 hover:border-blush-dark/50 hover:shadow-xs'
                    }`}
                  >
                    {/* Circle Checkbox indicator */}
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5.5 h-5.5 text-rose fill-rose/10 transition-transform duration-300 scale-110" />
                      ) : (
                        <div className="w-5.5 h-5.5 rounded-full border border-charcoal/30 hover:border-rose hover:bg-cream-dark/20 flex items-center justify-center text-xs font-serif font-semibold text-charcoal-light">
                          {step.stepNumber}
                        </div>
                      )}
                    </div>

                    {/* Icon indicator */}
                    <div className={`p-2 rounded-xs shrink-0 ${isCompleted ? 'bg-rose/10 text-rose' : 'bg-[#FAF0EE] text-[#CFA39F]'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Step Text */}
                    <div className="space-y-1">
                      <span className="block text-[11px] font-bold uppercase tracking-widest text-charcoal-light/60 font-sans">
                        Step {step.stepNumber}
                      </span>
                      <p className={`text-sm leading-relaxed ${isCompleted ? 'text-charcoal-light/50 line-through' : 'text-charcoal font-light'}`}>
                        {step.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* aftercare column */}
          <div className="space-y-8 bg-cream-light p-6 sm:p-8 rounded-sm border border-cream-dark/50 shadow-xs">
            <div className="border-b border-cream-dark pb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sage">Keep Them Stunning</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal mt-1">
                Brow Lamination Aftercare
              </h2>
              <p className="text-xs text-charcoal-light mt-1">Follow these daily habits to preserve your style and nourish the hair.</p>
            </div>

            <div className="space-y-6">
              {AFTER_CARE_STEPS.map((step) => {
                const IconComponent = iconMap[step.iconName] || HelpCircle;
                const isCompleted = checkedAfter[step.id] || false;

                return (
                  <button
                    key={step.id}
                    id={`after-step-btn-${step.id}`}
                    onClick={() => toggleAfter(step.id)}
                    className={`w-full text-left p-5 rounded-xs border transition-all duration-300 flex items-start gap-4 cursor-pointer focus:outline-hidden ${
                      isCompleted 
                        ? 'bg-rose/5 border-rose/30 shadow-xs scale-98 md:scale-97' 
                        : 'bg-cream-light border-cream-dark/40 hover:border-blush-dark/50 hover:shadow-xs'
                    }`}
                  >
                    {/* Circle Checkbox indicator */}
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5.5 h-5.5 text-rose fill-rose/10 transition-transform duration-300 scale-110" />
                      ) : (
                        <div className="w-5.5 h-5.5 rounded-full border border-charcoal/30 hover:border-rose hover:bg-cream-dark/20 flex items-center justify-center text-xs font-serif font-semibold text-charcoal-light">
                          {step.stepNumber}
                        </div>
                      )}
                    </div>

                    {/* Icon indicator */}
                    <div className={`p-2 rounded-xs shrink-0 ${isCompleted ? 'bg-rose/10 text-rose' : 'bg-[#FAF0EE] text-[#CFA39F]'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Step Text */}
                    <div className="space-y-1">
                      <span className="block text-[11px] font-bold uppercase tracking-widest text-charcoal-light/60 font-sans">
                        Step {step.stepNumber}
                      </span>
                      <p className={`text-sm leading-relaxed ${isCompleted ? 'text-charcoal-light/50 line-through' : 'text-charcoal font-light'}`}>
                        {step.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Why nourishing matters */}
        <div className="bg-[#FAF7F2] p-8 sm:p-12 border border-cream-dark/80 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <h3 className="font-serif text-2xl font-light text-charcoal flex items-center gap-2">
                <Heart className="w-5 h-5 text-blush-dark fill-blush/25 shrink-0" />
                <span>Why We Give You Complimentary Brow Oil</span>
              </h3>
              <p className="text-sm text-charcoal-light leading-relaxed font-light">
                Brow lamination is essentially a gentle perm for your brows, and just like physical head-hair, it needs continuous moisture and lipids to counteract dryness from the perm. Leticia provides a free nourishing oil syringe or roll-on with every single sculpt or lamination booking so you can replenish keratin stocks daily.
              </p>
            </div>
            <div className="md:col-span-4 bg-cream-light p-6 rounded-xs border border-cream-dark/60 text-center">
              <span className="block font-serif text-3xl font-semibold text-sage">6-8 Weeks</span>
              <span className="block text-[11px] font-sans uppercase tracking-widest font-bold text-[#CFA39F] mt-1">Average Lift Durability</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
