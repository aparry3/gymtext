'use client'

import { Card } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

interface OverviewSectionProps {
  content: string
}

/**
 * Renders the Session Overview section
 * Expects content like: "Duration: ~60 min | RPE Target: 7-8 | Focus: areas"
 */
export function OverviewSection({ content }: OverviewSectionProps) {
  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-0">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="text-blue-700 font-semibold">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Card>
  )
}
