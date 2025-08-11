import React, { useState } from "react";
import axios from "axios";

function AddUserForm({ onUserAdded }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/admin/users", {
        username,
        email,
        password,
        role,
      });
      alert("User added successfully!");
      onUserAdded(); // Refresh the list after adding the user
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <h3>Add User</h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={{ marginBottom: "10px", padding: "8px" }}
      />
      <br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ marginBottom: "10px", padding: "8px" }}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ marginBottom: "10px", padding: "8px" }}
      />
      <br />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px" }}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <br />
      <button type="submit" style={{ padding: "10px 20px" }}>
        Add User
      </button>
    </form>
  );
}

export default AddUserForm;
