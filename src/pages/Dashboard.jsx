import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, rtdb } from "../firebase";
import { ref as rtdbRef, get as rtdbGet, push as rtdbPush } from "firebase/database";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { Plus, Trash2, Package, MapPin, Loader, TrendingUp, Pencil, X, Save, AlertTriangle, RefreshCw } from "lucide-react";
import { CameraIcon, ProductPlaceholder, BasketIcon } from "../components/Icons";
import { useToast } from "../hooks/useToast";
import "./Dashboard.css";

const UNITS = [
  { value: "tonelada", label: "Tonelada" },
  { value: "kg", label: "Kilogramo" },
  { value: "lb", label: "Libra" },
  { value: "caja", label: "Caja" },
  { value: "costal", label: "Costal" },
  { value: "pieza", label: "Pieza" },
  { value: "litro", label: "Litro" },
];
const CATEGORIES = ["verduras", "chiles", "frutas", "granos", "otros"];

export default function Dashboard() {
  const { currentUser, userData } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    unit: "kg",
    category: "verduras",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avgPrice, setAvgPrice] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const { toast, showToast } = useToast();

  const validateForm = () => {
    const errs = {};
    const name = form.name.trim();
    const desc = form.description.trim();
    const price = Number(form.price);
    const qty = Number(form.quantity);

    if (name.length < 3) errs.name = "Mínimo 3 caracteres";
    else if (name.length > 100) errs.name = "Máximo 100 caracteres";

    if (desc.length < 10) errs.description = "Mínimo 10 caracteres";
    else if (desc.length > 500) errs.description = "Máximo 500 caracteres";

    if (!price || price <= 0) errs.price = "Ingresa un precio válido mayor a 0";

    if (!qty || qty <= 0) errs.quantity = "Ingresa una cantidad válida mayor a 0";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "products"),
      where("sellerId", "==", currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  // Search average price when product name changes
  useEffect(() => {
    const name = form.name.trim().toLowerCase();
    if (name.length < 3) {
      setAvgPrice(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const matches = snap.docs
          .map((d) => d.data())
          .filter((p) => {
            const pName = (p.name || "").toLowerCase();
            const words = name.split(/\s+/);
            return words.some((w) => w.length >= 3 && pName.includes(w));
          });
        if (matches.length >= 2) {
          const avg = matches.reduce((s, p) => s + p.price, 0) / matches.length;
          const units = {};
          matches.forEach((p) => { units[p.unit] = (units[p.unit] || 0) + 1; });
          const topUnit = Object.entries(units).sort((a, b) => b[1] - a[1])[0][0];
          setAvgPrice({ avg: avg.toFixed(0), unit: topUnit, count: matches.length });
        } else {
          setAvgPrice(null);
        }
      } catch {
        setAvgPrice(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.name]);

  const MAX_BASE64 = 800_000; // 800KB max para Firestore

  const compressImage = (file) =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        let quality = 0.7;
        let result = canvas.toDataURL("image/jpeg", quality);
        while (result.length > MAX_BASE64 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(result);
      };
      img.src = URL.createObjectURL(file);
    });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1_000_000) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setImageSize({ original: file.size, compressed: null });

    const compressed = await compressImage(file);
    const compressedBytes = Math.round(compressed.length * 0.75);

    if (compressedBytes > MAX_BASE64) {
      showToast(`Imagen demasiado grande (${formatSize(compressedBytes)}). Usa una foto más pequeña.`, "error");
      setImageFile(null);
      setImagePreview(null);
      setImageSize(null);
      return;
    }

    setImageFile(compressed);
    setImageSize({ original: file.size, compressed: compressedBytes });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", quantity: "", unit: "kg", category: "verduras" });
    setImageFile(null);
    setImagePreview(null);
    setImageSize(null);
    setLocation(null);
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      quantity: String(product.quantity),
      unit: product.unit || "kg",
      category: product.category || "verduras",
    });
    setImageFile(product.imageUrl || null); // URL string de Storage
    setImagePreview(product.imageUrl || null);
    setImageSize(null); // No mostramos tamaño para fotos existentes
    setLocation(product.lat ? { lat: product.lat, lng: product.lng } : null);
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // La imagen ya viene como base64 comprimido o como URL/base64 existente
      const imageUrl = (typeof imageFile === "string" && imageFile.length > 0) ? imageFile : "";

      const productData = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        imageUrl,
        sellerId: currentUser.uid,
        sellerName: userData?.name || "Vendedor",
      };
      if (location) {
        productData.lat = location.lat;
        productData.lng = location.lng;
      }

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        resetForm();
        showToast("Producto actualizado");
      } else {
        productData.createdAt = new Date().toISOString();
        productData.moderationStatus = "pending";
        await addDoc(collection(db, "products"), productData);

        // Send alerts to buyers watching this category
        try {
          const alertsSnap = await rtdbGet(rtdbRef(rtdb, "alerts"));
          const alertsData = alertsSnap.val();
          if (alertsData) {
            const category = form.category || "otros";
            Object.entries(alertsData).forEach(([uid, userAlerts]) => {
              if (uid === currentUser.uid) return;
              if (userAlerts.categories && userAlerts.categories[category]) {
                rtdbPush(rtdbRef(rtdb, `notifications/${uid}`), {
                  type: "new_product",
                  productName: form.name,
                  category,
                  sellerName: userData?.name || "Vendedor",
                  sellerId: currentUser.uid,
                  timestamp: Date.now(),
                  read: false,
                });
              }
            });
          }
        } catch (e) {
          console.error("Error sending alerts:", e);
        }

        resetForm();
        showToast("¡Producto publicado!");
      }
    } catch (err) {
      showToast(editingId ? "Error al actualizar: " + err.message : "Error al publicar: " + err.message, "error");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      showToast("Producto eliminado");
    } catch (err) {
      showToast("Error al eliminar: " + err.message, "error");
    }
  };

  return (
    <div className="dashboard container">
      <div className="dash-header">
        <h1>
          <Package size={28} /> Mi Panel de Vendedor
        </h1>
        <p>Publica y administra tus productos del campo</p>
      </div>

      <div className="dash-grid">
        <div className="dash-form-wrap">
          <div className="dash-form-header">
            <h2>{editingId ? "Editar Producto" : "Publicar Producto"}</h2>
            {editingId && (
              <button type="button" className="btn btn-sm cancel-edit-btn" onClick={resetForm}>
                <X size={16} /> Cancelar
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="dash-form">
            <div className="input-group">
              <label>Nombre del producto</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                placeholder="Ej: Chile Habanero, Aguacate Hass..."
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="input-group">
              <label>Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: undefined }); }}
                placeholder="Describe tu producto: origen, frescura, tipo..."
                className={errors.description ? "input-error" : ""}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="input-group">
              <label>Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Precio por tonelada (MXN)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.price ? Number(form.price).toLocaleString("es-MX") : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, "");
                    setForm({ ...form, price: raw });
                    setErrors({ ...errors, price: undefined });
                  }}
                  placeholder="0"
                  className={errors.price ? "input-error" : ""}
                />
                {errors.price && <span className="field-error">{errors.price}</span>}
                {Number(form.price) > 0 && (
                  <div className="price-equivalences">
                    <span>= <strong>${(Number(form.price) / 1000).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> por kg</span>
                    <span>= <strong>${(Number(form.price) / 2204.62).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> por libra</span>
                  </div>
                )}
                {avgPrice && (
                  <div className="avg-price-hint">
                    <TrendingUp size={14} />
                    Precio promedio en Xixaro: <strong>${Number(avgPrice.avg).toLocaleString("es-MX")}/ton</strong>
                    <span className="avg-count">({avgPrice.count} productos)</span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => { setForm({ ...form, quantity: e.target.value }); setErrors({ ...errors, quantity: undefined }); }}
                  placeholder="0"
                  className={errors.quantity ? "input-error" : ""}
                />
                {errors.quantity && <span className="field-error">{errors.quantity}</span>}
              </div>

              <div className="input-group">
                <label>Unidad</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Foto del producto</label>
              <div className="image-upload">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="img-preview" />
                ) : (
                  <div className="img-placeholder">
                    <CameraIcon size={36} />
                    <span>Subir foto</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="file-input"
                />
              </div>
              {imageSize && imageSize.original && (
                <div className="image-size-info">
                  <span>Original: {formatSize(imageSize.original)}</span>
                  {imageSize.compressed && (
                    <span className="compressed-ok">
                      → Comprimida: {formatSize(imageSize.compressed)} ✓
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Ubicación</label>
              {location ? (
                <div className="location-info">
                  <MapPin size={16} />
                  <span>Ubicación guardada ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</span>
                  <button type="button" className="loc-clear" onClick={() => setLocation(null)}>✕</button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  disabled={locLoading}
                  onClick={() => {
                    if (!navigator.geolocation) {
                      alert("Tu navegador no soporta geolocalización");
                      return;
                    }
                    setLocLoading(true);
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ lat: latitude, lng: longitude });
                        setLocLoading(false);
                        alert("Ubicación obtenida correctamente");
                      },
                      (error) => {
                        console.error("Error geolocalización:", error.code, error.message);
                        alert("Error: " + error.message);
                        setLocLoading(false);
                      },
                      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
                    );
                  }}
                >
                  {locLoading ? <Loader size={16} className="spin" /> : <MapPin size={16} />}
                  {locLoading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {loading
                ? (editingId ? "Guardando..." : "Publicando...")
                : (editingId ? "Guardar Cambios" : "Publicar Producto")
              }
            </button>
          </form>
        </div>

        <div className="dash-products">
          <h2>Mis Productos ({products.length})</h2>
          {products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><BasketIcon size={48} /></span>
              <p>Aún no has publicado productos</p>
            </div>
          ) : (
            <div className="my-products-list">
              {products.map((p) => (
                <div key={p.id} className="my-product-item card">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="my-product-img" />
                  ) : (
                    <div className="my-product-img-ph"><ProductPlaceholder size={40} /></div>
                  )}
                  <div className="my-product-info">
                    <h4>
                      {p.name}
                      {Number(p.quantity) <= 0 && (
                        <span className="stock-badge-sold-out"><AlertTriangle size={12} /> Agotado</span>
                      )}
                      {p.moderationStatus === "pending" && (
                        <span className="stock-badge-pending">En revision</span>
                      )}
                      {p.moderationStatus === "rejected" && (
                        <span className="stock-badge-sold-out">Rechazado</span>
                      )}
                    </h4>
                    <p className="my-product-price">
                      ${Number(p.price).toLocaleString("es-MX")} / {p.unit}
                    </p>
                    <StockEditor product={p} onUpdate={showToast} />
                  </div>
                  <div className="my-product-actions">
                    <button
                      className="btn btn-sm edit-btn"
                      onClick={() => handleEdit(p)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-sm delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

function StockEditor({ product, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(String(product.quantity));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const newQty = Number(qty);
    if (isNaN(newQty) || newQty < 0) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "products", product.id), { quantity: newQty });
      onUpdate("Stock actualizado");
      setEditing(false);
    } catch (err) {
      onUpdate("Error: " + err.message, "error");
    }
    setSaving(false);
  };

  if (editing) {
    return (
      <div className="stock-editor">
        <input
          type="number"
          min="0"
          step="0.01"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="stock-input"
          autoFocus
        />
        <span className="stock-unit">{product.unit}s</span>
        <button className="btn btn-sm btn-primary stock-save" onClick={handleSave} disabled={saving}>
          {saving ? "..." : <Save size={12} />}
        </button>
        <button className="btn btn-sm stock-cancel" onClick={() => { setEditing(false); setQty(String(product.quantity)); }}>
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <p className="my-product-qty stock-clickable" onClick={() => setEditing(true)}>
      {product.quantity} {product.unit}{Number(product.quantity) !== 1 && "s"}
      <RefreshCw size={11} />
    </p>
  );
}
