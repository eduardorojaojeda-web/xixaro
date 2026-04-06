import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { LogIn } from "lucide-react";
import { ChileLargeIcon } from "../components/Icons";
import { useToast } from "../hooks/useToast";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("¡Bienvenido de vuelta!");
      navigate("/marketplace");
    } catch (err) {
      const msgs = {
        "auth/invalid-credential": "Correo o contraseña incorrectos",
        "auth/user-not-found": "No existe una cuenta con este correo",
        "auth/wrong-password": "Contraseña incorrecta",
      };
      showToast(msgs[err.code] || "Error al iniciar sesión", "error");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-emoji"><ChileLargeIcon size={80} /></span>
          <h1>Accede a tu cuenta</h1>
          <p>Plataforma de comercio agrícola directo</p>
        </div>

        <form onSubmit={handleSubmit}>
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
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>

        <button
          className="forgot-password"
          onClick={async () => {
            if (!email.trim()) {
              showToast("Escribe tu correo primero", "error");
              return;
            }
            try {
              await sendPasswordResetEmail(auth, email);
              showToast("Correo de recuperación enviado. Revisa tu bandeja.");
            } catch (err) {
              showToast(
                err.code === "auth/user-not-found"
                  ? "No existe una cuenta con ese correo"
                  : "Error al enviar correo de recuperación",
                "error"
              );
            }
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta comercial</Link>
        </p>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
