import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CareerForm from "../pages/CareerForm";
import ProfilePage from "../pages/ProfilePage"; // ✅ make sure this file exists

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<CareerForm />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/career" element={<CareerForm />} />

      {/* Private route for Profile */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage /> {/* ✅ use ProfilePage, not Profile */}
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
