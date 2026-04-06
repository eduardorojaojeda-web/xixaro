import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rtdb } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { Bell, ShoppingBag } from "lucide-react";
import "./Alerts.css";

export default function Alerts() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const notifsRef = ref(rtdb, `notifications/${currentUser.uid}`);
    const unsub = onValue(notifsRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setNotifications([]);
        return;
      }
      const list = Object.entries(data)
        .map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setNotifications(list);

      // Mark all as read
      const updates = {};
      Object.entries(data).forEach(([id, n]) => {
        if (!n.read) updates[`${id}/read`] = true;
      });
      if (Object.keys(updates).length > 0) {
        update(notifsRef, updates);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const catEmoji = {
    verduras: "🥬",
    chiles: "🌶️",
    frutas: "🍎",
    granos: "🌾",
    otros: "📦",
  };

  return (
    <div className="alerts-page container">
      <div className="alerts-header">
        <h1><Bell size={28} /> Mis Alertas</h1>
        <p>Notificaciones de nuevos productos en tus categorías favoritas</p>
      </div>

      {notifications.length === 0 ? (
        <div className="alerts-empty">
          <span>🔔</span>
          <p>No tienes alertas aún</p>
          <p>Activa categorías desde tu perfil para recibir notificaciones</p>
          <Link to={`/perfil/${currentUser?.uid}`} className="btn btn-primary btn-sm">
            Configurar Alertas
          </Link>
        </div>
      ) : (
        <div className="alerts-list">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={`/perfil/${n.sellerId}`}
              className={`alert-item card ${n.read ? "" : "unread"}`}
            >
              <span className="alert-cat-emoji">{catEmoji[n.category] || "📦"}</span>
              <div className="alert-content">
                <strong>{n.productName}</strong>
                <p>
                  Nuevo producto en <em>{n.category}</em> publicado por{" "}
                  <strong>{n.sellerName}</strong>
                </p>
                <span className="alert-time">
                  {n.timestamp
                    ? new Date(n.timestamp).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <ShoppingBag size={16} className="alert-arrow" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
