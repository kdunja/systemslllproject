import React from "react";

function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function Dashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser && isValidJson(storedUser) ? JSON.parse(storedUser) : null;

  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "white" }}>
        <h2>No user data found. Please log in.</h2>
        <a href="/" style={{ color: "lightblue" }}>Go to login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Welcome, {user.username}!</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#ff4d4d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
