import React, { useState } from "react";
import axios from "./axios";

export default function EditUserForm({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    role: user.role || "user",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`/admin/users/${user.userId}`, form);
      onSaved();
    } catch {
      alert("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#252422",
          color: "#FFFcf2",
          padding: 20,
          borderRadius: 10,
          width: 420,
          border: "1px solid #403D39",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Edit User #{user.userId}</h3>

        <div style={{ marginBottom: 10 }}>
          <label>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: "100%", marginTop: 6 }}
          >
            <option value="admin">admin</option>
            <option value="carrier">carrier</option>
            <option value="shipper">shipper</option>
            <option value="user">user</option>
          </select>
        </div>

        <div style={{ textAlign: "right" }}>
          <button onClick={onClose} style={{ marginRight: 10 }}>
            Close
          </button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
