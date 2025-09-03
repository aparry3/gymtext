/**
 * Domain model for Mesocycle
 * Represents a training phase within a fitness plan
 */
export class Mesocycle {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly fitnessPlanId: string,
    public readonly phase: string,
    public readonly cycleOffset: number,
    public readonly lengthWeeks: number,
    public readonly startDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Get the end date of the mesocycle
   */
  getEndDate(): Date {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + (this.lengthWeeks * 7));
    return endDate;
  }

  /**
   * Check if the mesocycle is currently active
   */
  isActive(currentDate: Date = new Date()): boolean {
    return currentDate >= this.startDate && currentDate < this.getEndDate();
  }

  /**
   * Get the current week number (1-based)
   */
  getCurrentWeek(currentDate: Date = new Date()): number | null {
    if (!this.isActive(currentDate)) {
      return null;
    }

    const daysSinceStart = Math.floor((currentDate.getTime() - this.startDate.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.floor(daysSinceStart / 7) + 1;
    
    return Math.min(currentWeek, this.lengthWeeks);
  }

  /**
   * Get progress percentage
   */
  getProgress(currentDate: Date = new Date()): number {
    const currentWeek = this.getCurrentWeek(currentDate);
    if (!currentWeek) return 0;
    
    return (currentWeek / this.lengthWeeks) * 100;
  }
}

/**
 * Interface for creating a new mesocycle
 */
export interface CreateMesocycleInput {
  clientId: string;
  fitnessPlanId: string;
  phase: string;
  cycleOffset: number;
  lengthWeeks: number;
  startDate: Date;
}