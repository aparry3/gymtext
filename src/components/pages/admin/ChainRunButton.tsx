'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export type ChainOperation = 'full' | 'structured' | 'formatted' | 'message'
export type EntityType = 'fitness-plan' | 'microcycle' | 'workout'

interface ChainRunButtonProps {
  entityType: EntityType
  entityId: string
  onSuccess?: () => void
  onError?: (error: string) => void
  disabled?: boolean
}

const OPERATION_LABELS: Record<ChainOperation, string> = {
  full: 'Full Chain',
  structured: 'Structured Only',
  formatted: 'Formatted Only',
  message: 'Message Only',
}

const OPERATION_DESCRIPTIONS: Record<ChainOperation, string> = {
  full: 'Re-generate everything from scratch',
  structured: 'Re-parse into structured data',
  formatted: 'Re-generate markdown format',
  message: 'Re-generate SMS message',
}

export function ChainRunButton({
  entityType,
  entityId,
  onSuccess,
  onError,
  disabled = false,
}: ChainRunButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingOperation, setLoadingOperation] = useState<ChainOperation | null>(null)
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)

  const getApiPath = () => {
    switch (entityType) {
      case 'fitness-plan':
        return `/api/admin/chains/fitness-plans/${entityId}/run`
      case 'microcycle':
        return `/api/admin/chains/microcycles/${entityId}/run`
      case 'workout':
        return `/api/admin/chains/workouts/${entityId}/run`
    }
  }

  const handleRunChain = async (operation: ChainOperation) => {
    setIsLoading(true)
    setLoadingOperation(operation)
    setLastResult(null)

    try {
      const response = await fetch(getApiPath(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to run chain')
      }

      const successMessage = `${OPERATION_LABELS[operation]} completed in ${result.executionTimeMs}ms`
      setLastResult({ success: true, message: successMessage })
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setLastResult({ success: false, message: errorMessage })
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
      setLoadingOperation(null)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isLoading}
            className="gap-2"
          >
            <ChainIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? `Running ${OPERATION_LABELS[loadingOperation!]}...` : 'Run Chain'}
            <ChevronDownIcon className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" side="bottom" className="w-56 p-2">
          <div className="flex flex-col gap-1">
            {(Object.keys(OPERATION_LABELS) as ChainOperation[]).map((operation) => (
              <button
                key={operation}
                onClick={() => handleRunChain(operation)}
                disabled={isLoading}
                className="flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-muted disabled:opacity-50"
              >
                <span className="text-sm font-medium">{OPERATION_LABELS[operation]}</span>
                <span className="text-xs text-muted-foreground">
                  {OPERATION_DESCRIPTIONS[operation]}
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {lastResult && (
        <span
          className={`text-xs ${
            lastResult.success ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {lastResult.message}
        </span>
      )}
    </div>
  )
}

// Simple icons
const ChainIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
    />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)
