import { LocateFixed, MapPin, Navigation, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { LoadingState } from '../components/LoadingState'
import { MemoryMap, type DeviceLocation } from '../components/MemoryMap'
import { PageHeader } from '../components/PageHeader'
import { useMemories } from '../hooks/useMemories'
import { memoryCategories, type MemoryCategory } from '../types'

type Filter = 'todos' | MemoryCategory

function distanceInKm(origin: DeviceLocation, latitude: number, longitude: number) {
  const earthRadius = 6371
  const radians = (value: number) => value * Math.PI / 180
  const latitudeDelta = radians(latitude - origin.latitude)
  const longitudeDelta = radians(longitude - origin.longitude)
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(origin.latitude)) * Math.cos(radians(latitude)) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

function formatDistance(distance: number) {
  if (distance < 1) return `${Math.max(1, Math.round(distance * 1000))} m`
  return `${distance.toFixed(distance < 10 ? 1 : 0).replace('.', ',')} km`
}

export function MapaPage() {
  const { memories, loading, error } = useMemories()
  const [filter, setFilter] = useState<Filter>('todos')
  const [query, setQuery] = useState('')
  const [locationMessage, setLocationMessage] = useState('Buscando sua localização…')
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null)
  const [focusDeviceKey, setFocusDeviceKey] = useState(0)
  const [locationAttempt, setLocationAttempt] = useState(0)

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => setLocationMessage('Localização não disponível neste dispositivo.'))
      return
    }
    let firstPosition = true
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDeviceLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setLocationMessage(`Localização em tempo real ativa · precisão de ${Math.round(position.coords.accuracy)} m`)
        if (firstPosition) {
          setFocusDeviceKey((value) => value + 1)
          firstPosition = false
        }
      },
      (geolocationError) => {
        const message = geolocationError.code === geolocationError.PERMISSION_DENIED
          ? 'Permissão de localização negada. Toque no alvo para tentar novamente.'
          : 'Não foi possível obter sua posição. O mapa continua disponível.'
        setLocationMessage(message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [locationAttempt])

  const filtered = useMemo(() => memories.filter((memory) => {
    const categoryMatch = filter === 'todos' || memory.category === filter || memory.categories?.includes(filter)
    const text = `${memory.title} ${memory.subtitle} ${memory.location}`.toLocaleLowerCase('pt-BR')
    return categoryMatch && text.includes(query.toLocaleLowerCase('pt-BR'))
  }).sort((first, second) => deviceLocation
    ? distanceInKm(deviceLocation, first.latitude, first.longitude) - distanceInKm(deviceLocation, second.latitude, second.longitude)
    : 0), [deviceLocation, filter, memories, query])

  function focusCurrentLocation() {
    if (deviceLocation) {
      setFocusDeviceKey((value) => value + 1)
      return
    }
    setLocationMessage('Buscando sua localização…')
    setLocationAttempt((value) => value + 1)
  }

  return (
    <main className="app-page with-bottom-nav">
      <PageHeader />
      <section className="map-toolbar">
        <div className="search-field">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="map-search">Pesquisar lugares</label>
          <input id="map-search" type="search" placeholder="Pesquisar no território" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {locationMessage && <p className={`inline-status live-location-status ${deviceLocation ? 'active' : ''}`} role="status"><Navigation size={12} /> {locationMessage}</p>}
        <div className="filter-row" aria-label="Filtrar por categoria">
          {(['todos', ...memoryCategories] as Filter[]).map((category) => (
            <button key={category} className={filter === category ? 'active' : ''} type="button" onClick={() => setFilter(category)}>{category}</button>
          ))}
        </div>
      </section>
      {loading ? <LoadingState /> : error ? <p className="empty-state" role="alert">{error}</p> : (
        <>
          <section className="map-wrap" aria-label="Mapa das memórias">
            <MemoryMap memories={filtered} deviceLocation={deviceLocation} focusDeviceKey={focusDeviceKey} />
            <button className={`map-location-control ${deviceLocation ? 'active' : ''}`} type="button" onClick={focusCurrentLocation} aria-label={deviceLocation ? 'Centralizar na minha localização' : 'Ativar minha localização'}><LocateFixed size={22} /></button>
          </section>
          <section className="nearby-section">
            <div className="section-title-row"><div><span className="section-kicker">Ao seu redor</span><h1>Lugares de memória</h1></div><span>{filtered.length} registros</span></div>
            {filtered.length === 0 ? <p className="empty-state">Nenhuma memória corresponde aos filtros.</p> : (
              <div className="place-list">
                {filtered.slice(0, 5).map((memory) => (
                  <Link key={memory.id} to={`/historias/${memory.id}`}>
                    <span className={`place-dot category-bg-${memory.category}`}><MapPin size={14} /></span>
                    <span><strong>{memory.title}</strong><small>{memory.subtitle}</small></span>
                    <em>{deviceLocation ? formatDistance(distanceInKm(deviceLocation, memory.latitude, memory.longitude)) : memory.distance}</em>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <BottomNav />
    </main>
  )
}
