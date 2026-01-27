'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface RankExercise {
  id: string
  name: string
  description: string | null
  popularity: string
}

export default function ExerciseRankPage() {
  const [exercises, setExercises] = useState<RankExercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [threshold, setThreshold] = useState(0)
  const [highlight, setHighlight] = useState<'gold' | 'red' | null>(null)
  const [loading, setLoading] = useState(true)

  const round = Math.round(threshold / 0.2) + 1
  const totalRounds = 5

  const fetchExercises = useCallback(async (t: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/exercises/rank?threshold=${t}`)
      const json = await res.json()
      if (json.success) {
        setExercises(json.data)
        setCurrentIndex(0)
        setHighlight(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExercises(threshold)
  }, [threshold, fetchExercises])

  const current = exercises[currentIndex]
  const popularity = current ? parseFloat(current.popularity) : 0
  const starCount = Math.round(popularity / 0.2)

  const adjustPopularity = useCallback(async (delta: number) => {
    if (!current) return
    const newPop = Math.min(1, Math.max(0, popularity + delta))
    // Optimistic local update
    setExercises(prev =>
      prev.map((e, i) => i === currentIndex ? { ...e, popularity: newPop.toFixed(3) } : e)
    )
    setHighlight(delta > 0 ? 'gold' : 'red')
    // Persist
    await fetch('/api/exercises/rank', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: current.id, delta }),
    })
  }, [current, currentIndex, popularity])

  const navigate = useCallback((dir: 1 | -1) => {
    const next = currentIndex + dir
    if (next < 0) return
    if (next >= exercises.length) {
      // End of round — advance threshold
      if (threshold < 0.8) {
        setThreshold(prev => Math.round((prev + 0.2) * 10) / 10)
      }
      return
    }
    setCurrentIndex(next)
    setHighlight(null)
  }, [currentIndex, exercises.length, threshold])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigate(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigate(-1)
      } else if (e.key === ' ') {
        e.preventDefault()
        if (e.shiftKey) {
          adjustPopularity(-0.2)
        } else {
          adjustPopularity(0.2)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate, adjustPopularity])

  const cardBg = highlight === 'gold'
    ? 'bg-amber-50 ring-2 ring-amber-300'
    : highlight === 'red'
      ? 'bg-red-50 ring-2 ring-red-300'
      : 'bg-white'

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/exercises" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Exercises
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">Round {round}/{totalRounds}</span>
          {exercises.length > 0 && (
            <span>{currentIndex + 1} / {exercises.length}</span>
          )}
          <button
            onClick={async () => {
              if (!confirm('Reset ALL exercise popularity to 0? This cannot be undone.')) return
              await fetch('/api/exercises/rank', { method: 'POST' })
              setThreshold(0)
              fetchExercises(0)
            }}
            className="ml-4 px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="text-gray-400">Loading exercises...</div>
        ) : exercises.length === 0 ? (
          <div className="text-gray-400">No exercises at this threshold</div>
        ) : current ? (
          <div className={`rounded-xl shadow-lg p-10 max-w-lg w-full transition-all ${cardBg}`}>
            {/* Stars */}
            <div className="flex gap-1 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <svg
                  key={i}
                  className={`w-7 h-7 ${i <= starCount ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  fill={i <= starCount ? 'currentColor' : 'none'}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>

            {/* Exercise name */}
            <h2 className="text-2xl font-bold text-center mb-3">{current.name}</h2>

            {/* Description */}
            {current.description && (
              <p className="text-gray-600 text-center text-sm">{current.description}</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Bottom hints */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400 mt-4">
        <span>&larr; prev</span>
        <span>space: star</span>
        <span>shift+space: unstar</span>
        <span>next &rarr;</span>
      </div>
    </div>
  )
}
