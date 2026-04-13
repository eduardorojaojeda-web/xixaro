import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, rtdb } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref as rtdbRef, onValue as rtdbOnValue, update as rtdbUpdate } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { Package, Clock, CheckCircle, Truck, CircleCheck } from "lucide-react";
import "./Orders.css";

const STATUS_CONFIG = {
  pendiente: { label: "Pendiente", icon: <Clock size={16} />, color: "status-pending" },
  confirmado: { label: "Confirmado", icon: <CheckCircle size={16} />, color: "status-confirmed" },
  en_camino: { label: "En camino", icon: <Truck size={16} />, color: "status-shipping" },
  entregado: { label: "Entregado", icon: <CircleCheck size={16} />, color: "status-delivered" },
};

const STATUS_STEPS = ["pendiente", "confirmado", "en_camino", "entregado"];

export default function Orders() {
  const { currentUser, userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const isVendedor = userData?.role === "vendedor";
  const field = isVendedor ? "sellerId" : "buyerId";

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "orders"),
      where(field, "==", currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setOrders(list);
      setLoading(false);
    });
    return unsub;
  }, [currentUser, field]);

  // Marcar notificaciones de pedidos como leídas al entrar
  useEffect(() => {
    if (!currentUser) return;
    const notifsRef = rtdbRef(rtdb, `orderNotifs/${currentUser.uid}`);
    const unsub = rtdbOnValue(notifsRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const updates = {};
      Object.entries(data).forEach(([id, n]) => {
        if (!n.read) updates[`${id}/read`] = true;
      });
      if (Object.keys(updates).length > 0) {
        rtdbUpdate(notifsRef, updates);
      }
    }, { onlyOnce: true });
    return () => unsub();
  }, [currentUser]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <h1><Package size={28} /> {isVendedor ? "Pedidos Recibidos" : "Mis Pedidos"}</h1>
        <p>{isVendedor ? "Gestiona los pedidos de tus compradores" : "Seguimiento de tus compras"}</p>
      </div>

      <div className="orders-filters">
        {["all", ...STATUS_STEPS].map((s) => (
          <button
            key={s}
            className={`filter-chip ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "Todos" : STATUS_CONFIG[s].label}
            {s !== "all" && (
              <span className="filter-count">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="orders-loading">Cargando pedidos...</p>
      ) : filtered.length === 0 ? (
        <div className="orders-empty">
          <Package size={48} strokeWidth={1.5} />
          <p>{filter === "all" ? "No tienes pedidos aún" : "No hay pedidos con este estado"}</p>
          {!isVendedor && (
            <Link to="/marketplace" className="btn btn-primary btn-sm">
              Ir al Marketplace
            </Link>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} isVendedor={isVendedor} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, isVendedor }) {
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="order-card card">
      <div className="order-card-top">
        <div className="order-card-product">
          {order.productImage && (
            <img src={order.productImage} alt={order.productName} className="order-thumb" />
          )}
          <div>
            <h3>{order.productName}</h3>
            <p className="order-party">
              {isVendedor
                ? `Comprador: ${order.buyerName}`
                : `Productor: ${order.sellerName}`
              }
            </p>
          </div>
        </div>
        <div className={`order-status-badge ${STATUS_CONFIG[order.status].color}`}>
          {STATUS_CONFIG[order.status].icon}
          {STATUS_CONFIG[order.status].label}
        </div>
      </div>

      <div className="order-details">
        <div className="order-detail">
          <span className="detail-label">Cantidad</span>
          <span className="detail-value">{order.quantity} {order.unit}{Number(order.quantity) !== 1 && "s"}</span>
        </div>
        <div className="order-detail">
          <span className="detail-label">Total</span>
          <span className="detail-value detail-price">${Number(order.total).toLocaleString("es-MX")}</span>
        </div>
        <div className="order-detail">
          <span className="detail-label">Entrega</span>
          <span className="detail-value">
            {new Date(order.deliveryDate + "T12:00:00").toLocaleDateString("es-MX", {
              weekday: "short", year: "numeric", month: "short", day: "numeric"
            })}
          </span>
        </div>
        <div className="order-detail">
          <span className="detail-label">Pedido</span>
          <span className="detail-value">
            {new Date(order.createdAt).toLocaleDateString("es-MX")}
          </span>
        </div>
      </div>

      {order.notes && (
        <p className="order-notes">"{order.notes}"</p>
      )}

      {/* Progress bar */}
      <div className="order-progress">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className={`progress-step ${i <= currentStep ? "completed" : ""}`}>
            <div className="progress-dot" />
            <span>{STATUS_CONFIG[step].label}</span>
          </div>
        ))}
      </div>

      {/* Vendor actions */}
      {isVendedor && order.status !== "entregado" && (
        <VendorActions order={order} />
      )}
    </div>
  );
}

function VendorActions({ order }) {
  const [updating, setUpdating] = useState(false);
  const { useToast: _ } = {};

  const nextStatus = {
    pendiente: "confirmado",
    confirmado: "en_camino",
    en_camino: "entregado",
  };

  const nextLabel = {
    pendiente: "Confirmar Pedido",
    confirmado: "Marcar En Camino",
    en_camino: "Marcar Entregado",
  };

  const handleAdvance = async () => {
    setUpdating(true);
    try {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { db, rtdb } = await import("../firebase");
      const { ref: rtdbRef, push: rtdbPush } = await import("firebase/database");

      const newStatus = nextStatus[order.status];
      await updateDoc(doc(db, "orders", order.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Al confirmar, restar la cantidad del inventario del producto
      if (order.status === "pendiente" && newStatus === "confirmado") {
        const { getDoc } = await import("firebase/firestore");
        const productSnap = await getDoc(doc(db, "products", order.productId));
        if (productSnap.exists()) {
          const currentQty = productSnap.data().quantity || 0;
          const newQty = Math.max(0, currentQty - order.quantity);
          await updateDoc(doc(db, "products", order.productId), {
            quantity: newQty,
          });
        }
      }

      // Notificar al comprador del cambio de estado
      rtdbPush(rtdbRef(rtdb, `orderNotifs/${order.buyerId}`), {
        type: "estado_actualizado",
        productName: order.productName,
        newStatus,
        sellerName: order.sellerName,
        timestamp: Date.now(),
        read: false,
      });
    } catch (err) {
      alert("Error: " + err.message);
    }
    setUpdating(false);
  };

  return (
    <div className="order-vendor-actions">
      <button
        className="btn btn-primary btn-sm"
        onClick={handleAdvance}
        disabled={updating}
      >
        {STATUS_CONFIG[nextStatus[order.status]].icon}
        {updating ? "Actualizando..." : nextLabel[order.status]}
      </button>
    </div>
  );
}
