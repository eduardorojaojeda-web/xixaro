import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { MessageCircle } from "lucide-react";
import "./ChatList.css";

export default function ChatList() {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const userChatsRef = ref(rtdb, `userChats/${currentUser.uid}`);
    const unsub = onValue(userChatsRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Mark all chats as read when viewing the list
      const updates = {};
      Object.keys(data).forEach((chatId) => {
        if (data[chatId].unread > 0) {
          updates[`${chatId}/unread`] = 0;
        }
      });
      if (Object.keys(updates).length > 0) {
        console.log("[Xixaro] Marking all chats as read:", updates);
        update(ref(rtdb, `userChats/${currentUser.uid}`), updates);
      }

      const chatList = Object.entries(data)
        .map(([chatId, meta]) => ({
          chatId,
          otherUserId: meta.otherUserId,
          otherUserName: meta.otherUserName || "Usuario",
          lastMessage: meta.lastMessage || "",
          lastTime: meta.timestamp || 0,
          unread: meta.unread || 0,
        }))
        .sort((a, b) => b.lastTime - a.lastTime);

      setChats(chatList);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const openChat = (chat) => {
    navigate(`/chat/${chat.chatId}`, {
      state: {
        otherUserId: chat.otherUserId,
        otherUserName: chat.otherUserName,
      },
    });
  };

  return (
    <div className="chat-list container">
      <div className="cl-header">
        <h1>
          <MessageCircle size={28} /> Mensajes
        </h1>
      </div>

      {loading ? (
        <p className="cl-loading">Cargando conversaciones...</p>
      ) : chats.length === 0 ? (
        <div className="cl-empty">
          <span>💬</span>
          <p>No tienes conversaciones aún</p>
          <p>Contacta a un vendedor desde el marketplace</p>
        </div>
      ) : (
        <div className="cl-items">
          {chats.map((chat) => (
            <div
              key={chat.chatId}
              className="cl-item card"
              onClick={() => openChat(chat)}
            >
              <div className="cl-avatar">
                {chat.otherUserName.charAt(0).toUpperCase()}
              </div>
              <div className="cl-info">
                <h3>{chat.otherUserName}</h3>
                <p>{chat.lastMessage}</p>
              </div>
              {chat.lastTime > 0 && (
                <span className="cl-time">
                  {new Date(chat.lastTime).toLocaleDateString("es-MX")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
