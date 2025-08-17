import { onboardingAgent, OnboardingMessage } from '@/server/agents/onboarding/chain'

export interface ChatSession {
  id: string
  userId?: string
  messages: OnboardingMessage[]
  createdAt: Date
  updatedAt: Date
}

export class ChatInterfaceService {
  private sessions: Map<string, ChatSession> = new Map()

  startConversation(sessionId: string, userId?: string): ChatSession {
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.sessions.set(sessionId, session)
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
      // Get response from agent
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