import React, { useState } from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("/login", form, { validateStatus: () => true });
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setMessage("Login successful. Redirecting to loads…");
        setTimeout(() => window.location.replace("/loadboard"), 600);
      } else {
        setMessage(res.data?.error || "Invalid credentials.");
      }
    } catch {
      setMessage("Network error.");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>

      {message && (
        <p style={{ color: message.toLowerCase().includes("success") ? "green" : "red" }}>
          {message}
        </p>
      )}

       <p style={{ marginTop: "15px" }}>
        No account?{" "}
        <Link to="/register" style={{ color: "#EB5E28", textDecoration: "underline" }}>
          Register here
        </Link>
      </p>
    </div>
  );
}

export default Login;
