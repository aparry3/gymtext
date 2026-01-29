'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const heroImages = [
  {
    url: "https://res.cloudinary.com/norrona/image/upload/x_4225,y_3514,w_8449,h_4753,c_crop,g_xy_center/b_rgb:fcfcfc/c_pad,f_auto,d_imgmissing.jpg,fl_progressive.lossy,q_auto,w_3200/Auto%2FFW2324-senja-Nordmarka-DSC02177-updated.jpg",
    alt: "Trail running in the mountains"
  },
  {
    url: "https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=2626&auto=format&fit=crop",
    alt: "Ski touring in the mountains"
  },
  {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop",
    alt: "Hiking in the mountains"
  }
];

export const NorronaHero: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-norr-black">
      {/* Background Images with Fade */}
      {heroImages.map((img, index) => (
        <div
          key={img.url}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.alt}
            className="h-full w-full object-cover object-center grayscale-[20%] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex h-full flex-col justify-end pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6 text-white/90">
            <span className="uppercase tracking-[0.2em] text-xs md:text-sm font-semibold">Norrøna</span>
            <span className="h-px w-8 bg-white/50"></span>
            <span className="uppercase tracking-[0.2em] text-xs md:text-sm font-semibold">Gymtext</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8">
            TRAIN FOR <br/>
            THE MOUNTAINS.
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 font-light max-w-xl mb-10 leading-relaxed">
            One text at a time. Professional running, ski, boarding, and hiking coaching delivered directly to your messages.
          </p>

          <a
            href="#programs"
            className="inline-block bg-white text-black px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-gray-200 transition-colors duration-300"
          >
            Choose Your Training
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};
