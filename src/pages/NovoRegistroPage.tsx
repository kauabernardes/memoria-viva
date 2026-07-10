import { Camera, LocateFixed, MapPin, Save } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { LocationPicker, type MapPoint } from '../components/LocationPicker'
import { useAuth } from '../hooks/useAuth'
import { createMemory } from '../services/memoryService'
import { memoryCategories, type MemoryCategory } from '../types'
import { sendAppInventorEvent } from '../utils/appInventor'

const emptyForm = {
  title: '', subtitle: '', description: '', community: '', category: 'histórico' as MemoryCategory,
  location: '', image: '',
}

export function NovoRegistroPage() {
  const navigate = useNavigate()
  const { user, isDemo } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [locationStatus, setLocationStatus] = useState('')

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })) }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2_500_000) return setError('Escolha uma imagem de até 2,5 MB.')
    const reader = new FileReader()
    reader.onload = () => update('image', String(reader.result))
    reader.onerror = () => setError('Não foi possível ler a imagem.')
    reader.readAsDataURL(file)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return setLocationStatus('Localização não disponível neste dispositivo.')
    setLocationStatus('Buscando sua localização…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedPoint({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setLocationStatus('Localização marcada. Você ainda pode ajustar tocando no mapa.')
      },
      () => setLocationStatus('Não foi possível acessar sua localização. Marque o ponto no mapa.'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (form.title.trim().length < 3 || form.subtitle.trim().length < 3) return setError('Preencha título e subtítulo.')
    if (form.description.trim().length < 30) return setError('Conte a memória em pelo menos 30 caracteres.')
    if (!form.community.trim() || !form.location.trim()) return setError('Informe a comunidade e o local.')
    if (!selectedPoint) return setError('Marque a localização da memória no mapa.')
    if (!form.image) return setError('Informe uma URL ou selecione uma imagem.')
    if (!isDemo && !user) return setError('Sua sessão expirou. Entre novamente antes de publicar.')
    setSubmitting(true)
    try {
      const memory = await createMemory({
        ...form,
        latitude: selectedPoint.latitude,
        longitude: selectedPoint.longitude,
        author: user?.username || user?.email || 'Autoria comunitária',
      })
      sendAppInventorEvent('NEW_MEMORY_CREATED')
      navigate(`/historias/${memory.id}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar agora. Tente novamente.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="app-page new-memory-page">
      <PageHeader title="Novo registro" back />
      <section className="form-heading"><span className="section-kicker">Documentar é preservar</span><h1>Conte uma memória</h1><p>Registre com respeito a história e o território de sua comunidade.</p>{isDemo && <p className="notice">Este registro ficará salvo somente neste dispositivo.</p>}</section>
      <form className="memory-form" onSubmit={handleSubmit} noValidate>
        <fieldset><legend>Sobre a história</legend><label htmlFor="memory-title">Título</label><input id="memory-title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Como esta memória é conhecida?" /><label htmlFor="memory-subtitle">Subtítulo</label><input id="memory-subtitle" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} placeholder="Uma frase que convide à escuta" /><label htmlFor="memory-description">Descrição</label><textarea id="memory-description" rows={7} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Conte a origem, as pessoas e por que esta memória importa…" /></fieldset>
        <fieldset><legend>Território</legend><label htmlFor="memory-community">Comunidade</label><input id="memory-community" value={form.community} onChange={(e) => update('community', e.target.value)} /><label htmlFor="memory-category">Categoria</label><select id="memory-category" value={form.category} onChange={(e) => update('category', e.target.value)}>{memoryCategories.map((category) => <option key={category}>{category}</option>)}</select><label htmlFor="memory-location">Nome do local</label><div className="input-with-icon"><MapPin size={18} /><input id="memory-location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Cidade, estado" /></div><div className="map-picker-heading"><div><strong>Marque no mapa</strong><small>A posição exata será vinculada à memória.</small></div><button type="button" onClick={useCurrentLocation}><LocateFixed size={17} /> Minha localização</button></div><LocationPicker value={selectedPoint} onSelect={(point) => { setSelectedPoint(point); setLocationStatus('Local selecionado no mapa.') }} />{selectedPoint && <p className="selected-coordinate"><MapPin size={14} /> Ponto selecionado: {selectedPoint.latitude.toFixed(5)}, {selectedPoint.longitude.toFixed(5)}</p>}{locationStatus && <p className="inline-status" role="status">{locationStatus}</p>}</fieldset>
        <fieldset><legend>Imagem</legend><label htmlFor="memory-image">URL da imagem</label><input id="memory-image" type="url" value={form.image.startsWith('data:') ? '' : form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://…" /><span className="form-divider">ou</span><label className="upload-button" htmlFor="memory-upload"><Camera size={20} /> {form.image.startsWith('data:') ? 'Imagem selecionada' : 'Selecionar imagem'}<input id="memory-upload" className="sr-only" type="file" accept="image/*" onChange={handleUpload} /></label></fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button sticky-submit" type="submit" disabled={submitting}><Save size={18} /> {submitting ? 'Salvando…' : 'Publicar memória'}</button>
      </form>
    </main>
  )
}
