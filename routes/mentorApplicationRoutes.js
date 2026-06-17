const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  applyMentor,
  getApplications,
  approveMentor,
  rejectMentor,
} = require("../controllers/mentorApplicationController");

// Student Apply
router.post(
  "/apply",
  authMiddleware,
  applyMentor
);

// Admin View
router.get(
  "/all",
  authMiddleware,
  getApplications
);

// Approve
router.put(
  "/approve/:id",
  authMiddleware,
  approveMentor
);

// Reject
router.put(
  "/reject/:id",
  authMiddleware,
  rejectMentor
);

module.exports = router;