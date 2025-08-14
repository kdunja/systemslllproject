import React, { useEffect, useState } from "react";
import axios from "./axios";

function EditLoadForm({ load, onCancel, onUpdate }) {
  const [form, setForm] = useState({
    title: load.title || "",
    description: load.description || "",
    status: load.status || "open",
  });

  const [cargoList, setCargoList] = useState([]);
  const [cargoEdits, setCargoEdits] = useState({});

  useEffect(() => {
    const fetchCargo = async () => {
      try {
        const res = await axios.get(`/cargo/${load.loadassignmentId}`);
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setCargoList(data);
        const editState = {};
        data.forEach((cargo) => {
          editState[cargo.cargoId] = {
            destination: cargo.destination,
            cargotype: cargo.cargotype,
            cargoweight: cargo.cargoweight,
            pickuptime: cargo.pickuptime,
            delieverytime: cargo.delieverytime,
          };
        });
        setCargoEdits(editState);
      } catch {}
    };
    fetchCargo();
  }, [load.loadassignmentId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCargoChange = (cargoId, e) => {
    const { name, value } = e.target;
    setCargoEdits((prev) => ({
      ...prev,
      [cargoId]: { ...prev[cargoId], [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/loads/${load.loadassignmentId}`, form);
      for (const cargoId of Object.keys(cargoEdits)) {
        await axios.put(`/cargo/${cargoId}`, cargoEdits[cargoId]);
      }
      alert("Load and cargo updated successfully.");
      onUpdate({ ...load, ...form });
    } catch {
      alert("Failed to update. Please try again.");
    }
  };

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
      <form onSubmit={handleSubmit}>
        <h3>Edit Load</h3>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
          style={{ width: "70%", marginBottom: "10px", padding: "5px" }}
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          required
          style={{ width: "70%", marginBottom: "10px", padding: "5px" }}
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          required
          style={{ width: "70%", marginBottom: "20px", padding: "5px" }}
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <h4>Cargo Stops</h4>
        {cargoList.map((cargo) => (
          <div
            key={cargo.cargoId}
            style={{
              marginBottom: "15px",
              padding: "10px",
              border: "1px solid #CCC5B9",
              borderRadius: "6px",
            }}
          >
            <input
              name="destination"
              value={cargoEdits[cargo.cargoId]?.destination || ""}
              onChange={(e) => handleCargoChange(cargo.cargoId, e)}
              placeholder="Destination"
              required
              style={{ width: "70%", marginBottom: "5px", padding: "5px" }}
            />
            <input
              name="cargotype"
              value={cargoEdits[cargo.cargoId]?.cargotype || ""}
              onChange={(e) => handleCargoChange(cargo.cargoId, e)}
              placeholder="Type"
              required
              style={{ width: "70%", marginBottom: "5px", padding: "5px" }}
            />
            <input
              name="cargoweight"
              type="number"
              value={cargoEdits[cargo.cargoId]?.cargoweight || ""}
              onChange={(e) => handleCargoChange(cargo.cargoId, e)}
              placeholder="Weight"
              required
              style={{ width: "70%", marginBottom: "5px", padding: "5px" }}
            />
            <input
              name="pickuptime"
              type="datetime-local"
              value={cargoEdits[cargo.cargoId]?.pickuptime?.slice(0, 16) || ""}
              onChange={(e) => handleCargoChange(cargo.cargoId, e)}
              required
              style={{ width: "70%", marginBottom: "5px", padding: "5px" }}
            />
            <input
              name="delieverytime"
              type="datetime-local"
              value={cargoEdits[cargo.cargoId]?.delieverytime?.slice(0, 16) || ""}
              onChange={(e) => handleCargoChange(cargo.cargoId, e)}
              required
              style={{ width: "70%", padding: "5px" }}
            />
          </div>
        ))}

        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#EB5E28",
              color: "#FFFcf2",
              padding: "8px 14px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              marginLeft: "10px",
              backgroundColor: "#403D39",
              color: "#FFFcf2",
              padding: "8px 14px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditLoadForm;
