import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllComplaints } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  Pending: { badge: "badge-pending", emoji: "⏳" },
  "In Progress": { badge: "badge-progress", emoji: "🔧" },
  Resolved: { badge: "badge-resolved", emoji: "✅" },
  Rejected: { badge: "badge-rejected", emoji: "❌" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllComplaints({ limit: 100 })
      .then(({ data }) => setComplaints(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    progress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  const recent = complaints.slice(0, 5);

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <div className="page-title">Welcome, {user?.name} 👋</div>
          <div className="page-desc">Here's your complaint management overview</div>
        </div>
        <Link to="/register-complaint" className="btn btn-primary">
          + File Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: "28px" }}>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">📋 Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#f59e0b" }}>{stats.pending}</div>
          <div className="stat-label">⏳ Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#10b981" }}>{stats.resolved}</div>
          <div className="stat-label">✅ Resolved</div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <div className="card-title">Recent Complaints</div>
            <div className="card-subtitle">Your latest 5 submissions</div>
          </div>
          <Link to="/complaints" className="btn btn-secondary btn-sm">View All</Link>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No complaints yet. <Link to="/register-complaint">File your first complaint</Link></p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>AI Priority</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 500, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</td>
                    <td>{c.category}</td>
                    <td>{c.location}</td>
                    <td>
                      <span className={`badge ${STATUS_CONFIG[c.status]?.badge || "badge-pending"}`}>
                        {STATUS_CONFIG[c.status]?.emoji} {c.status}
                      </span>
                    </td>
                    <td>
                      {c.aiPriority ? (
                        <span className={`badge badge-${c.aiPriority.toLowerCase()}`}>{c.aiPriority}</span>
                      ) : <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Not analyzed</span>}
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <Link to={`/complaints/${c._id}`} className="btn btn-secondary btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
