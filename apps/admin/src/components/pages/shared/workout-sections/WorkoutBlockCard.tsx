'use client'

import { Card } from '@/components/ui/card'
import { ReactNode } from 'react'

interface WorkoutBlockCardProps {
  emoji?: string
  blockName?: string
  goal?: string
  children: ReactNode
}

/**
 * Wrapper card for a workout block with colored border based on emoji
 */
export function WorkoutBlockCard({ emoji, blockName, goal, children }: WorkoutBlockCardProps) {
  // Determine border color based on emoji
  const getBorderColor = (emoji?: string): string => {
    switch (emoji) {
      case '🔥':
        return 'border-l-blue-500'
      case '💪':
        return 'border-l-red-500'
      case '🏋️':
        return 'border-l-green-500'
      case '🏃':
        return 'border-l-pink-500'
      case '🧘':
        return 'border-l-purple-500'
      default:
        return 'border-l-gray-400'
    }
  }

  return (
    <Card className={`p-6 border-l-4 ${getBorderColor(emoji)}`}>
      {/* Block Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {emoji && <span className="text-2xl">{emoji}</span>}
          {blockName && (
            <h3 className="text-xl font-semibold text-gray-900">{blockName}</h3>
          )}
        </div>
        {goal && (
          <p className="text-sm text-gray-600 italic">{goal}</p>
        )}
      </div>

      {/* Block Content (exercises, supersets, circuits) */}
      <div className="space-y-3">
        {children}
      </div>
    </Card>
  )
}
