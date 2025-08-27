import React, { useEffect, useState } from "react";
import axios from "./axios";

function MessageModal({ recipientId, onClose }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const senderId = currentUser?.userId;

  useEffect(() => {
    if (senderId && recipientId) fetchConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderId, recipientId]);

  const fetchConversation = async () => {
    try {
      // use conversation endpoint (ascending order from backend)
      const res = await axios.get(
  `/message/conversation/${senderId}/${recipientId}`,
  { validateStatus: () => true }
);
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setMessages(list);
    } catch {
      setMessages([]);
    }
  };

  const handleSend = async () => {
    setMsg("");
    if (!text.trim()) return;
    try {
      const res = await axios.post(
  "/message",
  { senderId, recipientId, text },
  { validateStatus: () => true }
);

      if (res.status === 201) {
        setText("");
        await fetchConversation();
      } else {
        setMsg(res.data?.error || "Failed to send message.");
      }
    } catch {
      setMsg("Network/server error.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#1e1e1e",
        color: "#f1f1f1",
        padding: "20px",
        borderRadius: "10px",
        zIndex: 1000,
        width: "70%",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      <h3>Conversation with User #{recipientId}</h3>

      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "15px" }}>
        {messages.length === 0 ? (
          <p style={{ color: "#aaa" }}>No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.messageId}
              style={{
                textAlign: m.senderId === senderId ? "right" : "left",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "inline-block", maxWidth: "80%" }}>
                <strong>{m.senderId === senderId ? "You" : `User ${m.senderId}`}</strong>
                <div>{m.text}</div>
                <small style={{ fontSize: "0.75rem", color: "#aaa" }}>
                  {m.timestamp ? new Date(m.timestamp).toLocaleString() : ""}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      <textarea
        rows="2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "70%", marginBottom: "10px" }}
      />
      {msg && <div style={{ color: "#e67e22", marginBottom: 8 }}>{msg}</div>}

      <div style={{ textAlign: "right" }}>
        <button onClick={handleSend} style={{ marginRight: "10px" }}>
          Send
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default MessageModal;
