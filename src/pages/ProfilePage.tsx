import { Camera, CirclePlus, MapPin, Pencil, Save, UserRound, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImageWithFallback } from '../components/ImageWithFallback'
import { LoadingState } from '../components/LoadingState'
import { MemoryCard } from '../components/MemoryCard'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { getProfileById, getProfileMemories, updateProfile, uploadProfileAvatar } from '../services/profileService'
import type { Memory, Profile } from '../types'

export function ProfilePage({ own = false }: { own?: boolean }) {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const profileId = own ? user?.id : params.id
  const [profile, setProfile] = useState<Profile | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: '', description: '', avatarUrl: '' })
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!profileId) return
    let active = true
    void Promise.all([getProfileById(profileId), getProfileMemories(profileId)])
      .then(([profileResult, memoryResult]) => {
        if (!active) return
        setProfile(profileResult)
        setMemories(memoryResult)
        if (profileResult) setForm({ username: profileResult.username, description: profileResult.description ?? '', avatarUrl: profileResult.avatarUrl ?? '' })
      })
      .catch(() => { if (active) setError('Não foi possível carregar este perfil.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [authLoading, profileId])

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!profileId || form.username.trim().length < 2) return setError('Informe um nome de usuário válido.')
    setSaving(true)
    setError('')
    try {
      const avatarUrl = avatarFile ? await uploadProfileAvatar(profileId, avatarFile) : form.avatarUrl
      const result = await updateProfile(profileId, { ...form, avatarUrl })
      setProfile(result)
      setForm((current) => ({ ...current, avatarUrl }))
      setAvatarFile(null)
      setAvatarPreview('')
      setEditing(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar o perfil.')
    } finally { setSaving(false) }
  }

  function handleAvatarSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Escolha uma imagem JPEG, PNG ou WebP.')
    if (file.size > 2 * 1024 * 1024) return setError('A foto de perfil deve ter no máximo 2 MB.')
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(String(reader.result))
    reader.onerror = () => setError('Não foi possível visualizar a imagem.')
    reader.readAsDataURL(file)
  }

  if (!profileId && own) return <main className="app-page"><PageHeader back title="Perfil" /><div className="empty-state"><h1>Entre para ver seu perfil</h1><Link to="/login">Ir para o login</Link></div></main>
  if (loading || authLoading) return <main className="app-page"><PageHeader back title="Perfil" /><LoadingState label="Carregando perfil…" /></main>
  if (!profile) return <main className="app-page"><PageHeader back title="Perfil" /><div className="empty-state"><h1>Perfil não encontrado</h1><p>{error}</p><Link to="/registros">Voltar aos registros</Link></div></main>

  const locations = new Set(memories.map((memory) => memory.location)).size
  return (
    <main className={`app-page profile-page ${own ? 'own-profile' : 'public-profile'}`}>
      <PageHeader back title={own ? 'Seu perfil' : 'Perfil'} />
      <section className="profile-cover">
        <div className="large-profile-avatar">
          {profile.avatarUrl ? <ImageWithFallback src={profile.avatarUrl} alt={`Foto de ${profile.username}`} /> : <UserRound size={52} />}
        </div>
        <div className="profile-identity"><h1>{profile.username}</h1><p>{profile.description || 'Guardião de memórias e territórios.'}</p></div>
        {own && <button type="button" className="profile-edit-button" onClick={() => setEditing((value) => !value)} aria-label={editing ? 'Fechar edição' : 'Editar perfil'}>{editing ? <X /> : <Pencil />}</button>}
        <div className="profile-stats"><div><strong>{memories.length}</strong><span>{memories.length === 1 ? 'Registro' : 'Registros'}</span></div><div><strong>{locations}</strong><span>{locations === 1 ? 'Local' : 'Locais'}</span></div></div>
      </section>

      {editing && own && (
        <form className="profile-edit-form" onSubmit={handleSave}>
          <div className="section-title-row"><h2>Edite seu perfil</h2><Camera size={19} /></div>
          <label htmlFor="profile-name">Nome de usuário</label><input id="profile-name" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
          <label htmlFor="profile-description">Descrição</label><textarea id="profile-description" rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <span className="profile-photo-label">Foto do perfil</span>
          <div className="avatar-upload-field">
            <div className="avatar-upload-preview">{avatarPreview || form.avatarUrl ? <ImageWithFallback src={avatarPreview || form.avatarUrl} alt="Pré-visualização da foto do perfil" /> : <UserRound size={34} />}</div>
            <div><label className="upload-button" htmlFor="profile-avatar-upload"><Camera size={18} /> {avatarFile ? 'Trocar imagem' : 'Escolher imagem'}<input id="profile-avatar-upload" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarSelection} /></label><small>JPEG, PNG ou WebP · máximo 2 MB</small></div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" disabled={saving} type="submit"><Save size={18} /> {saving ? 'Salvando…' : 'Salvar alterações'}</button>
        </form>
      )}

      <section className="profile-creations">
        <div className="section-title-row"><div><span className="section-kicker">Arquivo pessoal</span><h2>{own ? 'Suas criações' : 'Criações'}</h2></div>{own && <Link to="/novo-registro"><CirclePlus size={17} /> adicionar</Link>}</div>
        {memories.length === 0 ? <div className="empty-state"><MapPin size={23} /><p>{own ? 'Você ainda não publicou nenhuma memória.' : 'Este perfil ainda não publicou memórias.'}</p>{own && <Link to="/novo-registro">Criar primeiro registro</Link>}</div> : <div className="profile-memory-list">{memories.map((memory) => <MemoryCard key={memory.id} memory={memory} compact />)}</div>}
      </section>
    </main>
  )
}
