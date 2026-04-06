import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ProductMap.css";

// Fix default marker icons in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ProductMap({ products, onContact }) {
  const geoProducts = products.filter((p) => p.lat && p.lng);

  if (geoProducts.length === 0) {
    return (
      <div className="map-empty">
        <span>📍</span>
        <p>No hay productos con ubicación disponible</p>
      </div>
    );
  }

  const center = [geoProducts[0].lat, geoProducts[0].lng];

  return (
    <MapContainer center={center} zoom={10} className="product-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoProducts.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]}>
          <Popup>
            <div className="map-popup">
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.name} className="popup-img" />
              )}
              <strong>{p.name}</strong>
              <span className="popup-price">${p.price} / {p.unit}</span>
              <span className="popup-seller">{p.sellerName}</span>
              <div className="popup-actions">
                <Link to={`/perfil/${p.sellerId}`} className="popup-link">
                  Ver vendedor
                </Link>
                {onContact && (
                  <button className="popup-contact" onClick={() => onContact(p)}>
                    Contactar
                  </button>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
