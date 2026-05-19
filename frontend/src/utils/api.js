import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    const { token } = JSON.parse(user);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/profile");

// ─── Complaints ───────────────────────────────────────────────────────────────
export const addComplaint = (data) => API.post("/complaints", data);
export const getAllComplaints = (params) => API.get("/complaints", { params });
export const getComplaintById = (id) => API.get(`/complaints/${id}`);
export const updateComplaintStatus = (id, data) => API.put(`/complaints/${id}`, data);
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const searchByLocation = (location) =>
  API.get("/complaints/search", { params: { location } });

// ─── AI ───────────────────────────────────────────────────────────────────────
export const analyzeComplaint = (complaintId) =>
  API.post("/ai/analyze", { complaintId });
export const getAnalysis = (id) => API.get(`/ai/analyze/${id}`);

export default API;
