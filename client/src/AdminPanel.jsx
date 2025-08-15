import React, { useEffect, useState } from "react";
import axios from "./axios";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";

function AdminPanel() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loads, setLoads] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingsUserFilter, setRatingsUserFilter] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesUserFilter, setMessagesUserFilter] = useState("");
  const [stats, setStats] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      const rows = res.data?.data || [];
      setUsers(rows);
    } catch {}
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch {
      alert("Failed to delete user.");
    }
  };

  const handleUserAdded = () => {
    setShowAddUserForm(false);
    fetchUsers();
  };

  const handleUserSaved = () => {
    setEditUser(null);
    fetchUsers();
  };

  const toggleUserActive = async (user) => {
    const next = user.is_active ? 0 : 1;
    const verb = next ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${verb} this user?`)) return;
    try {
      await axios.patch(`/admin/users/${user.userId}/status`, { is_active: next });
      fetchUsers();
    } catch {
      alert("Failed to update user status.");
    }
  };

  const fetchLoads = async () => {
    try {
      const res = await axios.get("/admin/loads");
      const rows = res.data?.data || [];
      setLoads(rows);
    } catch {}
  };

  const handleDeleteLoad = async (loadId) => {
    if (!window.confirm("Delete this load and all its cargo?")) return;
    try {
      await axios.delete(`/admin/loads/${loadId}`);
      setLoads((prev) => prev.filter((l) => l.loadassignmentId !== loadId));
    } catch {
      alert("Failed to delete load.");
    }
  };

  const fetchRatings = async () => {
    try {
      const query = ratingsUserFilter ? `?userId=${encodeURIComponent(ratingsUserFilter)}` : "";
      const res = await axios.get(`/admin/ratings${query}`);
      const rows = res.data?.data || [];
      setRatings(rows);
    } catch {}
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("Delete this rating?")) return;
    try {
      await axios.delete(`/admin/ratings/${ratingId}`);
      setRatings((prev) => prev.filter((r) => r.ratingId !== ratingId));
    } catch {
      alert("Failed to delete rating.");
    }
  };

  const fetchMessages = async () => {
    try {
      const query = messagesUserFilter ? `?userId=${encodeURIComponent(messagesUserFilter)}` : "";
      const res = await axios.get(`/admin/messages${query}`);
      const rows = res.data?.data || [];
      setMessages(rows);
    } catch {}
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`/admin/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    } catch {
      alert("Failed to delete message.");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("/admin/stats");
      const s = res.data?.data || null;
      setStats(s);
    } catch {}
  };

  useEffect(() => {
    if (tab === "users") fetchUsers();
    if (tab === "loads") fetchLoads();
    if (tab === "ratings") fetchRatings();
    if (tab === "messages") fetchMessages();
    if (tab === "dashboard") fetchStats();
  }, [tab]);

  const maxStatusCount =
    stats && stats.statusCounts && stats.statusCounts.length
      ? Math.max(...stats.statusCounts.map((s) => Number(s.count) || 0))
      : 0;

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>Admin Panel</h2>

      <div style={{ marginBottom: 16 }}>
        {["users", "loads", "ratings", "messages", "dashboard"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              marginRight: 10,
              padding: "8px 14px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              backgroundColor: tab === t ? "#EB5E28" : "#403D39",
              color: "#FFFcf2",
            }}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <>
          <button
            onClick={() => setShowAddUserForm(!showAddUserForm)}
            style={{
              marginBottom: "20px",
              padding: "10px 20px",
              backgroundColor: "#EB5E28",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {showAddUserForm ? "Cancel" : "Add User"}
          </button>

          {showAddUserForm && <AddUserForm onUserAdded={handleUserAdded} />}

          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status / Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.userId}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: u.is_active ? "#2e7d32" : "#6d4c41",
                          color: "white",
                          marginRight: 12,
                          fontSize: 12,
                        }}
                      >
                        {u.is_active ? "active" : "suspended"}
                      </span>
                      <button
                        onClick={() => setEditUser(u)}
                        style={{
                          marginRight: 8,
                          backgroundColor: "#403D39",
                          color: "#FFFcf2",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleUserActive(u)}
                        style={{
                          marginRight: 8,
                          backgroundColor: "#403D39",
                          color: "#FFFcf2",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {u.is_active ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.userId)}
                        style={{
                          backgroundColor: "#EB5E28",
                          color: "#FFFcf2",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {editUser && (
            <EditUserForm
              user={editUser}
              onClose={() => setEditUser(null)}
              onSaved={handleUserSaved}
            />
          )}
        </>
      )}

      {tab === "loads" && (
        <>
          {loads.length === 0 ? (
            <p>No loads found.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Cargo Stops</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loads.map((l) => (
                  <tr key={l.loadassignmentId}>
                    <td>{l.loadassignmentId}</td>
                    <td>{l.username ? `${l.username} (#${l.userId})` : l.userId}</td>
                    <td>{l.title}</td>
                    <td>{l.description}</td>
                    <td>{l.status}</td>
                    <td>{new Date(l.timestamp).toLocaleString()}</td>
                    <td>{l.cargoCount}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteLoad(l.loadassignmentId)}
                        style={{
                          backgroundColor: "#EB5E28",
                          color: "#FFFcf2",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === "ratings" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="Filter by User ID (optional)"
              value={ratingsUserFilter}
              onChange={(e) => setRatingsUserFilter(e.target.value)}
              style={{ padding: "8px 12px", marginRight: 8 }}
            />
            <button onClick={fetchRatings} style={{ padding: "8px 12px" }}>
              Refresh
            </button>
          </div>
          {ratings.length === 0 ? (
            <p>No ratings found.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Author ID</th>
                  <th>Stars</th>
                  <th>Comment</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr key={r.ratingId}>
                    <td>{r.ratingId}</td>
                    <td>{r.userId}</td>
                    <td>{r.authorId}</td>
                    <td>{r.stars}</td>
                    <td>{r.comment}</td>
                    <td>{new Date(r.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteRating(r.ratingId)}
                        style={{
                          backgroundColor: "#EB5E28",
                          color: "#FFFcf2",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === "messages" && (
        <>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="Filter by User ID (optional)"
              value={messagesUserFilter}
              onChange={(e) => setMessagesUserFilter(e.target.value)}
              style={{ padding: "8px 12px", marginRight: 8 }}
            />
            <button onClick={fetchMessages} style={{ padding: "8px 12px" }}>
              Refresh
            </button>
          </div>
          {messages.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Text</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.messageId}>
                    <td>{m.messageId}</td>
                    <td>{m.senderId}</td>
                    <td>{m.recipientId}</td>
                    <td>{m.text}</td>
                    <td>{new Date(m.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteMessage(m.messageId)}
                        style={{
                          backgroundColor: "#EB5E28",
                          color: "#FFFcf2",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === "dashboard" && (
        <>
          {!stats ? (
            <p>Loading stats...</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <div style={{ background: "#252422", padding: 16, borderRadius: 8 }}>
                  <h4>Total Users</h4>
                  <div style={{ fontSize: 28 }}>{stats.counts.users}</div>
                </div>
                <div style={{ background: "#252422", padding: 16, borderRadius: 8 }}>
                  <h4>Total Loads</h4>
                  <div style={{ fontSize: 28 }}>{stats.counts.loads}</div>
                </div>
                <div style={{ background: "#252422", padding: 16, borderRadius: 8 }}>
                  <h4>Total Ratings</h4>
                  <div style={{ fontSize: 28 }}>{stats.counts.ratings}</div>
                </div>
                <div style={{ background: "#252422", padding: 16, borderRadius: 8 }}>
                  <h4>Total Messages</h4>
                  <div style={{ fontSize: 28 }}>{stats.counts.messages}</div>
                </div>
              </div>

              <div style={{ marginTop: 24, background: "#252422", borderRadius: 8, padding: 16 }}>
                <h4 style={{ marginTop: 0, marginBottom: 12 }}>Loads by status</h4>
                {(!stats.statusCounts || stats.statusCounts.length === 0) && <p>No data.</p>}
                {stats.statusCounts &&
                  stats.statusCounts.map((row) => {
                    const count = Number(row.count) || 0;
                    const widthPct = maxStatusCount ? Math.max(4, Math.round((count / maxStatusCount) * 100)) : 0;
                    return (
                      <div key={row.status} style={{ marginBottom: 10 }}>
                        <div style={{ marginBottom: 4, fontSize: 14 }}>
                          {row.status} ({count})
                        </div>
                        <div style={{ background: "#403D39", height: 12, borderRadius: 6, overflow: "hidden" }}>
                          <div style={{ width: `${widthPct}%`, height: "100%", background: "#EB5E28" }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPanel;
