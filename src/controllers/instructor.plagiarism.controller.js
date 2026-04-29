const asyncHandler = require('../utils/asyncHandler');
const Submission = require('../models/Submission');
const Lab = require('../models/Lab');

// POST /api/instructor/labs/:labId/check-plagiarism
const checkPlagiarism = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await Lab.findById(labId);
  if (!lab) {
    res.status(404);
    throw new Error('Lab not found');
  }
  if (lab.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Simple stub: compare code strings pairwise and compute naive similarity
  const subs = await Submission.find({ labId });
  const pairs = [];
  for (let i = 0; i < subs.length; i++) {
    for (let j = i + 1; j < subs.length; j++) {
      const a = subs[i].code || '';
      const b = subs[j].code || '';
      const sim = a && b ? (a === b ? 100 : Math.round((a.split(' ').filter(w=>b.includes(w)).length / Math.max(a.split(' ').length,1))*100)) : 0;
      if (sim > 10) {
        pairs.push({ studentAId: subs[i].studentId, studentBId: subs[j].studentId, similarity: sim, flagged: sim > 70 });
      }
    }
  }

  res.json({ success: true, data: { pairs } });
});

// GET /api/instructor/labs/:labId/plagiarism
const getPlagiarism = asyncHandler(async (req, res) => {
  // For now return empty; in future store results
  res.json({ success: true, data: [] });
});

// PATCH /api/instructor/labs/:labId/plagiarism/:pairKey
const updatePlagiarism = asyncHandler(async (req, res) => {
  // stub: accept flagged boolean
  const { flagged } = req.body;
  res.json({ success: true, data: { flagged: !!flagged } });
});

module.exports = { checkPlagiarism, getPlagiarism, updatePlagiarism };
