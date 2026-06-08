/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: 'core' | 'addon' | 'signature' | 'lash';
  popular?: boolean;
  bookable?: boolean; // undefined or true = bookable, false = coming soon
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number; // e.g., 5
  service?: string; // service they received
  date?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface CareStep {
  id: string;
  stepNumber: number;
  text: string;
  iconName: string; // Key of LucideIcon
}

export interface Policy {
  id: string;
  title: string;
  description: string;
}

export interface Booking {
  serviceId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface AvailabilitySettings {
  openDays: number[];
  timeSlots: string[];
  bufferMinutes: number;
  maxBookingsPerSlot: number;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
  blockedSlots: string[];
  createdAt?: any;
}

