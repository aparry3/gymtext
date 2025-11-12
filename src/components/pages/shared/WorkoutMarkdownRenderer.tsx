'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/components/ui/badge'

/**
 * Custom Workout Markdown Renderer
 *
 * Renders formatted workout text with custom styling for workout-specific elements:
 * - Exercise type badges ([COMPOUND], [ACCESSORY], etc.)
 * - RPE and intensity indicators
 * - Emphasis on coaching cues
 * - Proper spacing and visual hierarchy
 */

interface WorkoutMarkdownRendererProps {
  content: string
  className?: string
}

export function WorkoutMarkdownRenderer({ content, className = '' }: WorkoutMarkdownRendererProps) {
  return (
    <div className={`workout-markdown prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold mb-4 mt-6 text-gray-900" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-semibold mb-3 mt-6 text-gray-800 border-b pb-2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-medium mb-2 mt-4 text-gray-700" {...props}>
              {children}
            </h3>
          ),

          // Horizontal rule for block separators
          hr: (props) => (
            <hr className="my-6 border-gray-200" {...props} />
          ),

          // Paragraphs with proper spacing
          p: ({ children, ...props }) => {
            // Convert children to string to check for special patterns
            const text = String(children);

            // Check for exercise type badges [TYPE]
            const badgeMatch = text.match(/\[([A-Z]+)\]/);
            if (badgeMatch) {
              const typeColors: Record<string, string> = {
                prep: 'bg-blue-100 text-blue-700 border-blue-300',
                compound: 'bg-red-100 text-red-700 border-red-300',
                secondary: 'bg-orange-100 text-orange-700 border-orange-300',
                accessory: 'bg-green-100 text-green-700 border-green-300',
                core: 'bg-purple-100 text-purple-700 border-purple-300',
                cardio: 'bg-pink-100 text-pink-700 border-pink-300',
                cooldown: 'bg-gray-100 text-gray-700 border-gray-300',
              };

              return (
                <p className="mb-2" {...props}>
                  {text.split(/\[([A-Z]+)\]/).map((part, i) => {
                    if (i % 2 === 1) {
                      // This is the badge content
                      const color = typeColors[part.toLowerCase()] || 'bg-gray-100 text-gray-700';
                      return (
                        <Badge key={i} variant="outline" className={`text-xs mr-2 ${color}`}>
                          {part}
                        </Badge>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            }

            return (
              <p className="mb-2 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },

          // Strong (bold) text - used for exercise names and important info
          strong: ({ children, ...props }) => {
            const text = String(children);

            // Check for special keywords
            if (text.includes('Progression:') || text.includes('Duration:') || text.includes('Goal:')) {
              return (
                <strong className="text-blue-700 font-semibold" {...props}>
                  {children}
                </strong>
              );
            }

            // Check for RPE/RIR indicators
            if (text.includes('RPE') || text.includes('RIR')) {
              return (
                <strong className="text-orange-600 font-semibold" {...props}>
                  {children}
                </strong>
              );
            }

            // Exercise names (likely if followed by work details)
            return (
              <strong className="text-gray-900 font-semibold" {...props}>
                {children}
              </strong>
            );
          },

          // Emphasis (italic) - used for coaching cues
          em: ({ children, ...props }) => {
            return (
              <em className="text-gray-600 not-italic" {...props}>
                💡 {children}
              </em>
            );
          },

          // Lists with proper styling
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside space-y-1 mb-4" {...props}>
              {children}
            </ul>
          ),

          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4" {...props}>
              {children}
            </ol>
          ),

          li: ({ children, ...props }) => (
            <li className="ml-4" {...props}>
              {children}
            </li>
          ),

          // Blockquotes (if used for special notes)
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700" {...props}>
              {children}
            </blockquote>
          ),

          // Code blocks (if used for special formatting)
          code: ({ children, ...props }) => (
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        .workout-markdown {
          color: #374151;
        }

        .workout-markdown h1 {
          line-height: 1.2;
        }

        .workout-markdown h2 {
          line-height: 1.3;
        }

        .workout-markdown p {
          margin-bottom: 0.5rem;
        }

        .workout-markdown strong {
          font-weight: 600;
        }

        .workout-markdown ul,
        .workout-markdown ol {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  )
}
