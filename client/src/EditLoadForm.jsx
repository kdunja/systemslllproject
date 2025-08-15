import React, { useEffect, useState } from "react";
import axios from "./axios";

export default function EditLoadForm({ load, onCancel, onUpdate }) {
  const [title, setTitle] = useState(load.title || "");
  const [description, setDescription] = useState(load.description || "");
  const [status, setStatus] = useState(load.status || "pending");
  const [stops, setStops] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(load.title || "");
    setDescription(load.description || "");
    setStatus(load.status || "pending");
  }, [load]);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/cargo/by-load/${load.loadassignmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        });
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setStops(data.map(toEditableStop));
      } catch (e) {
        console.error("GET /cargo/by-load failed:", e);
      }
    };
    fetchStops();
  }, [load.loadassignmentId]);

  const toEditableStop = (c) => ({
    cargoId: c.cargoId ?? null,
    destination: c.destination || "",
    cargotype: c.cargotype || "",
    cargoweight: c.cargoweight ?? "",
    pickuptime: toLocalInput(c.pickuptime),
    delieverytime: toLocalInput(c.delieverytime),
  });

  function toLocalInput(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  const fromLocalInput = (s) => (s ? new Date(s) : null);

  const addStop = () =>
    setStops((prev) => [
      ...prev,
      { cargoId: null, destination: "", cargotype: "", cargoweight: "", pickuptime: "", delieverytime: "" },
    ]);

  const removeStop = (idx) => setStops((prev) => prev.filter((_, i) => i !== idx));

  const changeStop = (idx, field, value) =>
    setStops((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // 1) update load base fields
      const baseRes = await axios.put(
        `/loads/${load.loadassignmentId}`,
        { title, description, status },
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
      );
      if (!baseRes.data?.ok) throw new Error(baseRes.data?.error || "Failed to update load.");

      // 2) bulk replace cargo stops (single payload)
      const payload = {
        items: stops.map((s) => ({
          destination: s.destination,
          cargotype: s.cargotype,
          cargoweight: Number(s.cargoweight) || 0,
          pickuptime: fromLocalInput(s.pickuptime),
          delieverytime: fromLocalInput(s.delieverytime),
        })),
      };
      const cargoRes = await axios.put(
        `/cargo/bulk/${load.loadassignmentId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
      );
      if (!cargoRes.data?.ok) throw new Error(cargoRes.data?.error || "Failed to update cargo.");

      onUpdate({ ...load, title, description, status });
    } catch (err) {
      console.error(err);
      alert(err.message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "70%", marginBottom: 10, padding: 6 };

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
        padding: 20,
        zIndex: 1000,
        width: "92%",
        maxWidth: 740,
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        borderRadius: 12,
      }}
    >
      <form onSubmit={save}>
        <h3 style={{ marginTop: 0 }}>Edit Load</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={inputStyle}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          style={inputStyle}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          style={{ ...inputStyle, marginBottom: 20 }}
        >
          <option value="pending">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>

        <h4 style={{ margin: "0 0 10px" }}>Cargo Stops</h4>

        {stops.map((s, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 14,
              padding: 12,
              border: "1px solid #CCC5B9",
              borderRadius: 8,
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <input
              placeholder="Destination"
              value={s.destination}
              onChange={(e) => changeStop(idx, "destination", e.target.value)}
              style={inputStyle}
              required
            />
            <input
              placeholder="Type"
              value={s.cargotype}
              onChange={(e) => changeStop(idx, "cargotype", e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={s.cargoweight}
              onChange={(e) => changeStop(idx, "cargoweight", e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="datetime-local"
              value={s.pickuptime}
              onChange={(e) => changeStop(idx, "pickuptime", e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="datetime-local"
              value={s.delieverytime}
              onChange={(e) => changeStop(idx, "delieverytime", e.target.value)}
              style={inputStyle}
              required
            />
            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                className="action-button delete"
                onClick={() => removeStop(idx)}
                style={{ padding: "6px 10px" }}
              >
                Remove stop
              </button>
            </div>
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="action-button"
            onClick={addStop}
            style={{ padding: "8px 12px" }}
          >
            + Add stop
          </button>
        </div>

        <div style={{ textAlign: "right" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#EB5E28",
              color: "#FFFcf2",
              padding: "8px 14px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              marginLeft: 10,
              backgroundColor: "#403D39",
              color: "#FFFcf2",
              padding: "8px 14px",
              border: "none",
              borderRadius: 6,
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
