import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axios";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    surname: "",
    phonenumber: "",
    role: "shipper",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("/register", form, { validateStatus: () => true });
      if (res.status === 201) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 800);
      } else {
        setMessage(res.data?.error || "Registration failed.");
      }
    } catch {
      setMessage("Network error.");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <br />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <br />
        <input name="name" placeholder="First Name" value={form.name} onChange={handleChange} />
        <br />
        <input name="surname" placeholder="Last Name" value={form.surname} onChange={handleChange} />
        <br />
        <input name="phonenumber" placeholder="Phone Number" value={form.phonenumber} onChange={handleChange} />
        <br />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="shipper">Shipper</option>
          <option value="carrier">Carrier</option>
        </select>
        <br /><br />
        <button type="submit">Register</button>
      </form>
      {message && <p style={{ color: message.includes("successful") ? "green" : "red" }}>{message}</p>}
    </div>
  );
}

export default Register;
