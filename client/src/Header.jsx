import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // ako koristiš localStorage
    navigate("/"); // vodi na login stranicu
  };

 return (
  <header
    style={{
      width: "100%",
      backgroundColor: "#252422", // nova tamna boja
      color: "#FFFCF2",            // svetla bela boja teksta
      padding: "12px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "4px solid #EB5E28", // narandžasta linija
      boxSizing: "border-box",
    }}
  >
    <h2 style={{ margin: 0, fontSize: "24px" }}>Transport Manager</h2>

    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <span style={{ fontSize: "16px" }}>Welcome</span>
      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "none",
          color: "#EB5E28", // narandžasta ikonica
          cursor: "pointer",
          fontSize: "24px",
          padding: "4px",
          borderRadius: "4px",
          transition: "background-color 0.2s",
        }}
        title="Logout"
      >
        <FiLogOut />
      </button>
    </div>
  </header>
);

};

export default Header;
