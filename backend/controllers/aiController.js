const axios = require("axios");
const Complaint = require("../models/Complaint");

// OpenRouter API call helper
const callOpenRouter = async (prompt) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct:free", // Free model on OpenRouter
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for a government complaint management system. Always respond in valid JSON format only. No markdown, no explanation outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://smart-complaint-system.onrender.com",
        "X-Title": "Smart Complaint Management System",
      },
    }
  );

  const content = response.data.choices[0].message.content.trim();
  // Strip markdown code fences if present
  const clean = content.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

// @desc    Analyze a complaint using AI
// @route   POST /api/ai/analyze
// @access  Private
const analyzeComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId) {
      return res.status(400).json({ success: false, message: "complaintId is required" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const prompt = `
Analyze the following citizen complaint and respond ONLY with a JSON object having these exact keys:

{
  "priority": "Low" | "Medium" | "High" | "Critical",
  "department": "<name of the responsible government department>",
  "summary": "<2-3 sentence summary of the complaint>",
  "response": "<polite, professional auto-response message to the complainant>"
}

Complaint Details:
- Title: ${complaint.title}
- Category: ${complaint.category}
- Description: ${complaint.description}
- Location: ${complaint.location}

Determine priority based on urgency and public safety impact.
Suggest the most appropriate government department.
Write a concise summary.
Generate a professional response assuring the complainant their issue will be addressed.
`;

    let aiResult;
    try {
      aiResult = await callOpenRouter(prompt);
    } catch (aiError) {
      // Fallback if AI fails
      console.error("OpenRouter error:", aiError.message);
      aiResult = getFallbackAnalysis(complaint);
    }

    // Save AI results to DB
    complaint.aiPriority = aiResult.priority || "Medium";
    complaint.aiDepartment = aiResult.department || "General Administration";
    complaint.aiSummary = aiResult.summary || "Complaint received and under review.";
    complaint.aiResponse = aiResult.response || "Thank you for your complaint. We will look into it shortly.";
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "AI analysis completed",
      data: {
        complaintId: complaint._id,
        priority: complaint.aiPriority,
        department: complaint.aiDepartment,
        summary: complaint.aiSummary,
        response: complaint.aiResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Fallback rule-based analysis when AI is unavailable
const getFallbackAnalysis = (complaint) => {
  const categoryMap = {
    "Water Supply": {
      department: "Municipal Water Department",
      priority: "High",
    },
    Electricity: {
      department: "Electricity Distribution Board",
      priority: "High",
    },
    "Roads & Infrastructure": {
      department: "Public Works Department (PWD)",
      priority: "Medium",
    },
    Sanitation: {
      department: "Sanitation & Waste Management Department",
      priority: "Medium",
    },
    "Public Safety": {
      department: "Police & Law Enforcement",
      priority: "Critical",
    },
    Healthcare: {
      department: "Health Department",
      priority: "High",
    },
    Education: {
      department: "Education Department",
      priority: "Low",
    },
    Other: {
      department: "General Administration",
      priority: "Low",
    },
  };

  const mapped = categoryMap[complaint.category] || categoryMap["Other"];

  return {
    priority: mapped.priority,
    department: mapped.department,
    summary: `A ${complaint.category.toLowerCase()} complaint has been registered from ${complaint.location} regarding: ${complaint.title}.`,
    response: `Dear ${complaint.name}, thank you for registering your complaint titled "${complaint.title}". Your complaint has been forwarded to the ${mapped.department}. We assure you it will be addressed at the earliest. Your complaint ID is for tracking purposes.`,
  };
};

// @desc    Get AI analysis for a specific complaint
// @route   GET /api/ai/analyze/:id
// @access  Private
const getAnalysis = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (!complaint.aiPriority) {
      return res.status(200).json({
        success: false,
        message: "AI analysis not yet performed for this complaint",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        complaintId: complaint._id,
        priority: complaint.aiPriority,
        department: complaint.aiDepartment,
        summary: complaint.aiSummary,
        response: complaint.aiResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeComplaint, getAnalysis };
