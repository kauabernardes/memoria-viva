import { LocateFixed, MapPin, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { LoadingState } from '../components/LoadingState'
import { MemoryMap } from '../components/MemoryMap'
import { PageHeader } from '../components/PageHeader'
import { useMemories } from '../hooks/useMemories'
import { memoryCategories, type MemoryCategory } from '../types'

type Filter = 'todos' | MemoryCategory

export function MapaPage() {
  const { memories, loading, error } = useMemories()
  const [filter, setFilter] = useState<Filter>('todos')
  const [query, setQuery] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const filtered = useMemo(() => memories.filter((memory) => {
    const categoryMatch = filter === 'todos' || memory.category === filter || memory.categories?.includes(filter)
    const text = `${memory.title} ${memory.subtitle} ${memory.location}`.toLocaleLowerCase('pt-BR')
    return categoryMatch && text.includes(query.toLocaleLowerCase('pt-BR'))
  }), [filter, memories, query])

  function requestLocation() {
    if (!navigator.geolocation) return setLocationMessage('Localização não disponível neste dispositivo.')
    setLocationMessage('Buscando sua localização…')
    navigator.geolocation.getCurrentPosition(
      () => setLocationMessage('Localização encontrada. Os registros próximos aparecem primeiro.'),
      () => setLocationMessage('Sem acesso à localização. O mapa continua disponível.'),
      { timeout: 6000, maximumAge: 300000 },
    )
  }

  return (
    <main className="app-page with-bottom-nav">
      <PageHeader />
      <section className="map-toolbar">
        <div className="search-field">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="map-search">Pesquisar lugares</label>
          <input id="map-search" type="search" placeholder="Pesquisar no território" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="icon-button" type="button" onClick={requestLocation} aria-label="Usar minha localização"><LocateFixed size={19} /></button>
        </div>
        {locationMessage && <p className="inline-status" role="status">{locationMessage}</p>}
        <div className="filter-row" aria-label="Filtrar por categoria">
          {(['todos', ...memoryCategories] as Filter[]).map((category) => (
            <button key={category} className={filter === category ? 'active' : ''} type="button" onClick={() => setFilter(category)}>{category}</button>
          ))}
        </div>
      </section>
      {loading ? <LoadingState /> : error ? <p className="empty-state" role="alert">{error}</p> : (
        <>
          <section className="map-wrap" aria-label="Mapa das memórias"><MemoryMap memories={filtered} /></section>
          <section className="nearby-section">
            <div className="section-title-row"><div><span className="section-kicker">Ao seu redor</span><h1>Lugares de memória</h1></div><span>{filtered.length} registros</span></div>
            {filtered.length === 0 ? <p className="empty-state">Nenhuma memória corresponde aos filtros.</p> : (
              <div className="place-list">
                {filtered.slice(0, 5).map((memory) => (
                  <Link key={memory.id} to={`/historias/${memory.id}`}>
                    <span className={`place-dot category-bg-${memory.category}`}><MapPin size={14} /></span>
                    <span><strong>{memory.title}</strong><small>{memory.subtitle}</small></span>
                    <em>{memory.distance}</em>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <BottomNav />
    </main>
  )
}
