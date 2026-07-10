import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadingState } from '../components/LoadingState'
import { MemoryCard } from '../components/MemoryCard'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { listFavoriteMemories } from '../services/memoryService'
import type { Memory } from '../types'

export function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    let active = true
    void listFavoriteMemories(user?.id)
      .then((result) => { if (active) setMemories(result) })
      .catch(() => { if (active) setError('Não foi possível carregar seus favoritos.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [authLoading, user?.id])

  return (
    <main className="app-page favorites-page">
      <PageHeader back title="Favoritos" />
      <section className="favorites-heading"><Heart size={25} /><span className="section-kicker">Seu arquivo afetivo</span><h1>Histórias favoritas</h1><p>Memórias que você escolheu guardar por perto.</p></section>
      {loading || authLoading ? <LoadingState /> : error ? <p className="empty-state" role="alert">{error}</p> : memories.length === 0 ? <div className="empty-state"><Heart size={27} /><h2>Nenhuma favorita ainda</h2><p>Marque o coração em uma memória para encontrá-la aqui.</p><Link to="/registros">Descobrir histórias</Link></div> : <section className="favorite-memory-list">{memories.map((memory) => <MemoryCard key={memory.id} memory={memory} compact />)}</section>}
    </main>
  )
}
