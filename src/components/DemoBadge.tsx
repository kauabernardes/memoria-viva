import { FlaskConical } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function DemoBadge() {
  const { isDemo } = useAuth()
  if (!isDemo) return null
  return <span className="demo-badge"><FlaskConical size={12} /> Modo demonstração</span>
}
