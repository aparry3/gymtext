export interface TrainingProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  focusAreas: string[];
  image: string;
  cta: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}
