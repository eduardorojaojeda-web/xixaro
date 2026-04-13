import { useEffect, useRef } from "react";
import { rtdb } from "../firebase";
import { ref, onChildAdded } from "firebase/database";

// Pide permiso al navegador para enviar notificaciones
export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// Envia una notificacion del navegador si el permiso esta otorgado
function sendBrowserNotification(title, body, onClick) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  // Solo enviar si la pestana no esta enfocada (el usuario esta en otra cosa)
  if (document.hasFocus()) return;

  const notif = new Notification(title, {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: title, // Evita duplicados con el mismo titulo
  });

  notif.onclick = () => {
    window.focus();
    if (onClick) onClick();
    notif.close();
  };
}

// Hook que escucha notificaciones nuevas en RTDB y las muestra como push
export function usePushNotifications(currentUser, userData) {
  // Ref para rastrear si ya estamos escuchando (evitar duplicados)
  const initialized = useRef(false);

  useEffect(() => {
    if (!currentUser || initialized.current) return;
    initialized.current = true;

    const uid = currentUser.uid;
    const role = userData?.role;

    // --- Notificaciones de pedidos (vendedor y comprador) ---
    const orderNotifsRef = ref(rtdb, `orderNotifs/${uid}`);
    const unsubOrders = onChildAdded(orderNotifsRef, (snap) => {
      const data = snap.val();
      if (!data || data.read) return;

      // Solo notificar si la notificacion es reciente (menos de 10 segundos)
      if (Date.now() - (data.timestamp || 0) > 10000) return;

      if (data.type === "nuevo_pedido") {
        sendBrowserNotification(
          "Nuevo pedido recibido",
          `${data.buyerName} hizo un pedido de ${data.productName}`,
          () => { window.location.href = "/pedidos"; }
        );
      }

      if (data.type === "estado_actualizado") {
        const statusLabels = {
          confirmado: "confirmado",
          en_camino: "en camino",
          entregado: "entregado",
        };
        sendBrowserNotification(
          "Pedido actualizado",
          `Tu pedido de ${data.productName} fue ${statusLabels[data.newStatus] || data.newStatus}`,
          () => { window.location.href = "/pedidos"; }
        );
      }
    });

    // --- Notificaciones de productos (compradores con alertas) ---
    const prodNotifsRef = ref(rtdb, `notifications/${uid}`);
    const unsubProducts = onChildAdded(prodNotifsRef, (snap) => {
      const data = snap.val();
      if (!data || data.read) return;
      if (Date.now() - (data.timestamp || 0) > 10000) return;

      if (data.type === "new_product") {
        sendBrowserNotification(
          "Nuevo producto disponible",
          `${data.sellerName} publicó ${data.productName} en ${data.category}`,
          () => { window.location.href = "/alertas"; }
        );
      }
    });

    // --- Notificaciones para admin (nuevo usuario, producto pendiente) ---
    const adminNotifsRef = ref(rtdb, `adminNotifs/${uid}`);
    const unsubAdmin = onChildAdded(adminNotifsRef, (snap) => {
      const data = snap.val();
      if (!data || data.read) return;
      if (Date.now() - (data.timestamp || 0) > 10000) return;

      if (data.type === "nuevo_usuario") {
        sendBrowserNotification(
          "Nuevo usuario registrado",
          `${data.userName} se registró como ${data.userRole === "vendedor" ? "productor" : "comprador"}`,
          () => { window.location.href = "/admin"; }
        );
      }

      if (data.type === "producto_pendiente") {
        sendBrowserNotification(
          "Producto pendiente de aprobación",
          `${data.sellerName} publicó "${data.productName}"`,
          () => { window.location.href = "/admin"; }
        );
      }
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubAdmin();
      initialized.current = false;
    };
  }, [currentUser, userData]);
}
