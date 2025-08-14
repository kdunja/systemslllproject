import React, { useEffect, useState } from "react";
import AddLoadForm from "./AddLoadForm";
import EditLoadForm from "./EditLoadForm";
import LoadDetails from "./LoadDetails";
import axios from "./axios";
import RatingModal from "./RatingModal";
import MessageModal from "./MessageModal";
import Header from "./Header";

function LoadBoard() {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const [loads, setLoads] = useState([]);
  const [cargoData, setCargoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [pickupAfter, setPickupAfter] = useState("");
  const [deliveryBefore, setDeliveryBefore] = useState("");
  const [editLoad, setEditLoad] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [ratingTargetUserId, setRatingTargetUserId] = useState(null);
  const [messageTargetUserId, setMessageTargetUserId] = useState(null);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSelectedCity("");
    setSelectedType("");
    setPickupAfter("");
    setDeliveryBefore("");
  };

  const startEditing = (load) => setEditLoad(load);
  const cancelEditing = () => setEditLoad(null);

  const updateLoadInList = (updatedLoad) => {
    setLoads((prev) =>
      prev.map((l) =>
        l.loadassignmentId === updatedLoad.loadassignmentId ? updatedLoad : l
      )
    );
    setEditLoad(null);
  };

  const openDetails = (load) => setSelectedLoad(load);
  const closeDetails = () => setSelectedLoad(null);

  const handleEditFromDetails = (load) => {
    setSelectedLoad(null);
    setEditLoad(load);
  };

  useEffect(() => {
    fetchLoads();
    fetchCargo();
  }, []);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/loads", {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });
      setLoads(Array.isArray(res.data.data) ? res.data.data : []); // <- ispravljeno
    } catch (e) {
      console.error("GET /loads failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCargo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/cargo/all", {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });
      setCargoData(Array.isArray(res.data.data) ? res.data.data : []); // <- ispravljeno
    } catch (e) {
      console.error("GET /cargo/all failed:", e);
    }
  };

  const handleLoadAdded = async () => {
    await fetchLoads();
    await fetchCargo();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this load?")) return;
    try {
      await axios.delete(`/loads/${id}`);
      setLoads((prev) => prev.filter((l) => l.loadassignmentId !== id));
      setCargoData((prev) => prev.filter((c) => c.loadassignmentId !== id));
    } catch {
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
      ? relatedCargo.some(
          (c) => new Date(c.delieverytime) <= new Date(deliveryBefore)
        )
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

  if (loading) return <p>Loading loads...</p>;

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Header />
      <div style={{ padding: "20px" }}>
        <AddLoadForm onLoadAdded={handleLoadAdded} />
        <table
          border="1"
          cellPadding="5"
          style={{ width: "85%", borderCollapse: "collapse" }}
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
                    className="action-button delete"
                  >
                    Delete
                  </button>
                  {loggedInUser && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRatingTargetUserId(load.userId);
                      }}
                      className="action-button"
                    >
                      Rate
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMessageTargetUserId(load.userId);
                    }}
                    className="action-button"
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
          <LoadDetails
            load={selectedLoad}
            onClose={closeDetails}
            onEdit={handleEditFromDetails}
          />
        )}
        {ratingTargetUserId && (
          <RatingModal
            userId={ratingTargetUserId}
            authorId={loggedInUser?.userId}
            onClose={() => setRatingTargetUserId(null)}
          />
        )}
        {messageTargetUserId && (
          <MessageModal
            senderId={loggedInUser?.userId || 1}
            recipientId={messageTargetUserId}
            onClose={() => setMessageTargetUserId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default LoadBoard;
