const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  resetPassword,
  updateProfile,
  uploadProfilePhoto,
} = require("../controllers/authController");

const authMiddleware =
  require("../middleware/authMiddleware");

const upload =
  require("../middleware/upload");

// AUTH
router.post("/register", register);

router.post("/login", login);

// RESET PASSWORD
router.post(
  "/reset-password",
  resetPassword
);

// PROFILE
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// UPDATE PROFILE
router.put(
  "/update-profile",
  authMiddleware,
  updateProfile
);

// UPLOAD PROFILE PHOTO
router.put(
  "/upload-photo",
  authMiddleware,
  upload.single("profilePhoto"),
  uploadProfilePhoto
);

// TEST
router.get("/test", (req, res) => {
  res.json({
    message:
      "Auth Route Working",
  });
});

module.exports = router;