import React, { useState } from "react";
import axios from "./axios";

const toMySQL = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return null;
  const pad = (n) => String(n).padStart(2, "0");
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

const initialLoad = { title: "", description: "", status: "open" };
const initialStop = { destination: "", cargotype: "", cargoweight: "", pickuptime: "", delieverytime: "" };

export default function AddLoadForm({ onLoadAdded }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [loadForm, setLoadForm] = useState(initialLoad);
  const [stops, setStops] = useState([initialStop]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const onChangeLoad = (e) => setLoadForm({ ...loadForm, [e.target.name]: e.target.value });

  const handleStopChange = (idx, field, value) => {
    setStops((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const addStop = () => setStops((prev) => [...prev, { ...initialStop }]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user?.userId) return setMsg("You must be logged in.");
    if (!loadForm.title) return setMsg("Title is required.");

    setBusy(true);
    setMsg("");

    try {
      const create = await axios.post(
        "/loads",
        {
          userId: user.userId,
          title: loadForm.title,
          description: loadForm.description,
          status: loadForm.status,
        },
        { validateStatus: () => true }
      );

      if (create.status !== 201 && create.status !== 200) {
        setBusy(false);
        return setMsg(create.data?.error || "Failed to create load.");
      }

      const loadassignmentId =
        create.data?.loadassignmentId ?? create.data?.data?.loadassignmentId ?? create.data?.id;

      for (const s of stops) {
        await axios.post(
          "/cargo",
          {
            loadassignmentId,
            destination: s.destination,
            cargotype: s.cargotype,
            cargoweight: s.cargoweight ? Number(s.cargoweight) : 0,
            pickuptime: toMySQL(s.pickuptime),
            delieverytime: toMySQL(s.delieverytime),
          },
          { validateStatus: () => true }
        );
      }

      setLoadForm(initialLoad);
      setStops([initialStop]);
      setMsg("Load created.");
      if (onLoadAdded) onLoadAdded();
    } catch (e) {
      setMsg("Server error while creating load.");
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(""), 1500);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: "30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "80px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT – Add Load (exact sizes) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 className="section-title">Add Load</h3>

          <input
            name="title"
            placeholder="Title"
            value={loadForm.title}
            onChange={onChangeLoad}
            required
            style={{ width: "160px" }}
          />

          <textarea
            name="description"
            placeholder="Description"
            value={loadForm.description}
            onChange={onChangeLoad}
            required
            style={{ width: "160px", height: "50px" }}
          />

          <select
            name="status"
            value={loadForm.status}
            onChange={onChangeLoad}
            style={{ width: "200px" }}
          >
            {/* Keep backend-friendly values; labels remain clear */}
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* RIGHT – Cargo Stops (exact layout and widths) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h4 className="section-title">Cargo Stops</h4>

          {stops.map((stop, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Destination"
                value={stop.destination}
                onChange={(e) => handleStopChange(index, "destination", e.target.value)}
                required
                style={{ width: "100px" }}
              />
              <input
                type="text"
                placeholder="Type"
                value={stop.cargotype}
                onChange={(e) => handleStopChange(index, "cargotype", e.target.value)}
                required
                style={{ width: "100px" }}
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={stop.cargoweight}
                onChange={(e) => handleStopChange(index, "cargoweight", e.target.value)}
                required
                style={{ width: "100px" }}
              />
              <input
                type="datetime-local"
                value={stop.pickuptime}
                onChange={(e) => handleStopChange(index, "pickuptime", e.target.value)}
                required
                style={{ width: "120px" }}
              />
              <input
                type="datetime-local"
                value={stop.delieverytime}
                onChange={(e) => handleStopChange(index, "delieverytime", e.target.value)}
                required
                style={{ width: "120px" }}
              />
            </div>
          ))}

          <button type="button" onClick={addStop}>
            + Add Stop
          </button>
        </div>
      </div>

      <div style={{ marginTop: "20px", marginLeft: "550px" }}>
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add Load"}
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 10, color: msg.includes("error") ? "#e74c3c" : "#2ecc71" }}>
          {msg}
        </div>
      )}
    </form>
  );
}
