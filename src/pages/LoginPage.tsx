import { ArrowRight, LockKeyhole, Mail, Sprout } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DemoBadge } from '../components/DemoBadge'
import { useAuth } from '../hooks/useAuth'
import { sendAppInventorEvent } from '../utils/appInventor'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Informe um e-mail válido.')
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')
    setSubmitting(true)
    const result = await signIn(email, password)
    setSubmitting(false)
    if (result.error) return setError(result.error)
    sendAppInventorEvent('LOGIN_SUCCESS')
    navigate('/mapa')
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Sprout size={48} aria-hidden="true" />
        <p>Entre para continuar preservando histórias.</p>
        <DemoBadge />
      </section>
      <section className="auth-panel">
        <span className="section-kicker">Bem-vinda de volta</span>
        <h1>Acesse sua conta</h1>
        <p className="section-description">Sua memória também mora aqui.</p>
        {isDemo && <p className="notice">Use qualquer e-mail válido e uma senha com 6 ou mais caracteres.</p>}
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">E-mail</label>
          <div className="input-with-icon"><Mail size={18} /><input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></div>
          <label htmlFor="login-password">Senha</label>
          <div className="input-with-icon"><LockKeyhole size={18} /><input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" /></div>
          {!isDemo && <Link className="forgot-password-link" to="/esqueci-senha">Esqueci minha senha</Link>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'} <ArrowRight size={18} />
          </button>
        </form>
        <p className="auth-switch">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
      </section>
    </main>
  )
}
