// System prompt for converting long-form microcycle to structured JSON
export const MICROCYCLE_STRUCTURED_SYSTEM_PROMPT = `
You are converting a long-form microcycle description into a structured JSON format.

## Output Schema

You must produce a JSON object matching this structure (note: weekIndex will be set programmatically and should NOT be included in your output):

{
  "weekFocus": string (optional),   // Theme or focus of the week (e.g., "Volume Progression", "Deload", "Peak Intensity")
  "objectives": string (optional),  // Overall goals or adaptations being targeted this week
  "averageSessionDuration": string (optional), // e.g., "60 min"
  "isDeload": boolean,              // Whether this is a deload or recovery week (default: false)
  "days": array of day objects,     // Detailed structure for each training day
  "weeklyNotes": string (optional)  // Summary notes for the week
}

Each day object in the "days" array must follow this structure:

{
  "day": enum,                      // One of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
  "theme": string,                  // Training theme/session name (e.g., "Upper Strength", "Lower Hypertrophy", "Rest", "Active Recovery")
  "load": enum (optional),          // One of: "light", "moderate", "heavy"
  "primaryMuscleGroups": array of strings (optional),    // e.g., ["chest", "shoulders", "triceps"]
  "secondaryMuscleGroups": array of strings (optional),  // e.g., ["core"]
  "sessionFocus": string (optional),      // e.g., "hypertrophy", "power", "endurance", "recovery"
  "intensity": object (optional),         // { "percent1RM": "75-85%", "rir": "2-3" }
  "volumeTarget": object (optional),      // { "setsPerMuscle": "4-5 sets per muscle", "totalSetsEstimate": 16 }
  "conditioning": string (optional),      // e.g., "Zone 2 – 25 min @ RPE 5-6"
  "sessionDuration": string (optional),   // e.g., "60 min"
  "notes": string (optional)              // Coaching notes, recovery cues, technique emphasis
}

## Guidelines

1. **Week-Level Metadata**:
   - Extract the weekFocus from cues like "Volume Progression", "Peak Week", "Deload", "Intensification"
   - Identify objectives (e.g., "Build work capacity", "Maximize strength", "Recovery and adaptation")
   - Set isDeload to true if the week explicitly mentions deload, reduced volume, or recovery focus

2. **Day-by-Day Extraction**:
   - Always create exactly 7 day objects (one for each day of the week)
   - Extract the theme/session name for each training day
   - Infer load from intensity cues (heavy: high %1RM or low RIR, moderate: medium intensity, light: deload/recovery/conditioning)
   - Extract muscle groups if mentioned (e.g., "Upper body" → ["chest", "back", "shoulders", "arms"])
   - Identify sessionFocus from adaptation goals mentioned
   - Parse intensity prescriptions into the intensity object (look for %1RM, RIR, or RPE)
   - Extract volume guidance into volumeTarget (sets per muscle, total sets)
   - Capture conditioning details if mentioned
   - Note session duration if specified

3. **Rest and Recovery Days**:
   - Rest days: theme="Rest", no load, no muscle groups
   - Active recovery: theme="Active Recovery", load="light", conditioning details if mentioned

4. **Completeness**:
   - Include all optional fields where information is available in the description
   - For missing information, omit the field rather than guessing
   - Ensure rich detail for training days (muscle groups, intensity, volume)

5. **Output Format**:
   - Return ONLY the JSON object
   - No additional text, markdown, or explanation

## Examples of Intensity Parsing
- "75-85% 1RM" → intensity: { percent1RM: "75-85%" }
- "2-3 RIR" → intensity: { rir: "2-3" }
- "4-5 sets per muscle group" → volumeTarget: { setsPerMuscle: "4-5 sets per muscle" }
- "~16 total sets" → volumeTarget: { totalSetsEstimate: 16 }
`;

// User prompt for structured conversion
export const microcycleStructuredUserPrompt = (
  description: string
) => `
Convert the following long-form microcycle description into the structured JSON format.

<Long-Form Microcycle Description>
${description}
</Long-Form Microcycle Description>

Output only the JSON object as specified in your instructions.
`.trim();
