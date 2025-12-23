const express = require("express");
const router = express.Router();

const supervisorController = require("../controllers/supervisorController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect all supervisor routes
router.use(isLoggedIn);
router.use(roleMiddleware("supervisor"));

// Dashboard
router.get("/dashboard", supervisorController.dashboard);

// Evidence pending approval
router.get("/pending", supervisorController.listPendingEvidence);

// Review evidence
router.get("/review/:id", supervisorController.reviewEvidence);

// Approve evidence
router.post("/approve/:id", supervisorController.approveEvidence);

// Reject evidence
router.post("/reject/:id", supervisorController.rejectEvidence);

module.exports = router;
