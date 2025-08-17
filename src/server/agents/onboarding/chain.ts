import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { createOnboardingPrompt } from './prompts'

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.7, 
  model: "gemini-2.0-flash",
  streaming: true
})

export interface OnboardingMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface OnboardingInput {
  message: string
  history: OnboardingMessage[]
}

export const onboardingAgent = {
  async *streamResponse(input: OnboardingInput) {
    const prompt = createOnboardingPrompt(input.message, input.history)
    
    try {
      const stream = await llm.stream(prompt)
      
      for await (const chunk of stream) {
        const content = typeof chunk.content === 'string' 
          ? chunk.content 
          : chunk.content?.toString() || ''
        
        if (content) {
          yield content
        }
      }
    } catch (error) {
      console.error('Error in onboarding agent:', error)
      throw new Error('Failed to generate response')
    }
  },

  async invoke(input: OnboardingInput): Promise<string> {
    const prompt = createOnboardingPrompt(input.message, input.history)
    
    try {
      const response = await llm.invoke(prompt)
      return typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content)
    } catch (error) {
      console.error('Error in onboarding agent:', error)
      throw new Error('Failed to generate response')
    }
  }
}