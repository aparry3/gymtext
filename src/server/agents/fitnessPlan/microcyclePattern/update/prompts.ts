import { MicrocyclePattern } from '@/server/models/microcycle';
import { MesocycleOverview } from '@/server/models/fitnessPlan';

export interface MicrocycleUpdateParams {
  modifications: Array<{
    day: string;
    change: string;
  }>;
  constraints: string[];
  reason: string;
}

export const MICROCYCLE_UPDATE_SYSTEM_PROMPT = `You are an expert fitness coach specializing in weekly training pattern modifications. Your task is to update weekly microcycle patterns when users face schedule changes, travel, equipment limitations, or other factors requiring multi-day adjustments.

<Critical Rules>
1. PRESERVE the overall training volume and progression intent of the week
2. Apply the specified day-specific modifications
3. Maintain training balance across the week
4. Ensure adequate rest and recovery
5. Respect the mesocycle's focus and progression strategy
6. Only make changes necessary to accommodate the constraints
7. TRACK all changes made - you must return a "modificationsApplied" array listing each change
</Critical Rules>

<Modification Guidelines>
**Day-Specific Changes:**
- Apply each requested modification to the specified day
- Maintain training themes where possible
- Adjust load and volume as needed
- Consider impact on recovery and surrounding days

**Weekly Constraints:**
- Equipment limitations: Adjust all affected days consistently
- Time constraints: Reduce volume while preserving key work
- Travel/schedule: Maintain flexibility while keeping training effective
- Recovery needs: Respect fatigue management across the week

**Training Balance:**
- Maintain muscle group balance across the week
- Ensure adequate rest between similar training days
- Preserve key training days (e.g., heavy compound days)
- Adjust accessory work before main work
</Modification Guidelines>

<Output Requirements>
Return the COMPLETE updated microcycle pattern as a valid JSON object matching the UpdatedMicrocyclePattern schema with:
1. All pattern data (weekIndex, days array)
2. A "modificationsApplied" array of strings describing each change made
   - Format: "[Day]: [Change made] - [Why]"
   - Examples:
     - "Monday: Changed from Upper Push to Home Upper Push - no gym access"
     - "Wednesday: Changed from Lower Body to Rest - travel day"
     - "Friday: Reduced from Heavy to Moderate load - fatigue management"
     - "Saturday: Moved Upper Pull to Saturday from Friday - schedule conflict"
   - Include one entry for each day that was modified
</Output Requirements>

<Modification Tracking>
Be specific and comprehensive in tracking modifications:
- Training theme changes (what changed and why)
- Load adjustments (heavy → moderate, etc.)
- Day swaps or moves (moved X from Y to Z)
- Rest day changes (training day → rest or vice versa)
- Volume/intensity modifications
</Modification Tracking>`;

export const updateMicrocyclePatternPrompt = (
  currentPattern: MicrocyclePattern,
  params: MicrocycleUpdateParams,
  mesocycle: MesocycleOverview,
  programType: string
): string => {
  const modificationsText = params.modifications.map((m, idx) =>
    `${idx + 1}. ${m.day}: ${m.change}`
  ).join('\n');

  const constraintsText = params.constraints.map((c, idx) => `${idx + 1}. ${c}`).join('\n');

  const currentDaysText = currentPattern.days.map(d =>
    `${d.day}: ${d.theme}${d.load ? ` (${d.load})` : ''}`
  ).join('\n');

  return `<Current Weekly Pattern>
Week ${currentPattern.weekIndex + 1} of mesocycle
${currentDaysText}
</Current Weekly Pattern>

<Mesocycle Context>
Name: ${mesocycle.name}
Focus: ${mesocycle.focus.join(', ')}
Program Type: ${programType}
Week ${currentPattern.weekIndex + 1} of ${mesocycle.weeks}
Deload Week: ${mesocycle.deload && currentPattern.weekIndex + 1 === mesocycle.weeks ? 'Yes' : 'No'}
</Mesocycle Context>

<Modification Request>
Reason: ${params.reason}

Day-Specific Modifications:
${modificationsText}

Overall Constraints:
${constraintsText}
</Modification Request>

<Task>
Update this weekly training pattern to accommodate the requested modifications and constraints while maintaining as much of the original training intent as possible.

Guidelines:
- Apply each day-specific modification
- Respect the overall constraints for the week
- Maintain training balance and progression
- Keep the same week index (${currentPattern.weekIndex})
- Ensure all 7 days are present (Monday-Sunday)
- Be specific about what changed and why in the modificationsApplied array

Return the complete updated microcycle pattern as a JSON object with detailed modification tracking.
</Task>

Generate the updated microcycle pattern now.`;
};
