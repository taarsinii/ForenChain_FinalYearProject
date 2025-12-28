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

// Show report form
router.get("/report/:id", analystController.showReportForm);

// Handle report upload
const multer = require("multer");
const upload = multer({ dest: "uploads/reports/" });

router.post("/report/:id", upload.single("report"), analystController.uploadReport);

// Uploaded forensic reports
router.get("/reports", analystController.viewReports);

// Ready for Prosecutor
router.get("/ready", analystController.readyForProsecutor);

// Transfer to Prosecutor
router.post("/transfer/:id", analystController.transferToProsecutor);


module.exports = router;
