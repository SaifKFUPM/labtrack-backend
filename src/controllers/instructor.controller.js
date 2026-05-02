const asyncHandler = require("../utils/asyncHandler");
const Lab = require("../models/Lab");
const Course = require("../models/Course");
const User = require("../models/User");
const Submission = require("../models/Submission");

const generateJoinCode = async () => {
  let code, exists;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = await Course.findOne({ joinCode: code });
  } while (exists);
  return code;
};

const getDefaultSolutionFileName = (language) => {
  const normalized = String(language || "").toLowerCase();
  if (normalized.includes("python")) return "main.py";
  if (normalized.includes("java") && !normalized.includes("script")) return "Main.java";
  if (normalized.includes("javascript")) return "main.js";
  if (normalized.includes("c++") || normalized.includes("cpp")) return "main.cpp";
  if (normalized === "c") return "main.c";
  if (normalized.includes("go")) return "main.go";
  if (normalized.includes("rust")) return "main.rs";
  return "solution.txt";
};

const getFirstFileContent = (files) => {
  if (!files || Array.isArray(files) || typeof files !== "object") return "";
  return Object.values(files).find((content) => typeof content === "string" && content.trim()) || "";
};

const normalizeTestCases = (testCases = []) =>
  testCases.map((testCase, index) => {
    const type = testCase.type || testCase.visibility;
    return {
      name: testCase.name || `Test Case ${index + 1}`,
      description: testCase.description || testCase.name || `Test Case ${index + 1}`,
      input: testCase.input ?? testCase.expectedInput ?? "",
      expectedOutput: testCase.expectedOutput ?? "",
      points: Number.parseInt(testCase.points, 10) || 1,
      visible: testCase.visible ?? type !== "hidden",
      timeoutSeconds: Number.parseInt(testCase.timeoutSeconds ?? testCase.timeout, 10) || 5,
      order: Number.isInteger(Number(testCase.order)) ? Number(testCase.order) : index + 1,
      verified: Boolean(testCase.verified),
    };
  });

const normalizeLabFiles = (files = []) =>
  files
    .map((file) => {
      if (typeof file === "string") {
        return { name: file.trim(), size: 0, fileType: "", content: "" };
      }

      const name = file?.name || file?.fileName || file?.filename;
      return {
        name: String(name || "").trim(),
        size: Number.parseInt(file?.size, 10) || 0,
        fileType: file?.fileType || file?.type || "",
        content: typeof file?.content === "string" ? file.content : "",
      };
    })
    .filter((file) => file.name);

const getLabFileNames = (body) => {
  const explicitFiles = Array.isArray(body.files) ? body.files : [];
  const starterFiles = Array.isArray(body.starterFiles) ? body.starterFiles : [];
  const supportingFiles = Array.isArray(body.supportingFiles) ? body.supportingFiles : [];
  const names = [...explicitFiles, ...starterFiles, ...supportingFiles]
    .map((file) => (typeof file === "string" ? file : file?.name || file?.fileName || file?.filename))
    .map((name) => String(name || "").trim())
    .filter(Boolean);

  return [...new Set(names)];
};

const normalizeSolutions = (solutions = []) =>
  solutions.map((solution, index) => {
    const files =
      solution.files && !Array.isArray(solution.files) && typeof solution.files === "object"
        ? solution.files
        : solution.code
          ? { [getDefaultSolutionFileName(solution.language)]: solution.code }
          : {};
    const code = solution.code ?? getFirstFileContent(files);

    return {
      type: solution.type === "top_student" ? "top_student" : "instructor",
      title: solution.title?.trim() || `Solution ${index + 1}`,
      language: solution.language,
      code: code || "",
      files,
      explanation: solution.explanation || "",
      unlockedAt: solution.unlockedAt || solution.releaseDate || undefined,
      publishedAt: solution.publishedAt || undefined,
      releaseMode: solution.releaseMode || "after_graded",
      status: solution.status || (solution.publishedAt ? "published" : "scheduled"),
    };
  });

const buildLabUpdate = (body) => {
  const updates = { ...body };
  if (body.testCases !== undefined) updates.testCases = normalizeTestCases(body.testCases);
  if (body.solutions !== undefined) updates.solutions = normalizeSolutions(body.solutions);
  if (body.starterFiles !== undefined) updates.starterFiles = normalizeLabFiles(body.starterFiles);
  if (body.supportingFiles !== undefined) updates.supportingFiles = normalizeLabFiles(body.supportingFiles);
  if (
    body.files !== undefined ||
    body.starterFiles !== undefined ||
    body.supportingFiles !== undefined
  ) {
    updates.files = getLabFileNames(body);
  }
  return updates;
};

const emptySubmissionStats = {
  submissionCount: 0,
  submittedCount: 0,
  gradedCount: 0,
};

const getSubmissionStatsByLab = async (labIds) => {
  const ids = labIds.filter(Boolean);
  if (ids.length === 0) return new Map();

  const stats = await Submission.aggregate([
    { $match: { labId: { $in: ids } } },
    {
      $group: {
        _id: "$labId",
        submissionCount: { $sum: 1 },
        submittedCount: {
          $sum: {
            $cond: [{ $in: ["$status", ["submitted", "graded"]] }, 1, 0],
          },
        },
        gradedCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "graded"] }, 1, 0],
          },
        },
      },
    },
  ]);

  return new Map(stats.map((item) => [item._id.toString(), item]));
};

const formatLab = (lab, submissionStats = emptySubmissionStats) => {
  const obj = lab.toObject ? lab.toObject() : lab;
  const course = obj.courseId && typeof obj.courseId === "object" ? obj.courseId : null;
  const stats = submissionStats || emptySubmissionStats;
  return {
    ...obj,
    id: obj._id,
    courseId: course?._id || obj.courseId,
    courseCode: course?.code,
    courseName: course?.name,
    semester: course?.semester,
    submissionCount: stats.submissionCount || 0,
    submittedCount: stats.submittedCount || 0,
    gradedCount: stats.gradedCount || 0,
  };
};

const formatInstructorSettings = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  department: user.department,
  status: user.status,
  lastLogin: user.lastLogin,
});

const getInstructorSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("Instructor not found");
  }

  res.json({ success: true, data: formatInstructorSettings(user) });
});

const updateInstructorSettings = asyncHandler(async (req, res) => {
  const { fullName, department, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Instructor not found");
  }

  if (fullName !== undefined) {
    if (!String(fullName).trim()) {
      res.status(400);
      throw new Error("Full name cannot be empty");
    }
    user.fullName = String(fullName).trim();
  }

  if (department !== undefined) {
    user.department = String(department || "").trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      res.status(400);
      throw new Error("Current password is required");
    }
    if (!(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }
    user.password = newPassword;
  }

  await user.save();

  res.json({ success: true, data: formatInstructorSettings(user) });
});

const getInstructorStudents = asyncHandler(async (req, res) => {
  const courses = await Course.find({
    "sections.instructor": req.user._id,
    active: true,
  })
    .populate("sections.students", "fullName email studentId department status lastLogin")
    .sort({ code: 1 });

  const studentsById = new Map();
  for (const course of courses) {
    for (const section of course.sections || []) {
      if (String(section.instructor) !== String(req.user._id)) continue;

      for (const student of section.students || []) {
        if (!student || typeof student !== "object") continue;

        const studentKey = student._id.toString();
        if (!studentsById.has(studentKey)) {
          studentsById.set(studentKey, {
            id: student._id,
            fullName: student.fullName,
            email: student.email,
            studentId: student.studentId,
            department: student.department,
            status: student.status,
            lastLogin: student.lastLogin,
            enrollments: [],
          });
        }

        const entry = studentsById.get(studentKey);
        const enrollment = {
          courseId: course._id,
          courseCode: course.code,
          courseName: course.name,
          semester: course.semester,
          sectionNumber: section.sectionNumber,
        };
        const enrollmentKey = `${enrollment.courseId}-${enrollment.sectionNumber}`;
        const alreadyIncluded = entry.enrollments.some(
          (item) => `${item.courseId}-${item.sectionNumber}` === enrollmentKey,
        );
        if (!alreadyIncluded) entry.enrollments.push(enrollment);
      }
    }
  }

  const students = Array.from(studentsById.values())
    .map((student) => ({
      ...student,
      courseSections: student.enrollments.map((enrollment) => (
        [
          enrollment.courseCode,
          enrollment.sectionNumber ? `SEC ${enrollment.sectionNumber}` : null,
        ].filter(Boolean).join(" - ")
      )),
    }))
    .sort((a, b) => String(a.fullName || "").localeCompare(String(b.fullName || "")));

  res.json({ success: true, data: students });
});

// GET /api/instructor/courses
const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({
    "sections.instructor": req.user._id,
    active: true,
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: courses });
});

// POST /api/instructor/courses
const createCourse = asyncHandler(async (req, res) => {
  const { code, name, department, semester, creditHours, sectionNumber } = req.body;

  if (!code || !name || !department || !semester) {
    res.status(400);
    throw new Error("code, name, department, and semester are required");
  }

  const joinCode = await generateJoinCode();

  const course = await Course.create({
    code,
    name,
    department,
    semester,
    creditHours: creditHours || 3,
    joinCode,
    sections: [
      {
        sectionNumber: sectionNumber || "01",
        instructor: req.user._id,
        students: [],
      },
    ],
  });

  res.status(201).json({ success: true, data: course });
});

// GET /api/instructor/labs
const getLabs = asyncHandler(async (req, res) => {
  const query = { createdBy: req.user._id };
  if (req.query.status && req.query.status !== "all") {
    query.status = req.query.status;
  }

  const labs = await Lab.find(query)
    .populate("courseId", "code name semester")
    .sort({ createdAt: -1 });
  const statsByLab = await getSubmissionStatsByLab(labs.map((lab) => lab._id));
  res.json({
    success: true,
    data: labs.map((lab) => formatLab(lab, statsByLab.get(lab._id.toString()))),
  });
});

// GET /api/instructor/labs/:labId
const getLabById = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.labId).populate("courseId", "code name semester");
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  if (lab.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view this lab");
  }

  const statsByLab = await getSubmissionStatsByLab([lab._id]);
  res.json({ success: true, data: formatLab(lab, statsByLab.get(lab._id.toString())) });
});

// POST /api/instructor/labs
const createLab = asyncHandler(async (req, res) => {
  const { title, labNumber, instructions, dueDate, points, difficulty, languages } = req.body;
  if (!title || !labNumber || !instructions || !dueDate || !points) {
    res.status(400);
    throw new Error("Missing required lab fields");
  }

  const lab = await Lab.create({
    courseId: req.body.courseId,
    labNumber,
    title,
    instructions,
    dueDate,
    points,
    difficulty: difficulty || "medium",
    languages: languages || [],
    starterCode: req.body.starterCode || "",
    files: getLabFileNames(req.body),
    starterFiles: normalizeLabFiles(req.body.starterFiles || []),
    supportingFiles: normalizeLabFiles(req.body.supportingFiles || []),
    status: req.body.status || "draft",
    createdBy: req.user._id,
    testCases: normalizeTestCases(req.body.testCases || []),
    solutions: normalizeSolutions(req.body.solutions || []),
  });

  await lab.populate("courseId", "code name semester");
  res.status(201).json({ success: true, data: formatLab(lab) });
});

// PATCH /api/instructor/labs/:labId
const updateLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.labId);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  if (lab.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this lab");
  }

  const updates = buildLabUpdate(req.body);
  Object.assign(lab, updates);
  await lab.save();
  await lab.populate("courseId", "code name semester");

  const statsByLab = await getSubmissionStatsByLab([lab._id]);
  res.json({ success: true, data: formatLab(lab, statsByLab.get(lab._id.toString())) });
});

// DELETE /api/instructor/labs/:labId
const deleteLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.labId);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  if (lab.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this lab");
  }

  await lab.deleteOne();
  res.json({ success: true, message: "Lab deleted" });
});

// PATCH /api/instructor/labs/:labId/publish
const publishLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.labId);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  if (lab.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to publish this lab");
  }

  lab.status = req.body.status || "active";
  await lab.save();
  await lab.populate("courseId", "code name semester");

  // Note: email notifications can be triggered here when email.service is implemented

  const statsByLab = await getSubmissionStatsByLab([lab._id]);
  res.json({ success: true, data: formatLab(lab, statsByLab.get(lab._id.toString())) });
});

module.exports = {
  getInstructorSettings,
  updateInstructorSettings,
  getInstructorStudents,
  getLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
  publishLab,
  getInstructorCourses,
  createCourse,
};
