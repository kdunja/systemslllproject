import React, { useState } from "react";

function EditLoadForm({ load, onCancel, onUpdate }) {
  const [form, setForm] = useState({
    title: load.title,
    description: load.description,
    status: load.status,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/loadassignments/${load.loadassignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        onUpdate(data.load);
      } else {
        alert("Error: " + data.msg);
      }
    } catch (err) {
      alert("Error updating load.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        required
      />
      <br />
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        required
      />
      <br />
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
      <br />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: "10px" }}>
        Cancel
      </button>
    </form>
  );
}

export default EditLoadForm;
