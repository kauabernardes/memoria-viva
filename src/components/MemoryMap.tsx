import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import { Link } from 'react-router-dom'
import type { Memory, MemoryCategory } from '../types'

const markerColors: Record<MemoryCategory, string> = {
  histórico: '#c82638',
  urbano: '#c82638',
  religioso: '#304fd4',
  indígena: '#d83a25',
  ribeirinho: '#68d31a',
  rural: '#68d31a',
}

function markerIcon(category: MemoryCategory) {
  return L.divIcon({
    className: 'memory-map-marker-wrapper',
    html: `<span class="memory-map-marker" style="--marker-color:${markerColors[category]}"><span></span></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}

interface MemoryMapProps {
  memories: Memory[]
  center?: [number, number]
  zoom?: number
}

export function MemoryMap({ memories, center = [-20.28, -40.34], zoom = 11 }: MemoryMapProps) {
  return (
    <MapContainer
      className="leaflet-memory-map"
      center={center}
      zoom={zoom}
      minZoom={8}
      zoomControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      {memories.map((memory) => (
        <Marker
          key={memory.id}
          position={[memory.latitude, memory.longitude]}
          icon={markerIcon(memory.category)}
          title={`${memory.title} — ${memory.category}`}
        >
          <Popup>
            <strong>{memory.title}</strong>
            <span>{memory.location}</span>
            <Link to={`/historias/${memory.id}`}>Abrir memória</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
