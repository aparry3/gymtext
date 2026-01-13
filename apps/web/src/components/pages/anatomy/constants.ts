import { NavItem, Testimonial, FaqItem, PricingPlan } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Plans', href: '#plans' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "I travel 3 weeks a month. The consistency of just getting a text in the morning removes all the friction. It's Anatomy quality, wherever I am.",
    author: "James T.",
    role: "Executive & Anatomy Member"
  },
  {
    id: 2,
    quote: "I love classes, but I needed structure for my lifting days. This fills that gap perfectly without needing another complicated app.",
    author: "Sarah L.",
    role: "Marketing Director"
  },
  {
    id: 3,
    quote: "Having a coach I can actually text for form checks is a game changer. It feels personal, not algorithmic.",
    author: "Michael R.",
    role: "Entrepreneur"
  }
];

export const FAQS: FaqItem[] = [
  {
    question: "Do I need an Anatomy membership?",
    answer: "No. While this service is designed to complement the Anatomy experience, it is available to anyone seeking premium, remote coaching via text."
  },
  {
    question: "Do I need to download an app?",
    answer: "Absolutely not. The entire experience happens via SMS. No logins, no loading screens, no friction."
  },
  {
    question: "How personalized is the programming?",
    answer: "Every workout is built by a human coach based on your initial consultation, goals, equipment access, and feedback. It adapts daily."
  },
  {
    question: "What if I travel or miss a day?",
    answer: "Just text us. We will adjust your schedule immediately. Traveling? We'll send a hotel room or bodyweight workout."
  },
  {
    question: "Can it work with my existing class schedule?",
    answer: "Yes. We can build a 'Strength Focus' track that programs around your HIIT, Yoga, or Pilates classes to ensure you don't overtrain."
  },
  {
    question: "How fast are responses?",
    answer: "Your coach responds within hours during business windows, and often much faster. We are here to support you 7 days a week."
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "GymText Coaching",
    price: "$149",
    period: "per month",
    features: [
      { text: "Daily Personalized Workouts", included: true },
      { text: "24/7 Text Access to Coach", included: true },
      { text: "Form Checks & Video Feedback", included: true },
      { text: "Travel & Equipment Adjustments", included: true },
      { text: "No App Required", included: true },
    ]
  },
  {
    name: "Anatomy Member Perk",
    price: "$99",
    period: "first month",
    isPopular: true,
    features: [
      { text: "Everything in Standard Coaching", included: true },
      { text: "Integrated with Class Schedule", included: true },
      { text: "Priority Onboarding", included: true },
      { text: "Exclusive Anatomy Events", included: true },
      { text: "Nutrition Guidelines", included: true },
    ]
  }
];
