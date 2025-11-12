'use client'

import { Card } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

interface NotesSectionProps {
  content: string
}

/**
 * Renders coaching notes or modifications section
 * Content should be markdown bullet list
 */
export function NotesSection({ content }: NotesSectionProps) {
  return (
    <Card className="p-6 bg-gray-50 border-gray-200">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 text-gray-700">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-gray-900 font-semibold">{children}</strong>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-2">{children}</p>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Card>
  )
}
