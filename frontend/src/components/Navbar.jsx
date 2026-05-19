import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🏛️ Smart<span>Complaint</span>
      </Link>

      {user && (
        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/complaints" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Complaints
          </NavLink>
          <NavLink to="/register-complaint" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            + New
          </NavLink>
          <span style={{ color: "#64748b", fontSize: "0.85rem", padding: "0 8px" }}>
            {user.name} {user.role === "admin" && <span style={{ color: "#06b6d4" }}>(Admin)</span>}
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
