import React, { useEffect, useState } from "react";
import axios from "axios";

function MessageModal({ senderId, recipientId, onClose }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchConversation();
  }, [senderId, recipientId]);

  const fetchConversation = async () => {
    try {
      const res = await axios.get(`/api/messages/${senderId}`);
      const conversation = res.data.filter(
        (m) =>
          (m.senderId === senderId && m.recipientId === recipientId) ||
          (m.senderId === recipientId && m.recipientId === senderId)
      );
      setMessages(conversation);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await axios.post("/api/messages", {
        senderId,
        recipientId,
        text
      });
      setText("");
      fetchConversation();
    } catch (err) {
      console.error("Error sending message:", err);
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
        width: "90%",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)"
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
                marginBottom: "8px"
              }}
            >
              <div style={{ display: "inline-block", maxWidth: "80%" }}>
                <strong>{m.senderId === senderId ? "You" : `User ${m.senderId}`}</strong>
                <div>{m.text}</div>
                <small style={{ fontSize: "0.75rem", color: "#aaa" }}>
                  {new Date(m.timestamp).toLocaleString()}
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
        style={{ width: "100%", marginBottom: "10px" }}
      />

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
