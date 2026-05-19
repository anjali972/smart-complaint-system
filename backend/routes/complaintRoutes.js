const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
} = require("../controllers/complaintController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Validation rules for adding a complaint
const complaintValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("category").notEmpty().withMessage("Category is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
];

// GET /api/complaints/search?location=Ghaziabad  (must be before /:id)
router.get("/search", protect, searchByLocation);

// POST /api/complaints
router.post("/", protect, complaintValidation, addComplaint);

// GET /api/complaints
router.get("/", protect, getAllComplaints);

// GET /api/complaints/:id
router.get("/:id", protect, getComplaintById);

// PUT /api/complaints/:id
router.put("/:id", protect, updateComplaintStatus);

// DELETE /api/complaints/:id
router.delete("/:id", protect, adminOnly, deleteComplaint);

module.exports = router;
