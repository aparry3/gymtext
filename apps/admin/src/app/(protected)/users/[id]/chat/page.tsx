'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEnvironment } from '@/context/EnvironmentContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'

interface Message {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  timestamp: string
  from: string
  to: string
  mediaUrls?: string[]
}

export default function AdminChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const { mode } = useEnvironment()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>('')
  const [sseConnected, setSseConnected] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const MESSAGES_PER_PAGE = 20

  const scrollToBottom = useCallback(() => {
    // Use setTimeout to ensure DOM has updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const fetchConversations = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsInitialLoading(true)
    }
    try {
      const response = await fetch(`/api/users/${id}/chat?limit=${MESSAGES_PER_PAGE}&offset=0`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch messages')
      }

      // Get messages from the API (already sorted oldest-to-newest)
      const messages = result.data.messages ?? []
      setMessages(messages)
      setHasMore(result.data.pagination?.hasMore ?? false)
      setOffset(MESSAGES_PER_PAGE)

      // Fetch user name and phone number on initial load
      if (isInitialLoad) {
        const userResponse = await fetch(`/api/users/${id}`)
        const userResult = await userResponse.json()
        if (userResult.success) {
          setUserName(userResult.data.user.name || 'User')
          setUserPhoneNumber(userResult.data.user.phoneNumber || '')
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      if (isInitialLoad) {
        setIsInitialLoading(false)
      }
    }
  }, [id, MESSAGES_PER_PAGE])

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const response = await fetch(`/api/users/${id}/chat?limit=${MESSAGES_PER_PAGE}&offset=${offset}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch more messages')
      }

      const olderMessages = result.data.messages ?? []

      // Prepend older messages to the existing list
      setMessages(prev => [...olderMessages, ...prev])
      setHasMore(result.data.pagination?.hasMore ?? false)
      setOffset(prev => prev + MESSAGES_PER_PAGE)
    } catch (err) {
      console.error('Error loading more messages:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [id, offset, hasMore, isLoadingMore, MESSAGES_PER_PAGE])

  useEffect(() => {
    if (id) {
      fetchConversations(true)
    }
  }, [id, fetchConversations, mode])

  // Handle scroll to top for loading more messages
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      // Load more when scrolled within 100px of the top
      if (container.scrollTop < 100 && hasMore && !isLoadingMore) {
        // Save current scroll position
        const scrollHeightBefore = container.scrollHeight
        const scrollTopBefore = container.scrollTop

        loadMoreMessages().then(() => {
          // Restore scroll position after loading more messages
          // This prevents the view from jumping to the top
          requestAnimationFrame(() => {
            const scrollHeightAfter = container.scrollHeight
            container.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore)
          })
        })
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoadingMore, loadMoreMessages])

  // Set up SSE connection for real-time messages
  useEffect(() => {
    if (!id || !userPhoneNumber) return

    // Try to connect to SSE endpoint (only works with MESSAGING_PROVIDER=local)
    const eventSource = new EventSource(`/api/messages/stream?phoneNumber=${encodeURIComponent(userPhoneNumber)}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('[SSE] Connected to message stream')
      setSseConnected(true)
    }

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'connected') {
          console.log('[SSE] Stream ready:', data)
        } else if (data.type === 'message' && data.message) {
          // Add the new outbound message to the messages list
          const newMessage: Message = {
            id: data.message.id,
            content: data.message.content,
            direction: 'outbound',
            timestamp: data.message.timestamp,
            from: data.message.from,
            to: data.message.to,
            mediaUrls: data.message.mediaUrls,
          }

          setMessages(prev => {
            // Remove any temporary ack messages (starts with "temp-ack-")
            // and avoid duplicates
            const withoutTempAck = prev.filter(m => !m.id.startsWith('temp-ack-'))

            if (withoutTempAck.some(m => m.id === newMessage.id)) {
              return prev
            }

            return [...withoutTempAck, newMessage]
          })

          console.log('[SSE] Received message:', newMessage)
        }
      } catch (error) {
        console.error('[SSE] Error parsing message:', error)
      }
    })

    eventSource.onerror = (error) => {
      console.log('[SSE] Connection error (may not be using local provider):', error)
      setSseConnected(false)
      eventSource.close()
    }

    // Cleanup on unmount
    return () => {
      console.log('[SSE] Disconnecting')
      eventSource.close()
      setSseConnected(false)
    }
  }, [id, userPhoneNumber])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isSending) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    // Optimistically add user message
    const optimisticUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      content: userMessage,
      direction: 'inbound',
      timestamp: new Date().toISOString(),
      from: 'user',
      to: 'system'
    }
    setMessages(prev => [...prev, optimisticUserMessage])

    try {
      const response = await fetch(`/api/users/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, userId: id }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message')
      }

      // The API now returns ack instead of the actual response
      // Show the ack message temporarily (will be replaced by real response via SSE)
      const ackMessage: Message = {
        id: `temp-ack-${result.data.jobId}`,
        content: result.data.ackMessage,
        direction: 'outbound',
        timestamp: result.data.timestamp,
        from: 'system',
        to: 'user'
      }

      // Add the ack message
      // The actual response will arrive via SSE and replace this
      setMessages(prev => [...prev, ackMessage])

      console.log('[Admin Chat] Message queued:', {
        jobId: result.data.jobId,
        conversationId: result.data.conversationId,
      })
    } catch (err) {
      console.error('Failed to send message:', err)
      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticUserMessage.id))
    } finally {
      setIsSending(false)
    }
  }

  if (isInitialLoading) {
    return <ChatSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/users/${id}`}>
                  {userName || 'User'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chat</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Chat Interface */}
          <Card className="flex flex-col h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">{userName}</h1>
                  <p className="text-sm text-muted-foreground">
                    Admin Chat Simulator
                    {sseConnected && (
                      <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                        Live
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/users/${id}`)}
                >
                  Back to Profile
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {/* Loading indicator at the top */}
              {isLoadingMore && (
                <div className="flex justify-center py-2">
                  <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Show "no more messages" when at the end */}
              {!hasMore && messages.length > 0 && (
                <div className="flex justify-center py-2">
                  <p className="text-xs text-muted-foreground">No more messages</p>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No messages yet. Start a conversation!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound'
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isInbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isInbound
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
        }`}
      >
        {message.mediaUrls && message.mediaUrls.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.mediaUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Attachment ${index + 1}`}
                className="max-w-full rounded-lg"
              />
            ))}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isInbound ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {timestamp}
        </p>
      </div>
    </div>
  )
}

function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-64" />
          <Card className="h-[calc(100vh-200px)]">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <Skeleton className="h-16 w-64 rounded-2xl" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Simple icons
const Send = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
)

const Loader = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const MessageCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
)
