const express = require("express");
const router = express.Router();
const evidenceController = require("../controllers/evidenceController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const multer = require("multer");
const path = require("path");

// File upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/evidence_photos/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get("/dashboard", isLoggedIn, roleMiddleware("investigator"), (req, res) => {
    res.render("investigator/dashboard");
});

// ============================
// Evidence Routes
// ============================

// Add evidence
router.get("/add", evidenceController.showAddForm);
router.post("/add", upload.single("photo"), evidenceController.addEvidence);

//my evidence
router.get("/my-evidence", evidenceController.listMyEvidence);

router.get("/transfer/:id", evidenceController.showTransferForm); //// Show transfer page (after supervisor approval)
router.post("/transfer-to-analyst/:id", evidenceController.transferToAnalyst); //NEW: Transfer to Analyst (AUTO)

router.get("/evidence/:id", evidenceController.viewEvidenceDetails);

// ============================
// Rejected Evidence Flow
// ============================

// IF REJECTED (EDIT & RESUBMITTED)

// Edit rejected evidence
router.get("/edit/:id", evidenceController.editEvidence);
// Resubmit rejected evidence
router.post("/resubmit/:id", evidenceController.resubmitEvidence);

module.exports = router;

