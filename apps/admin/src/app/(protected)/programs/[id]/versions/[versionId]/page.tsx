'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function VersionDetailPage() {
  const { id: programId, versionId } = useParams()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/programs/${programId}?viewVersion=${versionId}`)
  }, [programId, versionId, router])

  return null
}
