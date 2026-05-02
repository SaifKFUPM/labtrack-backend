const asyncHandler = require("../utils/asyncHandler");
const Submission = require("../models/Submission");
const Lab = require("../models/Lab");

const formatTestResult = (result) => {
  const obj = result.toObject ? result.toObject() : result;
  return {
    ...obj,
    id: obj._id || obj.testCaseId,
    status: obj.passed ? "pass" : "fail",
    earned: obj.points || 0,
  };
};

const formatSubmission = (sub) => {
  const obj = sub.toObject ? sub.toObject() : sub;
  const student = obj.studentId && typeof obj.studentId === "object" ? obj.studentId : null;
  return {
    ...obj,
    id: obj._id,
    studentId: student?._id || obj.studentId,
    student: student
      ? {
          id: student._id,
          fullName: student.fullName,
          email: student.email,
        }
      : undefined,
    studentName: student?.fullName,
    studentEmail: student?.email,
    testResults: (obj.testResults || []).map(formatTestResult),
  };
};

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
  res.json({ success: true, data: subs.map(formatSubmission) });
});

// PATCH /api/instructor/submissions/:subId/grade
const gradeSubmission = asyncHandler(async (req, res) => {
  const { subId } = req.params;
  const { score, rubric, inlineComments, overallFeedback, instructorNote, status } = req.body;

  const sub = await Submission.findById(subId).populate("labId").populate("studentId", "fullName email");
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
  if (inlineComments !== undefined) sub.inlineComments = inlineComments;
  if (overallFeedback !== undefined) sub.overallFeedback = overallFeedback;
  if (instructorNote !== undefined) sub.instructorNote = instructorNote;
  if (status) sub.status = status;
  if (status === "graded" || score != null || rubric) {
    sub.status = status || "graded";
    sub.gradedBy = req.user._id;
    sub.gradedAt = new Date();
  }
  await sub.save();
  await sub.populate("studentId", "fullName email");

  // TODO: trigger email notification to student

  res.json({ success: true, data: formatSubmission(sub) });
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
