import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addComplaint } from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Water Supply",
  "Electricity",
  "Roads & Infrastructure",
  "Sanitation",
  "Public Safety",
  "Healthcare",
  "Education",
  "Other",
];

const INITIAL = {
  name: "", email: "", title: "", description: "",
  category: "", location: "",
};

export default function RegisterComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = "Valid email required";
    if (form.title.trim().length < 5) e.title = "Title must be at least 5 characters";
    if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    if (!form.category) e.category = "Please select a category";
    if (!form.location.trim()) e.location = "Location is required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setLoading(true);
    try {
      const { data } = await addComplaint(form);
      toast.success("Complaint registered successfully!");
      navigate(`/complaints/${data.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to register complaint";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-title">📝 File a Complaint</div>
        <div className="page-desc">Fill in the details below to register your complaint</div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" className={`form-control ${errors.name ? "error" : ""}`} placeholder="Rahul Kumar" value={form.name} onChange={handleChange} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input name="email" type="email" className={`form-control ${errors.email ? "error" : ""}`} placeholder="rahul@example.com" value={form.email} onChange={handleChange} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Complaint Title *</label>
            <input name="title" className={`form-control ${errors.title ? "error" : ""}`} placeholder="e.g. Water pipeline burst near main market" value={form.title} onChange={handleChange} />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className={`form-control ${errors.description ? "error" : ""}`} placeholder="Describe the issue in detail..." value={form.description} onChange={handleChange} rows={4} />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className={`form-control ${errors.category ? "error" : ""}`} value={form.category} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input name="location" className={`form-control ${errors.location ? "error" : ""}`} placeholder="e.g. Ghaziabad, Sector 5" value={form.location} onChange={handleChange} />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/complaints")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
