const asyncHandler = require("../utils/asyncHandler");
const PeerReview = require("../models/PeerReview");
const Lab = require("../models/Lab");

// GET /api/peer-reviews
const listPeerReviews = asyncHandler(async (req, res) => {
  // return reviews assigned to current student
  const reviews = await PeerReview.find({ reviewerId: req.user._id }).sort({
    dueDate: 1,
  });
  res.json({ success: true, data: reviews });
});

// GET /api/peer-reviews/:reviewId
const getPeerReview = asyncHandler(async (req, res) => {
  const rev = await PeerReview.findById(req.params.reviewId);
  if (!rev) {
    res.status(404);
    throw new Error("Peer review not found");
  }
  res.json({ success: true, data: rev });
});

// POST /api/peer-reviews/:reviewId/submit
const submitPeerReview = asyncHandler(async (req, res) => {
  const {
    readability,
    efficiency,
    comments,
    strengths,
    improvements,
    overallComment,
    lineComments,
    submittedAt,
  } = req.body;
  const rev = await PeerReview.findById(req.params.reviewId);
  if (!rev) {
    res.status(404);
    throw new Error("Peer review not found");
  }
  if (rev.reviewerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to submit this review");
  }

  rev.readability = readability;
  rev.efficiency = efficiency;
  rev.comments = comments;
  rev.strengths = strengths;
  rev.improvements = improvements;
  rev.overallComment = overallComment;
  rev.lineComments = lineComments || [];
  rev.status = "submitted";
  rev.submittedAt = submittedAt || new Date();
  await rev.save();

  res.json({ success: true, data: rev });
});

// GET /api/peer-reviews/received/:labId
const getReceivedReviews = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const reviews = await PeerReview.find({ labId, authorId: req.user._id }).sort(
    { createdAt: -1 },
  );
  res.json({ success: true, data: reviews });
});

// POST /api/peer-reviews/share
const sharePeerReview = asyncHandler(async (req, res) => {
  const { labId, reviewerEmail, fileContents, files, dueDate } = req.body;
  if (!labId || !reviewerEmail || !fileContents) {
    res.status(400);
    throw new Error("labId, reviewerEmail and fileContents are required");
  }

  // Resolve reviewer by email - if not exists, in frontend they will invite; here we allow reviewerEmail string and leave reviewerId null
  const review = await PeerReview.create({
    labId,
    reviewerId: req.user._id,
    authorId: req.user._id,
    fileContents,
    files: files || [],
    shareLink: null,
    dueDate: dueDate || null,
  });

  res
    .status(201)
    .json({
      success: true,
      data: { id: review._id, shareLink: review.shareLink },
    });
});

module.exports = {
  listPeerReviews,
  getPeerReview,
  submitPeerReview,
  getReceivedReviews,
  sharePeerReview,
};
