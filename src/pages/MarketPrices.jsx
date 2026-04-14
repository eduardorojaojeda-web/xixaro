import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Search, TrendingUp, TrendingDown, Minus, BarChart3, Users } from "lucide-react";
import "./MarketPrices.css";

export default function MarketPrices() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Agrupar productos por nombre normalizado
  const grouped = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.moderationStatus === "rejected" || p.moderationStatus === "pending") return;
      const key = p.name.trim().toLowerCase();
      if (!map[key]) {
        map[key] = { name: p.name, products: [], prices: [], dates: [] };
      }
      map[key].products.push(p);
      map[key].prices.push(p.price);
      map[key].dates.push({ price: p.price, date: p.createdAt, seller: p.sellerName, id: p.id });
    });

    return Object.values(map)
      .filter((g) => g.products.length >= 1)
      .map((g) => {
        const prices = g.prices;
        const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const sorted = [...g.dates].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        let trend = "stable";
        if (sorted.length >= 2) {
          const first = sorted[0].price;
          const last = sorted[sorted.length - 1].price;
          const diff = ((last - first) / first) * 100;
          if (diff > 5) trend = "up";
          else if (diff < -5) trend = "down";
        }
        return { ...g, avg, min, max, trend, sorted };
      })
      .sort((a, b) => b.products.length - a.products.length);
  }, [products]);

  const filtered = search.length >= 2
    ? grouped.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : grouped;

  const detail = selected ? grouped.find((g) => g.name.toLowerCase() === selected) : null;

  return (
    <div className="mp-prices container">
      <div className="mpp-header">
        <h1><BarChart3 size={28} /> Precios del Mercado</h1>
        <p>Consulta precios actuales, tendencias y compara entre vendedores</p>
      </div>

      <div className="mpp-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar producto... (ej: chile habanero, aguacate, tomate)"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
        />
      </div>

      {detail ? (
        <ProductDetail data={detail} onBack={() => setSelected(null)} />
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="mpp-empty">
              <BarChart3 size={48} strokeWidth={1.5} />
              <p>{search ? "No se encontraron productos con ese nombre" : "Aún no hay productos en la plataforma"}</p>
            </div>
          ) : (
            <div className="mpp-grid">
              {filtered.map((g) => (
                <button
                  key={g.name}
                  className="mpp-card card"
                  onClick={() => setSelected(g.name.toLowerCase())}
                >
                  <div className="mpp-card-top">
                    <h3>{g.name}</h3>
                    <TrendBadge trend={g.trend} />
                  </div>
                  <div className="mpp-card-price">
                    ${Math.round(g.avg).toLocaleString("es-MX")}
                    <span>/ton</span>
                  </div>
                  <div className="mpp-card-range">
                    <span>Min: ${Math.round(g.min).toLocaleString("es-MX")}</span>
                    <span>Max: ${Math.round(g.max).toLocaleString("es-MX")}</span>
                  </div>
                  <MiniChart data={g.sorted} />
                  <div className="mpp-card-sellers">
                    <Users size={13} /> {g.products.length} vendedor{g.products.length !== 1 && "es"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TrendBadge({ trend }) {
  if (trend === "up") return <span className="trend-badge trend-up"><TrendingUp size={14} /> Sube</span>;
  if (trend === "down") return <span className="trend-badge trend-down"><TrendingDown size={14} /> Baja</span>;
  return <span className="trend-badge trend-stable"><Minus size={14} /> Estable</span>;
}

function MiniChart({ data }) {
  if (data.length < 2) return null;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 200;
  const h = 40;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const last = prices[prices.length - 1];
  const prev = prices[prices.length - 2];
  const color = last >= prev ? "var(--verde-hoja)" : "var(--danger)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mini-chart">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={parseFloat(points[points.length - 1].split(",")[0])} cy={parseFloat(points[points.length - 1].split(",")[1])} r="3" fill={color} />
    </svg>
  );
}

function PriceChart({ data }) {
  if (data.length < 2) {
    return <p className="chart-note">Se necesitan al menos 2 publicaciones para mostrar la gráfica</p>;
  }
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 600;
  const h = 200;
  const padX = 50;
  const padY = 20;
  const chartW = w - padX;
  const chartH = h - padY * 2;

  const points = prices.map((p, i) => {
    const x = padX + (i / (prices.length - 1)) * chartW;
    const y = padY + chartH - ((p - min) / range) * chartH;
    return { x, y, price: p };
  });

  const linePath = points.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`).join(" ");
  const areaPath = linePath + ` L${points[points.length - 1].x},${h - padY} L${padX},${h - padY} Z`;

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => min + (range / gridLines) * i);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="price-chart">
      {/* Grid */}
      {gridValues.map((v, i) => {
        const y = padY + chartH - ((v - min) / range) * chartH;
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={w} y2={y} stroke="var(--tierra-200)" strokeWidth="1" />
            <text x={padX - 8} y={y + 4} textAnchor="end" fontSize="9" fill="var(--tierra-400)">
              ${Math.round(v / 1000)}k
            </text>
          </g>
        );
      })}
      {/* Area */}
      <path d={areaPath} fill="var(--verde-hoja)" opacity="0.08" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--verde-hoja)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="4" fill="var(--white)" stroke="var(--verde-hoja)" strokeWidth="2" />
          <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="8" fill="var(--tierra-600)" fontWeight="600">
            ${Math.round(pt.price / 1000)}k
          </text>
        </g>
      ))}
    </svg>
  );
}

function ProductDetail({ data, onBack }) {
  const sorted = [...data.sorted].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const sellers = {};
  data.products.forEach((p) => {
    if (!p.sellerId) return;
    if (!sellers[p.sellerId]) {
      sellers[p.sellerId] = { name: p.sellerName || "Vendedor", price: p.price, id: p.sellerId };
    }
  });
  const sellerList = Object.values(sellers).sort((a, b) => a.price - b.price);

  return (
    <div className="mpp-detail">
      <button className="btn btn-sm btn-outline mpp-back" onClick={onBack}>
        ← Volver a la lista
      </button>

      <div className="mpp-detail-header">
        <div>
          <h2>{data.name}</h2>
          <TrendBadge trend={data.trend} />
        </div>
        <div className="mpp-detail-price">
          <span className="detail-avg">${Math.round(data.avg).toLocaleString("es-MX")}</span>
          <span className="detail-unit">/ton promedio</span>
        </div>
      </div>

      <div className="mpp-detail-stats">
        <div className="mpp-stat">
          <span className="mpp-stat-label">Mínimo</span>
          <span className="mpp-stat-value">${Math.round(data.min).toLocaleString("es-MX")}</span>
        </div>
        <div className="mpp-stat">
          <span className="mpp-stat-label">Promedio</span>
          <span className="mpp-stat-value mpp-stat-avg">${Math.round(data.avg).toLocaleString("es-MX")}</span>
        </div>
        <div className="mpp-stat">
          <span className="mpp-stat-label">Máximo</span>
          <span className="mpp-stat-value">${Math.round(data.max).toLocaleString("es-MX")}</span>
        </div>
        <div className="mpp-stat">
          <span className="mpp-stat-label">Por kg</span>
          <span className="mpp-stat-value">${(data.avg / 1000).toFixed(2)}</span>
        </div>
        <div className="mpp-stat">
          <span className="mpp-stat-label">Por libra</span>
          <span className="mpp-stat-value">${(data.avg / 2204.62).toFixed(2)}</span>
        </div>
        <div className="mpp-stat">
          <span className="mpp-stat-label">Vendedores</span>
          <span className="mpp-stat-value">{sellerList.length}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mpp-chart-section card">
        <h3><BarChart3 size={18} /> Historial de Precios</h3>
        <PriceChart data={sorted} />
      </div>

      {/* Sellers comparison */}
      <div className="mpp-sellers-section card">
        <h3><Users size={18} /> Comparativa de Vendedores</h3>
        <div className="sellers-table-wrap">
          <table className="sellers-table">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Precio / ton</th>
                <th>Precio / kg</th>
                <th>vs Promedio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sellerList.map((s) => {
                const diff = ((s.price - data.avg) / data.avg) * 100;
                return (
                  <tr key={s.id}>
                    <td className="seller-name">{s.name}</td>
                    <td className="seller-price">${Number(s.price).toLocaleString("es-MX")}</td>
                    <td>${(s.price / 1000).toFixed(2)}</td>
                    <td>
                      <span className={`diff-badge ${diff < 0 ? "diff-low" : diff > 0 ? "diff-high" : "diff-avg"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      {s.id ? (
                        <Link to={`/perfil/${s.id}`} className="btn btn-sm btn-outline">Ver perfil</Link>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--tierra-400)" }}>No disponible</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price history list */}
      <div className="mpp-history card">
        <h3>Publicaciones recientes</h3>
        <div className="history-list">
          {sorted.slice().reverse().slice(0, 10).map((d, i) => (
            <div key={i} className="history-item">
              <span className="history-seller">{d.seller}</span>
              <span className="history-price">${Number(d.price).toLocaleString("es-MX")} /ton</span>
              <span className="history-date">
                {d.date ? new Date(d.date).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
