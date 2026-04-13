import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, rtdb } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { ref as rtdbRef, push as rtdbPush } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { ShoppingCart, Calendar, Package, ArrowLeft } from "lucide-react";
import { useToast } from "../hooks/useToast";
import "./NewOrder.css";

export default function NewOrder() {
  const { productId } = useParams();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast, showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "products", productId));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setProduct(data);
        setUnit(data.unit || "tonelada");
      } else {
        navigate("/marketplace");
      }
    };
    load();
  }, [productId, navigate]);

  const validate = () => {
    const errs = {};
    if (!quantity || Number(quantity) <= 0) errs.quantity = "Ingresa una cantidad válida";
    if (Number(quantity) > product.quantity) errs.quantity = `Solo hay ${product.quantity} ${product.unit}(s) disponibles`;
    if (!deliveryDate) errs.date = "Selecciona una fecha de entrega";
    const selected = new Date(deliveryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (selected < tomorrow) errs.date = "La fecha debe ser al menos mañana";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Re-verificar stock actual antes de crear el pedido
      const freshSnap = await getDoc(doc(db, "products", productId));
      if (!freshSnap.exists()) {
        showToast("Este producto ya no existe", "error");
        setLoading(false);
        return;
      }
      const freshProduct = freshSnap.data();
      if (Number(quantity) > freshProduct.quantity) {
        setErrors({ quantity: `Stock actualizado: solo hay ${freshProduct.quantity} ${freshProduct.unit}(s) disponibles` });
        setProduct({ id: freshSnap.id, ...freshProduct });
        setLoading(false);
        return;
      }

      const total = Number(quantity) * product.price;

      await addDoc(collection(db, "orders"), {
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl || "",
        pricePerUnit: product.price,
        unit: product.unit,
        quantity: Number(quantity),
        total,
        deliveryDate,
        notes: notes.trim(),
        status: "pendiente",
        buyerId: currentUser.uid,
        buyerName: userData?.name || "Comprador",
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Notificar al vendedor que tiene un nuevo pedido
      rtdbPush(rtdbRef(rtdb, `orderNotifs/${product.sellerId}`), {
        type: "nuevo_pedido",
        productName: product.name,
        buyerName: userData?.name || "Comprador",
        timestamp: Date.now(),
        read: false,
      });

      showToast("Pedido enviado al productor");
      navigate("/pedidos");
    } catch (err) {
      showToast("Error al crear pedido: " + err.message, "error");
    }
    setLoading(false);
  };

  if (!product) {
    return <div className="order-loading"><p>Cargando producto...</p></div>;
  }

  const estimatedTotal = quantity > 0 ? (Number(quantity) * product.price) : 0;

  return (
    <div className="new-order container">
      <button className="btn btn-sm btn-outline back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="order-layout">
        <div className="order-product-summary card">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="order-product-img" />
          )}
          <div className="order-product-info">
            <h3>{product.name}</h3>
            <p className="order-product-price">
              ${Number(product.price).toLocaleString("es-MX")} / {product.unit}
            </p>
            <p className="order-product-seller">Productor: {product.sellerName}</p>
            <p className="order-product-available">
              {product.quantity} {product.unit}{Number(product.quantity) !== 1 && "s"} disponible{Number(product.quantity) !== 1 && "s"}
            </p>
          </div>
        </div>

        <form className="order-form card" onSubmit={handleSubmit}>
          <h2><ShoppingCart size={22} /> Crear Pedido</h2>

          <div className="input-group">
            <label>Cantidad ({product.unit}s)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setErrors({ ...errors, quantity: undefined }); }}
              placeholder={`¿Cuántas ${product.unit}s necesitas?`}
              className={errors.quantity ? "input-error" : ""}
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </div>

          <div className="input-group">
            <label><Calendar size={14} /> Fecha de entrega deseada</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => { setDeliveryDate(e.target.value); setErrors({ ...errors, date: undefined }); }}
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              className={errors.date ? "input-error" : ""}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          <div className="input-group">
            <label>Notas para el productor (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Especificaciones de calidad, empaque, punto de entrega..."
              rows={3}
            />
          </div>

          {estimatedTotal > 0 && (
            <div className="order-total">
              <span>Total estimado</span>
              <strong>${estimatedTotal.toLocaleString("es-MX")}</strong>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <Package size={18} />
            {loading ? "Enviando pedido..." : "Enviar Pedido al Productor"}
          </button>
        </form>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
