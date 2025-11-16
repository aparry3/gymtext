import { Microcycle } from '@/server/models/microcycle';
import { Mesocycle } from '@/server/models/fitnessPlan';

export interface MicrocycleUpdateParams {
  targetDay: string; // The specific day being modified (e.g., "Monday", typically "today")
  changes: string[]; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 minutes", "Apply hotel gym constraints to remaining days"])
  reason: string; // Why the modification is needed (e.g., "Gym is too crowded", "Traveling for work")
  remainingDays?: string[]; // Days that are remaining in the week (today and future)
}

export const MICROCYCLE_UPDATE_SYSTEM_PROMPT = `You are an expert fitness coach specializing in weekly training modifications. Your task is to update weekly microcycle day overviews when users face schedule changes, travel, equipment limitations, or other factors requiring workout adjustments.

<Critical Rules>
1. ONLY modify REMAINING days in the week (days that haven't been completed yet)
2. PRESERVE the overall training volume and progression intent of the remaining week
3. Apply the specified day-specific modifications
4. Maintain training balance and muscle group distribution across remaining days
5. Ensure adequate rest and recovery between similar muscle groups
6. Respect the mesocycle's focus and progression strategy
7. TRACK all changes made - you must return a "modificationsApplied" array listing each change
8. Maintain the day overview format with headers like *** MONDAY - [Session Type] ***
</Critical Rules>

<Modification Guidelines>

**Remaining Days Only:**
- Only modify days that are marked as "remaining" (today and future days)
- Do NOT change days that have already passed or been completed
- Preserve completed days' training themes and structure

**Day-Specific Changes:**
- Apply each requested modification to the specified day
- Maintain training themes where possible
- Adjust load and volume as needed
- Consider impact on recovery and surrounding days
- Update the day overview text to reflect changes

**Weekly Constraints:**
- Equipment limitations: Adjust all affected remaining days consistently
  Example: "Traveling Mon-Fri, only hotel gym access" -> modify Mon-Fri for dumbbells/bodyweight
- Time constraints: Reduce volume while preserving key work
  Example: "Only 30 minutes per day this week" -> condense remaining workouts
- Environment changes: Adapt to new circumstances
  Example: "Gym closed today due to weather" -> convert to home workout for today
- Recovery needs: Respect fatigue management across remaining days

**Training Balance & Muscle Group Coherence:**
- When a user swaps muscle groups, ensure remaining days maintain balance
  Example: "Can you give me a back workout instead of chest today?"
  -> Change today to back, then check remaining days to avoid back-to-back back days
  -> May need to swap another days back workout to push/chest to maintain balance
- Maintain muscle group balance across remaining days
- Ensure adequate rest (48+ hours) between similar muscle groups
- Preserve key training days (e.g., heavy compound days) where possible
- Adjust accessory work before main work

**Training Balance & Muscle Group Coherence:**
- When a user swaps muscle groups, ensure remaining days maintain balance
  Example: "Can you give me a back workout instead of chest today?"
  -> Change today to back, then check remaining days to avoid back-to-back back days
  -> May need to swap another day's back workout to push/chest to maintain balance
- Maintain muscle group balance across remaining days
- Ensure adequate rest (48+ hours) between similar muscle groups
- Preserve key training days (e.g., heavy compound days) where possible

**Day Overview Format:**
- Maintain the header format: *** DAY_NAME - [Session Type] ***
- Include detailed session objectives, movement patterns, volume guidance, intensity/RIR bands
- Preserve the structure and detail level of the original overviews
</Modification Guidelines>

<Output Requirements>
Return all 7 day overviews (Monday through Sunday) with:
1. Each day's complete overview text (maintaining the *** MONDAY - [Type] *** format)
2. A "modificationsApplied" array of strings describing each change made
   - Format: "[Day]: [Change made] - [Why]"
   - Examples:
     - "Monday: Changed from Upper Push to Back Focus - user requested back workout"
     - "Wednesday: Reduced session duration to 45 minutes - time constraint"
     - "Friday: Modified for hotel gym equipment - dumbbells and bodyweight only"
   - Include one entry for each day that was modified
</Output Requirements>`;

export const updateMicrocyclePrompt = (
  currentMicrocycle: Microcycle,
  params: MicrocycleUpdateParams,
  mesocycle: Mesocycle,
  programType: string
): string => {
  const weeks = mesocycle.durationWeeks || 4;

  // Identify remaining days vs completed days
  const remainingDays = params.remainingDays || [];
  const remainingDaysSet = new Set(remainingDays.map(d => d.toUpperCase()));

  // Build current day overviews display
  const dayOverviews = [
    { name: 'MONDAY', overview: currentMicrocycle.mondayOverview },
    { name: 'TUESDAY', overview: currentMicrocycle.tuesdayOverview },
    { name: 'WEDNESDAY', overview: currentMicrocycle.wednesdayOverview },
    { name: 'THURSDAY', overview: currentMicrocycle.thursdayOverview },
    { name: 'FRIDAY', overview: currentMicrocycle.fridayOverview },
    { name: 'SATURDAY', overview: currentMicrocycle.saturdayOverview },
    { name: 'SUNDAY', overview: currentMicrocycle.sundayOverview },
  ];

  const currentDaysText = dayOverviews.map(d => {
    const isRemaining = remainingDaysSet.has(d.name);
    const isTarget = d.name === params.targetDay.toUpperCase();
    let status = isRemaining ? '[REMAINING - CAN MODIFY]' : '[COMPLETED - DO NOT MODIFY]';
    if (isTarget) {
      status = '[TARGET DAY - MODIFY THIS]';
    }

    // Extract just the header for summary
    const header = d.overview ? d.overview.split('\n')[0] : 'No overview';

    return `${d.name}: ${header} ${status}`;
  }).join('\n');

  const remainingDaysInfo = remainingDays.length > 0
    ? `\nRemaining Days (today and future): ${remainingDays.join(', ')}`
    : '';

  const changesText = params.changes.map((c, idx) => `${idx + 1}. ${c}`).join('\n');

  return `<Current Weekly Pattern>
Week ${currentMicrocycle.weekNumber}${remainingDaysInfo}

Day Summaries:
${currentDaysText}

Full Day Overviews:
${dayOverviews.map(d => `\n${d.name}:\n${d.overview || 'No overview'}\n`).join('\n')}
</Current Weekly Pattern>

<Mesocycle Context>
Name: ${mesocycle.name}
Focus: ${mesocycle.focus?.join(', ') || 'General training'}
Program Type: ${programType}
Week ${currentMicrocycle.weekNumber} of ${weeks}
</Mesocycle Context>

<Modification Request>
Target Day: ${params.targetDay}
Requested Changes:
${changesText}
Reason: ${params.reason}
</Modification Request>

<Task>
Update this weekly training pattern to accommodate the requested changes while maintaining training balance and coherence for the remaining days.

**PRIMARY GOAL**: Apply the requested changes to ${params.targetDay} (marked as [TARGET DAY]).

**SECONDARY GOAL**: If changes mention constraints or modifications for "remaining days", "rest of week", or "all days", apply those to other REMAINING days as needed. Also update remaining days to maintain training balance (e.g., if changing to a back workout today, ensure no back-to-back back days).

**CRITICAL RULES**:
- Modify ${params.targetDay} according to the requested changes
- If changes mention applying to multiple days or "rest of week", apply those to remaining days
- Only modify days marked as [REMAINING - CAN MODIFY] or [TARGET DAY]
- Do NOT change days marked as [COMPLETED - DO NOT MODIFY]
- Check for muscle group conflicts in remaining days (avoid back-to-back same muscles)
- Maintain training balance and progression across remaining days
- Ensure all 7 day overviews are returned (even if unchanged)
- Preserve completed days exactly as they were
- Maintain the *** DAY - [Type] *** header format in each overview
- Be specific about what changed and why in the modificationsApplied array

Return all 7 updated day overviews (mondayOverview through sundayOverview) plus the modificationsApplied tracking array.
</Task>

Generate the updated microcycle now.`;
};
