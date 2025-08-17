import { Metadata } from 'next'
import ChatInterface from './components/ChatInterface'

export const metadata: Metadata = {
  title: 'Chat - GYMTEXT',
  description: 'Chat with our AI fitness coach to create your personalized fitness profile',
}

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ChatInterface />
    </main>
  )
}