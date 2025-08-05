import React, { useState } from "react";

function AddLoadForm({ onLoadAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");

  const [cargoStops, setCargoStops] = useState([
    {
      destination: "",
      cargotype: "",
      cargoweight: "",
      pickuptime: "",
      delieverytime: ""
    }
  ]);

  const handleAddStop = () => {
    setCargoStops([
      ...cargoStops,
      {
        destination: "",
        cargotype: "",
        cargoweight: "",
        pickuptime: "",
        delieverytime: ""
      }
    ]);
  };

  const handleCargoChange = (index, field, value) => {
    const updated = [...cargoStops];
    updated[index][field] = value;
    setCargoStops(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const loadData = {
      title,
      description,
      status,
      userId: 1
    };

    onLoadAdded({ loadData, cargoStops });

    // Reset
    setTitle("");
    setDescription("");
    setStatus("open");
    setCargoStops([
      {
        destination: "",
        cargotype: "",
        cargoweight: "",
        pickuptime: "",
        delieverytime: ""
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "80px",
          flexWrap: "wrap"
        }}
      >
        {/* LEVA STRANA – ADD LOAD */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          <h3 className="section-title">Add Load</h3>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "160px" }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "160px", height: "50px" }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* DESNA STRANA – CARGO STOPS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h4 className="section-title">Cargo Stops</h4>
          {cargoStops.map((stop, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <input
                type="text"
                placeholder="Destination"
                value={stop.destination}
                onChange={(e) => handleCargoChange(index, "destination", e.target.value)}
                required
                style={{ width: "100px" }}
              />
              <input
                type="text"
                placeholder="Type"
                value={stop.cargotype}
                onChange={(e) => handleCargoChange(index, "cargotype", e.target.value)}
                required
                style={{ width: "100px" }}
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={stop.cargoweight}
                onChange={(e) => handleCargoChange(index, "cargoweight", e.target.value)}
                required
                style={{ width: "100px" }}
              />
              <input
                type="datetime-local"
                value={stop.pickuptime}
                onChange={(e) => handleCargoChange(index, "pickuptime", e.target.value)}
                required
                style={{ width: "120px" }}
              />
              <input
                type="datetime-local"
                value={stop.delieverytime}
                onChange={(e) => handleCargoChange(index, "delieverytime", e.target.value)}
                required
                style={{ width: "120px" }}
              />
            </div>
          ))}

          <button type="button" onClick={handleAddStop}>+ Add Stop</button>
        </div>
      </div>

      {/* SUBMIT button below both sections, centered */}
      <div style={{marginTop: "20px", marginLeft: "80px" }}>
        <button type="submit">Add Load</button>
      </div>
    </form>
  );
}

export default AddLoadForm;

