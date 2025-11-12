'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'

interface SupersetSectionProps {
  content: string
  name?: string
}

/**
 * Renders a superset with visual pairing
 * Content should be markdown like:
 * **Superset A** (3 rounds, 90s rest)
 * - 1a. **Exercise 1** - details
 * - 1b. **Exercise 2** - details
 */
export function SupersetSection({ content, name }: SupersetSectionProps) {
  // Extract rounds and rest info from first line
  const firstLine = content.split('\n')[0]
  const metaMatch = firstLine.match(/\((.+)\)/)
  const metaInfo = metaMatch ? metaMatch[1] : null

  // Split content into individual exercises (1a, 1b)
  const exercises = content.split(/^-\s+\d[a-z]\./m).filter(Boolean).slice(1)

  return (
    <Card className="p-4 bg-purple-50 border-purple-300">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white">{name || 'Superset'}</Badge>
            {metaInfo && (
              <span className="text-sm text-gray-600">{metaInfo}</span>
            )}
          </div>
        </div>

        {/* Exercises in superset */}
        <div className="grid md:grid-cols-2 gap-3">
          {exercises.map((exercise, idx) => {
            const label = idx === 0 ? '1a' : '1b'
            return (
              <div key={idx} className="bg-white p-3 rounded border border-purple-200">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 shrink-0">
                    {label}
                  </Badge>
                  <div className="prose prose-sm max-w-none flex-1">
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
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
