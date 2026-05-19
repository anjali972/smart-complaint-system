const { validationResult } = require("express-validator");
const Complaint = require("../models/Complaint");

// @desc    Add a new complaint
// @route   POST /api/complaints
// @access  Public
const addComplaint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, title, description, category, location } = req.body;

    const complaint = await Complaint.create({
      name,
      email,
      title,
      description,
      category,
      location,
      userId: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (with optional filters)
// @route   GET /api/complaints
// @access  Private
const getAllComplaints = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    // Regular users see only their complaints; admins see all
    if (req.user && req.user.role !== "admin") {
      filter.userId = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, aiPriority, aiDepartment, aiSummary, aiResponse } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (status) complaint.status = status;
    if (aiPriority) complaint.aiPriority = aiPriority;
    if (aiDepartment) complaint.aiDepartment = aiDepartment;
    if (aiSummary) complaint.aiSummary = aiSummary;
    if (aiResponse) complaint.aiResponse = aiResponse;

    const updated = await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }
    res.status(200).json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Search complaints by location
// @route   GET /api/complaints/search?location=Ghaziabad
// @access  Private
const searchByLocation = async (req, res, next) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ success: false, message: "Location query parameter is required" });
    }

    const filter = {
      location: { $regex: location, $options: "i" },
    };

    if (req.user && req.user.role !== "admin") {
      filter.userId = req.user._id;
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
};
