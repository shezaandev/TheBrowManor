/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Testimonial, FAQ, CareStep, Policy } from './types';

// Image paths
export const IMAGES = {
  hero: '/src/assets/images/brow-hero.jpg',
  studio: '/src/assets/images/brow-studio.jpg',
  leticia: '/src/assets/images/leticia-profile.jpg',
  lamination: '/src/assets/images/brow-lamination.jpg',
  dyeSculpt: '/src/assets/images/brow-dye-sculpt.jpg',
  cozyStudio: '/src/assets/images/cozy-studio.jpg',
  eyeMask: '/src/assets/images/brow-eye-mask.jpg',
  beforeLamination: '/src/assets/images/before-lamination.jpg',
  beforeSculpt: '/src/assets/images/before-sculpt.jpg',
  secondary: '/src/assets/images/brow-secondary.jpg',
};

// Services Data
export const SERVICES: Service[] = [

  // BROW ARTISTRY — category: core
  {
    id: 'classy-sculpt',
    name: 'Classy Sculpt',
    description: 'A refined introduction to the Manor\'s brow artistry. Your brows are thoughtfully mapped, delicately waxed, and sculpted into a silhouette of quiet elegance — as though they were always meant to frame your face in exactly this way. Timeless. Poised. Entirely yours.',
    price: 35,
    duration: '30 min',
    category: 'core',
    popular: false,
    bookable: true,
  },
  {
    id: 'signature-sculpt',
    name: 'Signature Sculpt',
    description: 'The Manor\'s most beloved treatment. Your brows are mapped with Leticia\'s signature precision, waxed with care, and finished with a bespoke tint or dye selected to complement your natural colouring. You will leave looking as though beauty has always come this effortlessly to you.',
    price: 55,
    duration: '50 min',
    category: 'core',
    popular: true,
    bookable: true,
  },
  {
    id: 'bare-lami',
    name: 'Bare Lami',
    description: 'For those who desire the quiet drama of beautifully lifted brows without the tint. Each hair is carefully repositioned, lifted, and set into a feathered, flowing silhouette that speaks of natural elegance. Paired with a delicate sculpt and wax — the result is brows that appear to have always been this perfect. Results last 6–8 weeks.',
    price: 75,
    duration: '1 hr 10 min',
    category: 'core',
    popular: false,
    bookable: true,
  },
  {
    id: 'full-face-lami',
    name: 'Full Face Lami',
    description: 'The Manor\'s most transformative brow experience. Each hair is lifted into a soft, feathered arrangement and set with intention — then paired with a signature sculpt, delicate wax, and a bespoke tint or dye. You will leave The Manor with arches so gracefully defined, so timelessly refined, that you will wonder how you ever went without. Results last 6–8 weeks.',
    price: 95,
    duration: '1 hr 20 min',
    category: 'core',
    popular: true,
    bookable: true,
  },

  // THE SIGNATURE EXPERIENCE — category: signature
  {
    id: 'divine-duo',
    name: 'Divine Duo',
    description: 'A most distinguished pairing. The Signature Sculpt and Luscious Lift are united in one unhurried session — crafted for the discerning client who refuses to choose between perfectly sculpted brows and beautifully lifted lashes. Leave The Manor wholly refined, every feature considered, every detail attended to with devotion.',
    price: 105,
    duration: '1 hr 30 min',
    category: 'signature',
    popular: true,
    bookable: true,
  },
  {
    id: 'angel-face',
    name: 'Angel Face',
    description: 'Reserved for those who wish to be utterly transformed. The Full Face Lami is paired with the Luscious Lift in The Manor\'s most indulgent offering — a complete elevation of brow and lash in one deeply luxurious session. This is not merely a treatment. This is an experience. And you deserve every moment of it.',
    price: 135,
    duration: '2 hr',
    category: 'signature',
    popular: false,
    bookable: true,
  },

  // LASH ENHANCEMENTS — category: lash, bookable: false (coming soon)
  {
    id: 'soft-lift',
    name: 'Soft Lift',
    description: 'A gentle awakening for your natural lashes. The Soft Lift coaxes each lash into a graceful, upward curl — subtle yet striking, like the quiet confidence of a woman who requires no introduction. Your eyes will appear wider, brighter, and altogether more captivating. Coming soon to The Manor.',
    price: 40,
    duration: '45 min',
    category: 'lash',
    popular: false,
    bookable: false,
  },
  {
    id: 'luscious-lift',
    name: 'Luscious Lift',
    description: 'An ethereal lash experience unlike any other. Your natural lashes are lifted into a beautifully dramatic curl and deepened with a bespoke tint — leaving you with a gaze so captivating, so richly defined, that mascara shall never be required again. Coming soon to The Manor.',
    price: 65,
    duration: '1 hr',
    category: 'lash',
    popular: false,
    bookable: false,
  },

  // LUXURY INDULGENCES — category: addon
  {
    id: 'addon-eye-mask',
    name: 'Under-Eye Mask',
    description: 'A deeply restorative collagen treatment for the delicate skin beneath your eyes. Cool, soothing, and quietly indulgent — it de-puffs, brightens, and restores a luminous, well-rested elegance to your complexion while Leticia perfects your brows above.',
    price: 18,
    duration: '20 min',
    category: 'addon',
  },
  {
    id: 'addon-lip-mask',
    name: 'Lip Mask',
    description: 'A moment of pure softness. This cooling collagen lip mask plumps, hydrates, and nourishes your lips into silken submission — a quiet luxury that costs little but feels entirely extravagant.',
    price: 12,
    duration: '10 min',
    category: 'addon',
  },
  {
    id: 'addon-lip-wax',
    name: 'Upper Lip Wax',
    description: 'Precise. Swift. Immaculate. A gentle warm wax removal of upper lip hair using premium organic hypoallergenic wax — because the finest details are always worth attending to.',
    price: 7,
    duration: '5 min',
    category: 'addon',
  },
  {
    id: 'addon-hydro-brow-mask',
    name: 'Hydro-Jelly Brow Mask',
    description: 'The perfect finale to your Manor treatment. A luxurious hydro-jelly mask is applied to the brow area — cooling the skin, calming any sensitivity, and sealing in the results of your session with a final flourish of indulgence. Leave feeling not just beautiful, but thoroughly pampered.',
    price: 14,
    duration: '10 min',
    category: 'addon',
  },
];

// Testimonials Data
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Charlotte Thompson',
    content: 'Leticia is an absolute brow magician! The Brow Manor is so peaceful, warm, and beautifully clean. My brows have never looked so full or perfectly shaped. I got the full Brow Lamination & Dye and I am completely obsessed!',
    rating: 5,
    service: 'Full Face Lami',
    date: 'May 2026',
  },
  {
    id: 't2',
    name: 'Annie Pastars',
    content: 'Cannot recommend The Brow Manor enough. Leticia takes so much care, her attention to detail is unmatched. It feels like a high-end luxury spa retreat, and the deposit system makes securing a slot simple. The pre and aftercare advice has kept my lamination looking perfect for weeks.',
    rating: 5,
    service: 'Bare Lami',
    date: 'April 2026',
  },
  {
    id: 't3',
    name: 'Wendy Whitfield',
    content: 'What a beautiful boutique experience. Leticia is so friendly and professional, and she really listens to what you want. The tension-release scalp massage and under-eye luxury mask during my brow wax were absolute heaven!',
    rating: 5,
    service: 'Classy Sculpt + Luxury Indulgences',
    date: 'May 2026',
  },
];

// FAQs Data
export const FAQS: FAQ[] = [
  {
    id: 'faq-deposit',
    question: 'What is the A$20 deposit for, and is it refundable?',
    answer: 'A A$20 deposit is required to secure your booking. This deposit is non-refundable, but it is fully applied toward your final service price on the day of your appointment. If you cancel or reschedule at least 24 hours prior, your deposit can be rolled over to your next appointment.',
  },
  {
    id: 'faq-guests',
    question: 'Can I bring a friend, child, or pet with me?',
    answer: 'Because The Brow Manor is a boutique private studio styled for relaxation and with limited workspace, we kindly ask that you arrive to your appointment alone. If you have exceptional circumstances, please discuss this with Leticia directly before booking.',
  },
  {
    id: 'faq-early',
    question: 'How early should I arrive for my appointment?',
    answer: 'Please arrive exactly at your scheduled appointment time. Since we operate on back-to-back appointment schedules, arriving early may disrupt a client in session, while arriving more than 10 minutes late will result in the scheduled session being cancelled and forfeit of deposit.',
  },
  {
    id: 'faq-cancel',
    question: 'What happens if I need to cancel or rearrange?',
    answer: 'We require a minimum of 24 hours notice for any cancellations or reschedules. Doing so allows you to retain your A$20 deposit and apply it to a new date. Cancellations made inside the 24-hour window, or failure to attend (no-shows), will result in a forfeited deposit and potential booking restrictions.',
  },
  {
    id: 'faq-prepare',
    question: 'What do I need to do to prepare for my brow appointment?',
    answer: 'The most important steps are to ensure your brows are free of any makeup, oily creams, or powders on the day. Additionally, please avoid retinol creams, chemical exfoliants, and tanning products on your face for at least 72 hours prior. Review our full Pre & Aftercare guide for more details.',
  },
];

// Pre-care Steps
export const PRE_CARE_STEPS: CareStep[] = [
  {
    id: 'pre-1',
    stepNumber: 1,
    text: '24 hours before your appointment: Ensure your brow area is completely free of any face makeup, heavy moisturizers, oils, or powders. Clean skin ensures the wax adheres properly and tint infuses beautifully.',
    iconName: 'Sparkles',
  },
  {
    id: 'pre-2',
    stepNumber: 2,
    text: '72 hours before your appointment: Avoid applying self-tanner, retinol/Vitamin A, BHAs, or AHAs near the brow and forehead area, as these products sensitize the skin and can cause irritation or lift during waxing.',
    iconName: 'ShieldAlert',
  },
  {
    id: 'pre-3',
    stepNumber: 3,
    text: 'For optimal results: Avoid plucking, waxing, trimming, threading, or colouring your eyebrows for at least 6 weeks prior to your appointment. Let the natural hair grow so Leticia can sculpt the fullest possible shape.',
    iconName: 'CalendarRange',
  },
];

// Aftercare Steps
export const AFTER_CARE_STEPS: CareStep[] = [
  {
    id: 'after-1',
    stepNumber: 1,
    text: 'Avoid water, steam, heavy sweating, hot baths, and saunas for the first 24 hours. Moisture can disrupt the chemical bonds set during lamination and cause tint to fade prematurely.',
    iconName: 'Droplets',
  },
  {
    id: 'after-2',
    stepNumber: 2,
    text: 'Do not apply any brow serums, pencil/powder makeup, heavy oils, or foundation near the eyebrows for 24 hours to let the hair follicle settle and prevent irritation.',
    iconName: 'Ban',
  },
  {
    id: 'after-3',
    stepNumber: 3,
    text: 'Apply your complimentary brow nourishing oil or daily hydrating serum 1-2 times daily, starting 24 hours post-treatment. This maintains optimal hydration, shine, and hair health.',
    iconName: 'HeartPulse',
  },
  {
    id: 'after-4',
    stepNumber: 4,
    text: 'Avoid exfoliating facial cleansers, strong retinol serums, high-percentage vitamin C, or facial tanning products near the brow area for at least 72 hours post-session to prevent irritation or discolouration.',
    iconName: 'ZapOff',
  },
  {
    id: 'after-5',
    stepNumber: 5,
    text: 'Gently run a clean spoolie / brow brush through your brow hairs daily in an upward/outward motion to keep them set. Cleanse your face ultra-gently with non-oily wash and avoid rough rubbing.',
    iconName: 'Undo2',
  },
];

// Policy items
export const POLICY_ITEMS: Policy[] = [
  {
    id: 'p-deposit',
    title: '$20 Non-Refundable Deposit',
    description: 'To secure a booking slot with Leticia, a $20 deposit is required upon reservation. This deposit is non-refundable, but it applies fully as credit toward your completed treatments on the day.',
  },
  {
    id: 'p-timing',
    title: 'Punctuality & Late Policy',
    description: 'We respect your time and operate on a strict, prompt schedule. If you are more than 10 minutes late, your appointment will be automatically forfeited along with your deposit. We cannot run late as this directly cuts into the next client\'s boutique experience.',
  },
  {
    id: 'p-guests',
    title: 'Arrive Alone Policy',
    description: 'This is a dedicated private boutique room. Due to safe space constraints, safety regulations, and maintaining a peaceful sanctuary, guests, children, and pets are strictly not permitted. Please arrive alone.',
  },
  {
    id: 'p-cxl',
    title: '24-Hour Rescheduling',
    description: 'We require a minimum of 24 hours notice to cancel or reschedule appointments. If you give at least 24 hours notice, your $20 deposit can be happily rescheduled with you. Shorter notice or last-minute changes results in instant forfeiture.',
  },
  {
    id: 'p-noshow',
    title: 'No-Show Accountability',
    description: 'Failing to attend your appointment without any prior notice (no-show) automatically forfeits your deposit. In addition, you will be blocked from using our booking services in the future.',
  },
  {
    id: 'p-refunds',
    title: 'No Refunds Policy',
    description: 'We take custom precision and client care extremely seriously, spending custom craft, tailored high-end products, and dedicated time on your brows. As such, all treatments are non-refundable.',
  },
];
