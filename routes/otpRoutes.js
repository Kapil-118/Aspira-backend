const express = require("express");

const router = express.Router();

const {
  sendRegisterOtp,
  sendForgotPasswordOtp,
  verifyOtp,
} = require("../controllers/otpController");

router.post(
  "/register-send",
  sendRegisterOtp
);

router.post(
  "/forgot-send",
  sendForgotPasswordOtp
);

router.post(
  "/verify",
  verifyOtp
);

module.exports = router;