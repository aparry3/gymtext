/**
 * Cross-Activity Fitness Level Inference
 * 
 * This module provides utilities to infer general fitness levels and capabilities
 * from activity-specific experience and metrics.
 * 
 * As outlined in Phase 3.2 of the implementation approach:
 * - Marathon completion → intermediate+ endurance fitness
 * - Powerlifting experience → advanced strength training
 * - Weekly hiking → good cardiovascular base
 * - Ski racing background → advanced athletic performance
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import type { ActivityData, HikingData, RunningData, StrengthData, CyclingData, SkiingData, GeneralActivityData } from '../models/user/schemas';

// Individual activity data types
export type SingleActivityData = HikingData | RunningData | StrengthData | CyclingData | SkiingData | GeneralActivityData;

export interface FitnessInference {
  generalFitnessLevel: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite';
  enduranceLevel: 'low' | 'moderate' | 'good' | 'high' | 'elite';
  strengthLevel: 'low' | 'moderate' | 'good' | 'high' | 'elite';
  cardioLevel: 'low' | 'moderate' | 'good' | 'high' | 'elite';
  athleticPerformance: 'recreational' | 'competitive' | 'elite';
  confidence: number; // 0-1 confidence in inference
  reasoning: string[];
}

/**
 * Infer general fitness capabilities from activity data array
 */
export function inferFitnessFromActivity(activityData: ActivityData): FitnessInference {
  
  if (!activityData || !Array.isArray(activityData) || activityData.length === 0) {
    return {
      generalFitnessLevel: 'beginner',
      enduranceLevel: 'low',
      strengthLevel: 'low',
      cardioLevel: 'low',
      athleticPerformance: 'recreational',
      confidence: 0.1,
      reasoning: ['No activity data available']
    };
  }

  // Aggregate inferences from all activities
  const inferences = activityData.map(activity => inferFromSingleActivity(activity));
  
  // Combine inferences - take the highest levels across all activities
  return combineActivityInferences(inferences);
}

/**
 * Infer general fitness capabilities from a single activity data object
 */
export function inferFromSingleActivity(activityData: SingleActivityData): FitnessInference {
  
  if (!activityData || !activityData.type) {
    return {
      generalFitnessLevel: 'beginner',
      enduranceLevel: 'low',
      strengthLevel: 'low',
      cardioLevel: 'low',
      athleticPerformance: 'recreational',
      confidence: 0.1,
      reasoning: ['No activity data available']
    };
  }
  
  switch (activityData.type) {
    case 'running':
      return inferFromRunningData(activityData as any);
      
    case 'hiking':
      return inferFromHikingData(activityData as any);
      
    case 'strength':
      return inferFromStrengthData(activityData as any);
      
    case 'cycling':
      return inferFromCyclingData(activityData as any);
      
    case 'skiing':
      return inferFromSkiingData(activityData as any);
      
    default:
      return inferFromGeneralActivity(activityData as any);
  }
}

function inferFromRunningData(data: any): FitnessInference {
  const reasoning: string[] = [];
  let generalFitnessLevel: FitnessInference['generalFitnessLevel'] = 'beginner';
  let enduranceLevel: FitnessInference['enduranceLevel'] = 'low';
  let cardioLevel: FitnessInference['cardioLevel'] = 'moderate'; // Running always implies some cardio
  let athleticPerformance: FitnessInference['athleticPerformance'] = 'recreational';
  let confidence = 0.7;
  
  // Marathon completion inference
  if (data.keyMetrics?.racesCompleted && data.keyMetrics.racesCompleted > 0) {
    if (data.goals?.some((goal: string) => goal.toLowerCase().includes('marathon'))) {
      generalFitnessLevel = 'advanced';
      enduranceLevel = 'elite';
      cardioLevel = 'elite';
      athleticPerformance = 'competitive';
      confidence = 0.9;
      reasoning.push('Marathon completion indicates advanced endurance fitness');
    } else {
      generalFitnessLevel = 'intermediate';
      enduranceLevel = 'good';
      cardioLevel = 'good';
      reasoning.push('Race completion indicates good endurance base');
    }
  }
  
  // Weekly mileage inference
  if (data.keyMetrics?.weeklyMileage) {
    const miles = typeof data.keyMetrics.weeklyMileage === 'number' ? data.keyMetrics.weeklyMileage : 0;
    if (miles >= 40) {
      // If already set to advanced by marathon, upgrade endurance to elite
      if (generalFitnessLevel === 'advanced') {
        enduranceLevel = 'elite';
        cardioLevel = 'elite';
        reasoning.push('40+ weekly miles with marathon experience indicates elite endurance');
      } else {
        generalFitnessLevel = 'advanced';
        enduranceLevel = 'elite';
        cardioLevel = 'elite';
        reasoning.push('40+ weekly miles indicates advanced endurance fitness');
      }
    } else if (miles >= 25) {
      generalFitnessLevel = 'intermediate';
      enduranceLevel = 'high';
      cardioLevel = 'high';
      reasoning.push('25+ weekly miles indicates high endurance fitness');
    } else if (miles >= 15) {
      enduranceLevel = 'good';
      cardioLevel = 'good';
      reasoning.push('15+ weekly miles indicates good cardiovascular base');
    } else if (miles >= 8) {
      enduranceLevel = 'moderate';
      cardioLevel = 'moderate';
      reasoning.push('Regular weekly mileage indicates developing endurance');
    }
  }
  
  // Experience level inference
  if (data.experienceLevel) {
    const exp = data.experienceLevel.toLowerCase();
    if (exp.includes('advanced') || exp.includes('experienced')) {
      generalFitnessLevel = 'advanced';
      enduranceLevel = 'high';
    } else if (exp.includes('intermediate')) {
      generalFitnessLevel = 'intermediate';
      enduranceLevel = 'good';
    }
  }
  
  return {
    generalFitnessLevel,
    enduranceLevel,
    strengthLevel: 'moderate', // Runners typically have moderate strength
    cardioLevel,
    athleticPerformance,
    confidence,
    reasoning
  };
}

function inferFromStrengthData(data: any): FitnessInference {
  const reasoning: string[] = [];
  let generalFitnessLevel: FitnessInference['generalFitnessLevel'] = 'beginner';
  let strengthLevel: FitnessInference['strengthLevel'] = 'moderate';
  let athleticPerformance: FitnessInference['athleticPerformance'] = 'recreational';
  let confidence = 0.7;
  
  // Powerlifting/advanced strength inference
  if (data.experienceLevel?.toLowerCase().includes('advanced') || 
      data.goals?.some((goal: string) => goal.toLowerCase().includes('powerlifting'))) {
    generalFitnessLevel = 'advanced';
    strengthLevel = 'elite';
    athleticPerformance = 'competitive';
    confidence = 0.9;
    reasoning.push('Advanced strength training/powerlifting indicates elite strength levels');
  }
  
  // Big three lifts inference
  const { benchPress, squat, deadlift } = data.keyMetrics || {};
  if (benchPress || squat || deadlift) {
    // If already advanced from experience, upgrade strength level
    if (generalFitnessLevel === 'advanced') {
      strengthLevel = 'elite';
    } else {
      // Simple heuristic: if they track big lifts, they're at least intermediate
      generalFitnessLevel = 'intermediate';
      strengthLevel = 'good';
    }
    reasoning.push('Tracking compound lifts indicates intermediate+ strength training');
    
    // Advanced inference based on lift numbers (basic heuristic)
    const maxLift = Math.max(benchPress || 0, squat || 0, deadlift || 0);
    if (maxLift >= 300) { // Assuming lbs
      strengthLevel = 'elite';
      generalFitnessLevel = 'advanced';
      reasoning.push('Heavy compound lifts indicate advanced strength');
    } else if (maxLift >= 200) {
      strengthLevel = 'high';
      if (generalFitnessLevel !== 'advanced') {
        generalFitnessLevel = 'intermediate';
      }
    }
  }
  
  // Training frequency
  if (data.keyMetrics?.trainingDays >= 5) {
    generalFitnessLevel = 'intermediate';
    strengthLevel = 'high';
    reasoning.push('High training frequency indicates dedicated strength athlete');
  }
  
  return {
    generalFitnessLevel,
    enduranceLevel: 'moderate', // Strength athletes typically have moderate endurance
    strengthLevel,
    cardioLevel: 'moderate',
    athleticPerformance,
    confidence,
    reasoning
  };
}

function inferFromHikingData(data: any): FitnessInference {
  const reasoning: string[] = [];
  let generalFitnessLevel: FitnessInference['generalFitnessLevel'] = 'beginner';
  let enduranceLevel: FitnessInference['enduranceLevel'] = 'moderate';
  let cardioLevel: FitnessInference['cardioLevel'] = 'moderate';
  let confidence = 0.6;
  
  // Weekly hiking indicates good cardio base
  if (data.keyMetrics?.weeklyHikes >= 2) {
    generalFitnessLevel = 'intermediate';
    enduranceLevel = 'good';
    cardioLevel = 'good';
    confidence = 0.8;
    reasoning.push('Regular hiking indicates good cardiovascular base');
  }
  
  // Long distance hiking
  if (data.keyMetrics?.longestHike >= 15) {
    generalFitnessLevel = 'intermediate';
    enduranceLevel = 'high';
    reasoning.push('Long distance hiking indicates high endurance');
  }
  
  // High altitude comfort
  if (data.keyMetrics?.elevationComfort === 'high-altitude') {
    generalFitnessLevel = 'intermediate';
    enduranceLevel = 'high';
    cardioLevel = 'high';
    reasoning.push('High altitude hiking indicates advanced cardiovascular fitness');
  }
  
  return {
    generalFitnessLevel,
    enduranceLevel,
    strengthLevel: 'moderate', // Hikers have good functional strength
    cardioLevel,
    athleticPerformance: 'recreational',
    confidence,
    reasoning
  };
}

function inferFromCyclingData(data: any): FitnessInference {
  const reasoning: string[] = [];
  let generalFitnessLevel: FitnessInference['generalFitnessLevel'] = 'beginner';
  let enduranceLevel: FitnessInference['enduranceLevel'] = 'moderate';
  let cardioLevel: FitnessInference['cardioLevel'] = 'good';
  let confidence = 0.7;
  
  // Weekly hours
  if (data.keyMetrics?.weeklyHours >= 8) {
    generalFitnessLevel = 'intermediate';
    enduranceLevel = 'high';
    cardioLevel = 'high';
    reasoning.push('High weekly cycling volume indicates strong endurance base');
  }
  
  // Long ride capability
  if (data.keyMetrics?.longestRide >= 50) {
    generalFitnessLevel = 'intermediate';
    enduranceLevel = 'high';
    reasoning.push('Long distance cycling indicates high endurance');
  }
  
  return {
    generalFitnessLevel,
    enduranceLevel,
    strengthLevel: 'moderate',
    cardioLevel,
    athleticPerformance: 'recreational',
    confidence,
    reasoning
  };
}

function inferFromSkiingData(data: any): FitnessInference {
  const reasoning: string[] = [];
  let generalFitnessLevel: FitnessInference['generalFitnessLevel'] = 'intermediate'; // Skiing requires balance/coordination
  let athleticPerformance: FitnessInference['athleticPerformance'] = 'recreational';
  let confidence = 0.6;
  
  // Ski racing background
  if (data.goals?.some((goal: string) => goal.toLowerCase().includes('race')) ||
      data.experienceLevel?.toLowerCase().includes('racing')) {
    generalFitnessLevel = 'advanced';
    athleticPerformance = 'elite';
    confidence = 0.9;
    reasoning.push('Ski racing background indicates advanced athletic performance');
  }
  
  // High days per season
  if (data.keyMetrics?.daysPerSeason >= 30) {
    generalFitnessLevel = 'advanced';
    reasoning.push('High ski days indicates dedicated athlete with excellent fitness');
  }
  
  return {
    generalFitnessLevel,
    enduranceLevel: 'good', // Skiing requires good endurance
    strengthLevel: 'good', // Skiing requires leg strength
    cardioLevel: 'good',
    athleticPerformance,
    confidence,
    reasoning
  };
}

function inferFromGeneralActivity(data: any): FitnessInference {
  // Conservative inference for unknown activities
  return {
    generalFitnessLevel: 'beginner',
    enduranceLevel: 'moderate',
    strengthLevel: 'moderate', 
    cardioLevel: 'moderate',
    athleticPerformance: 'recreational',
    confidence: 0.3,
    reasoning: [`General activity (${data.activityName || 'unknown'}) - conservative inference`]
  };
}

/**
 * Combine multiple activity inferences for users with mixed activities
 */
export function combineActivityInferences(inferences: FitnessInference[]): FitnessInference {
  if (inferences.length === 0) {
    return inferFitnessFromActivity(null as any);
  }
  
  if (inferences.length === 1) {
    return inferences[0];
  }
  
  // Take the highest levels across all activities
  const levels = ['beginner', 'novice', 'intermediate', 'advanced', 'elite'];
  const cardioLevels = ['low', 'moderate', 'good', 'high', 'elite'];
  
  const maxGeneralLevel = Math.max(...inferences.map(inf => levels.indexOf(inf.generalFitnessLevel)));
  const maxEnduranceLevel = Math.max(...inferences.map(inf => cardioLevels.indexOf(inf.enduranceLevel)));
  const maxStrengthLevel = Math.max(...inferences.map(inf => cardioLevels.indexOf(inf.strengthLevel)));
  const maxCardioLevel = Math.max(...inferences.map(inf => cardioLevels.indexOf(inf.cardioLevel)));
  
  const avgConfidence = inferences.reduce((sum, inf) => sum + inf.confidence, 0) / inferences.length;
  const combinedReasoning = inferences.flatMap(inf => inf.reasoning);
  
  return {
    generalFitnessLevel: levels[maxGeneralLevel] as any,
    enduranceLevel: cardioLevels[maxEnduranceLevel] as any,
    strengthLevel: cardioLevels[maxStrengthLevel] as any,
    cardioLevel: cardioLevels[maxCardioLevel] as any,
    athleticPerformance: inferences.some(inf => inf.athleticPerformance === 'elite') ? 'elite' :
                        inferences.some(inf => inf.athleticPerformance === 'competitive') ? 'competitive' : 'recreational',
    confidence: avgConfidence,
    reasoning: ['Combined from multiple activities:', ...combinedReasoning]
  };
}