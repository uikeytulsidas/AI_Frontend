import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProfilePage() {
  const { user, setUser, setTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
    setUser(null);
    setTokens(null);
    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-4"
        style={{
          width: "400px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        }}
      >
        {/* Profile Avatar */}
        <div className="text-center">
          <div
            className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
            style={{ width: "80px", height: "80px", margin: "0 auto", fontSize: "32px" }}
          >
            {user ? user[0].toUpperCase() : "?"}
          </div>
          <h4 className="mt-3">{user || "Guest"}</h4>
          <p className="text-muted">Welcome to your profile</p>
        </div>

        {/* Profile Info */}
        <div className="mt-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-bold">Username:</span>
            <span>{user || "N/A"}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-bold">Email:</span>
            <span>{user ? `${user}@example.com` : "N/A"}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn btn-danger w-100 mt-4"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
