import { Heart, MapPin, Pause, Play, UserRound, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImageWithFallback } from '../components/ImageWithFallback'
import { LoadingState } from '../components/LoadingState'
import { MemoryMap } from '../components/MemoryMap'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { getMemoryById, isFavorite, toggleFavorite } from '../services/memoryService'
import type { Memory } from '../types'
import { sendAppInventorEvent } from '../utils/appInventor'

export function HistoriaPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const [memory, setMemory] = useState<Memory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let active = true
    void Promise.all([getMemoryById(id), isFavorite(id, user?.id)])
      .then(([result, favoriteResult]) => { if (active) { setMemory(result); setFavorite(favoriteResult); if (result) sendAppInventorEvent(`OPEN_MEMORY:${result.id}`) } })
      .catch(() => { if (active) setError('Não foi possível abrir esta memória.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, user?.id])

  async function handleFavorite() {
    try { setFavorite(await toggleFavorite(id, user?.id)) } catch { setError('Não foi possível atualizar o favorito.') }
  }

  if (loading) return <main className="app-page"><PageHeader back /><LoadingState label="Abrindo memória…" /></main>
  if (error && !memory) return <main className="app-page"><PageHeader back /><p className="empty-state" role="alert">{error}</p></main>
  if (!memory) return <main className="app-page"><PageHeader back /><div className="empty-state"><h1>Memória não encontrada</h1><Link to="/registros">Voltar aos registros</Link></div></main>

  const categories = memory.categories ?? [memory.category]
  return (
    <main className={`app-page story-page story-${memory.category}`}>
      <PageHeader back />
      <section className="story-image-wrap"><ImageWithFallback src={memory.image} alt={`Imagem de ${memory.title}`} /><div className="story-image-shade" /></section>
      <article className="story-content organic-lines">
        <button type="button" className={`favorite-button ${favorite ? 'active' : ''}`} onClick={handleFavorite} aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}><Heart fill={favorite ? 'currentColor' : 'none'} /></button>
        <span className="eyebrow">{memory.location}</span>
        <h1>{memory.title}</h1>
        <p className="story-subtitle">{memory.subtitle}</p>
        <div className="category-list">{categories.map((category) => <span key={category} className={`category-pill category-${category}`}>{category}</span>)}</div>
        <section className="narrator-card">
          <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pausar narração simulada' : 'Ouvir narração simulada'}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
          <UserRound size={28} aria-hidden="true" />
          <Link className="narrator-profile-link" to={memory.authorId ? `/perfis/${memory.authorId}` : '/perfil'}><span>Narrado por</span><strong>{memory.author}</strong><small>{memory.authorRole ?? 'Guardião desta memória'}</small></Link>
          <span className={`audio-progress ${playing ? 'playing' : ''}`} />
        </section>
        <section className="story-text"><span className="section-kicker">Memória</span><p>{memory.description}</p><blockquote>“Quando uma história encontra escuta, o território volta a falar.”</blockquote></section>
        <section className="story-location-section">
          <span className="section-kicker">Localização</span>
          <div className="story-location-map"><MemoryMap memories={[memory]} center={[memory.latitude, memory.longitude]} zoom={15} /></div>
          <div className="story-location-meta"><MapPin size={18} /><div><strong>{memory.location}</strong><small>{memory.latitude.toFixed(5)}, {memory.longitude.toFixed(5)}</small></div></div>
          <div className="story-location-meta"><UsersRound size={18} /><div><strong>{memory.community}</strong><small>Comunidade relacionada</small></div></div>
        </section>
        <section className="story-author-section">
          <span className="section-kicker">Autoria</span>
          <Link to={memory.authorId ? `/perfis/${memory.authorId}` : '/perfil'}><UserRound size={22} /><span><strong>{memory.author}</strong><small>Conheça outras histórias desta autoria</small></span></Link>
        </section>
        {error && <p className="form-error" role="alert">{error}</p>}
      </article>
    </main>
  )
}
