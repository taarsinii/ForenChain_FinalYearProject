const express = require("express");
const router = express.Router();

const supervisorController = require("../controllers/supervisorController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(isLoggedIn);
router.use(roleMiddleware("supervisor"));

router.get("/dashboard", supervisorController.dashboard);
router.get("/pending", supervisorController.listPendingEvidence);
router.get("/review/:id", supervisorController.reviewEvidence);
router.post("/approve/:id", supervisorController.approveEvidence);
router.post("/reject/:id", supervisorController.rejectEvidence);

module.exports = router;
