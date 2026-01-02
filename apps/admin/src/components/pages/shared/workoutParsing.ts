/**
 * Workout Markdown Pattern Detection Utilities
 *
 * These utilities split markdown into sections based on regex patterns,
 * WITHOUT converting to TypeScript types. Each section remains as a markdown string
 * with a type label for rendering purposes.
 */

export interface WorkoutSection {
  type: 'title' | 'overview' | 'block' | 'notes' | 'modifications'
  content: string
  emoji?: string  // Block emoji if present
  blockName?: string  // Block name if it's a block section
}

export interface BlockItem {
  type: 'exercise' | 'superset' | 'circuit'
  content: string  // markdown string
  name?: string  // exercise/superset/circuit name
}

/**
 * Split workout markdown into major sections
 * Returns array of sections with their markdown content
 */
export function splitWorkoutSections(markdown: string): WorkoutSection[] {
  const sections: WorkoutSection[] = []

  // Split by H2 headers (##) while preserving them
  const lines = markdown.split('\n')
  let currentSection: WorkoutSection | null = null
  let currentContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check for H1 (title)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      if (currentSection && currentContent.length > 0) {
        sections.push({ ...currentSection, content: currentContent.join('\n').trim() })
      }
      currentSection = { type: 'title', content: '' }
      currentContent = [line.replace(/^# /, '')]
      continue
    }

    // Check for H2 (block/section headers)
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections.push({ ...currentSection, content: currentContent.join('\n').trim() })
      }

      // Determine section type
      const headerText = line.replace(/^## /, '')
      const emojiMatch = headerText.match(/^([\u{1F300}-\u{1F9FF}])\s*/u)
      const emoji = emojiMatch ? emojiMatch[1] : undefined
      const textWithoutEmoji = emoji ? headerText.replace(emoji, '').trim() : headerText

      // Detect section type by content
      if (textWithoutEmoji.toLowerCase().includes('session overview') || textWithoutEmoji.includes('🎯')) {
        currentSection = { type: 'overview', content: '', emoji }
      } else if (textWithoutEmoji.toLowerCase().includes('coaching notes') || textWithoutEmoji.toLowerCase().includes('notes')) {
        currentSection = { type: 'notes', content: '', emoji }
      } else if (textWithoutEmoji.toLowerCase().includes('modifications')) {
        currentSection = { type: 'modifications', content: '', emoji }
      } else {
        // It's a workout block
        const blockMatch = textWithoutEmoji.match(/Block \d+:\s*(.+)/)
        const blockName = blockMatch ? blockMatch[1] : textWithoutEmoji
        currentSection = { type: 'block', content: '', emoji, blockName }
      }

      currentContent = []
      continue
    }

    // Skip horizontal rules (they're just separators)
    if (line.trim() === '---') {
      continue
    }

    // Add line to current content
    if (line.trim()) {
      currentContent.push(line)
    } else if (currentContent.length > 0) {
      // Preserve blank lines within sections
      currentContent.push('')
    }
  }

  // Add final section
  if (currentSection && currentContent.length > 0) {
    sections.push({ ...currentSection, content: currentContent.join('\n').trim() })
  }

  return sections
}

/**
 * Clean block content to handle nested structures and metadata
 * Converts nested/indented exercises to flat structure
 */
function cleanBlockContent(content: string): string {
  const lines = content.split('\n')
  const cleaned: string[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Skip metadata lines (Duration, Light Cardio, etc.)
    if (line.match(/^-\s+\*\*(Duration|Light Cardio|Mobility|Specific Warm-up|Equipment):/)) {
      continue
    }

    // Skip section label lines (Activation:, Main Work:, etc.) but keep subsections for supersets/circuits
    if (line.match(/^-\s+\*\*[A-Za-z\s]+:\*\*\s*$/) && !line.includes('Superset') && !line.includes('Circuit')) {
      continue
    }

    // Handle nested exercises - remove indentation and numbering
    // Match: "  1. **Exercise** [TYPE]" or "     - details"
    if (line.match(/^\s{2,}\d+\.\s+\*\*[^*]+\*\*/)) {
      // This is a nested exercise, flatten it
      line = line.replace(/^\s{2,}\d+\.\s+/, '')
    } else if (line.match(/^\s{5,}-\s+/)) {
      // This is a nested detail line, flatten it
      line = line.replace(/^\s{5,}/, '')
    }

    // Remove letter prefixes from regular exercises (A., B., C.) unless it's in a superset/circuit context
    // Only remove if it's at the start of a bold exercise name and NOT in a list item starting with "1a."
    if (line.match(/^\*\*[A-Z]\.\s+[^*]+\*\*/) && !line.match(/^-\s+\d[a-z]\./)) {
      line = line.replace(/^\*\*([A-Z])\.\s+/, '**')
    }

    cleaned.push(line)
  }

  return cleaned.join('\n')
}

/**
 * Split a workout block into individual items (exercises, supersets, circuits)
 * Returns array of items with their markdown content
 */
export function splitBlockItems(blockMarkdown: string): BlockItem[] {
  // Pre-process content to clean nested structures
  const cleanedContent = cleanBlockContent(blockMarkdown)

  const items: BlockItem[] = []

  // Split into lines for processing
  const lines = cleanedContent.split('\n')
  let currentItem: BlockItem | null = null
  let currentContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip the Goal line (it's part of block header)
    if (line.trim().startsWith('**Goal:**')) {
      continue
    }

    // Check for Superset pattern: **Superset X** (...)
    const supersetMatch = line.match(/^\*\*Superset\s+([A-Z])\*\*\s*\((.+)\)/)
    if (supersetMatch) {
      // Save previous item
      if (currentItem && currentContent.length > 0) {
        items.push({ ...currentItem, content: currentContent.join('\n').trim() })
      }

      currentItem = {
        type: 'superset',
        content: '',
        name: `Superset ${supersetMatch[1]}`
      }
      currentContent = [line]
      continue
    }

    // Check for Circuit pattern: **Circuit X** (...)
    const circuitMatch = line.match(/^\*\*Circuit\s+([A-Z])\*\*\s*\((.+)\)/)
    if (circuitMatch) {
      // Save previous item
      if (currentItem && currentContent.length > 0) {
        items.push({ ...currentItem, content: currentContent.join('\n').trim() })
      }

      currentItem = {
        type: 'circuit',
        content: '',
        name: `Circuit ${circuitMatch[1]}`
      }
      currentContent = [line]
      continue
    }

    // Check for standalone exercise: **Exercise Name** [TYPE] or just **Exercise Name**
    const exerciseMatch = line.match(/^\*\*([^*]+)\*\*(?:\s*\[([A-Z]+)\])?/)
    if (exerciseMatch && !line.includes('**Goal:**') && !line.includes('**Superset') && !line.includes('**Circuit')) {
      // Only start new exercise if we're not in a superset/circuit
      if (!currentItem || (currentItem.type !== 'superset' && currentItem.type !== 'circuit')) {
        // Save previous item
        if (currentItem && currentContent.length > 0) {
          items.push({ ...currentItem, content: currentContent.join('\n').trim() })
        }

        currentItem = {
          type: 'exercise',
          content: '',
          name: exerciseMatch[1].trim()
        }
        currentContent = [line]
        continue
      }
    }

    // Add line to current item
    if (currentItem) {
      if (line.trim()) {
        currentContent.push(line)
      } else if (currentContent.length > 0 && i < lines.length - 1) {
        // Preserve blank lines between exercises
        const nextLine = lines[i + 1]
        const isNextExercise = nextLine && nextLine.match(/^\*\*([^*]+)\*\*/)
        if (isNextExercise && (!currentItem || currentItem.type === 'exercise')) {
          // This blank line separates exercises, so save current and prepare for next
          if (currentContent.length > 0) {
            items.push({ ...currentItem, content: currentContent.join('\n').trim() })
            currentItem = null
            currentContent = []
          }
        } else {
          // Blank line within an item
          currentContent.push('')
        }
      }
    }
  }

  // Add final item
  if (currentItem && currentContent.length > 0) {
    items.push({ ...currentItem, content: currentContent.join('\n').trim() })
  }

  return items
}

/**
 * Extract the goal from a block's markdown content
 */
export function extractBlockGoal(blockMarkdown: string): string | undefined {
  const match = blockMarkdown.match(/\*\*Goal:\*\*\s*(.+)/)
  return match ? match[1].trim() : undefined
}
