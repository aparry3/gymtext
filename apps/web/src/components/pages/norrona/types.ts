export interface TrainingProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  focusAreas: string[];
  image: string;
  imagePosition?: string; // CSS object-position value (e.g., 'left center', '20% 50%')
  cta: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}
