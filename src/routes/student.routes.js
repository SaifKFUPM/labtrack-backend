const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const {
  getCourses,
  getLabs,
  getLabById,
  submitLabCode,
  getGrades,
  saveVersion,
  getVersions,
  getSubmissionDetails,
  joinCourse,
} = require("../controllers/student.controller");

router.use(authMiddleware);
router.use(checkRole("student"));

router.get("/courses", getCourses);
router.post("/courses/join", joinCourse);
router.get("/labs", getLabs);
router.get("/labs/:labId", getLabById);
router.post("/submissions/:labId", submitLabCode);
router.get("/submissions/:labId", getSubmissionDetails);
router.get("/grades", getGrades);
router.post("/labs/:labId/versions", saveVersion);
router.get("/labs/:labId/versions", getVersions);

module.exports = router;
