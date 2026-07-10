import { ArrowRight, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="opening-page organic-lines">
      <div className="opening-copy">
        <span>Visibilidade começa com evidência.</span>
        <strong>E a evidência começa com Memória Viva.</strong>
      </div>
      <div className="floating-point point-blue" />
      <div className="floating-point point-green" />
      <div className="floating-point point-red" />
      <div className="opening-brand">
        <Sprout size={46} strokeWidth={1.5} />
        <span>Memória Viva</span>
      </div>
      <Link className="access-button" to="/login">
        Acessar <span><ArrowRight size={26} /></span>
      </Link>
      <p className="opening-note">Territórios, vozes e histórias que permanecem.</p>
    </main>
  )
}
