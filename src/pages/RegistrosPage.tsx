import { ArrowRight, Search, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { LoadingState } from '../components/LoadingState'
import { MemoryCard } from '../components/MemoryCard'
import { PageHeader } from '../components/PageHeader'
import { useMemories } from '../hooks/useMemories'

const demoCreators = [
  { id: 'mock-milena', name: 'Milena', role: 'Pesquisa urbana', color: '#c82638' },
  { id: 'mock-antonia', name: 'Antônia', role: 'Memória oral', color: '#304b24' },
  { id: 'mock-elisa', name: 'Elisa', role: 'Saberes indígenas', color: '#304fd4' },
]

export function RegistrosPage() {
  const { memories, loading, error } = useMemories()
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const results = useMemo(() => memories.filter((memory) => `${memory.title} ${memory.subtitle} ${memory.author}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [memories, query])
  const creators = useMemo(() => {
    const colors = ['#c82638', '#304b24', '#304fd4']
    const unique = new Map<string, { id: string; name: string; role: string; color: string }>()
    memories.forEach((memory) => {
      if (memory.authorId && !unique.has(memory.authorId)) unique.set(memory.authorId, {
        id: memory.authorId,
        name: memory.author.split(' ')[0],
        role: memory.authorRole ?? 'Guardião de memórias',
        color: colors[unique.size % colors.length],
      })
    })
    return unique.size > 0 ? [...unique.values()].slice(0, 3) : demoCreators
  }, [memories])
  const featured = results.filter((memory) => memory.featured)
  const featuredMemory = featured[slide % Math.max(featured.length, 1)]

  return (
    <main className="app-page with-bottom-nav records-page">
      <PageHeader />
      <section className="records-hero">
        <span className="section-kicker">Arquivo vivo</span>
        <h1>Histórias do território</h1>
        <p>Escute, leia e reconheça as memórias que formam nossos lugares.</p>
        <div className="search-field records-search"><Search size={19} /><label className="sr-only" htmlFor="records-search">Pesquisar histórias</label><input id="records-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setSlide(0) }} placeholder="Pesquisar histórias" /></div>
      </section>
      {loading ? <LoadingState /> : error ? <p className="empty-state" role="alert">{error}</p> : results.length === 0 ? <p className="empty-state">Nenhuma história encontrada para “{query}”.</p> : (
        <div className="records-content">
          {featuredMemory && <section><div className="section-title-row"><h2>Em destaque</h2><span>{featured.length} histórias</span></div><MemoryCard memory={featuredMemory} /><div className="carousel-dots" aria-label="Selecionar história em destaque">{featured.map((item, index) => <button key={item.id} type="button" className={index === slide ? 'active' : ''} onClick={() => setSlide(index)} aria-label={`Ver destaque ${index + 1}`} />)}</div></section>}
          <section className="creators-section"><h2>Vozes que preservam</h2><div className="creator-list">{creators.map((creator) => <Link to={`/perfis/${creator.id}`} key={creator.name}><span style={{ '--creator-color': creator.color } as React.CSSProperties}><UserRound size={25} /></span><strong>{creator.name}</strong><small>{creator.role}</small></Link>)}</div></section>
          <section><div className="section-title-row"><h2>Mais histórias</h2><Link to="/mapa">Ver no mapa <ArrowRight size={15} /></Link></div><div className="compact-memory-list">{results.filter((item) => item.id !== featuredMemory?.id).map((memory) => <MemoryCard key={memory.id} memory={memory} compact />)}</div></section>
        </div>
      )}
      <BottomNav />
    </main>
  )
}
