import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Memory } from '../types'
import { ImageWithFallback } from './ImageWithFallback'

export function MemoryCard({ memory, compact = false }: { memory: Memory; compact?: boolean }) {
  return (
    <Link className={`memory-card ${compact ? 'compact' : ''}`} to={`/historias/${memory.id}`}>
      <ImageWithFallback src={memory.image} alt={`Imagem de ${memory.title}`} loading="lazy" />
      <div className="memory-card-shade" />
      <div className="memory-card-content">
        <span className="eyebrow"><MapPin size={12} /> {memory.location}</span>
        <h3>{memory.title}</h3>
        <p>{memory.subtitle}</p>
        <span className={`category-pill category-${memory.category}`}>{memory.category}</span>
      </div>
      <ArrowUpRight className="memory-card-arrow" size={20} aria-hidden="true" />
    </Link>
  )
}
