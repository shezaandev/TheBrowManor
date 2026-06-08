/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, Mail, Instagram, Clock, Sparkles, MapPin } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-charcoal text-cream pt-16 pb-8 border-t border-rose-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-rose-border/10">
          
          {/* Logo & Intro Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-rose">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="text-left font-serif text-lg font-medium tracking-tight text-white">
                The Brow <span className="text-rose italic font-light">Manor</span>
              </div>
            </div>
            
            <p className="text-sm font-sans text-cream-dark/80 leading-relaxed max-w-xs">
              A luxury brow studio serving North Lakes and Bongaree, QLD. Leticia East delivers precision brow artistry in an elevated, unhurried environment — where every client is the only client.
            </p>
          </div>

          {/* Quick Links Col */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-rose font-semibold mb-5">
              Explore Studio
            </h3>
            <ul className="space-y-2.5 text-sm text-cream-dark/90 text-left">
              <li>
                <button 
                  onClick={() => handleNavClick('home')}
                  className="hover:text-rose transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('services')}
                  className="hover:text-rose transition-colors cursor-pointer text-left"
                >
                  Services & Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('gallery')}
                  className="hover:text-rose transition-colors cursor-pointer text-left"
                >
                  Gallery Showcase
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('first-visit')}
                  className="hover:text-rose transition-colors cursor-pointer text-left"
                >
                  First Visit Guide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('about')}
                  className="hover:text-rose transition-colors cursor-pointer text-left"
                >
                  About Leticia
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('care')}
                  className="hover:text-rose transition-colors cursor-pointer text-left"
                >
                  Pre & Aftercare
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('policies')}
                  className="hover:text-rose transition-colors cursor-pointer text-left"
                >
                  Salon Policies
                </button>
              </li>
            </ul>
          </div>

          {/* Hours Col */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-rose font-semibold mb-5">
              Opening Hours
            </h3>
            <div className="space-y-3 text-sm text-cream-dark/90 text-left">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-rose shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-cream">Thursday – Saturday</p>
                  <p className="text-xs text-cream-dark/75 mt-0.5">8:00am – 8:00pm</p>
                </div>
              </div>
              <div className="text-xs text-cream-dark/50 italic border-t border-rose-border/15 pt-2 max-w-[200px]">
                Other days available upon request.<br />
                Bongaree by request only.
              </div>
            </div>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-rose font-semibold mb-5">
              Connect
            </h3>
            <ul className="space-y-3.5 text-sm text-cream-dark/90 text-left col-span-1">
              <li>
                <a 
                  href="tel:+61416423758" 
                  className="flex items-center gap-2.5 hover:text-rose transition-colors"
                >
                  <Phone className="w-4 h-4 text-rose" />
                  <span>+61 416 423 758</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:leticiaeast04@gmail.com" 
                  className="flex items-center gap-2.5 hover:text-rose transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-rose" />
                  <span>leticiaeast04@gmail.com</span>
                </a>
              </li>
              <li className="space-y-2 text-cream-dark/95">
                <div className="flex items-start gap-2.5 pb-1">
                  <MapPin className="w-4 h-4 text-rose shrink-0 mt-0.5" />
                  <span>📍 North Lakes QLD 4509 — Main Studio</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-cream-dark/70 pl-6.5">
                  <span>📍 Bongaree, Bribie Island — By Request Only</span>
                </div>
              </li>
              <li className="pt-2">
                <a 
                  href="https://www.instagram.com/thebrowmanorr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-cream bg-rose hover:bg-blush-dark px-4 py-2.5 rounded-full transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@thebrowmanorr</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-cream-dark/60 gap-4">
          <p>© 2026 The Brow Manor. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => handleNavClick('policies')} className="hover:underline">Studio Policy</button>
            <button onClick={() => handleNavClick('care')} className="hover:underline">Care Steps</button>
            <span>Operated by Leticia East</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
