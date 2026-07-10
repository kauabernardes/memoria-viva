import { CheckCircle2, KeyRound, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { updatePassword } from '../services/authService'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 6) return setError('A nova senha deve ter pelo menos 6 caracteres.')
    if (password !== confirmPassword) return setError('As senhas não coincidem.')
    setSubmitting(true)
    try {
      await updatePassword(password)
      setSuccess(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'O link expirou ou não é válido. Solicite um novo link.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="auth-page recovery-page">
      <section className="auth-intro recovery-intro"><KeyRound size={46} /><p>Escolha uma nova senha para sua conta.</p></section>
      <section className="auth-panel">
        {success ? <div className="recovery-success"><CheckCircle2 size={48} /><h1>Senha atualizada</h1><p>Você já pode entrar usando sua nova senha.</p><Link className="primary-button" to="/login">Ir para o login</Link></div> : <><span className="section-kicker">Nova credencial</span><h1>Redefinir senha</h1><p className="section-description">Use uma senha segura que você ainda não utiliza em outros serviços.</p><form onSubmit={handleSubmit} noValidate><label htmlFor="new-password">Nova senha</label><div className="input-with-icon"><LockKeyhole size={18} /><input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></div><label htmlFor="confirm-new-password">Confirmar nova senha</label><div className="input-with-icon"><LockKeyhole size={18} /><input id="confirm-new-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Atualizando…' : 'Salvar nova senha'}</button></form></>}
      </section>
    </main>
  )
}
