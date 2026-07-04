import { useEffect, useState } from 'react'
import { AttributionControl, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'

// Default view: London.
const LONDON: [number, number] = [51.5074, -0.1278]

// ☕ emoji marker via a divIcon — avoids Leaflet's default-icon path breaking
// under bundlers, and it's on-brand.
const coffeeIcon = L.divIcon({
  className: 'coffee-pin',
  html: '<span class="coffee-pin__glyph">☕</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  popupAnchor: [0, -26],
})

interface Visit {
  coffee: number | null
  service: number | null
  atmosphere: number | null
}

interface Shop {
  url: string
  name: string
  lat: number
  lng: number
  tags: string[]
  visits: Visit[]
}

// Merge visits into one representation: for each dimension the latest known
// rating wins. Visits are oldest-first, and null means "not rated this visit",
// so a later null does NOT clobber an earlier real rating.
function mergedRating(shop: Shop): Visit {
  const merged: Visit = { coffee: null, service: null, atmosphere: null }
  for (const v of shop.visits) {
    if (v.coffee !== null) merged.coffee = v.coffee
    if (v.service !== null) merged.service = v.service
    if (v.atmosphere !== null) merged.atmosphere = v.atmosphere
  }
  return merged
}

function ratingLabel(value: number | null): string {
  if (value === null) return 'no rating set yet'
  if (value === 0) return 'no stars'
  return '⭐'.repeat(value)
}

function Ratings({ visit }: { visit: Visit }) {
  const dims: [string, number | null][] = [
    ['Coffee', visit.coffee],
    ['Service', visit.service],
    ['Atmosphere', visit.atmosphere],
  ]
  if (dims.every(([, v]) => v === null)) {
    return <p className="rating-none">No rating set yet</p>
  }
  return (
    <ul className="ratings">
      {dims.map(([label, v]) => (
        <li key={label}>
          <span className="ratings__dim">{label}</span>
          <span className="ratings__val">{ratingLabel(v)}</span>
        </li>
      ))}
    </ul>
  )
}

export function App() {
  const [shops, setShops] = useState<Shop[]>([])
  const [map, setMap] = useState<L.Map | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/coffee.json`)
      .then((r) => r.json())
      .then((data: Shop[]) => setShops(data))
      .catch(() => setShops([]))
  }, [])

  function goToMyLocation() {
    if (!map || !('geolocation' in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 14)
        setLocating(false)
      },
      () => {
        setLocating(false)
        alert('Could not get your location.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Coffee Map ☕</h1>
      </header>

      <div className="map-wrap">
        <MapContainer
          center={LONDON}
          zoom={11}
          scrollWheelZoom
          className="map"
          ref={setMap}
          attributionControl={false}
        >
          {/* Keep the required OpenStreetMap credit, drop the "Leaflet" prefix link. */}
          <AttributionControl prefix={false} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {shops.map((shop) => (
            <Marker key={shop.url} position={[shop.lat, shop.lng]} icon={coffeeIcon}>
              <Popup>
                <div className="popup">
                  <a className="popup__name" href={shop.url} target="_blank" rel="noreferrer">
                    {shop.name}
                  </a>
                  <Ratings visit={mergedRating(shop)} />
                  {shop.tags.length > 0 && (
                    <div className="tags">
                      {shop.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <a className="popup__maps" href={shop.url} target="_blank" rel="noreferrer">
                    Open in Google Maps ↗
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button
          type="button"
          className="locate-btn"
          onClick={goToMyLocation}
          disabled={locating || !map}
        >
          {locating ? 'Locating…' : '📍 My location'}
        </button>
      </div>

      <footer className="disclaimer">
        Ratings are the personal opinion of a few people who don't really know anything about
        coffee — take them with a pinch of salt.
      </footer>
    </div>
  )
}
