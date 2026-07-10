import { Map, Menu, NotebookText } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/mapa', label: 'mapa', icon: Map },
  { to: '/registros', label: 'registros', icon: NotebookText },
  { to: '/menu', label: 'menu', icon: Menu },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
          <Icon size={25} strokeWidth={2.2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
