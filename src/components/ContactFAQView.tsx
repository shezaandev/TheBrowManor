/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { 
  Phone, Mail, Instagram, Clock, MapPin, 
  ChevronDown, ChevronUp, HelpCircle, Send, Sparkles, AlertCircle 
} from 'lucide-react';
import { FAQS } from '../data';

export default function ContactFAQView() {
  const [openFaq, setOpenFaq] = useState<string | null>('faq-deposit');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    try {
      await emailjs.send(
        'service_gi2b928',
        'template_fmy0f5y',
        {
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone ?? 'Not provided',
          message: formData.message,
        },
        'xs287kRgirxEW_Dcz'
      );
    } catch (error) {
      console.error('EmailJS enquiry error:', error);
    }

    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  };

  return (
    <div className="bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blush-light text-blush-dark rounded-full text-xs font-semibold tracking-wider uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>Salon Concierge</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal tracking-wide">
            Contact & Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-charcoal-light leading-relaxed max-w-2xl mx-auto font-light font-sans">
            No automated bots, no call centres. Just Leticia, answering your message herself. Have a question before you book? Reach out below and she'll get back to you personally.
          </p>
        </div>

        {/* Contact Info & Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Salon details & Hours */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-cream-light p-8 rounded-sm border border-cream-dark/50 shadow-xs space-y-6">
              <h3 className="font-serif text-2xl font-light text-charcoal border-b border-cream-dark/50 pb-3">
                The Brow Manor
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-sage shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-rose font-sans">Location</h4>
                    <span className="text-sm text-charcoal mt-1 block font-semibold text-left">
                      Level One, Suite 5/5 Discovery Dr, North Lakes QLD 4509
                    </span>
                    <p className="text-xs text-charcoal-light italic mt-0.5">Main studio. Thursday – Saturday 8am–8pm.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-sage shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#CFA39F] id-phone font-sans">Call or Text</h4>
                    <a href="tel:+61416423758" className="text-sm text-charcoal font-semibold mt-1 block hover:text-sage transition-colors">
                      +61 416 423 758
                    </a>
                    <p className="text-xs text-charcoal-light italic">Direct lines to Leticia East</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-sage shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#CFA39F] font-sans">Email</h4>
                    <a href="mailto:leticiaeast04@gmail.com" className="text-sm text-charcoal font-semibold mt-1 block hover:text-sage transition-colors break-all">
                      leticiaeast04@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-cream-dark/40 pt-5">
                  <Clock className="w-5 h-5 text-sage shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#CFA39F] font-sans">Opening Hours</h4>
                    <ul className="text-xs sm:text-sm text-charcoal-light space-y-1 mt-1 font-sans">
                      <li className="flex justify-between"><span>Mon – Wed:</span> <span className="font-semibold text-charcoal/60">By Request</span></li>
                      <li className="flex justify-between"><span>Thu – Sat:</span> <span className="text-charcoal font-semibold">8:00am – 8:00pm</span></li>
                      <li className="flex justify-between"><span>Sunday:</span> <span className="font-semibold text-charcoal/60">By Request</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick instagram mention */}
            <div className="bg-[#FAF1EF] border border-[#F5EAE8] p-6 rounded-sm text-center space-y-3">
              <Instagram className="w-6 h-6 text-blush-dark mx-auto" />
              <h4 className="font-serif text-charcoal font-semibold">DMs Always Open</h4>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Leticia's DMs are always open. Follow along for the latest Manor transformations, live availability, and brow inspiration — or simply reach out for a chat at{' '}
                <a 
                  href="https://www.instagram.com/thebrowmanorr/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-rose font-bold"
                >
                  @thebrowmanorr
                </a>
                .
              </p>
            </div>
          </div>

          {/* Column 2: Studio locations block and Quick Form */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif text-xl sm:text-2xl font-light text-charcoal tracking-wide flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sage-light" />
                <span>Our Studio Locations</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location 1: North Lakes Main Studio */}
                <div className="space-y-3 bg-cream-light p-5 rounded-sm border border-cream-dark/50">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-sage font-sans text-left">North Lakes — Main Studio</h4>
                  <div className="relative w-full h-[220px] rounded-sm overflow-hidden border border-cream-dark shadow-3xs bg-cream-dark/20">
                    <iframe
                      title="The Brow Manor location map at North Lakes"
                      id="google-maps-embed-iframe"
                      src="https://maps.google.com/maps?q=Suite%205,%205%20Discovery%20Dr,%2520North%2520Lakes%2520QLD%25204509,%2520Australia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="grayscale-20 opacity-90"
                    />
                  </div>
                  <p className="text-xs text-charcoal-light leading-relaxed text-left">Level One, Suite 5/5 Discovery Dr, North Lakes QLD 4509 · Thursday–Saturday 8am–8pm</p>
                  <a
                    href="https://maps.google.com/?q=Suite%205,%205%20Discovery%20Dr,%20North%20Lakes%20QLD%204509"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-rose hover:text-blush-dark transition-all pt-2"
                  >
                    Get Directions →
                  </a>
                </div>

                {/* Location 2: Bongaree - Bribie Island By Request */}
                <div className="space-y-4 bg-cream-light p-5 rounded-sm border border-cream-dark/50 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-sage font-sans text-left">Bongaree — By Request Only</h4>
                    <span className="text-xs font-semibold text-rose block text-left">📍 By request only</span>
                    <p className="text-xs text-charcoal-light leading-relaxed text-left font-sans">
                      Bongaree appointments are available by personal request only — no online booking. Please reach out to Leticia directly via Instagram DM or email and she will be delighted to arrange your visit.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col gap-2">
                    <a 
                      href="https://www.instagram.com/thebrowmanorr/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-white bg-sage hover:bg-sage/90 py-2.5 rounded-full transition-all text-center cursor-pointer"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Instagram DM</span>
                    </a>
                    <a 
                      href="mailto:leticiaeast04@gmail.com" 
                      className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-sage bg-transparent border border-sage/40 hover:border-sage py-2.5 rounded-full transition-all text-center cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email Inquiry</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick contact form */}
            <div className="bg-cream-light p-6 sm:p-8 rounded-sm border border-cream-dark/50 shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-light text-charcoal">
                  Send Leticia a Message
                </h3>
                <p className="text-xs text-charcoal-light">Submit your details below and Leticia shall correspond with you within twenty-four business hours.</p>
              </div>

              {isSubmitted ? (
                <div className="bg-sage-pale/60 border border-sage/35 p-6 rounded-xs space-y-3 text-center">
                  <Sparkles className="w-8 h-8 text-sage mx-auto" />
                  <h4 className="font-serif text-sage-dark font-semibold text-lg">Thank You, Sweetheart!</h4>
                  <p className="text-xs text-charcoal-light max-w-sm mx-auto leading-relaxed">
                    Your inquiry has been logged successfully. Leticia will review your request and call, text, or email you back shortly.
                  </p>
                  <button 
                    id="submit-another-msg-btn"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 text-xs font-semibold text-sage hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form id="contact-salon-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="form-name">
                        Your Full Name *
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Sarah Smith"
                        className="w-full bg-cream border border-cream-dark/80 focus:border-sage px-4 py-2.5 rounded-xs text-sm focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="form-email">
                        Your Email Address *
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. sarah@example.com"
                        className="w-full bg-cream border border-cream-dark/80 focus:border-sage px-4 py-2.5 rounded-xs text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="form-phone">
                        Phone Number
                      </label>
                      <input
                        id="form-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 0412 345 678"
                        className="w-full bg-cream border border-cream-dark/80 focus:border-sage px-4 py-2.5 rounded-xs text-sm focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="form-subject">
                        Subject
                      </label>
                      <select
                        id="form-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full bg-cream border border-cream-dark/80 focus:border-sage px-4 py-2.5 rounded-xs text-sm focus:outline-hidden"
                      >
                        <option>General Inquiry</option>
                        <option>Lamination Question</option>
                        <option>Rescheduling Help</option>
                        <option>Custom Bridal Styling</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal" htmlFor="form-message">
                      Your Message *
                    </label>
                    <textarea
                      id="form-message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Hi Leticia! I had a quick question regarding..."
                      className="w-full bg-cream border border-cream-dark/80 focus:border-sage px-4 py-2.5 rounded-xs text-sm focus:outline-hidden"
                    />
                  </div>

                  <button
                    id="submit-contact-form-btn"
                    type="submit"
                    className="w-full py-3 bg-sage hover:bg-sage-dark text-cream text-xs uppercase tracking-widest font-semibold rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Accordions FAQ Block */}
        <div className="space-y-10 pt-10 border-t border-cream-dark/50">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-rose block">FAQ</span>
            <h2 className="font-serif text-3xl font-light text-charcoal">Frequently Asked Questions</h2>
            <p className="text-xs text-charcoal-light max-w-md mx-auto">Every query deserves a considered answer. Please find The Manor&apos;s most common questions below.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  id={`faq-panel-${faq.id}`}
                  className="bg-cream-light rounded-sm border border-cream-dark/50 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    id={`faq-toggle-btn-${faq.id}`}
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-cream/40 transition-colors cursor-pointer focus:outline-hidden"
                  >
                    <span className="font-serif font-medium text-charcoal text-md sm:text-lg">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-sage shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-sage-light shrink-0" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-charcoal-light border-t border-cream-dark/30 bg-[#FAF7F2]/40 font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
