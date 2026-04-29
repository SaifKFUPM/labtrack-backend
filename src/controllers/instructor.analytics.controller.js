const asyncHandler = require("../utils/asyncHandler");
const Lab = require("../models/Lab");
const Submission = require("../models/Submission");

// GET /api/instructor/labs/:labId/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await Lab.findById(labId);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  if (lab.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const subs = await Submission.find({ labId });
  const stats = {
    totalSubmissions: subs.length,
    averageScore: subs.length
      ? subs.reduce((s, x) => s + (x.score || 0), 0) / subs.length
      : 0,
    distribution: {},
    timeline: [],
    topSubmitters: [],
  };

  res.json({ success: true, data: stats });
});

module.exports = { getAnalytics };
