import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { createOnboardingPrompt } from './prompts'
import { EnhancedOnboardingAgent } from './structuredChain'
import { ProfileUpdateService } from '../../services/profileUpdateService'
import { Kysely } from 'kysely'
import { DB } from '../../models/_types'
import { FitnessProfile } from '../../models/fitnessProfile'

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.7, 
  model: "gemini-2.5-flash",
  streaming: true
})

export interface OnboardingMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface OnboardingInput {
  message: string
  history: OnboardingMessage[]
  userId?: string
  useStructured?: boolean
}

export interface OnboardingResponse {
  reply: string
  profileUpdated?: boolean
  confidence?: number
  nextQuestion?: string
}

export const onboardingAgent = {
  async *streamResponse(input: OnboardingInput) {
    // Use enhanced agent if structured extraction is enabled
    if (input.useStructured && input.userId) {
      const enhancedAgent = new EnhancedOnboardingAgent()
      const stream = enhancedAgent.streamResponse(input.message, input.history)
      
      for await (const chunk of stream) {
        yield chunk
      }
      return
    }

    // Original streaming implementation
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
    // Use enhanced agent if structured extraction is enabled
    if (input.useStructured && input.userId) {
      const enhancedAgent = new EnhancedOnboardingAgent()
      const result = await enhancedAgent.processMessage(input.message, input.history)
      return result.reply
    }

    // Original implementation
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
  },

  /**
   * Process message with structured extraction and profile updates
   */
  async processWithExtraction(
    input: OnboardingInput & { userId: string; db: Kysely<DB> }
  ): Promise<OnboardingResponse> {
    const enhancedAgent = new EnhancedOnboardingAgent()
    const result = await enhancedAgent.processMessage(input.message, input.history)
    
    // Apply profile updates if extracted
    if (result.profileUpdate && input.userId) {
      const updateService = new ProfileUpdateService(input.db)
      
      try {
        if (result.profileUpdate.type === 'mergePatch' && result.profileUpdate.patch) {
          // Convert patch to FitnessProfile type (constraints need special handling)
          const patch: Partial<FitnessProfile> = { ...result.profileUpdate.patch } as any
          
          await updateService.applyPatch(
            input.userId,
            patch,
            'onboarding_agent',
            `Extracted from message: "${input.message.slice(0, 50)}..."`
          )
        } else if (result.profileUpdate.type === 'op' && result.profileUpdate.op) {
          await updateService.applyOp(
            input.userId,
            result.profileUpdate.op as any,
            'onboarding_agent',
            `Extracted from message: "${input.message.slice(0, 50)}..."`
          )
        }
      } catch (error) {
        console.error('Failed to apply profile update:', error)
      }
    }
    
    return {
      reply: result.reply,
      profileUpdated: !!result.profileUpdate,
      confidence: result.confidence,
      nextQuestion: result.nextQuestion,
    }
  }
}