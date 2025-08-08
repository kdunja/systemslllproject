import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:7210/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Čuvanje tokena i korisnika
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/loads";
        }, 1500);
      } else {
        setMessage("" + (data.error || "Login failed."));
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(" Server error. Please try again.");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>User Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px" }}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Log in
        </button>
      </form>

      <p style={{ marginTop: "20px" }}>
        Don't have an account?{" "}
        <a
          href="/register"
          style={{
            color: "#EB5E28",
            textDecoration: "none",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
        >
          Register here
        </a>
      </p>

      {message && (
        <p style={{ color: message.includes("❌") ? "red" : "green", marginTop: "10px" }}>
          {message}
        </p>
      )}
    </div>
  );
}
