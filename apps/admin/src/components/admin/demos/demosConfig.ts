import { Demo, DemoCategory, DemoTag } from './types';

export const DEMO_BASE_URL =
  process.env.NEXT_PUBLIC_WEB_BASE_URL || 'https://gymtext.co';

export function getDemoUrl(slug: string): string {
  return `${DEMO_BASE_URL}/${slug}`;
}

export const CATEGORY_CONFIG: Record<
  DemoCategory,
  { label: string; color: string }
> = {
  hospitality: { label: 'Hospitality', color: 'bg-blue-100 text-blue-800' },
  outdoor: { label: 'Outdoor', color: 'bg-green-100 text-green-800' },
  retail: { label: 'Retail', color: 'bg-purple-100 text-purple-800' },
  corporate: { label: 'Corporate', color: 'bg-amber-100 text-amber-800' },
  fitness: { label: 'Fitness', color: 'bg-rose-100 text-rose-800' },
};

export const TAG_CONFIG: Record<DemoTag, { label: string }> = {
  hotel: { label: 'Hotel' },
  skiing: { label: 'Skiing' },
  hiking: { label: 'Hiking' },
  wellness: { label: 'Wellness' },
  travel: { label: 'Travel' },
  'outdoor-apparel': { label: 'Outdoor Apparel' },
  'in-room-fitness': { label: 'In-Room Fitness' },
  partnership: { label: 'Partnership' },
  b2b: { label: 'B2B' },
};

export const DEMOS: Demo[] = [
  {
    id: 'norrona',
    title: 'Norrona',
    subtitle: 'Train for the Mountains',
    description:
      'Professional ski and hiking coaching delivered directly to your messages.',
    slug: 'norrona',
    category: 'outdoor',
    tags: ['skiing', 'hiking', 'outdoor-apparel', 'partnership'],
    status: 'active',
    brandColor: '#1a1a1a',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'ihg',
    title: 'IHG / EVEN Hotels',
    subtitle: 'Wellness Reimagined',
    description: 'AI-powered personal coaching in your hotel room.',
    slug: 'ihg',
    category: 'hospitality',
    tags: ['hotel', 'wellness', 'travel', 'in-room-fitness', 'partnership', 'b2b'],
    status: 'active',
    brandColor: '#006633',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
];

export function getActiveCategories(): DemoCategory[] {
  const categories = new Set(DEMOS.map((d) => d.category));
  return Array.from(categories);
}

export function getActiveTags(): DemoTag[] {
  const tags = new Set(DEMOS.flatMap((d) => d.tags));
  return Array.from(tags);
}
