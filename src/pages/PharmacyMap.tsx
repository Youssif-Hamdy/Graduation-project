import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiX } from 'react-icons/fi';

interface PharmacyMapProps {
  latitude: number;
  longitude: number;
  pharmacyName: string;
  medicineName: string;
  onClose: () => void;
}

// إنشاء أيقونة مخصصة مع اسم الصيدلية
const createPharmacyIcon = (name: string) => {
  return L.divIcon({
    html: `
      <div style="position: relative;">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 384 512" 
          width="32" 
          height="32"
          fill="red"
          style="transform: translateX(-50%)"
        >
          <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
        </svg>
        <div style="
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
          border: 1px solid #ccc;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          ${name}
        </div>
      </div>
    `,
    className: 'pharmacy-marker',
    iconSize: [32, 48], // زيادة الارتفاع لاستيعاب النص
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function PharmacyMap({ 
  latitude, 
  longitude, 
  pharmacyName, 
  medicineName,
  onClose 
}: PharmacyMapProps) {
  const position: [number, number] = [latitude, longitude];
  const pharmacyIcon = createPharmacyIcon(pharmacyName);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
      >
        <FiX className="text-gray-700" />
      </button>
      
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={pharmacyIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-indigo-700">{pharmacyName}</h3>
              <p className="text-gray-600">{medicineName}</p>
              <p className="text-sm text-gray-500 mt-1">
                Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}