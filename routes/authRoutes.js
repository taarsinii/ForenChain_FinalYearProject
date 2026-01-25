const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimit");

// Landing Page
router.get("/", authController.showHome);

// Login
router.get("/login", authController.showLogin);
router.post("/login", loginLimiter, authController.login);

// OTP
router.get("/otp", authController.showOtp);
router.post("/verify-otp", authController.verifyOtp);

// Logout
router.get("/logout", authController.logout);

module.exports = router;
