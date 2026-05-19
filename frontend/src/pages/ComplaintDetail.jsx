import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getComplaintById, updateComplaintStatus, analyzeComplaint } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];

const STATUS_BADGE = {
  Pending: "badge-pending",
  "In Progress": "badge-progress",
  Resolved: "badge-resolved",
  Rejected: "badge-rejected",
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchComplaint = async () => {
    try {
      const { data } = await getComplaintById(id);
      setComplaint(data.data);
      setSelectedStatus(data.data.status);
    } catch {
      toast.error("Failed to load complaint");
      navigate("/complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const { data } = await updateComplaintStatus(id, { status: selectedStatus });
      setComplaint(data.data);
      toast.success("Status updated successfully");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    try {
      const { data } = await analyzeComplaint(id);
      // Refresh complaint to get updated AI fields
      const { data: refreshed } = await getComplaintById(id);
      setComplaint(refreshed.data);
      toast.success("🤖 AI analysis complete!");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!complaint) return null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-header flex-between">
        <Link to="/complaints" className="btn btn-secondary btn-sm">← Back</Link>
        <span className={`badge ${STATUS_BADGE[complaint.status]}`} style={{ fontSize: "0.9rem", padding: "6px 14px" }}>
          {complaint.status}
        </span>
      </div>

      {/* Main Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div className="card-title">{complaint.title}</div>
          <div className="card-subtitle" style={{ marginTop: "8px" }}>
            Filed by <strong>{complaint.name}</strong> ({complaint.email}) · {complaint.location}
          </div>
          <div style={{ marginTop: "6px", color: "#64748b", fontSize: "0.8rem" }}>
            Submitted: {new Date(complaint.createdAt).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Category</div>
            <div>{complaint.category}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Location</div>
            <div>{complaint.location}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#64748b", marginBottom: "6px" }}>Description</div>
          <p style={{ color: "#334155", lineHeight: 1.7, background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            {complaint.description}
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header flex-between">
          <div>
            <div className="card-title">🤖 AI Analysis</div>
            <div className="card-subtitle">Powered by OpenRouter AI</div>
          </div>
          <button className="btn btn-primary" onClick={handleAIAnalyze} disabled={aiLoading}>
            {aiLoading ? "Analyzing..." : complaint.aiPriority ? "Re-Analyze" : "Run AI Analysis"}
          </button>
        </div>

        {complaint.aiPriority ? (
          <div className="ai-result">
            <div className="ai-result-title">✅ Analysis Results</div>
            <div className="grid-2">
              <div className="ai-field">
                <div className="ai-field-label">Priority Level</div>
                <span className={`badge badge-${complaint.aiPriority.toLowerCase()}`} style={{ fontSize: "0.85rem" }}>
                  {complaint.aiPriority}
                </span>
              </div>
              <div className="ai-field">
                <div className="ai-field-label">Responsible Department</div>
                <div className="ai-field-value" style={{ fontWeight: 500 }}>{complaint.aiDepartment}</div>
              </div>
            </div>
            <div className="ai-field">
              <div className="ai-field-label">AI Summary</div>
              <div className="ai-field-value">{complaint.aiSummary}</div>
            </div>
            <div className="ai-field">
              <div className="ai-field-label">Auto-Generated Response to User</div>
              <div className="ai-field-value" style={{ background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #bfdbfe", fontStyle: "italic" }}>
                "{complaint.aiResponse}"
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "24px" }}>
            <div className="empty-icon">🤖</div>
            <p>Click "Run AI Analysis" to detect priority, suggest department, and generate a response.</p>
          </div>
        )}
      </div>

      {/* Status Update (Admin) */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: "16px" }}>🔄 Update Status</div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="form-control"
            style={{ width: "auto" }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={user?.role !== "admin"}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {user?.role === "admin" && (
            <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={updating || selectedStatus === complaint.status}>
              {updating ? "Updating..." : "Update Status"}
            </button>
          )}
          {user?.role !== "admin" && (
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Only admins can update status</span>
          )}
        </div>
      </div>
    </div>
  );
}
