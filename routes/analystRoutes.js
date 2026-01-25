const express = require("express");
const router = express.Router();
const analystController = require("../controllers/analystController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(isLoggedIn);
router.use(roleMiddleware("analyst"));

router.get("/dashboard", analystController.dashboard);
router.get("/incoming", analystController.incomingEvidence);
router.get("/view/:id", analystController.viewEvidence);
router.get("/download/:id", analystController.downloadEvidence);


// Analysis
router.get("/analysis/:id", analystController.showAnalysisForm);
router.post("/analysis/:id", analystController.saveAnalysis);

// Finalize
router.post("/finalize/:id", analystController.finalizeReport);

router.post("/submit-review/:id", analystController.submitForSupervisorReview);

// Reports
router.get("/reports", analystController.viewReports);

router.get("/ready", analystController.readyForProsecutor);
router.post("/transfer/:id", analystController.transferToProsecutor);

module.exports = router;
