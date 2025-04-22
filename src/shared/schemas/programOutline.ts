
// OpenAI compatible schemas (without default values)
// Create program week schema without defaults for OpenAI
export const openAIProgramWeekSchema = {
  type: "object",
  properties: {
    weekNumber: { type: "integer", minimum: 1 },
    focusAreas: { type: "array", items: { type: "string" } },
    thingsToConsider: { type: "array", items: { type: "string" } },
    intensity: { type: "string", enum: ["light", "moderate", "heavy"] },
    volume: { type: "string", enum: ["low", "medium", "high"] },
    description: { type: "string" },
    notes: { type: "array", items: { type: "string" } }
  },
  required: ["weekNumber", "focusAreas", "thingsToConsider"]
};

// Create program outline schema without defaults for OpenAI
export const openAICreateProgramOutlineSchema = {
  type: "object",
  properties: {
    goals: {
      type: "object",
      properties: {
        primary: { type: "string" },
        secondary: { type: "array", items: { type: "string" } }
      },
      required: ["primary"]
    },
    progression: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["linear", "undulating", "block"] },
        description: { type: "string" }
      },
      required: ["type", "description"]
    },
    weeks: {
      type: "array",
      items: openAIProgramWeekSchema
    }
  },
  required: ["goals", "weeks"]
}; 