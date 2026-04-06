import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus, Sprout, Building2 } from "lucide-react";
import { useToast } from "../hooks/useToast";
import "./Auth.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
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
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        photoURL: "",
      };
      await setDoc(doc(db, "users", cred.user.uid), userData);
      setUserData({ id: cred.user.uid, ...userData });
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

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
