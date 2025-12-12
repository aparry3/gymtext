'use client';

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
      <div className="rounded-2xl p-4 bg-[#1DB954] text-white animate-pulse shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white/20 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/20 rounded" />
            <div className="h-3 w-32 bg-white/20 rounded" />
          </div>
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
      <div className="rounded-2xl p-4 bg-[#1DB954] text-white hover:bg-[#1aa34a] transition-colors cursor-pointer shadow-lg">
        <div className="flex items-center gap-3">
          <img
            src="/spotify-logo-white.svg"
            alt="Spotify"
            className="h-8 w-8"
          />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm opacity-80">{subtitle}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
