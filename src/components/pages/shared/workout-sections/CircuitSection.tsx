'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'

interface CircuitSectionProps {
  content: string
  name?: string
}

/**
 * Renders a circuit with numbered flow
 * Content should be markdown like:
 * **Circuit A** (2 rounds, 60s rest)
 * - 1a. **Exercise 1** - details
 * - 1b. **Exercise 2** - details
 * - 1c. **Exercise 3** - details
 */
export function CircuitSection({ content, name }: CircuitSectionProps) {
  // Extract rounds and rest info from first line
  const firstLine = content.split('\n')[0]
  const metaMatch = firstLine.match(/\((.+)\)/)
  const metaInfo = metaMatch ? metaMatch[1] : null

  // Split content into individual exercises (1a, 1b, 1c, etc)
  const exercises = content.split(/^-\s+\d[a-z]\./m).filter(Boolean).slice(1)

  return (
    <Card className="p-4 bg-orange-50 border-orange-300">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-600 text-white">{name || 'Circuit'}</Badge>
            {metaInfo && (
              <span className="text-sm text-gray-600">{metaInfo}</span>
            )}
          </div>
        </div>

        {/* Exercises in circuit - vertical flow */}
        <div className="space-y-2">
          {exercises.map((exercise, idx) => {
            return (
              <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded border border-orange-200">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="text-sm text-gray-700 mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="text-gray-900 font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="text-gray-600 not-italic block text-xs mt-1">💡 {children}</em>,
                      }}
                    >
                      {exercise.trim()}
                    </ReactMarkdown>
                  </div>
                </div>
                {idx < exercises.length - 1 && (
                  <div className="text-orange-400 text-xl">→</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
