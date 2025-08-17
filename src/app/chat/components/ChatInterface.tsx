'use client'

import { useState, useRef } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import StreamingMessage from './StreamingMessage'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setHasStarted(true)
    setIsLoading(true)
    setError(null)
    setStreamingContent('')

    try {
      abortControllerRef.current = new AbortController()
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          history: messages
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                accumulatedContent += data.content
                setStreamingContent(accumulatedContent)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }

      if (accumulatedContent) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: accumulatedContent,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setStreamingContent('')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Error sending message:', err)
        setError('Failed to send message. Please try again.')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  if (!hasStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            GYMTEXT Chat
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="What are your fitness goals?"
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e.currentTarget.value)
                }
              }}
              autoFocus
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <button
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.parentElement?.querySelector('input')
                  if (input) {
                    handleSendMessage(input.value)
                  }
                }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Start a conversation to build your personalized fitness profile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">GYMTEXT Chat</h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <MessageList messages={messages} />
        
        {isLoading && streamingContent && (
          <div className="px-4 py-2">
            <StreamingMessage content={streamingContent} />
          </div>
        )}
        
        {isLoading && !streamingContent && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="px-4 py-2">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <MessageInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            onStop={isLoading ? handleStop : undefined}
          />
        </div>
      </div>
    </div>
  )
}