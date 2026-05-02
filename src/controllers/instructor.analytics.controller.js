const asyncHandler = require("../utils/asyncHandler");
const Lab = require("../models/Lab");
const Course = require("../models/Course");
const Submission = require("../models/Submission");

const SCORE_BUCKETS = [
  { label: "0-20", min: 0, max: 20 },
  { label: "21-40", min: 21, max: 40 },
  { label: "41-60", min: 41, max: 60 },
  { label: "61-80", min: 61, max: 80 },
  { label: "81-100", min: 81, max: 100 },
];

const round = (value) => Math.round(value);

const percent = (numerator, denominator) => (
  denominator > 0 ? round((numerator / denominator) * 100) : 0
);

const toId = (value) => {
  if (!value) return "";
  if (value._id) return value._id.toString();
  return value.toString();
};

const getEnrolledStudentIds = (course, instructorId) => {
  if (!course) return [];
  const instructorSections = (course.sections || []).filter(
    (section) => toId(section.instructor) === toId(instructorId),
  );
  const sections = instructorSections.length > 0 ? instructorSections : course.sections || [];
  const ids = new Set();

  sections.forEach((section) => {
    (section.students || []).forEach((studentId) => {
      const id = toId(studentId);
      if (id) ids.add(id);
    });
  });

  return Array.from(ids);
};

const isLateSubmission = (submission, lab) => (
  Boolean(submission.late) ||
  Boolean(submission.submittedAt && lab.dueDate && new Date(submission.submittedAt) > new Date(lab.dueDate))
);

const scorePercent = (submission, maxScore) => {
  if (submission.score === null || submission.score === undefined) return null;
  return maxScore > 0 ? (Number(submission.score) / maxScore) * 100 : 0;
};

const buildDistribution = (submissions, maxScore) => {
  const buckets = SCORE_BUCKETS.map((bucket) => ({ label: bucket.label, count: 0 }));

  submissions.forEach((submission) => {
    const pct = scorePercent(submission, maxScore);
    if (pct === null || !Number.isFinite(pct)) return;
    const clamped = Math.max(0, Math.min(100, pct));
    const bucketIndex = SCORE_BUCKETS.findIndex((bucket) => clamped >= bucket.min && clamped <= bucket.max);
    buckets[bucketIndex === -1 ? buckets.length - 1 : bucketIndex].count += 1;
  });

  return buckets;
};

const buildTimeline = (submissions) => {
  const counts = new Map();
  submissions.forEach((submission) => {
    if (!submission.submittedAt) return;
    const label = new Date(submission.submittedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
};

const buildTopSubmitters = (submissions) => (
  submissions
    .filter((submission) => submission.studentId)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 6)
    .map((submission) => {
      const student = submission.studentId && typeof submission.studentId === "object"
        ? submission.studentId
        : null;
      return {
        id: student?._id || submission.studentId,
        studentId: student?._id || submission.studentId,
        studentName: student?.fullName || "Student",
        studentEmail: student?.email || "",
        score: submission.score ?? null,
        submittedAt: submission.submittedAt,
      };
    })
);

const buildTestCaseAnalytics = (lab, submissions) => (
  (lab.testCases || []).map((testCase, index) => {
    const testCaseId = toId(testCase._id);
    let total = 0;
    let passed = 0;

    submissions.forEach((submission) => {
      const result = (submission.testResults || []).find((item, itemIndex) => (
        toId(item.testCaseId) === testCaseId ||
        item.name === testCase.name ||
        item.description === testCase.description ||
        itemIndex === index
      ));
      if (!result) return;
      total += 1;
      if (result.passed || result.status === "pass") passed += 1;
    });

    return {
      id: testCase._id,
      testCaseId: testCase._id,
      name: testCase.name || testCase.description || `Test ${index + 1}`,
      description: testCase.description || testCase.name || `Test ${index + 1}`,
      passed,
      total,
      passRate: percent(passed, total),
    };
  })
);

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

  const [course, subs] = await Promise.all([
    Course.findById(lab.courseId).select("sections"),
    Submission.find({ labId })
      .populate("studentId", "fullName email studentId")
      .sort({ submittedAt: -1 }),
  ]);
  const enrolledStudentIds = getEnrolledStudentIds(course, req.user._id);
  const submissions = subs.filter((submission) => ["submitted", "graded"].includes(submission.status));
  const graded = submissions.filter((submission) => submission.status === "graded");
  const scored = submissions.filter((submission) => submission.score !== null && submission.score !== undefined);
  const late = submissions.filter((submission) => isLateSubmission(submission, lab)).length;
  const maxScore = lab.points || 100;
  const averageScore = scored.length
    ? round(scored.reduce((sum, submission) => sum + (submission.score || 0), 0) / scored.length)
    : null;
  const testTotals = submissions.reduce((acc, submission) => {
    (submission.testResults || []).forEach((result) => {
      acc.total += 1;
      if (result.passed || result.status === "pass") acc.passed += 1;
    });
    return acc;
  }, { passed: 0, total: 0 });

  const stats = {
    totalStudents: enrolledStudentIds.length,
    submitted: submissions.length,
    submissions: submissions.length,
    submittedCount: submissions.length,
    graded: graded.length,
    gradedCount: graded.length,
    late,
    lateCount: late,
    maxScore,
    averageScore,
    avgScore: averageScore,
    submissionRate: percent(submissions.length, enrolledStudentIds.length),
    completionRate: percent(graded.length, submissions.length),
    onTimeRate: percent(Math.max(submissions.length - late, 0), submissions.length),
    passRate: percent(testTotals.passed, testTotals.total),
  };

  res.json({
    success: true,
    data: {
      stats,
      distribution: buildDistribution(scored, maxScore),
      timeline: buildTimeline(submissions),
      topSubmitters: buildTopSubmitters(scored),
      testCases: buildTestCaseAnalytics(lab, submissions),
      generatedAt: new Date(),
    },
  });
});

module.exports = { getAnalytics };
