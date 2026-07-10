import { ArrowLeft, Sprout } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DemoBadge } from './DemoBadge'

interface PageHeaderProps {
  title?: string
  back?: boolean
}

export function PageHeader({ title = 'Memória Viva', back = false }: PageHeaderProps) {
  const navigate = useNavigate()
  const goBack = () => window.history.length > 1 ? navigate(-1) : navigate('/mapa')

  return (
    <header className="page-header">
      {back ? (
        <button type="button" className="icon-button" onClick={goBack} aria-label="Voltar">
          <ArrowLeft size={23} />
        </button>
      ) : <Sprout className="header-symbol" size={23} aria-hidden="true" />}
      <strong>{title}</strong>
      <DemoBadge />
    </header>
  )
}
