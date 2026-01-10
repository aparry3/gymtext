export type DemoCategory = 'hospitality' | 'outdoor' | 'retail' | 'corporate' | 'fitness';

export type DemoTag =
  | 'hotel'
  | 'skiing'
  | 'hiking'
  | 'wellness'
  | 'travel'
  | 'outdoor-apparel'
  | 'in-room-fitness'
  | 'partnership'
  | 'b2b';

export type DemoStatus = 'active' | 'draft' | 'archived';

export interface Demo {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  slug: string;
  category: DemoCategory;
  tags: DemoTag[];
  status: DemoStatus;
  brandColor?: string;
  createdAt: string;
}

export interface DemoFilters {
  search?: string;
  category?: DemoCategory;
  tags?: DemoTag[];
}
