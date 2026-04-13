import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db, rtdb } from "../firebase";
import { ref as rtdbRef, push as rtdbPush } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus, Sprout, Building2, CreditCard } from "lucide-react";
import { useToast } from "../hooks/useToast";
import "./Auth.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [inePhoto, setInePhoto] = useState(null);
  const [inePreview, setInePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const { setUserData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      showToast("Selecciona un rol", "error");
      return;
    }
    if (role === "vendedor" && !inePhoto) {
      showToast("Sube una foto de tu identificación oficial (INE)", "error");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        photoURL: "",
        ...(role === "vendedor" && {
          verified: false,
          verificationStatus: "pending",
          inePhoto: inePhoto,
        }),
      };
      await setDoc(doc(db, "users", cred.user.uid), userData);
      setUserData({ id: cred.user.uid, ...userData });
      // Notificar a todos los admins del nuevo registro
      try {
        const adminsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "admin")));
        adminsSnap.docs.forEach((adminDoc) => {
          rtdbPush(rtdbRef(rtdb, `adminNotifs/${adminDoc.id}`), {
            type: "nuevo_usuario",
            userName: name,
            userRole: role,
            timestamp: Date.now(),
            read: false,
          });
        });
      } catch (e) {
        console.error("Error notifying admins:", e);
      }

      showToast("¡Cuenta creada exitosamente!");
      navigate(role === "vendedor" ? "/dashboard" : "/marketplace");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "Este correo ya está registrado",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
        "auth/invalid-email": "Correo electrónico inválido",
      };
      showToast(msgs[err.code] || err.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-emoji"><Sprout size={48} strokeWidth={1.5} /></span>
          <h1>Crear Cuenta en Xixaro</h1>
          <p>Plataforma B2B de comercio agrícola directo en México</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre o razón social</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre o el de tu empresa"
              required
            />
          </div>

          <div className="input-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="input-group">
            <label>Tipo de cuenta</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${role === "vendedor" ? "active-seller" : ""}`}
                onClick={() => setRole("vendedor")}
              >
                <Sprout size={28} />
                <strong>Productor / Agricultor</strong>
                <span>Vendo cosecha, granos, chiles u otros productos del campo</span>
              </button>
              <button
                type="button"
                className={`role-option ${role === "comprador" ? "active-buyer" : ""}`}
                onClick={() => setRole("comprador")}
              >
                <Building2 size={28} />
                <strong>Comprador Comercial</strong>
                <span>Restaurante, supermercado, distribuidora o exportadora</span>
              </button>
            </div>
          </div>

          {role === "vendedor" && (
            <div className="input-group">
              <label><CreditCard size={14} /> Identificación oficial (INE)</label>
              <p className="ine-hint">
                Sube una foto legible de tu INE por ambos lados. Será revisada por un administrador para verificar tu identidad.
              </p>
              <div className="ine-upload">
                {inePreview ? (
                  <img src={inePreview} alt="INE preview" className="ine-preview" />
                ) : (
                  <div className="ine-placeholder">
                    <CreditCard size={28} />
                    <span>Subir foto de INE</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setInePreview(URL.createObjectURL(file));
                    // Comprimir a base64
                    const canvas = document.createElement("canvas");
                    const img = new window.Image();
                    img.onload = () => {
                      let w = img.width, h = img.height;
                      const MAX = 1400;
                      if (w > MAX || h > MAX) {
                        const r = Math.min(MAX / w, MAX / h);
                        w = Math.round(w * r);
                        h = Math.round(h * r);
                      }
                      canvas.width = w;
                      canvas.height = h;
                      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                      setInePhoto(canvas.toDataURL("image/jpeg", 0.6));
                    };
                    img.src = URL.createObjectURL(file);
                  }}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
        <p className="auth-legal">
          Al crear tu cuenta aceptas los <Link to="/terminos">Términos y Condiciones</Link> y
          la <Link to="/privacidad">Política de Privacidad</Link>
        </p>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
