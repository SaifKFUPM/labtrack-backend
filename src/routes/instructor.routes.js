const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  getLabs,
  createLab,
  updateLab,
  deleteLab,
  publishLab,
  getInstructorCourses,
  createCourse,
} = require("../controllers/instructor.controller");
const {
  listSubmissions,
  gradeSubmission,
  bulkGrade,
} = require("../controllers/instructor.submissions.controller");

router.use(authMiddleware);
router.use(checkRole("instructor"));

// Course management
router.get("/courses", getInstructorCourses);
router.post("/courses", createCourse);

router.get("/labs", getLabs);
router.post("/labs", createLab);
router.patch("/labs/:labId", updateLab);
router.delete("/labs/:labId", deleteLab);
router.patch("/labs/:labId/publish", publishLab);
router.get("/labs/:labId/submissions", listSubmissions);
router.patch("/submissions/:subId/grade", gradeSubmission);
router.post("/submissions/bulk-grade", bulkGrade);
const {
  checkPlagiarism,
  getPlagiarism,
  updatePlagiarism,
} = require("../controllers/instructor.plagiarism.controller");
const {
  getAnalytics,
} = require("../controllers/instructor.analytics.controller");
router.post("/labs/:labId/check-plagiarism", checkPlagiarism);
router.get("/labs/:labId/plagiarism", getPlagiarism);
router.patch("/labs/:labId/plagiarism/:pairKey", updatePlagiarism);
router.get("/labs/:labId/analytics", getAnalytics);

module.exports = router;
