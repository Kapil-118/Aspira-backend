const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createPost,
  getAllPosts,
  getMyPosts,
  updatePost,
  deletePost,
  filterPosts,
  resolvePost,
} = require("../controllers/lostFoundController");

// Create Lost/Found Post
router.post(
  "/create",
  authMiddleware,
  upload.single("image"),
  createPost
);

// Get All Posts
router.get("/all", getAllPosts);

// Get My Posts
router.get(
  "/my-posts",
  authMiddleware,
  getMyPosts
);

// Update Post
router.put(
  "/update/:id",
  authMiddleware,
  updatePost
);

// Delete Post
router.delete(
  "/delete/:id",
  authMiddleware,
  deletePost
);

// Filter Posts
router.get("/filter", filterPosts);

// Resolve Post
router.put(
  "/resolve/:id",
  authMiddleware,
  resolvePost
);

module.exports = router;