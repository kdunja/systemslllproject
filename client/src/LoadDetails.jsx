import React, { useEffect, useState } from "react";
import axios from "./axios";

function LoadDetails({ load, onClose, onEdit }) {
  const [cargoList, setCargoList] = useState([]);

  // Guard: if load is missing, render nothing
  const loadId = load?.loadassignmentId;
  useEffect(() => {
    if (!loadId) return;
    const fetchCargo = async () => {
      try {
        const res = await axios.get(`/cargo?loadId=${loadId}`, { validateStatus: () => true });
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setCargoList(list);
      } catch (err) {
        console.error("Failed to fetch cargo:", err);
        setCargoList([]);
      }
    };
    fetchCargo();
  }, [loadId]);

  if (!load) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#252422",
        color: "#FFFcf2",
        border: "1px solid #403D39",
        padding: "20px",
        zIndex: 1000,
        width: "90%",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        borderRadius: "12px",
      }}
    >
      <h3 style={{ borderBottom: "1px solid #CCC5B9", paddingBottom: "5px" }}>
        Load Details
      </h3>

      <p><strong>ID:</strong> {load.loadassignmentId}</p>
      <p><strong>User ID:</strong> {load.userId}</p>
      <p><strong>Title:</strong> {load.title}</p>
      <p><strong>Description:</strong> {load.description}</p>
      <p><strong>Status:</strong> {load.status}</p>
      <p><strong>Created At:</strong> {load.timestamp ? new Date(load.timestamp).toLocaleString() : "—"}</p>

      <hr style={{ marginTop: "15px", marginBottom: "10px", borderColor: "#CCC5B9" }} />
      <h4 style={{ marginBottom: "10px" }}>Cargo Stops</h4>

      {cargoList.length === 0 ? (
        <p style={{ color: "#CCC5B9" }}>No cargo stops for this load.</p>
      ) : (
        <ul style={{ paddingLeft: "18px" }}>
          {cargoList.map((cargo, index) => (
            <li key={cargo.cargoId ?? `${index}-${cargo.destination}`} style={{ marginBottom: "12px" }}>
              <p><strong>Stop #{index + 1}</strong></p>
              <p>Destination: {cargo.destination}</p>
              <p>Type: {cargo.cargotype}</p>
              <p>Weight: {cargo.cargoweight} kg</p>
              <p>Pickup: {cargo.pickuptime ? new Date(cargo.pickuptime).toLocaleString() : "N/A"}</p>
              <p>Delivery: {cargo.delieverytime ? new Date(cargo.delieverytime).toLocaleString() : "N/A"}</p>
            </li>
          ))}
        </ul>
      )}

      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <button
          onClick={() => { onClose(); onEdit(load); }}
          className="modal-button"
        >
          Edit
        </button>
        <button onClick={onClose} className="modal-button">
          Close
        </button>
      </div>
    </div>
  );
}

export default LoadDetails;

