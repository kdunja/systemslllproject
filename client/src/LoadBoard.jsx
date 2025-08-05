import React, { useEffect, useState } from "react";
import AddLoadForm from "./AddLoadForm";
import EditLoadForm from "./EditLoadForm";
import LoadDetails from "./LoadDetails";
import axios from "axios";
import RatingModal from "./RatingModal";
import MessageModal from "./MessageModal";
import Header from "./Header";



function LoadBoard() {
  const [loads, setLoads] = useState([]);
  const [cargoData, setCargoData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [pickupAfter, setPickupAfter] = useState("");
  const [deliveryBefore, setDeliveryBefore] = useState("");

  const resetFilters = () => {
  setSearchTerm("");
  setStatusFilter("");
  setSelectedCity("");
  setSelectedType("");
  setPickupAfter("");
  setDeliveryBefore("");
};


  const [editLoad, setEditLoad] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);

  const startEditing = (load) => setEditLoad(load);
  const cancelEditing = () => setEditLoad(null);

  const updateLoadInList = (updatedLoad) => {
    setLoads((prev) =>
      prev.map((load) =>
        load.loadassignmentId === updatedLoad.loadassignmentId ? updatedLoad : load
      )
    );
    setEditLoad(null);
  };

  const openDetails = (load) => setSelectedLoad(load);
  const closeDetails = () => setSelectedLoad(null);

  useEffect(() => {
    fetchLoads();
    fetchCargo();
  }, []);

  const fetchLoads = async () => {
    try {
      const res = await fetch("/api/loadassignments");
      const data = await res.json();
      setLoads(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading loads:", err);
      setLoading(false);
    }
  };

  const fetchCargo = async () => {
    try {
      const res = await fetch("/api/cargo/all");
      const data = await res.json();
      setCargoData(data);
    } catch (err) {
      console.error("Error loading cargo:", err);
    }
  };

  const handleLoadAdded = async ({ loadData, cargoStops }) => {
    try {
      const res = await axios.post("/api/loadassignments", loadData);
      const loadassignmentId = res.data.loadassignmentId;

      for (const stop of cargoStops) {
        await axios.post("/api/cargo", {
          loadassignmentId,
          ...stop,
        });
      }

      fetchLoads();
      fetchCargo();
    } catch (err) {
      console.error("Error adding load with cargo stops:", err);
      alert("Failed to add load and stops");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this load?")) return;

    try {
      const res = await fetch(`/api/loadassignments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLoads((prev) =>
          prev.filter((load) => load.loadassignmentId !== id)
        );
        setCargoData((prev) =>
          prev.filter((cargo) => cargo.loadassignmentId !== id)
        );
      } else {
        const data = await res.json();
        alert("Error: " + data.msg);
      }
    } catch (err) {
      alert("Error deleting the load.");
    }
  };

  const filteredLoads = loads.filter((load) => {
    const matchesSearch =
      load.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? load.status === statusFilter : true;

    const relatedCargo = cargoData.filter(
      (c) => c.loadassignmentId === load.loadassignmentId
    );

    const matchesCity = selectedCity
      ? relatedCargo.some((c) => c.destination === selectedCity)
      : true;

    const matchesType = selectedType
      ? relatedCargo.some((c) => c.cargotype === selectedType)
      : true;

    const matchesPickup = pickupAfter
      ? relatedCargo.some((c) => new Date(c.pickuptime) >= new Date(pickupAfter))
      : true;

    const matchesDelivery = deliveryBefore
      ? relatedCargo.some((c) => new Date(c.delieverytime) <= new Date(deliveryBefore))
      : true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCity &&
      matchesType &&
      matchesPickup &&
      matchesDelivery
    );
  });

  const [ratingTargetUserId, setRatingTargetUserId] = useState(null);

  const [messageTargetUserId, setMessageTargetUserId] = useState(null);


  if (loading) return <p>Loading loads...</p>;

  return (
      <div style={{ margin: 0, padding: 0 }}>
    <Header />
    <div style={{ padding: "20px" }}>

      <AddLoadForm onLoadAdded={handleLoadAdded} />

      <div style={{ marginBottom: "15px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "5px" }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="">All cities</option>
          {[...new Set(cargoData.map((c) => c.destination))].map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="">All types</option>
          {[...new Set(cargoData.map((c) => c.cargotype))].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={pickupAfter}
          onChange={(e) => setPickupAfter(e.target.value)}
          style={{ padding: "5px" }}
        />

        <input
          type="datetime-local"
          value={deliveryBefore}
          onChange={(e) => setDeliveryBefore(e.target.value)}
          style={{ padding: "5px" }}
        />

        <button
  onClick={resetFilters}
  style={{
    padding: "5px 10px",
    backgroundColor: "#ddd",
    border: "1px solid #aaa",
    borderRadius: "4px",
    cursor: "pointer"
  }}
>
  Reset Filters
</button>

      </div>

      <table
        border="1"
        cellPadding="5"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Date</th>
            <th style={{ minWidth: "130px", textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLoads.map((load) => (
            <tr
              key={load.loadassignmentId}
              onClick={() => openDetails(load)}
              style={{ cursor: "pointer" }}
            >
              <td>{load.loadassignmentId}</td>
              <td>{load.userId}</td>
              <td>{load.title}</td>
              <td>{load.description}</td>
              <td>{load.status}</td>
              <td>{new Date(load.timestamp).toLocaleString()}</td>
              <td style={{ minWidth: "130px", textAlign: "center" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(load.loadassignmentId);
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(load);
                  }}
                  style={{ marginLeft: "10px" }}
                >
                  Edit
                </button>
                <button
  onClick={(e) => {
    e.stopPropagation();
    setRatingTargetUserId(load.userId);
  }}
  style={{ marginLeft: "10px" }}
>
  Rate
</button>

<button
  onClick={(e) => {
    e.stopPropagation();
    setMessageTargetUserId(load.userId);
  }}
  style={{ marginLeft: "10px" }}
>
  Message
</button>


              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editLoad && (
        <EditLoadForm
          load={editLoad}
          onCancel={cancelEditing}
          onUpdate={updateLoadInList}
        />
      )}

      {selectedLoad && (
        <LoadDetails load={selectedLoad} onClose={closeDetails} />
      )}
      {ratingTargetUserId && (
  <RatingModal
    userId={ratingTargetUserId}
    authorId={1} // TODO: replace with logged-in user ID when login system is active
    onClose={() => setRatingTargetUserId(null)}
  />
)}

{messageTargetUserId && (
  <MessageModal
    senderId={1} // TODO: zameniti kad se login implementira
    recipientId={messageTargetUserId}
    onClose={() => setMessageTargetUserId(null)}
  />
)}


    </div>
    </div>
  );
}

export default LoadBoard;



