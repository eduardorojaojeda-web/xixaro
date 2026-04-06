import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { rtdb } from "../firebase";
import { ref, push, onValue, update, runTransaction, serverTimestamp } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { Send, ArrowLeft } from "lucide-react";
import "./Chat.css";

export default function Chat() {
  const { chatId } = useParams();
  const location = useLocation();
  const { currentUser, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const otherUserId = location.state?.otherUserId
    || chatId.split("_").find((id) => id !== currentUser.uid);
  const otherUserName = location.state?.otherUserName || "Usuario";

  // Mark as read when opening the chat
  useEffect(() => {
    if (!currentUser) return;
    console.log("[Xixaro] Opening chat, marking as read:", chatId);
    update(ref(rtdb, `userChats/${currentUser.uid}/${chatId}`), {
      unread: 0,
    });
  }, [chatId, currentUser]);

  useEffect(() => {
    const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
    const unsub = onValue(messagesRef, (snap) => {
      const data = snap.val();
      if (data) {
        setMessages(
          Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
        );
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text.trim();
    setText("");

    // Push message
    push(ref(rtdb, `chats/${chatId}/messages`), {
      text: messageText,
      senderId: currentUser.uid,
      senderName: userData?.name || "Usuario",
      timestamp: serverTimestamp(),
    });

    // Update sender's chat meta (unread = 0 because they're in the chat)
    update(ref(rtdb, `userChats/${currentUser.uid}/${chatId}`), {
      lastMessage: messageText,
      timestamp: serverTimestamp(),
      otherUserId,
      otherUserName,
      unread: 0,
    });

    // Update receiver's chat meta
    update(ref(rtdb, `userChats/${otherUserId}/${chatId}`), {
      lastMessage: messageText,
      timestamp: serverTimestamp(),
      otherUserId: currentUser.uid,
      otherUserName: userData?.name || "Usuario",
    });

    // Atomically increment unread count (transaction doesn't need read permission on parent)
    const unreadRef = ref(rtdb, `userChats/${otherUserId}/${chatId}/unread`);
    runTransaction(unreadRef, (current) => {
      console.log("[Xixaro] Transaction: current unread =", current, "-> setting to:", (current || 0) + 1);
      return (current || 0) + 1;
    }).catch((err) => {
      console.error("[Xixaro] Transaction error:", err);
    });
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <Link to="/chats" className="chat-back">
          <ArrowLeft size={20} />
        </Link>
        <div className="chat-header-info">
          <h2>{otherUserName}</h2>
          <span>Chat directo</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span>💬</span>
            <p>Inicia la conversación</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${
              msg.senderId === currentUser.uid ? "mine" : "theirs"
            }`}
          >
            {msg.senderId !== currentUser.uid && (
              <span className="bubble-name">{msg.senderName}</span>
            )}
            <p>{msg.text}</p>
            {msg.timestamp && (
              <span className="bubble-time">
                {new Date(msg.timestamp).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          autoFocus
        />
        <button type="submit" className="btn btn-primary">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
