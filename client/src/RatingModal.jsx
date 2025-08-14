import React, { useState, useEffect } from "react";
import axios from "./axios";

function RatingModal({ userId, authorId, onClose }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [existingRatings, setExistingRatings] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await axios.get(`/ratings/${userId}`, { validateStatus: () => true });
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setExistingRatings(list);
      } catch (err) {
        console.error("Error fetching ratings:", err);
        setExistingRatings([]);
      }
    };
    fetchRatings();
  }, [userId]);

  const handleSubmit = async () => {
    setMsg("");
    if (authorId === userId) return setMsg("You cannot rate yourself.");

    const s = Math.max(1, Math.min(5, Number(stars) || 1));
    try {
      const res = await axios.post(
        "/ratings",
        { userId, authorId, stars: s, comment },
        { validateStatus: () => true }
      );
      if (res.status === 201) {
        onClose();
      } else {
        setMsg(res.data?.error || "Failed to submit rating.");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      setMsg("Network/server error.");
    }
  };

  const average =
    existingRatings.length > 0
      ? (
          existingRatings.reduce((acc, r) => acc + (Number(r.stars) || 0), 0) /
          existingRatings.length
        ).toFixed(1)
      : null;

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
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      <h3>Rate User #{userId}</h3>

      {average && (
        <p>
          <strong>Average rating:</strong> {average} ⭐ • {existingRatings.length} rating(s)
        </p>
      )}

      <div style={{ marginBottom: "10px" }}>
        <label>Stars (1–5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={stars}
          onChange={(e) => setStars(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
          style={{ marginLeft: "10px", width: "60px" }}
        />
      </div>

      <div>
        <label>Comment:</label>
        <br />
        <textarea
          rows="2"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: "80%" }}
        />
      </div>

      {msg && <p style={{ color: "#e67e22", marginTop: 8 }}>{msg}</p>}

      <button onClick={handleSubmit} style={{ marginTop: "10px", marginRight: "10px" }}>
        Submit
      </button>
      <button onClick={onClose} style={{ marginTop: "10px" }}>
        Close
      </button>

      <hr style={{ margin: "20px 0", borderColor: "#444" }} />

      <h4>Previous Ratings</h4>
      {existingRatings.length === 0 ? (
        <p style={{ color: "#999" }}>No ratings yet.</p>
      ) : (
        <ul>
          {existingRatings.map((r) => (
            <li key={r.ratingId} style={{ marginBottom: "10px" }}>
              <strong>{r.stars} ⭐</strong> – {r.comment || "(no comment)"}{" "}
              <small style={{ color: "#aaa" }}>
                {r.timestamp ? `(${new Date(r.timestamp).toLocaleString()})` : ""}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RatingModal;

