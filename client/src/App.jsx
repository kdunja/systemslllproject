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
        {/* Javni pristup */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Zaštićena ruta za sve prijavljene korisnike */}
        <Route
          path="/loads"
          element={
            <ProtectedRoute>
              <LoadBoard />
            </ProtectedRoute>
          }
        />

        {/* Samo admin korisnici mogu pristupiti */}
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
