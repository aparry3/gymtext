export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  isPopular?: boolean;
}
