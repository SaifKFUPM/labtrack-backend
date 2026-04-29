const asyncHandler = require("../utils/asyncHandler");
const Lab = require("../models/Lab");

// GET /api/instructor/labs
const getLabs = asyncHandler(async (req, res) => {
  const labs = await Lab.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, data: labs });
});

// POST /api/instructor/labs
const createLab = asyncHandler(async (req, res) => {
  const {
    title,
    labNumber,
    instructions,
    dueDate,
    points,
    difficulty,
    languages,
    testCases,
    solutions,
  } = req.body;
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
    status: req.body.status || "draft",
    createdBy: req.user._id,
    testCases: testCases || [],
    solutions: solutions || [],
  });

  res.status(201).json({ success: true, data: lab });
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

  const updates = req.body;
  Object.assign(lab, updates);
  await lab.save();

  res.json({ success: true, data: lab });
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

  await lab.remove();
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

  // Note: email notifications can be triggered here when email.service is implemented

  res.json({ success: true, data: lab });
});

module.exports = {
  getLabs,
  createLab,
  updateLab,
  deleteLab,
  publishLab,
};
