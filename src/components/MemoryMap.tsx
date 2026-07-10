import L from 'leaflet'
import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet'
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

const deviceLocationIcon = L.divIcon({
  className: 'device-location-icon-wrapper',
  html: '<span class="device-location-pulse"><span class="device-location-dot"></span></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
})

export interface DeviceLocation {
  latitude: number
  longitude: number
  accuracy: number
}

function DeviceLocationFocus({ location, focusKey }: { location?: DeviceLocation | null; focusKey: number }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 15), { duration: 1.1 })
  }, [focusKey, location, map])
  return null
}

interface MemoryMapProps {
  memories: Memory[]
  center?: [number, number]
  zoom?: number
  deviceLocation?: DeviceLocation | null
  focusDeviceKey?: number
}

export function MemoryMap({ memories, center = [-20.28, -40.34], zoom = 11, deviceLocation, focusDeviceKey = 0 }: MemoryMapProps) {
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
      <DeviceLocationFocus location={deviceLocation} focusKey={focusDeviceKey} />
      {deviceLocation && (
        <>
          <Circle
            center={[deviceLocation.latitude, deviceLocation.longitude]}
            radius={Math.max(deviceLocation.accuracy, 12)}
            pathOptions={{ color: '#3578e5', fillColor: '#4b8df8', fillOpacity: 0.16, weight: 1 }}
          />
          <Marker position={[deviceLocation.latitude, deviceLocation.longitude]} icon={deviceLocationIcon} title="Sua localização atual">
            <Popup><strong>Você está aqui</strong><span>Precisão aproximada de {Math.round(deviceLocation.accuracy)} m</span></Popup>
          </Marker>
        </>
      )}
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
