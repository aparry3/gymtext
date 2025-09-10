/**
 * Fitness activity inference utilities
 * Phase 1: Simplified for strength + cardio activities only
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { StrengthData, CardioData } from '../models/user/schemas';

// Individual activity data types
export type SingleActivityData = StrengthData | CardioData;

export interface FitnessInference {
  generalFitnessLevel: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite';
  enduranceLevel: 'low' | 'moderate' | 'good' | 'high' | 'elite';
  strengthLevel: 'low' | 'moderate' | 'good' | 'high' | 'elite';
  cardioLevel: 'low' | 'moderate' | 'good' | 'high' | 'elite';
  athleticPerformance: 'recreational' | 'competitive' | 'elite';
  confidence: number; // 0-1 scale
  reasoning: string[]; // Explanation of inference
}

function defaultInference(): FitnessInference {
  return {
    generalFitnessLevel: 'beginner',
    enduranceLevel: 'low',
    strengthLevel: 'low',
    cardioLevel: 'low',
    athleticPerformance: 'recreational',
    confidence: 0.1,
    reasoning: ['No specific activity data - using conservative defaults']
  };
}

/**
 * Simplified fitness inference for Phase 1 implementation
 * Supports only strength and cardio activity types
 */
export function inferFitnessFromActivity(activityData: SingleActivityData): FitnessInference {
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
  
  // Simplified implementation for Phase 1 - just return defaults based on activity type
  return {
    generalFitnessLevel: activityData.experience as any || 'beginner',
    enduranceLevel: activityData.type === 'cardio' ? 'moderate' : 'low',
    strengthLevel: activityData.type === 'strength' ? 'moderate' : 'low',
    cardioLevel: activityData.type === 'cardio' ? 'moderate' : 'low',
    athleticPerformance: 'recreational',
    confidence: 0.6,
    reasoning: [`Based on ${activityData.type} activity with ${activityData.experience} experience`]
  };
}

/**
 * Combine inferences from multiple activities
 * Phase 1: Simplified version
 */
export function combineActivityInferences(inferences: FitnessInference[]): FitnessInference {
  if (inferences.length === 0) {
    return defaultInference();
  }
  
  if (inferences.length === 1) {
    return inferences[0];
  }
  
  // Simple averaging approach for Phase 1
  const avgConfidence = inferences.reduce((sum, inf) => sum + inf.confidence, 0) / inferences.length;
  const combinedReasoning = inferences.flatMap(inf => inf.reasoning);
  
  // Take the highest level across all activities
  const levels = ['beginner', 'novice', 'intermediate', 'advanced', 'elite'];
  const cardioLevels = ['low', 'moderate', 'good', 'high', 'elite'];
  
  const maxGeneralIndex = Math.max(...inferences.map(inf => levels.indexOf(inf.generalFitnessLevel)));
  const maxEnduranceIndex = Math.max(...inferences.map(inf => cardioLevels.indexOf(inf.enduranceLevel)));
  const maxStrengthIndex = Math.max(...inferences.map(inf => cardioLevels.indexOf(inf.strengthLevel)));
  const maxCardioIndex = Math.max(...inferences.map(inf => cardioLevels.indexOf(inf.cardioLevel)));
  
  return {
    generalFitnessLevel: levels[maxGeneralIndex] as any,
    enduranceLevel: cardioLevels[maxEnduranceIndex] as any,
    strengthLevel: cardioLevels[maxStrengthIndex] as any,
    cardioLevel: cardioLevels[maxCardioIndex] as any,
    athleticPerformance: inferences.some(inf => inf.athleticPerformance === 'elite') ? 'elite' :
                        inferences.some(inf => inf.athleticPerformance === 'competitive') ? 'competitive' : 'recreational',
    confidence: avgConfidence,
    reasoning: ['Combined from multiple activities:', ...combinedReasoning]
  };
}

// NOTE: All complex activity-specific inference functions from the old schema have been removed
// They will be reimplemented in Phase 2 for the new simplified strength + cardio structure