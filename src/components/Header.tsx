/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Header({ currentTab, setCurrentTab }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'first-visit', label: 'First Visit' },
    { id: 'about', label: 'About' },
    { id: 'care', label: 'Care' },
    { id: 'policies', label: 'Policies' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavItemClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
    // Scroll smoothly to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeClass = "text-rose font-semibold border-b border-rose pb-1 text-[11px] uppercase tracking-[0.2em]";
  const inactiveClass = "text-charcoal-light hover:text-rose transition-colors pb-1 text-[11px] uppercase tracking-[0.2em]";

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-rose-border/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-22">
          
          {/* Logo / Brand */}
          <button 
            id="header-logo-btn"
            onClick={() => handleNavItemClick('home')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
          >
            <div className="text-left font-serif text-2xl font-medium tracking-tight text-charcoal">
              The Brow <span className="text-rose italic font-light">Manor</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-[11px] tracking-[0.2em] uppercase">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavItemClick(item.id)}
                className={`cursor-pointer transition-all duration-300 ${
                  currentTab === item.id ? activeClass : inactiveClass
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Book Now Button Desktop */}
          <div className="hidden md:flex">
            <button
              id="desktop-book-btn"
              onClick={() => handleNavItemClick('book')}
              className="bg-rose text-cream px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-blush-dark cursor-pointer transform active:scale-95 transition-all"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-charcoal hover:text-sage transition-colors focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-cream-dark/50 bg-cream-light"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`mobile-nav-item-${item.id}`}
                  onClick={() => handleNavItemClick(item.id)}
                  className={`block w-full text-left py-3 px-4 rounded-md tracking-[0.1em] text-sm uppercase transition-colors ${
                    currentTab === item.id
                      ? "bg-rose-border/20 text-rose font-semibold border-l-4 border-rose"
                      : "text-charcoal-light hover:bg-cream-dark/30 hover:text-charcoal"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 px-4">
                <button
                  id="mobile-book-btn"
                  onClick={() => handleNavItemClick('book')}
                  className="w-full text-center py-3 bg-rose hover:bg-blush-dark text-cream text-xs uppercase tracking-[0.2em] font-semibold rounded-full shadow-md transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
