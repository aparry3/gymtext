export interface TrainingProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  focusAreas: string[];
  image: string;
  imagePosition?: string; // CSS object-position value (e.g., 'left center', '20% 50%')
  cta: string;
  link?: string; // URL to navigate to when clicked
  comingSoon?: boolean; // Whether this program is disabled/coming soon
}

export interface Step {
  number: string;
  title: string;
  description: string;
}
