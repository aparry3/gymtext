'use client';

import { Music, PlayCircle } from 'lucide-react';

interface TrackOfDayCardProps {
  title?: string;
  subtitle?: string;
  spotifyUrl?: string;
  isLoading?: boolean;
}

// Default playlist info
const DEFAULT_TRACK = {
  title: 'GymText Curated',
  subtitle: 'High Energy Mix Vol. 4',
  spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP', // Beast Mode playlist
};

export function TrackOfDayCard({
  title = DEFAULT_TRACK.title,
  subtitle = DEFAULT_TRACK.subtitle,
  spotifyUrl = DEFAULT_TRACK.spotifyUrl,
  isLoading = false,
}: TrackOfDayCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl p-5 bg-gradient-to-br from-green-600 to-emerald-700 text-white animate-pulse shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-white/20 rounded-full" />
            <div className="h-3 w-24 bg-white/20 rounded" />
          </div>
          <div className="h-5 w-32 bg-white/20 rounded" />
          <div className="h-4 w-40 bg-white/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="relative rounded-xl p-5 bg-gradient-to-br from-green-600 to-emerald-700 text-white hover:from-green-500 hover:to-emerald-600 transition-colors cursor-pointer shadow-lg overflow-hidden">
        {/* Music icon watermark */}
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Music className="w-10 h-10" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
              <PlayCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-green-100">Track of the Day</span>
          </div>
          <h4 className="text-lg font-bold">{title}</h4>
          <p className="text-sm text-green-100 opacity-90">{subtitle}</p>
        </div>
      </div>
    </a>
  );
}
