import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllComplaints, searchByLocation, deleteComplaint } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const CATEGORIES = ["", "Water Supply", "Electricity", "Roads & Infrastructure", "Sanitation", "Public Safety", "Healthcare", "Education", "Other"];
const STATUSES = ["", "Pending", "In Progress", "Resolved", "Rejected"];

const STATUS_BADGE = {
  Pending: "badge-pending",
  "In Progress": "badge-progress",
  Resolved: "badge-resolved",
  Rejected: "badge-rejected",
};

export default function ComplaintList() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [locationSearch, setLocationSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10 };
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const { data } = await getAllComplaints(params);
      setComplaints(data.data || []);
      setPagination((p) => ({ ...p, ...data.pagination }));
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => { fetchComplaints(); }, [filters, pagination.page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!locationSearch.trim()) return fetchComplaints();
    setLoading(true);
    try {
      const { data } = await searchByLocation(locationSearch.trim());
      setComplaints(data.data || []);
      setPagination({ page: 1, pages: 1, total: data.count });
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await deleteComplaint(id);
      toast.success("Complaint deleted");
      fetchComplaints();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <div className="page-title">📋 All Complaints</div>
          <div className="page-desc">{pagination.total} complaint{pagination.total !== 1 ? "s" : ""} found</div>
        </div>
        <Link to="/register-complaint" className="btn btn-primary">+ New Complaint</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="form-label">Category</label>
            <select className="form-control" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
            </select>
          </div>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div>
              <label className="form-label">Search by Location</label>
              <input className="form-control" placeholder="e.g. Ghaziabad" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
            {locationSearch && (
              <button type="button" className="btn btn-secondary" onClick={() => { setLocationSearch(""); fetchComplaints(); }}>Clear</button>
            )}
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No complaints found matching your filters.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>AI Priority</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 500, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</td>
                    <td>{c.name}</td>
                    <td>{c.category}</td>
                    <td>{c.location}</td>
                    <td><span className={`badge ${STATUS_BADGE[c.status] || "badge-pending"}`}>{c.status}</span></td>
                    <td>
                      {c.aiPriority
                        ? <span className={`badge badge-${c.aiPriority.toLowerCase()}`}>{c.aiPriority}</span>
                        : <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>—</span>}
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.85rem" }}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link to={`/complaints/${c._id}`} className="btn btn-secondary btn-sm">View</Link>
                        {user?.role === "admin" && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Del</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
            <button className="btn btn-secondary btn-sm" disabled={pagination.page === 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>← Prev</button>
            <span style={{ padding: "6px 12px", fontSize: "0.9rem", color: "#64748b" }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button className="btn btn-secondary btn-sm" disabled={pagination.page === pagination.pages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
