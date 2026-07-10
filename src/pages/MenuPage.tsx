import { BookImage, ChevronRight, CirclePlus, Heart, LockKeyhole, LogOut, Settings2, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'

const secondaryItems = [
  { label: 'Privacidade e segurança', icon: LockKeyhole },
  { label: 'Preferências', icon: Settings2 },
  { label: 'Autoria das imagens', icon: BookImage },
]

export function MenuPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  async function logout() { await signOut(); navigate('/login') }

  return (
    <main className="app-page with-bottom-nav menu-page">
      <PageHeader title="Menu" />
      <Link className="profile-summary" to="/perfil">
        <div className="profile-avatar"><UserRound size={32} /></div>
        <div><span>Seu perfil</span><strong>{user?.username || user?.email?.split('@')[0] || 'Visitante'}</strong><small>{user?.email || 'Modo demonstração'}</small></div>
        <ShieldCheck size={20} aria-label="Perfil protegido" />
      </Link>
      <nav className="menu-list" aria-label="Opções da conta">
        <Link to="/novo-registro"><CirclePlus /><span><strong>Novo registro</strong><small>Compartilhe uma memória</small></span><ChevronRight /></Link>
        <Link to="/favoritos"><Heart /><span><strong>Favoritos</strong><small>Memórias guardadas</small></span><ChevronRight /></Link>
        {secondaryItems.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setMessage(`${label}: disponível na próxima versão.`)}><Icon /><span><strong>{label}</strong><small>Configurações da plataforma</small></span><ChevronRight /></button>)}
        <button className="logout-item" type="button" onClick={logout}><LogOut /><span><strong>Sair</strong><small>Encerrar esta sessão</small></span><ChevronRight /></button>
      </nav>
      {message && <p className="menu-message" role="status">{message}</p>}
      <footer className="menu-footer"><span className="brand-mark">MV</span><p>Memórias não são só lembranças.<br />São caminhos para permanecer.</p></footer>
      <BottomNav />
    </main>
  )
}
