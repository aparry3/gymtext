import { Metadata } from 'next';
import IHGLandingPage from '@/components/pages/ihg/IHGLandingPage';
import './ihg.css';

export const metadata: Metadata = {
  title: 'IHG x GymText | Wellness Reimagined',
  description: 'EVEN Hotels and GymText partnership - AI-powered personal coaching in your hotel room.',
  openGraph: {
    title: 'IHG x GymText | Wellness Reimagined',
    description: 'EVEN Hotels and GymText partnership - AI-powered personal coaching in your hotel room.',
    type: 'website',
  },
};

export default function IHGPage() {
  return <IHGLandingPage />;
}
