import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoadBoard from "./LoadBoard";
import Login from "./Login";
import Register from "./Register";
import Unauthorized from "./Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import AdminPanel from "./AdminPanel";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/loadboard"
          element={
            <ProtectedRoute>
              <LoadBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
