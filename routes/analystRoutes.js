const express = require("express");
const router = express.Router();

const analystController = require("../controllers/analystController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect all analyst routes
router.use(isLoggedIn);
router.use(roleMiddleware("analyst"));

// Dashboard
router.get("/dashboard", analystController.dashboard);

// Incoming evidence
router.get("/incoming", analystController.listIncomingEvidence);

// Upload report page
router.get("/report/:id", analystController.viewUploadReport);

// Submit report
router.post("/report/:id", analystController.submitReport);

module.exports = router;
