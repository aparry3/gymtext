'use client';

import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface TrackOfDayCardProps {
  title?: string;
  subtitle?: string;
  spotifyUrl?: string;
  isLoading?: boolean;
}

// Default playlist info
const DEFAULT_TRACK = {
  title: 'Track of the Day',
  subtitle: 'GymText Curated Playlist',
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
      <Card className="p-4 bg-[hsl(143,85%,42%)] text-white animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/20 rounded" />
            <div className="h-3 w-32 bg-white/20 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="p-4 bg-[hsl(143,85%,42%)] text-white hover:bg-[hsl(143,85%,38%)] transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm opacity-80">{subtitle}</p>
          </div>
        </div>
      </Card>
    </a>
  );
}
