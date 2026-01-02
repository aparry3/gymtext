'use client'

import { splitWorkoutSections, splitBlockItems, extractBlockGoal } from './workoutParsing'
import { OverviewSection } from './workout-sections/OverviewSection'
import { ExerciseSection } from './workout-sections/ExerciseSection'
import { SupersetSection } from './workout-sections/SupersetSection'
import { CircuitSection } from './workout-sections/CircuitSection'
import { NotesSection } from './workout-sections/NotesSection'
import { WorkoutBlockCard } from './workout-sections/WorkoutBlockCard'

interface WorkoutStructuredRendererProps {
  content: string
  className?: string
}

/**
 * Main workout renderer that uses pattern detection to render
 * markdown content with appropriate visual components
 *
 * Does NOT convert to TypeScript types - keeps markdown as source of truth
 * and uses regex patterns to apply visual styling
 */
export function WorkoutStructuredRenderer({ content, className = '' }: WorkoutStructuredRendererProps) {
  // Split markdown into sections
  const sections = splitWorkoutSections(content)

  return (
    <div className={`space-y-6 ${className}`}>
      {sections.map((section, i) => {
        switch (section.type) {
          case 'title':
            return (
              <h1 key={i} className="text-3xl font-bold text-gray-900 mb-4">
                {section.content}
              </h1>
            )

          case 'overview':
            return <OverviewSection key={i} content={section.content} />

          case 'block': {
            // Extract goal from block content
            const goal = extractBlockGoal(section.content)

            // Split block into items (exercises, supersets, circuits)
            const items = splitBlockItems(section.content)

            return (
              <WorkoutBlockCard
                key={i}
                emoji={section.emoji}
                blockName={section.blockName}
                goal={goal}
              >
                {items.map((item, j) => {
                  switch (item.type) {
                    case 'superset':
                      return (
                        <SupersetSection
                          key={j}
                          content={item.content}
                          name={item.name}
                        />
                      )

                    case 'circuit':
                      return (
                        <CircuitSection
                          key={j}
                          content={item.content}
                          name={item.name}
                        />
                      )

                    case 'exercise':
                      return (
                        <ExerciseSection
                          key={j}
                          content={item.content}
                          name={item.name}
                        />
                      )

                    default:
                      return null
                  }
                })}
              </WorkoutBlockCard>
            )
          }

          case 'notes':
            return <NotesSection key={i} content={section.content} />

          case 'modifications':
            return <NotesSection key={i} content={section.content} />

          default:
            return null
        }
      })}
    </div>
  )
}
