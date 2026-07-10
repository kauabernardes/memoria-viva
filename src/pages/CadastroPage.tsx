import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DemoBadge } from '../components/DemoBadge'
import { useAuth } from '../hooks/useAuth'
import { sendAppInventorEvent } from '../utils/appInventor'

export function CadastroPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ username: '', description: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (form.username.trim().length < 2) return setError('Informe um nome de usuário.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Informe um e-mail válido.')
    if (form.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')
    if (form.password !== form.confirmPassword) return setError('As senhas não coincidem.')
    setSubmitting(true)
    const result = await signUp(form)
    setSubmitting(false)
    if (result.error) return setError(result.error)
    sendAppInventorEvent('LOGIN_SUCCESS')
    navigate('/mapa')
  }

  return (
    <main className="register-page">
      <div className="register-top">
        <Link className="icon-button" to="/login" aria-label="Voltar ao login"><ArrowLeft /></Link>
        <DemoBadge />
      </div>
      <section className="register-heading">
        <span className="section-kicker">Faça parte da rede</span>
        <h1>Criar conta</h1>
        <p>Contribua para manter vivas as histórias do território.</p>
      </section>
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="signup-username">Nome de usuário</label>
        <input id="signup-username" autoComplete="username" value={form.username} onChange={(e) => update('username', e.target.value)} />
        <label htmlFor="signup-description">Descrição <span>(opcional)</span></label>
        <textarea id="signup-description" rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Como você se relaciona com a memória local?" />
        <label htmlFor="signup-email">E-mail</label>
        <input id="signup-email" type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <div className="form-grid">
          <div><label htmlFor="signup-password">Senha</label><input id="signup-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} /></div>
          <div><label htmlFor="signup-confirm">Confirmar senha</label><input id="signup-confirm" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} /></div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Criando…' : 'Criar conta'} <ArrowRight size={18} /></button>
      </form>
    </main>
  )
}
