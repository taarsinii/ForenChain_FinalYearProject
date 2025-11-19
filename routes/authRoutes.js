const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");

// Admin creates users
router.post("/register", registerUser);

// Login (all roles)
router.post("/login", loginUser);

module.exports = router;
