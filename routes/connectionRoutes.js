const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  sendRequest,
  getMyRequests,
  getMyConnections,
  getMentorRequests,
  acceptRequest,
  rejectRequest,
} = require(
  "../controllers/connectionController"
);


// Student
router.post(
  "/send/:mentorId",
  authMiddleware,
  sendRequest
);

router.get(
  "/my-requests",
  authMiddleware,
  getMyRequests
);

router.get(
  "/my-connections",
  authMiddleware,
  getMyConnections
);


// Mentor
router.get(
  "/mentor-requests",
  authMiddleware,
  getMentorRequests
);

router.put(
  "/accept/:id",
  authMiddleware,
  acceptRequest
);

router.put(
  "/reject/:id",
  authMiddleware,
  rejectRequest
);

module.exports =
  router;