const { runTests } = require('../services/testRunner.service');
const Course = require('../models/Course');
const Lab = require('../models/Lab');
const Submission = require('../models/Submission');
const Version = require('../models/Version');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/student/courses
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({
    'sections.students': req.user._id,
    active: true,
  }).populate('sections.instructor', 'name email');

  res.json({ success: true, data: courses });
});

// GET /api/student/courses/:courseId/labs
const getLabs = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    'sections.students': req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or you are not enrolled');
  }

  const labs = await Lab.find({
    courseId: req.params.courseId,
    status: 'active',
  }).sort({ dueDate: 1 });

  // attach each lab's submission status for this student
  const labsWithStatus = await Promise.all(
    labs.map(async (lab) => {
      const submission = await Submission.findOne({
        studentId: req.user._id,
        labId: lab._id,
      });
      return {
        ...lab.toObject(),
        submissionStatus: submission ? submission.status : 'not started',
        totalScore: submission ? submission.totalScore : null,
      };
    })
  );

  res.json({ success: true, data: labsWithStatus });
});

// GET /api/student/labs/:labId
const getLabById = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.labId).populate('courseId', 'code name');

  if (!lab || lab.status !== 'active') {
    res.status(404);
    throw new Error('Lab not found');
  }

  res.json({ success: true, data: lab });
});

// POST /api/student/submit
const submitLab = asyncHandler(async (req, res) => {
  const { labId, code, language } = req.body;

  const lab = await Lab.findById(labId);
  if (!lab || lab.status !== 'active') {
    res.status(404);
    throw new Error('Lab not found');
  }

  const submission = await Submission.findOneAndUpdate(
    { studentId: req.user._id, labId },
    {
      code,
      language,
      status: 'submitted',
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // auto-run tests after submission
  const testResults = await runTests(submission._id);

  res.json({ success: true, data: { submission, testResults } });
});

// GET /api/student/grades
const getGrades = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    studentId: req.user._id,
    status: 'graded',
  }).populate('labId', 'title totalPoints dueDate');

  res.json({ success: true, data: submissions });
});

// POST /api/student/versions
const saveVersion = asyncHandler(async (req, res) => {
  const { submissionId, code, description } = req.body;

  const submission = await Submission.findOne({
    _id: submissionId,
    studentId: req.user._id,
  });

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  const lastVersion = await Version.findOne({ submissionId }).sort({ versionNumber: -1 });

  if (lastVersion && lastVersion.code === code) {
    res.status(400);
    throw new Error('No changes detected since last version');
  }

  const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  const version = await Version.create({ submissionId, code, description, versionNumber });

  res.status(201).json({ success: true, data: version });
});

// GET /api/student/versions/:labId
const getVersions = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    labId: req.params.labId,
    studentId: req.user._id,
  });

  if (!submission) {
    res.status(404);
    throw new Error('No submission found for this lab');
  }

  const versions = await Version.find({ submissionId: submission._id }).sort({ versionNumber: -1 });

  res.json({ success: true, data: versions });
});

module.exports = { getCourses, getLabs, getLabById, submitLab, getGrades, saveVersion, getVersions };
