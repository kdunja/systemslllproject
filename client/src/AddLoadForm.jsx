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
      userId: 1 // TODO: zameni pravim ID-jem iz auth-a ako budeš imala
    };

    onLoadAdded({ loadData, cargoStops });

    // Reset forma
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
      <h3>Add Load</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <br />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>

      <hr />
      <h4>Cargo Stops</h4>
      {cargoStops.map((stop, index) => (
        <div
          key={index}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <input
            type="text"
            placeholder="Destination"
            value={stop.destination}
            onChange={(e) =>
              handleCargoChange(index, "destination", e.target.value)
            }
            required
          />
          <input
            type="text"
            placeholder="Type"
            value={stop.cargotype}
            onChange={(e) =>
              handleCargoChange(index, "cargotype", e.target.value)
            }
            required
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={stop.cargoweight}
            onChange={(e) =>
              handleCargoChange(index, "cargoweight", e.target.value)
            }
            required
          />
          <input
            type="datetime-local"
            value={stop.pickuptime}
            onChange={(e) =>
              handleCargoChange(index, "pickuptime", e.target.value)
            }
            required
          />
          <input
            type="datetime-local"
            value={stop.delieverytime}
            onChange={(e) =>
              handleCargoChange(index, "delieverytime", e.target.value)
            }
            required
          />
        </div>
      ))}

      <button type="button" onClick={handleAddStop}>
        + Add Stop
      </button>
      <br />
      <button type="submit" style={{ marginTop: "10px" }}>
        Add Load
      </button>
    </form>
  );
}

export default AddLoadForm;
