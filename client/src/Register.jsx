import React, { useState } from "react";

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

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Registration successful! Please log in.");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      setMessage("Error: " + data.msg);
    }
  } catch (err) {
    setMessage("Error sending request.");
    console.error(err);
  }
};


  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <br />
        <input
          name="surname"
          placeholder="Surname"
          value={form.surname}
          onChange={handleChange}
        />
        <br />
        <input
          name="phonenumber"
          placeholder="Phone number"
          value={form.phonenumber}
          onChange={handleChange}
        />
        <br />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="shipper">Shipper</option>
          <option value="carrier">Carrier</option>
        </select>
        <br />
        <br />
        <button type="submit">Register</button>
      </form>
      {message && (
        <p style={{ color: message.includes("Error") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Register;
