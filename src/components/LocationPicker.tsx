import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet'

export interface MapPoint {
  latitude: number
  longitude: number
}

const selectedIcon = L.divIcon({
  className: 'memory-map-marker-wrapper',
  html: '<span class="memory-map-marker selected-location-marker" style="--marker-color:#00c878"><span></span></span>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
})

function ClickSelector({ onSelect }: { onSelect: (point: MapPoint) => void }) {
  useMapEvents({
    click(event) {
      onSelect({ latitude: event.latlng.lat, longitude: event.latlng.lng })
    },
  })
  return null
}

function CenterUpdater({ point }: { point: MapPoint | null }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.setView([point.latitude, point.longitude], Math.max(map.getZoom(), 15))
  }, [map, point])
  return null
}

export function LocationPicker({ value, onSelect }: { value: MapPoint | null; onSelect: (point: MapPoint) => void }) {
  return (
    <div className="location-picker">
      <MapContainer center={[-20.28, -40.34]} zoom={10} minZoom={5} zoomControl={false} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <ClickSelector onSelect={onSelect} />
        <CenterUpdater point={value} />
        {value && <Marker position={[value.latitude, value.longitude]} icon={selectedIcon} title="Local selecionado" />}
      </MapContainer>
      <div className="location-picker-hint">Toque no mapa para marcar o local</div>
    </div>
  )
}
