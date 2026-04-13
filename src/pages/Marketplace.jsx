import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import ProductCard from "../components/ProductCard";
import ProductMap from "../components/ProductMap";
import { Search, SlidersHorizontal, Map, List, Locate } from "lucide-react";
import { BasketIcon } from "../components/Icons";
import "./Marketplace.css";

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("list");
  const [radius, setRadius] = useState("all");
  const [myLocation, setMyLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleContact = (product) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const chatId = [currentUser.uid, product.sellerId].sort().join("_");
    navigate(`/chat/${chatId}`, {
      state: { otherUserId: product.sellerId, otherUserName: product.sellerName },
    });
  };

  const filtered = products
    .filter((p) => !p.moderationStatus || p.moderationStatus === "approved")
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.sellerName?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (radius === "all" || !myLocation) return true;
      if (!p.lat || !p.lng) return false;
      return getDistanceKm(myLocation.lat, myLocation.lng, p.lat, p.lng) <= parseInt(radius);
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "distance" && myLocation) {
        const dA = a.lat ? getDistanceKm(myLocation.lat, myLocation.lng, a.lat, a.lng) : 99999;
        const dB = b.lat ? getDistanceKm(myLocation.lat, myLocation.lng, b.lat, b.lng) : 99999;
        return dA - dB;
      }
      return 0;
    });

  return (
    <div className="marketplace container">
      <div className="mp-header">
        <h1><BasketIcon size={32} /> Marketplace</h1>
        <p>Productos frescos directo del campo mexicano</p>
      </div>

      <div className="mp-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar producto, vendedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sort-bar">
          <SlidersHorizontal size={16} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            {myLocation && <option value="distance">Más cercanos</option>}
          </select>
        </div>
      </div>

      <div className="mp-toolbar">
        <div className="mp-location-filter">
          <button
            className={`btn btn-sm ${myLocation ? "btn-primary" : "btn-outline"}`}
            onClick={handleLocate}
            disabled={locating}
          >
            <Locate size={15} />
            {locating ? "Ubicando..." : myLocation ? "Ubicación activa" : "Cerca de mí"}
          </button>
          {myLocation && (
            <select
              className="radius-select"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="all">Todos</option>
            </select>
          )}
        </div>
        <div className="mp-view-toggle">
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </button>
          <button
            className={`view-btn ${viewMode === "map" ? "active" : ""}`}
            onClick={() => setViewMode("map")}
          >
            <Map size={18} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mp-empty">
          <Search size={48} strokeWidth={1.5} />
          <p>No se encontraron productos</p>
        </div>
      ) : viewMode === "map" ? (
        <ProductMap
          products={filtered}
          onContact={currentUser ? handleContact : undefined}
        />
      ) : (
        <div className="mp-grid">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              showOrder={currentUser && currentUser.uid !== p.sellerId}
              onContact={
                currentUser?.uid !== p.sellerId ? handleContact : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
