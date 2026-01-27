import React from 'react';
import { NorronaProgramCard } from './NorronaProgramCard';
import { TrainingProgram } from './types';

const programs: TrainingProgram[] = [
  {
    id: 'run',
    title: 'Running',
    subtitle: 'Trail & Mountain',
    description: 'Conquer any terrain with confidence. Build the strength, stability, and endurance needed for trail running and mountain adventures.',
    focusAreas: ['Cardio Endurance', 'Leg Power', 'Ankle Stability', 'Hill Training', 'Recovery'],
    image: 'https://res.cloudinary.com/norrona/image/upload/x_4225,y_3514,w_8449,h_4753,c_crop,g_xy_center/b_rgb:fcfcfc/c_pad,f_auto,d_imgmissing.jpg,fl_progressive.lossy,q_auto,w_3200/Auto%2FFW2324-senja-Nordmarka-DSC02177-updated.jpg',
    imagePosition: 'left center',
    cta: 'Start Running Program'
  },
  {
    id: 'ski',
    title: 'Ski/Snowboard',
    subtitle: 'Downhill & Backcountry',
    description: 'Prepare your body for the demands of the slopes. This program focuses on explosive power, stability, and injury prevention to keep you on the snow longer.',
    focusAreas: ['Leg Strength', 'Core Stability', 'Balance', 'Injury Prevention', 'Endurance'],
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format&fit=crop',
    cta: 'Start Ski/Snowboard Program'
  },
  {
    id: 'hike',
    title: 'Hiking',
    subtitle: 'Endurance & Elevation',
    description: 'Built for long days on the trail. Build the resilience needed for elevation gain, heavy packs, and multi-day treks.',
    focusAreas: ['Joint Resilience', 'Leg Endurance', 'Pack Carry', 'Recovery', 'Cardio Base'],
    image: 'https://res.cloudinary.com/norrona/image/upload/x_3303,y_2009,w_3960,h_2227,c_crop,g_xy_center/b_rgb:fcfcfc/c_pad,f_auto,d_imgmissing.jpg,fl_progressive.lossy,q_auto,w_3200/Auto%2FEvent-Series-MorganBodet-MB_02495.jpg',
    cta: 'Start Hiking Program'
  }
];

export const NorronaPrograms: React.FC = () => {
  return (
    <section id="programs" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">Training Collections</h2>
        <div className="h-1 w-24 bg-black"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
        {programs.map(program => (
          <NorronaProgramCard key={program.id} program={program} />
        ))}
      </div>
    </section>
  );
};
