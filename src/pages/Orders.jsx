import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, rtdb } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, doc, getDoc } from "firebase/firestore";
import { ref as rtdbRef, onValue as rtdbOnValue, update as rtdbUpdate } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { Package, Clock, CheckCircle, Truck, CircleCheck, AlertTriangle, Send } from "lucide-react";
import { useToast } from "../hooks/useToast";
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
  const [disputes, setDisputes] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast, showToast } = useToast();

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

  // Cargar disputas del usuario
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "disputes"), where("openedBy", "==", currentUser.uid));
    const q2 = query(collection(db, "disputes"), where("againstId", "==", currentUser.uid));
    const map = {};
    const u1 = onSnapshot(q, (snap) => {
      snap.docs.forEach((d) => { map[d.data().orderId] = { id: d.id, ...d.data() }; });
      setDisputes({ ...map });
    });
    const u2 = onSnapshot(q2, (snap) => {
      snap.docs.forEach((d) => { map[d.data().orderId] = { id: d.id, ...d.data() }; });
      setDisputes({ ...map });
    });
    return () => { u1(); u2(); };
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
            <OrderCard key={order.id} order={order} isVendedor={isVendedor} dispute={disputes[order.id]} showToast={showToast} currentUser={currentUser} userData={userData} />
          ))}
        </div>
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

const DISPUTE_REASONS = [
  "Producto no recibido",
  "Cantidad incorrecta",
  "Calidad no esperada",
  "Producto dañado",
  "Entrega fuera de fecha",
  "Otro",
];

function OrderCard({ order, isVendedor, dispute, showToast, currentUser, userData }) {
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

      {/* Dispute section */}
      {dispute ? (
        <div className={`dispute-banner dispute-${dispute.status}`}>
          <AlertTriangle size={16} />
          <div>
            <strong>
              Disputa {dispute.status === "open" ? "abierta" : dispute.status === "resolved_buyer" ? "resuelta a favor del comprador" : "resuelta a favor del vendedor"}
            </strong>
            <p>{dispute.reason}: {dispute.description}</p>
          </div>
        </div>
      ) : (
        order.status !== "pendiente" && <DisputeButton order={order} currentUser={currentUser} userData={userData} showToast={showToast} />
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

function DisputeButton({ order, currentUser, userData, showToast }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { showToast("Selecciona un motivo", "error"); return; }
    if (description.trim().length < 10) { showToast("Describe el problema con al menos 10 caracteres", "error"); return; }
    setSending(true);
    try {
      const isBuyer = currentUser.uid === order.buyerId;
      await addDoc(collection(db, "disputes"), {
        orderId: order.id,
        productName: order.productName,
        reason,
        description: description.trim(),
        status: "open",
        openedBy: currentUser.uid,
        openedByName: userData?.name || "Usuario",
        openedByRole: isBuyer ? "comprador" : "vendedor",
        againstId: isBuyer ? order.sellerId : order.buyerId,
        againstName: isBuyer ? order.sellerName : order.buyerName,
        buyerId: order.buyerId,
        buyerName: order.buyerName,
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        total: order.total,
        createdAt: new Date().toISOString(),
      });
      showToast("Disputa abierta. Un administrador la revisará.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button className="dispute-open-btn" onClick={() => setOpen(true)}>
        <AlertTriangle size={14} /> Abrir disputa sobre este pedido
      </button>
    );
  }

  return (
    <div className="dispute-form">
      <h4><AlertTriangle size={16} /> Abrir Disputa</h4>
      <select value={reason} onChange={(e) => setReason(e.target.value)} className="dispute-select">
        <option value="">Selecciona el motivo...</option>
        {DISPUTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe el problema con detalle..."
        rows={3}
        className="dispute-textarea"
      />
      <div className="dispute-form-actions">
        <button className="btn btn-sm btn-danger" onClick={handleSubmit} disabled={sending}>
          <Send size={14} /> {sending ? "Enviando..." : "Enviar Disputa"}
        </button>
        <button className="btn btn-sm btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </div>
  );
}
