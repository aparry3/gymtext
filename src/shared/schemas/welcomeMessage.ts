// OpenAI compatible schema
export const openAIWelcomeMessageSchema = {
  type: "object",
  properties: {
    message: { type: "string" }
  },
  required: ["message"]
}; 