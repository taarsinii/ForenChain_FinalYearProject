const express = require("express");
const router = express.Router();
const analystController = require("../controllers/analystController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(isLoggedIn);
router.use(roleMiddleware("analyst"));

// Dashboard
router.get("/dashboard", analystController.dashboard);

// Incoming Evidence
router.get("/incoming", analystController.incomingEvidence);

// View evidence
router.get("/view/:id", analystController.viewEvidence);

// Download evidence file
router.get("/download/:id", analystController.downloadEvidence);

module.exports = router;
