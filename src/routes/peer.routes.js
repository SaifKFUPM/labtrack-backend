const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  listPeerReviews,
  getPeerReview,
  submitPeerReview,
  getReceivedReviews,
  sharePeerReview,
} = require("../controllers/peerReview.controller");

router.use(authMiddleware);
router.use(checkRole("student"));

router.get("/", listPeerReviews);
router.get("/received/:labId", getReceivedReviews);
router.post("/share", sharePeerReview);
router.get("/:reviewId", getPeerReview);
router.post("/:reviewId/submit", submitPeerReview);

module.exports = router;
