'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'

interface ExerciseSectionProps {
  content: string
  name?: string
}

/**
 * Renders a single exercise with its details
 * Content should be markdown like:
 * **Exercise Name** [TYPE]
 * - 3 × 10 reps
 * - RPE: 7
 * - *Cue: instruction*
 */
export function ExerciseSection({ content, name }: ExerciseSectionProps) {
  // Extract exercise type badge from content
  const typeMatch = content.match(/\[([A-Z]+)\]/)
  const exerciseType = typeMatch ? typeMatch[1] : null

  // Get color for exercise type
  const typeColors: Record<string, string> = {
    PREP: 'bg-blue-100 text-blue-700 border-blue-300',
    COMPOUND: 'bg-red-100 text-red-700 border-red-300',
    SECONDARY: 'bg-orange-100 text-orange-700 border-orange-300',
    ACCESSORY: 'bg-green-100 text-green-700 border-green-300',
    CORE: 'bg-purple-100 text-purple-700 border-purple-300',
    CARDIO: 'bg-pink-100 text-pink-700 border-pink-300',
    COOLDOWN: 'bg-gray-100 text-gray-700 border-gray-300',
  }

  return (
    <Card className="p-4 bg-white border-gray-200 hover:shadow-sm transition-shadow">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {name && <h4 className="font-semibold text-gray-900">{name}</h4>}
          {exerciseType && (
            <Badge variant="outline" className={`text-xs ${typeColors[exerciseType] || 'bg-gray-100 text-gray-700'}`}>
              {exerciseType}
            </Badge>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              // Hide the exercise name line if we're showing it in header
              strong: ({ children }) => {
                const text = String(children)
                if (name && text === name) return null
                return <strong className="text-gray-900">{children}</strong>
              },
              // Style bullet points
              ul: ({ children }) => (
                <ul className="list-none space-y-1 pl-0">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 text-sm">{children}</li>
              ),
              // Style cues (italic text)
              em: ({ children }) => (
                <em className="text-gray-600 not-italic block mt-1">
                  💡 {children}
                </em>
              ),
              p: ({ children }) => <p className="mb-1">{children}</p>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </Card>
  )
}
