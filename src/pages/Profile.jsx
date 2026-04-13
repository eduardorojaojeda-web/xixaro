import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, rtdb } from "../firebase";
import { ref as rtdbRef, onValue, set as rtdbSet } from "firebase/database";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import { User, MapPin, Calendar, CreditCard, Bell } from "lucide-react";
import { useToast } from "../hooks/useToast";
import "./Profile.css";

export default function Profile() {
  const { userId } = useParams();
  const { currentUser, userData: myData } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState("loading"); // "loading" | "found" | "not-found" | "error"
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [showPayment, setShowPayment] = useState(false);
  const [locationName, setLocationName] = useState(null);
  const [myAlerts, setMyAlerts] = useState({});
  const { toast, showToast } = useToast();

  const CATEGORIES = ["verduras", "chiles", "frutas", "granos", "otros"];

  // Load alert preferences for own profile
  const isOwnProfile = currentUser && currentUser.uid === userId;
  const isComprador = isOwnProfile && myData?.role === "comprador";

  useEffect(() => {
    if (!isComprador) return;
    const alertRef = rtdbRef(rtdb, `alerts/${currentUser.uid}/categories`);
    const unsub = onValue(alertRef, (snap) => {
      setMyAlerts(snap.val() || {});
    });
    return () => unsub();
  }, [isComprador, currentUser]);

  const toggleAlert = (cat) => {
    const updated = { ...myAlerts, [cat]: !myAlerts[cat] };
    rtdbSet(rtdbRef(rtdb, `alerts/${currentUser.uid}/categories`), updated);
  };

  useEffect(() => {
    setProfileStatus("loading");
    setProfile(null);

    const timeout = setTimeout(() => {
      setProfileStatus((prev) => {
        if (prev === "loading") return "error";
        return prev;
      });
    }, 10000);

    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        clearTimeout(timeout);
        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
          setProfileStatus("found");
        } else {
          setProfileStatus("not-found");
        }
      } catch (err) {
        clearTimeout(timeout);
        console.error("Error cargando perfil:", err);
        setProfileStatus("error");
      }
    };
    loadProfile();

    return () => clearTimeout(timeout);
  }, [userId]);

  // Reverse geocode from first product with location
  useEffect(() => {
    if (products.length === 0) return;
    const withLoc = products.find((p) => p.lat && p.lng);
    if (!withLoc) return;

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${withLoc.lat}&lon=${withLoc.lng}&format=json&zoom=12`
    )
      .then((r) => r.json())
      .then((data) => {
        const addr = data.address || {};
        const parts = [
          addr.suburb || addr.neighbourhood || addr.village,
          addr.city || addr.town || addr.municipality,
          addr.state,
        ].filter(Boolean);
        if (parts.length) setLocationName(parts.join(", "));
      })
      .catch(() => {});
  }, [products]);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("sellerId", "==", userId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userId]);

  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("targetId", "==", userId)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setReviews(list);
      },
      (err) => {
        console.error("Error al cargar reseñas:", err);
        showToast("Error al cargar reseñas: " + err.message, "error");
      }
    );
    return unsub;
  }, [userId]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  const handleReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (newReview.rating === 0) {
      showToast("Selecciona una calificación", "error");
      return;
    }
    try {
      await addDoc(collection(db, "reviews"), {
        targetId: userId,
        authorId: currentUser.uid,
        authorName: myData?.name || "Usuario",
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date().toISOString(),
      });
      setNewReview({ rating: 0, comment: "" });
      showToast("¡Reseña publicada!");
    } catch (err) {
      console.error("Error al publicar reseña:", err);
      showToast("Error al publicar reseña: " + err.message, "error");
    }
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

  if (profileStatus === "loading") {
    return (
      <div className="profile-status">
        <div className="status-spinner" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (profileStatus === "not-found") {
    return (
      <div className="profile-status">
        <span className="status-icon">👤</span>
        <h2>Perfil no encontrado</h2>
        <p>Este usuario no existe o fue eliminado.</p>
        <button className="btn btn-primary" onClick={() => navigate("/marketplace")}>
          Ir al Marketplace
        </button>
      </div>
    );
  }

  if (profileStatus === "error" || !profile) {
    return (
      <div className="profile-status">
        <span className="status-icon">⚠️</span>
        <h2>Error de conexión</h2>
        <p>No pudimos cargar este perfil. Revisa tu conexión a internet e intenta de nuevo.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="profile container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.name} />
          ) : (
            <div className="avatar-placeholder">
              <User size={48} />
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <span className={`role-badge ${profile.role}`}>
            {profile.role === "vendedor" ? "🌱 Vendedor" : "🛒 Comprador"}
          </span>
          <div className="profile-meta">
            <span>
              <Calendar size={14} />
              Miembro desde{" "}
              {new Date(profile.createdAt).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
              })}
            </span>
            {locationName && (
              <span>
                <MapPin size={14} />
                {locationName}
              </span>
            )}
          </div>
          {reviews.length > 0 && (
            <div className="profile-rating">
              <StarRating rating={Math.round(avgRating)} readonly size={18} />
              <span>
                {avgRating} ({reviews.length} reseña{reviews.length !== 1 && "s"})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment integration placeholder */}
      {profile.role === "vendedor" && currentUser && currentUser.uid !== userId && (
        <div className="payment-section card">
          <div className="payment-inner">
            <CreditCard size={24} />
            <div>
              <h3>Pago Seguro con Conekta</h3>
              <p>Realiza tu primera transacción de forma segura</p>
            </div>
            <button
              className="btn btn-orange btn-sm"
              onClick={() => setShowPayment(!showPayment)}
            >
              {showPayment ? "Cerrar" : "Pagar con Conekta"}
            </button>
          </div>
          {showPayment && (
            <div className="payment-placeholder">
              <div className="payment-box">
                <p>🔒 Integración con API de Conekta</p>
                <p className="payment-note">
                  Espacio reservado para el procesador de pagos Conekta.
                  Aquí se integrará el formulario de pago seguro para la primera transacción.
                </p>
                <div className="payment-fields">
                  <div className="input-group">
                    <label>Monto (MXN)</label>
                    <input type="number" placeholder="0.00" disabled />
                  </div>
                  <button className="btn btn-orange btn-block" disabled>
                    Procesar Pago (próximamente)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products — solo aprobados en perfil publico, todos en perfil propio */}
      {profile.role === "vendedor" && (() => {
        const visibleProducts = isOwnProfile
          ? products
          : products.filter((p) => !p.moderationStatus || p.moderationStatus === "approved");
        return (
        <section className="profile-section">
          <h2>Productos de {profile.name} ({visibleProducts.length})</h2>
          {visibleProducts.length === 0 ? (
            <p className="section-empty">Este vendedor aún no tiene productos.</p>
          ) : (
            <div className="mp-grid">
              {visibleProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showOrder={currentUser && currentUser.uid !== p.sellerId}
                  onContact={
                    currentUser && currentUser.uid !== p.sellerId
                      ? handleContact
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>
        );
      })()}

      {/* Alerts for buyers on own profile */}
      {isComprador && (
        <section className="profile-section">
          <h2><Bell size={20} /> Mis Alertas de Productos</h2>
          <p className="section-desc">
            Selecciona las categorías que te interesan. Recibirás una notificación cuando un vendedor publique un producto nuevo.
          </p>
          <div className="alerts-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`alert-chip ${myAlerts[cat] ? "active" : ""}`}
                onClick={() => toggleAlert(cat)}
              >
                <span className="alert-chip-emoji">
                  {cat === "verduras" && "🥬"}
                  {cat === "chiles" && "🌶️"}
                  {cat === "frutas" && "🍎"}
                  {cat === "granos" && "🌾"}
                  {cat === "otros" && "📦"}
                </span>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                {myAlerts[cat] && <span className="alert-check">✓</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="profile-section">
        <h2>Reseñas ({reviews.length})</h2>

        {currentUser && currentUser.uid !== userId && (
          <form onSubmit={handleReview} className="review-form card">
            <h3>Dejar una reseña</h3>
            <StarRating
              rating={newReview.rating}
              onRate={(r) => setNewReview({ ...newReview, rating: r })}
              size={28}
            />
            <div className="input-group">
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                placeholder="Comparte tu experiencia..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Publicar Reseña
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="section-empty">Aún no hay reseñas.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-item card">
                <div className="review-header">
                  <strong>{r.authorName}</strong>
                  <StarRating rating={r.rating} readonly size={14} />
                </div>
                <p className="review-comment">{r.comment}</p>
                <span className="review-date">
                  {new Date(r.createdAt).toLocaleDateString("es-MX")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
