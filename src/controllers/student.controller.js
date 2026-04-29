const { runTests } = require("../services/testRunner.service");
const Course = require("../models/Course");
const Lab = require("../models/Lab");
const Submission = require("../models/Submission");
const Version = require("../models/Version");
const Progress = require("../models/Progress");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/student/courses?enrolled=true
const getCourses = asyncHandler(async (req, res) => {
  const enrolledOnly = req.query.enrolled === "true";
  const query = enrolledOnly
    ? { "sections.students": req.user._id, active: true }
    : { active: true };

  const courses = await Course.find(query).sort({ courseCode: 1 });

  res.json({ success: true, data: courses });
});

// GET /api/student/labs?status=active
const getLabs = asyncHandler(async (req, res) => {
  const status = req.query.status || "active";

  const enrolledCourses = await Course.find({
    "sections.students": req.user._id,
    active: true,
  }).select("_id");

  if (!enrolledCourses.length) {
    return res.json({ success: true, data: [] });
  }

  const courseIds = enrolledCourses.map((course) => course._id);

  const labs = await Lab.find({
    courseId: { $in: courseIds },
    status,
  }).sort({ dueDate: 1 });

  const labsWithStatus = await Promise.all(
    labs.map(async (lab) => {
      const submission = await Submission.findOne({
        studentId: req.user._id,
        labId: lab._id,
      });

      return {
        ...lab.toObject(),
        submissionStatus: submission ? submission.status : "not started",
        submittedAt: submission ? submission.submittedAt : null,
      };
    }),
  );

  res.json({ success: true, data: labsWithStatus });
});

// GET /api/student/labs/:labId
const getLabById = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.labId);

  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }

  const allowedCourse = await Course.findOne({
    _id: lab.courseId,
    "sections.students": req.user._id,
    active: true,
  });

  if (!allowedCourse) {
    res.status(403);
    throw new Error("You do not have access to this lab");
  }

  res.json({ success: true, data: lab });
});

// POST /api/student/submissions/:labId
const submitLabCode = asyncHandler(async (req, res) => {
  const { code, language } = req.body;
  const { labId } = req.params;

  if (!code || !language) {
    res.status(400);
    throw new Error("Code and language are required");
  }

  const lab = await Lab.findById(labId);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }

  const allowedCourse = await Course.findOne({
    _id: lab.courseId,
    "sections.students": req.user._id,
    active: true,
  });

  if (!allowedCourse) {
    res.status(403);
    throw new Error("You do not have access to this lab");
  }

  const submission = await Submission.findOneAndUpdate(
    { studentId: req.user._id, labId },
    {
      code,
      language,
      status: "submitted",
      submittedAt: new Date(),
    },
    { upsert: true, new: true },
  );

  const testResults = await runTests(submission._id);

  res.json({
    success: true,
    data: {
      id: submission._id,
      status: submission.status,
      testResults,
    },
  });
});

// GET /api/student/grades
const getGrades = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    studentId: req.user._id,
    status: "graded",
  })
    .populate("labId", "title points dueDate")
    .sort({ submittedAt: -1 });

  const formatted = submissions.map((sub) => ({
    id: sub._id,
    lab: sub.labId?.title || null,
    score: sub.score,
    testsPassed: (sub.testResults || []).filter((result) => result.passed)
      .length,
    testsTotal: (sub.testResults || []).length,
    grade: sub.rubric,
    feedback: sub.overallFeedback,
    status: sub.status,
    submittedAt: sub.submittedAt,
  }));

  res.json({ success: true, data: formatted });
});

// GET /api/student/submissions/:labId
const getSubmissionDetails = asyncHandler(async (req, res) => {
  const { labId } = req.params;

  const submission = await Submission.findOne({
    labId,
    studentId: req.user._id,
  }).populate("labId", "title points");

  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  res.json({ success: true, data: submission });
});

// GET /api/progress
const getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.find({ studentId: req.user._id }).sort({
    updatedAt: -1,
  });

  const mapped = progress.reduce((acc, p) => {
    acc[p.labId] = {
      status: p.status,
      submittedAt: p.submittedAt,
      score: p.score,
    };
    return acc;
  }, {});

  res.json({ success: true, data: mapped });
});

// PATCH /api/progress/:labId
const updateProgress = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const { status, code, submittedAt } = req.body;

  const allowedStatuses = ["not started", "in progress", "submitted", "graded"];
  if (status && !allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const prog = await Progress.findOneAndUpdate(
    { labId, studentId: req.user._id },
    {
      $set: {
        status: status || undefined,
        code: code || undefined,
        submittedAt: submittedAt || undefined,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.json({ success: true, data: prog });
});

// GET /api/student/labs/:labId/versions
const getVersions = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    labId: req.params.labId,
    studentId: req.user._id,
  });

  if (!submission) {
    return res.json({ success: true, data: [] });
  }

  const versions = await Version.find({ submissionId: submission._id })
    .sort({ versionNumber: -1 })
    .select("versionNumber code description createdAt");

  const formatted = versions.map((version) => ({
    version: version.versionNumber,
    code: version.code,
    timestamp: version.createdAt,
    description: version.description,
  }));

  res.json({ success: true, data: formatted });
});

// POST /api/student/labs/:labId/versions
const saveVersion = asyncHandler(async (req, res) => {
  const { code, description } = req.body;
  const { labId } = req.params;

  if (!code) {
    res.status(400);
    throw new Error("Code is required");
  }

  const submission = await Submission.findOne({
    labId,
    studentId: req.user._id,
  });

  if (!submission) {
    res.status(404);
    throw new Error("No submission found for this lab");
  }

  const lastVersion = await Version.findOne({
    submissionId: submission._id,
  }).sort({ versionNumber: -1 });

  if (lastVersion && lastVersion.code === code) {
    res.status(400);
    throw new Error("No changes detected since last version");
  }

  const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 1;

  const version = await Version.create({
    submissionId: submission._id,
    code,
    description: description || `Version ${nextVersion}`,
    versionNumber: nextVersion,
  });

  res.status(201).json({
    success: true,
    data: {
      version: version.versionNumber,
      code: version.code,
      timestamp: version.createdAt,
      description: version.description,
    },
  });
});

module.exports = {
  getCourses,
  getLabs,
  getLabById,
  submitLabCode,
  getGrades,
  getSubmissionDetails,
  getProgress,
  updateProgress,
  saveVersion,
  getVersions,
};
