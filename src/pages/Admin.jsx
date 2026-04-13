import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, rtdb } from "../firebase";
import { ref as rtdbRef, onValue as rtdbOnValue, update as rtdbUpdate } from "firebase/database";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Shield, Users, Package, ShoppingCart, CheckCircle, XCircle,
  Ban, Trash2, Eye, Clock, TrendingUp, CreditCard,
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import "./Admin.css";

export default function Admin() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const { toast, showToast } = useToast();

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const u2 = onSnapshot(
      query(collection(db, "products"), orderBy("createdAt", "desc")),
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    const u3 = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      );
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  // Marcar notificaciones de admin como leidas al entrar
  useEffect(() => {
    if (!currentUser) return;
    const notifsRef = rtdbRef(rtdb, `adminNotifs/${currentUser.uid}`);
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

  const stats = {
    totalUsers: users.length,
    vendedores: users.filter((u) => u.role === "vendedor").length,
    compradores: users.filter((u) => u.role === "comprador").length,
    suspended: users.filter((u) => u.suspended).length,
    pendingVerification: users.filter((u) => u.verificationStatus === "pending").length,
    totalProducts: products.length,
    pending: products.filter((p) => p.moderationStatus === "pending").length,
    approved: products.filter((p) => !p.moderationStatus || p.moderationStatus === "approved").length,
    rejected: products.filter((p) => p.moderationStatus === "rejected").length,
    totalOrders: orders.length,
    ordersPending: orders.filter((o) => o.status === "pendiente").length,
    ordersDelivered: orders.filter((o) => o.status === "entregado").length,
  };

  const tabs = [
    { id: "stats", label: "Estadisticas", icon: <TrendingUp size={16} /> },
    { id: "verification", label: "Verificaciones", icon: <CreditCard size={16} />, badge: stats.pendingVerification },
    { id: "users", label: "Usuarios", icon: <Users size={16} /> },
    { id: "products", label: "Productos", icon: <Package size={16} /> },
    { id: "orders", label: "Pedidos", icon: <ShoppingCart size={16} /> },
  ];

  return (
    <div className="admin container">
      <div className="admin-header">
        <h1><Shield size={28} /> Panel de Administrador</h1>
        <p>Gestiona usuarios, modera productos y supervisa la plataforma</p>
      </div>

      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
            {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === "stats" && <StatsPanel stats={stats} />}
      {tab === "verification" && <VerificationPanel users={users} showToast={showToast} />}
      {tab === "users" && <UsersPanel users={users} showToast={showToast} />}
      {tab === "products" && <ProductsPanel products={products} showToast={showToast} />}
      {tab === "orders" && <OrdersPanel orders={orders} />}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

/* ── Stats ── */
function StatsPanel({ stats }) {
  const cards = [
    { label: "Usuarios totales", value: stats.totalUsers, icon: <Users size={24} />, color: "stat-blue" },
    { label: "Productores", value: stats.vendedores, icon: <Package size={24} />, color: "stat-green" },
    { label: "Compradores", value: stats.compradores, icon: <ShoppingCart size={24} />, color: "stat-orange" },
    { label: "Suspendidos", value: stats.suspended, icon: <Ban size={24} />, color: "stat-red" },
    { label: "Verificaciones pendientes", value: stats.pendingVerification, icon: <CreditCard size={24} />, color: "stat-yellow" },
    { label: "Productos totales", value: stats.totalProducts, icon: <Package size={24} />, color: "stat-green" },
    { label: "Pendientes de revision", value: stats.pending, icon: <Clock size={24} />, color: "stat-yellow" },
    { label: "Pedidos totales", value: stats.totalOrders, icon: <ShoppingCart size={24} />, color: "stat-blue" },
    { label: "Pedidos entregados", value: stats.ordersDelivered, icon: <CheckCircle size={24} />, color: "stat-green" },
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card ${c.color}`}>
          <div className="stat-card-icon">{c.icon}</div>
          <div className="stat-card-value">{c.value}</div>
          <div className="stat-card-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Verification ── */
function VerificationPanel({ users, showToast }) {
  const [filter, setFilter] = useState("pending");
  const [viewingIne, setViewingIne] = useState(null);

  const vendedores = users.filter((u) => u.role === "vendedor" && u.verificationStatus);
  const filtered = filter === "all"
    ? vendedores
    : vendedores.filter((u) => u.verificationStatus === filter);

  const handleVerify = async (user, status) => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        verificationStatus: status,
        verified: status === "approved",
        verifiedAt: new Date().toISOString(),
      });
      showToast(status === "approved" ? `${user.name} verificado` : `${user.name} rechazado`);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-top">
        <h2>Verificación de Productores</h2>
        <div className="mod-filters">
          {[
            { id: "pending", label: "Pendientes" },
            { id: "approved", label: "Aprobados" },
            { id: "rejected", label: "Rechazados" },
            { id: "all", label: "Todos" },
          ].map((f) => (
            <button
              key={f.id}
              className={`filter-chip ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay verificaciones con este filtro</p>
      ) : (
        <div className="verif-grid">
          {filtered.map((u) => (
            <div key={u.id} className="verif-card card">
              <div className="verif-card-top">
                <div>
                  <h4>{u.name}</h4>
                  <p className="verif-email">{u.email}</p>
                  <p className="verif-date">Registro: {new Date(u.createdAt).toLocaleDateString("es-MX")}</p>
                </div>
                <span className={`mod-status mod-${u.verificationStatus}`}>
                  {u.verificationStatus === "pending" && "Pendiente"}
                  {u.verificationStatus === "approved" && "Verificado"}
                  {u.verificationStatus === "rejected" && "Rechazado"}
                </span>
              </div>

              {u.inePhoto && (
                <div className="verif-ine">
                  <img
                    src={u.inePhoto}
                    alt="INE"
                    className="verif-ine-thumb"
                    onClick={() => setViewingIne(u.inePhoto)}
                  />
                  <span className="verif-ine-label">Clic para ver en grande</span>
                </div>
              )}

              {u.verificationStatus === "pending" && (
                <div className="mod-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => handleVerify(u, "approved")}>
                    <CheckCircle size={14} /> Aprobar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleVerify(u, "rejected")}>
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox para ver INE en grande */}
      {viewingIne && (
        <div className="ine-lightbox" onClick={() => setViewingIne(null)}>
          <img src={viewingIne} alt="INE completa" />
        </div>
      )}
    </div>
  );
}

/* ── Users ── */
function UsersPanel({ users, showToast }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (user) => {
    const newStatus = !user.suspended;
    try {
      await updateDoc(doc(db, "users", user.id), { suspended: newStatus });
      showToast(newStatus ? `${user.name} suspendido` : `${user.name} reactivado`);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`¿Eliminar la cuenta de ${user.name}? Esta accion no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, "users", user.id));
      showToast(`Cuenta de ${user.name} eliminada`);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-top">
        <h2>Usuarios ({users.length})</h2>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className={u.suspended ? "row-suspended" : ""}>
                <td className="td-name">{u.name || "—"}</td>
                <td className="td-email">{u.email}</td>
                <td>
                  <span className={`role-tag ${u.role}`}>
                    {u.role === "vendedor" ? "Productor" : u.role === "admin" ? "Admin" : "Comprador"}
                  </span>
                </td>
                <td className="td-date">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-MX") : "—"}
                </td>
                <td>
                  {u.suspended
                    ? <span className="status-tag suspended">Suspendido</span>
                    : <span className="status-tag active-tag">Activo</span>
                  }
                </td>
                <td className="td-actions">
                  {u.role !== "admin" && (
                    <>
                      <button
                        className="action-btn warn"
                        onClick={() => handleSuspend(u)}
                        title={u.suspended ? "Reactivar" : "Suspender"}
                      >
                        <Ban size={14} />
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(u)}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Products Moderation ── */
function ProductsPanel({ products, showToast }) {
  const [filter, setFilter] = useState("pending");

  const filtered = products.filter((p) => {
    if (filter === "pending") return p.moderationStatus === "pending";
    if (filter === "approved") return !p.moderationStatus || p.moderationStatus === "approved";
    if (filter === "rejected") return p.moderationStatus === "rejected";
    return true;
  });

  const handleModerate = async (product, status) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        moderationStatus: status,
        moderatedAt: new Date().toISOString(),
      });
      showToast(status === "approved" ? `"${product.name}" aprobado` : `"${product.name}" rechazado`);
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-top">
        <h2>Moderacion de Productos</h2>
        <div className="mod-filters">
          {[
            { id: "pending", label: "Pendientes" },
            { id: "approved", label: "Aprobados" },
            { id: "rejected", label: "Rechazados" },
            { id: "all", label: "Todos" },
          ].map((f) => (
            <button
              key={f.id}
              className={`filter-chip ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay productos con este filtro</p>
      ) : (
        <div className="mod-grid">
          {filtered.map((p) => (
            <div key={p.id} className="mod-card card">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="mod-img" />}
              <div className="mod-info">
                <h4>{p.name}</h4>
                <p className="mod-desc">{p.description}</p>
                <div className="mod-meta">
                  <span>${Number(p.price).toLocaleString("es-MX")} / {p.unit}</span>
                  <span>{p.sellerName}</span>
                </div>
                <span className={`mod-status mod-${p.moderationStatus || "approved"}`}>
                  {p.moderationStatus === "pending" && "Pendiente"}
                  {p.moderationStatus === "rejected" && "Rechazado"}
                  {(!p.moderationStatus || p.moderationStatus === "approved") && "Aprobado"}
                </span>
              </div>
              {p.moderationStatus === "pending" && (
                <div className="mod-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => handleModerate(p, "approved")}>
                    <CheckCircle size={14} /> Aprobar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleModerate(p, "rejected")}>
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Orders ── */
function OrdersPanel({ orders }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-panel">
      <div className="admin-panel-top">
        <h2>Todos los Pedidos ({orders.length})</h2>
        <div className="mod-filters">
          {["all", "pendiente", "confirmado", "en_camino", "entregado"].map((s) => (
            <button
              key={s}
              className={`filter-chip ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Todos" : s === "en_camino" ? "En camino" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay pedidos con este filtro</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Comprador</th>
                <th>Vendedor</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="td-name">{o.productName}</td>
                  <td>{o.buyerName}</td>
                  <td>{o.sellerName}</td>
                  <td>{o.quantity} {o.unit}{Number(o.quantity) !== 1 && "s"}</td>
                  <td className="td-price">${Number(o.total).toLocaleString("es-MX")}</td>
                  <td>
                    <span className={`status-tag order-${o.status}`}>
                      {o.status === "en_camino" ? "En camino" : o.status?.charAt(0).toUpperCase() + o.status?.slice(1)}
                    </span>
                  </td>
                  <td className="td-date">{new Date(o.createdAt).toLocaleDateString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
