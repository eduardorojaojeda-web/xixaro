import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth, rtdb } from "../firebase";
import { ref, onValue } from "firebase/database";
import { Menu, X, ShoppingBag, User, LogOut, MessageCircle, Bell, LayoutDashboard, Package, Shield } from "lucide-react";
import { LeafLogo } from "./Icons";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const userChatsRef = ref(rtdb, `userChats/${currentUser.uid}`);
    const unsub = onValue(
      userChatsRef,
      (snap) => {
        const data = snap.val();
        if (!data) { setUnreadCount(0); return; }
        let count = 0;
        Object.values(data).forEach((chat) => {
          if (chat.unread > 0) count++;
        });
        setUnreadCount(count);
      },
      () => setUnreadCount(0)
    );

    return () => unsub();
  }, [currentUser]);

  // Listen for unread notifications (alerts)
  useEffect(() => {
    if (!currentUser) {
      setAlertCount(0);
      return;
    }

    const notifsRef = ref(rtdb, `notifications/${currentUser.uid}`);
    const unsub = onValue(
      notifsRef,
      (snap) => {
        const data = snap.val();
        if (!data) { setAlertCount(0); return; }
        let count = 0;
        Object.values(data).forEach((n) => {
          if (!n.read) count++;
        });
        setAlertCount(count);
      },
      () => setAlertCount(0)
    );

    return () => unsub();
  }, [currentUser]);

  // Listen for order notifications
  useEffect(() => {
    if (!currentUser) {
      setOrderCount(0);
      return;
    }

    const orderNotifsRef = ref(rtdb, `orderNotifs/${currentUser.uid}`);
    const unsub = onValue(
      orderNotifsRef,
      (snap) => {
        const data = snap.val();
        if (!data) { setOrderCount(0); return; }
        let count = 0;
        Object.values(data).forEach((n) => {
          if (!n.read) count++;
        });
        setOrderCount(count);
      },
      () => setOrderCount(0)
    );

    return () => unsub();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const totalBadge = unreadCount + alertCount;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <LeafLogo size={28} />
          <span className="brand-text">Xixaro</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/marketplace" onClick={() => setMenuOpen(false)}>
            <ShoppingBag size={18} /> Marketplace
          </Link>

          {currentUser ? (
            <>
              {userData?.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  <Shield size={18} /> Admin
                </Link>
              )}
              {userData?.role === "vendedor" && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={18} /> Mi Panel
                </Link>
              )}
              <Link to="/pedidos" onClick={() => setMenuOpen(false)} className="messages-link">
                <Package size={18} /> Pedidos
                {orderCount > 0 && (
                  <span className="unread-badge">{orderCount > 9 ? "9+" : orderCount}</span>
                )}
              </Link>
              <Link to="/chats" onClick={() => setMenuOpen(false)} className="messages-link">
                <MessageCircle size={18} /> Mensajes
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </Link>
              {userData?.role === "comprador" && (
                <Link to="/alertas" onClick={() => setMenuOpen(false)} className="messages-link">
                  <Bell size={18} /> Alertas
                  {alertCount > 0 && (
                    <span className="unread-badge">{alertCount > 9 ? "9+" : alertCount}</span>
                  )}
                </Link>
              )}
              <Link to={`/perfil/${currentUser.uid}`} onClick={() => setMenuOpen(false)}>
                <User size={18} /> Mi Perfil
              </Link>
              <button className="btn btn-sm btn-outline" onClick={handleLogout}>
                <LogOut size={16} /> Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
