const express = require("express");
const router = express.Router();

const supervisorController = require("../controllers/supervisorController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(isLoggedIn);
router.use(roleMiddleware("supervisor"));

// Dashboard
router.get("/dashboard", supervisorController.dashboard);
// Pending evidence
router.get("/pending", supervisorController.listPendingEvidence);
// Review evidence
router.get("/review/:id", supervisorController.reviewEvidence);
// Approve evidence (with notes)
router.post("/approve/:id", supervisorController.approveEvidence);
// Reject evidence (with reason)
router.post("/reject/:id", supervisorController.rejectEvidence);

module.exports = router;
