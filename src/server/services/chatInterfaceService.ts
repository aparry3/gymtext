import { onboardingAgent, OnboardingMessage } from '@/server/agents/onboarding/chain'
import { EnhancedOnboardingAgent } from '@/server/agents/onboarding/structuredChain'
import { postgresDb } from '@/server/connections/postgres/postgres'
import { ProfileUpdateService } from '@/server/services/profileUpdateService'
import { ProfileUpdateOp } from '@/server/models/fitnessProfile'

export interface ChatSession {
  id: string
  userId?: string
  messages: OnboardingMessage[]
  createdAt: Date
  updatedAt: Date
  extractedProfile?: Record<string, unknown>
  useEnhancedAgent?: boolean
}

export class ChatInterfaceService {
  private sessions: Map<string, ChatSession> = new Map()
  private enhancedAgent?: EnhancedOnboardingAgent

  startConversation(sessionId: string, userId?: string, useEnhanced = false): ChatSession {
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      useEnhancedAgent: useEnhanced
    }
    
    this.sessions.set(sessionId, session)
    
    if (useEnhanced && !this.enhancedAgent) {
      this.enhancedAgent = new EnhancedOnboardingAgent()
    }
    
    return session
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId)
  }

  addMessage(sessionId: string, message: OnboardingMessage): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.messages.push(message)
      session.updatedAt = new Date()
    }
  }

  async *streamMessage(sessionId: string, message: string) {
    let session = this.getSession(sessionId)
    
    if (!session) {
      session = this.startConversation(sessionId)
    }

    // Add user message to history
    this.addMessage(sessionId, {
      role: 'user',
      content: message
    })

    // Get response from agent
    let fullResponse = ''
    
    try {
      for await (const chunk of onboardingAgent.streamResponse({
        message,
        history: session.messages.slice(0, -1) // Exclude the message we just added
      })) {
        fullResponse += chunk
        yield chunk
      }

      // Add assistant response to history
      this.addMessage(sessionId, {
        role: 'assistant',
        content: fullResponse
      })
    } catch (error) {
      console.error('Error in chat interface service:', error)
      throw error
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<string> {
    let session = this.getSession(sessionId)
    
    if (!session) {
      session = this.startConversation(sessionId)
    }

    // Add user message to history
    this.addMessage(sessionId, {
      role: 'user',
      content: message
    })

    try {
      // Use enhanced agent if configured and userId is available
      if (session.useEnhancedAgent && session.userId) {
        if (!this.enhancedAgent) {
          this.enhancedAgent = new EnhancedOnboardingAgent()
        }
        
        const result = await this.enhancedAgent.processMessage(
          message,
          session.messages.slice(0, -1).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          }))
        )
        
        // Store extracted profile data if available
        if (result.profileUpdate) {
          if (result.profileUpdate.type === 'mergePatch' && result.profileUpdate.patch) {
            session.extractedProfile = {
              ...session.extractedProfile,
              ...result.profileUpdate.patch
            }
            
            // Apply high-confidence patches to database
            if (result.confidence > 0.8 && session.userId) {
              const updateService = new ProfileUpdateService(postgresDb)
              await updateService.applyPatch(
                session.userId,
                result.profileUpdate.patch,
                'onboarding',
                'Extracted during onboarding conversation'
              )
            }
          } else if (result.profileUpdate.type === 'op' && result.profileUpdate.op && session.userId) {
            // Apply operations immediately (like adding constraints)
            const updateService = new ProfileUpdateService(postgresDb)
            await updateService.applyOp(
              session.userId,
              result.profileUpdate.op as ProfileUpdateOp,
              'onboarding',
              'Extracted during onboarding conversation'
            )
          }
        }
        
        // Add assistant response to history
        this.addMessage(sessionId, {
          role: 'assistant',
          content: result.reply
        })
        
        return result.reply
      } else {
        // Use standard agent
        const response = await onboardingAgent.invoke({
          message,
          history: session.messages.slice(0, -1) // Exclude the message we just added
        })

        // Add assistant response to history
        this.addMessage(sessionId, {
          role: 'assistant',
          content: response
        })

        return response
      }
    } catch (error) {
      console.error('Error in chat interface service:', error)
      throw error
    }
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }
}

// Export singleton instance
export const chatInterfaceService = new ChatInterfaceService()