const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Water Supply",
        "Electricity",
        "Roads & Infrastructure",
        "Sanitation",
        "Public Safety",
        "Healthcare",
        "Education",
        "Other",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // AI-generated fields
    aiPriority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: null,
    },
    aiDepartment: {
      type: String,
      default: null,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    aiResponse: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for location-based search
ComplaintSchema.index({ location: "text", title: "text" });

module.exports = mongoose.model("Complaint", ComplaintSchema);
