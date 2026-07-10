import { ArrowLeft, Mail, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { DemoBadge } from '../components/DemoBadge'
import { requestPasswordReset } from '../services/authService'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Informe um e-mail válido.')
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSuccess('Se existir uma conta com esse e-mail, você receberá o link para criar uma nova senha.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível enviar o e-mail agora.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="auth-page recovery-page">
      <section className="auth-intro recovery-intro"><Mail size={46} /><p>Recupere o acesso sem perder suas memórias.</p><DemoBadge /></section>
      <section className="auth-panel">
        <Link className="recovery-back" to="/login"><ArrowLeft size={17} /> Voltar ao login</Link>
        <span className="section-kicker">Recuperar acesso</span>
        <h1>Esqueceu sua senha?</h1>
        <p className="section-description">Informe o e-mail da conta. Enviaremos um link seguro para redefinição.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="recovery-email">E-mail</label>
          <div className="input-with-icon"><Mail size={18} /><input id="recovery-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}
          <button className="primary-button" type="submit" disabled={submitting}><Send size={17} /> {submitting ? 'Enviando…' : 'Enviar link'}</button>
        </form>
      </section>
    </main>
  )
}
