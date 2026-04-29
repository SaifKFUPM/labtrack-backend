const asyncHandler = require("../utils/asyncHandler");
const Submission = require("../models/Submission");
const Lab = require("../models/Lab");

// GET /api/instructor/labs/:labId/submissions
const listSubmissions = asyncHandler(async (req, res) => {
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

  const subs = await Submission.find({ labId })
    .populate("studentId", "fullName email")
    .sort({ submittedAt: -1 });
  res.json({ success: true, data: subs });
});

// PATCH /api/instructor/submissions/:subId/grade
const gradeSubmission = asyncHandler(async (req, res) => {
  const { subId } = req.params;
  const { score, rubric, inlineComments, overallFeedback, status } = req.body;

  const sub = await Submission.findById(subId).populate("labId");
  if (!sub) {
    res.status(404);
    throw new Error("Submission not found");
  }
  // only instructor who created the lab can grade
  if (sub.labId.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to grade this submission");
  }

  if (score != null) sub.score = score;
  if (rubric) sub.rubric = rubric;
  if (overallFeedback) sub.overallFeedback = overallFeedback;
  if (status) sub.status = status;
  sub.gradedBy = req.user._id;
  await sub.save();

  // TODO: trigger email notification to student

  res.json({ success: true, data: sub });
});

// POST /api/instructor/submissions/bulk-grade
const bulkGrade = asyncHandler(async (req, res) => {
  const { updates } = req.body; // [{ subId, score, feedback }]
  if (!Array.isArray(updates)) {
    res.status(400);
    throw new Error("Invalid payload");
  }

  const results = [];
  for (const u of updates) {
    const sub = await Submission.findById(u.subId).populate("labId");
    if (!sub) continue;
    if (sub.labId.createdBy.toString() !== req.user._id.toString()) continue;
    if (u.score != null) sub.score = u.score;
    if (u.feedback) sub.overallFeedback = u.feedback;
    sub.status = "graded";
    sub.gradedBy = req.user._id;
    await sub.save();
    results.push({ subId: sub._id, status: "graded" });
  }

  res.json({ success: true, data: results });
});

module.exports = { listSubmissions, gradeSubmission, bulkGrade };
