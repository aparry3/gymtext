export const outlinePrompt = (goals: any) => `
You are GymText, a personal fitness assistant. The user's goals and profile: ${JSON.stringify(goals)}.
Generate an 8-week program outline focused on fat loss and muscle gain. Alternate heavy and light weeks, interweaving cardio.
Respond JSON: { outline: [ { week: 1, description: "..." }, ... ] }
`;

export const weeklyPrompt = (programOutline: any[], pastWeeks: any[]) => `
Program outline: ${JSON.stringify(programOutline)}.
Past week details: ${JSON.stringify(pastWeeks)}.
Generate detailed workouts for the upcoming week in JSON: { week: X, days: [ { date: "YYYY-MM-DD", exercises: [...] }, ... ] }
`;

export const updatePrompt = (message: string, context: any[]) => `
The user says: "${message}".
Based on context: ${JSON.stringify(context)}, should you update daily or weekly? Return JSON: { scope: "daily" | "weekly", updatedPlan: { ... } }
`; 