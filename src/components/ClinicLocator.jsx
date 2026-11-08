import { useCallback, useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin, Navigation, Phone, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { publicAsset } from '../lib/publicAsset';
import './ClinicLocator.css';

const SEARCH_RADIUS_METERS = 6000;
const INITIAL_CENTER = [-8.5069, 115.2625];
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const SEARCH_TERMS = ['hospital', 'clinic', 'puskesmas', 'pharmacy'];
const NOMINATIM_REQUEST_INTERVAL_MS = 1100;
const REQUEST_TIMEOUT_MS = 12000;
let lastNominatimRequestAt = 0;

const distanceMeters = (aLat, aLon, bLat, bLon) => {
  const radians = (n) => n * Math.PI / 180;
  const dLat = radians(bLat - aLat);
  const dLon = radians(bLon - aLon);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};
const prettyDistance = (meters) => meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
const facilityType = (facility, searchTerm) => {
  if (/puskesmas|pusat kesehatan masyarakat|uptd? kesmas/i.test(facility.name || '')) return 'Puskesmas';
  if (/clinic|klinik|medical|health cent(er|re)/i.test(facility.name || '')) return 'Klinik';
  if (searchTerm === 'hospital' || facility.type === 'hospital') return 'Rumah sakit';
  if (searchTerm === 'pharmacy' || facility.type === 'pharmacy') return 'Apotek';
  if (facility.type === 'doctors' || facility.type === 'doctor') return 'Praktik dokter';
  if (searchTerm === 'clinic' || facility.type === 'clinic' || facility.type === 'health_centre') return 'Klinik';
  return 'Fasilitas kesehatan';
};
const iconFor = (color) => L.divIcon({ className: 'gg-leaflet-icon', html: `<span style="--marker:${color}"><i></i></span>`, iconSize: [27, 27], iconAnchor: [13, 13] });

const waitForNominatim = async () => {
  const wait = NOMINATIM_REQUEST_INTERVAL_MS - (Date.now() - lastNominatimRequestAt);
  if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait));
  lastNominatimRequestAt = Date.now();
};

const searchNearbyFacilities = async (lat, lon) => {
  const latitudeOffset = SEARCH_RADIUS_METERS / 111320;
  const longitudeOffset = SEARCH_RADIUS_METERS / (111320 * Math.cos(lat * Math.PI / 180));
  const viewbox = [
    lon - longitudeOffset,
    lat + latitudeOffset,
    lon + longitudeOffset,
    lat - latitudeOffset,
  ].join(',');
  const matches = [];
  const failedTerms = [];

  for (const searchTerm of SEARCH_TERMS) {
    await waitForNominatim();
    const url = new URL(NOMINATIM_ENDPOINT);
    url.search = new URLSearchParams({
      q: searchTerm,
      format: 'jsonv2',
      viewbox,
      bounded: '1',
      limit: '40',
      addressdetails: '1',
      extratags: '1',
    });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json', 'Accept-Language': 'id' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`OpenStreetMap merespons dengan status ${response.status}.`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Respons pencarian OpenStreetMap tidak valid.');
      matches.push(...data.map((facility) => ({ ...facility, searchTerm })));
    } catch {
      failedTerms.push(searchTerm);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (failedTerms.length === SEARCH_TERMS.length) {
    throw new Error('Layanan pencarian OpenStreetMap sedang tidak dapat dihubungi. Periksa koneksi internet dan coba lagi.');
  }

  return { matches, failedTerms };
};

export default function ClinicLocator() {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [status, setStatus] = useState('Peta berpusat di Gianyar. Tekan tombol untuk mencari layanan di dekat lokasimu.');
  const [facilities, setFacilities] = useState([]);
  const [locating, setLocating] = useState(false);
  const [center, setCenter] = useState(INITIAL_CENTER);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return undefined;
    const map = L.map(mapNode.current, { scrollWheelZoom: false }).setView(INITIAL_CENTER, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => { window.clearTimeout(timer); map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) { setError('Perangkat ini tidak menyediakan geolokasi.'); return; }
    setLocating(true);
    setError('');
    setStatus('Meminta lokasi perangkat…');
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setCenter([lat, lon]);
      mapRef.current?.setView([lat, lon], 14);
      setFacilities([]);
      setStatus('Mencari rumah sakit, klinik, puskesmas, dan apotek dalam radius 6 km…');
      layerRef.current?.clearLayers();
      L.marker([lat, lon], { icon: iconFor('#0d9488') }).addTo(layerRef.current).bindPopup('Lokasimu');
      try {
        const { matches, failedTerms } = await searchNearbyFacilities(lat, lon);
        const results = matches.map((facility) => {
          const facilityLat = Number(facility.lat);
          const facilityLon = Number(facility.lon);
          if (!Number.isFinite(facilityLat) || !Number.isFinite(facilityLon)
            || facilityLat < -90 || facilityLat > 90 || facilityLon < -180 || facilityLon > 180) return null;
          const distance = distanceMeters(lat, lon, facilityLat, facilityLon);
          const address = facility.address || {};
          const name = facility.name || facility.display_name?.split(',')[0] || facilityType(facility, facility.searchTerm);
          return {
            id: `${facility.osm_type || 'place'}-${facility.osm_id || facility.place_id}`,
            name,
            type: facilityType({ ...facility, name }, facility.searchTerm),
            lat: facilityLat,
            lon: facilityLon,
            distance,
            phone: facility.extratags?.phone || facility.extratags?.['contact:phone'] || '',
            address: [address.road || address.neighbourhood || address.suburb, address.city || address.town || address.village].filter(Boolean).join(', '),
          };
        }).filter((item) => item && item.distance <= SEARCH_RADIUS_METERS).sort((a, b) => a.distance - b.distance);
        const deduplicated = results.filter((item, index, list) => list.findIndex((other) => (
          other.id === item.id || (other.name.toLowerCase() === item.name.toLowerCase() && distanceMeters(other.lat, other.lon, item.lat, item.lon) < 50)
        )) === index).slice(0, 30);
        setFacilities(deduplicated);
        deduplicated.forEach((facility) => {
          const marker = L.marker([facility.lat, facility.lon], { icon: iconFor(facility.type === 'Apotek' ? '#f97316' : '#0f766e') }).addTo(layerRef.current);
          const popup = document.createElement('div');
          const title = document.createElement('strong'); title.textContent = facility.name;
          const detail = document.createElement('div'); detail.textContent = `${facility.type} · ${prettyDistance(facility.distance)}`;
          popup.append(title, detail);
          marker.bindPopup(popup);
        });
        setStatus(deduplicated.length
          ? `${deduplicated.length} fasilitas ditemukan dalam radius 6 km${failedTerms.length ? ' (sebagian kategori belum berhasil dimuat)' : ''}.`
          : 'Belum ada fasilitas terpetakan dalam radius 6 km. Coba perbarui pencarian atau pindah ke area yang lebih dekat dengan pusat layanan.');
        if (failedTerms.length) setError(`Data untuk sebagian kategori (${failedTerms.join(', ')}) tidak dapat dimuat. Hasil yang tersedia tetap ditampilkan.`);
      } catch (fetchError) {
        setError(fetchError.message || 'Pencarian fasilitas gagal. Coba lagi beberapa saat.');
        setStatus('Pencarian gagal.');
      } finally { setLocating(false); }
    }, (geoError) => {
      setLocating(false);
      setError(geoError.code === 1
        ? 'Izin lokasi tidak diberikan. Aktifkan akses lokasi untuk mencari fasilitas terdekat.'
        : geoError.code === 3
          ? 'Pengambilan lokasi terlalu lama. Periksa GPS dan coba lagi.'
          : 'Lokasi perangkat tidak dapat ditentukan. Periksa GPS dan coba lagi.');
      setStatus('Lokasi belum tersedia.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }, []);

  return <section className="gg-card gg-clinic-card gg-clinic-locator"><div className="gg-clinic-title"><span className="gg-clinic-icon gg-clinic-image"><img src={publicAsset('nusa-gastro-assets/features/rumah-sakit-terdekat.png')} alt="" /></span><span><b>Rumah sakit & puskesmas terdekat</b><small>Peta interaktif OpenStreetMap · jangkauan 6 km</small></span></div><button className="gg-location-btn" onClick={locate} disabled={locating}>{locating ? <RefreshCw className="gg-spin" size={16}/> : <LocateFixed size={17}/>} {locating ? 'Mencari fasilitas…' : 'Mulai pelacakan lokasi'} <Navigation size={15}/></button><small className="gg-location-consent">Lokasimu hanya dikirim ke OpenStreetMap untuk mencari fasilitas di sekitar. Browser akan meminta izin lokasi.</small><div className="gg-locator-status" role="status">{status}</div>{error && <p className="gg-locator-error">{error}</p>}<div className="gg-leaflet-map" ref={mapNode} aria-label="Peta interaktif fasilitas kesehatan di sekitar"/><div className="gg-facility-list">{facilities.map((facility) => <article className="gg-facility-row" key={facility.id}><span className="gg-facility-pin"><MapPin size={15}/></span><span className="gg-facility-info"><b>{facility.name}</b><small>{facility.type}{facility.address ? ` · ${facility.address}` : ''}</small></span><span className="gg-facility-distance">{prettyDistance(facility.distance)}</span>{facility.phone && <a className="gg-facility-call" href={`tel:${facility.phone.replace(/[^\d+]/g, '')}`} aria-label={`Telepon ${facility.name}`}><Phone size={15}/></a>}<a className="gg-facility-directions" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${center[0]}%2C${center[1]}%3B${facility.lat}%2C${facility.lon}`} aria-label={`Petunjuk arah ke ${facility.name}`}><Navigation size={15}/></a></article>)}</div><div className="gg-locator-emergency"><a href="tel:112"><Phone size={15}/><span><b>112</b><small>Darurat</small></span></a><a href="tel:119"><Phone size={15}/><span><b>119</b><small>Ambulans</small></span></a><a href="tel:118"><Phone size={15}/><span><b>118</b><small>Medis</small></span></a></div></section>;
}
