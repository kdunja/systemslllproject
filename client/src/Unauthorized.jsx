import React from "react";

export default function Unauthorized() {
  return (
    <div style={{ padding: "40px", textAlign: "center", color: "white" }}>
      <h2>Access denied</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  );
}
