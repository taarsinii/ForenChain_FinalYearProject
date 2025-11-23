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

// Investigator routes
router.get("/add", isLoggedIn, roleMiddleware("investigator"), evidenceController.showAddForm);
router.post("/add", isLoggedIn, roleMiddleware("investigator"), upload.single("photo"), evidenceController.addEvidence);
router.get("/my-evidence", isLoggedIn, roleMiddleware("investigator"), evidenceController.listMyEvidence);
router.get("/transfer/:id", isLoggedIn, roleMiddleware("investigator"), evidenceController.showTransferForm);
router.post("/transfer/:id", isLoggedIn, roleMiddleware("investigator"), evidenceController.transferEvidence);

module.exports = router;

