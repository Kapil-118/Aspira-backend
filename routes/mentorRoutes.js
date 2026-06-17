const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createMentor,
  getAllMentors,
  searchMentors
} = require("../controllers/mentorController");

// Create mentor (Protected Route)
router.post("/create", authMiddleware, createMentor);

// Get all mentors
router.get("/all", getAllMentors);

// Search mentors
router.get("/search", searchMentors);

module.exports = router;