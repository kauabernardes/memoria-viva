import { useEffect, useState } from 'react'
import { listMemories } from '../services/memoryService'
import type { Memory } from '../types'

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void listMemories()
      .then((data) => { if (active) setMemories(data) })
      .catch(() => { if (active) setError('Não foi possível carregar as memórias agora.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { memories, loading, error }
}
