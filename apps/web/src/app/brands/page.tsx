import { Metadata } from 'next';
import BrandsLandingPage from '@/components/pages/brands/BrandsLandingPage';
import './brands.css';

export const metadata: Metadata = {
  title: 'GymText for Brands | B2B Fitness Engagement Platform',
  description: 'White-labeled fitness coaching delivered via SMS. Partner with GymText to engage your customers with personalized workout programs.',
  openGraph: {
    title: 'GymText for Brands | B2B Fitness Engagement Platform',
    description: 'White-labeled fitness coaching delivered via SMS. Partner with GymText to engage your customers with personalized workout programs.',
    type: 'website',
  },
};

export default function BrandsPage() {
  return <BrandsLandingPage />;
}
