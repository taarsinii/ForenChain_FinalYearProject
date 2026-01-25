const express = require("express");
const router = express.Router();
const prosecutorController = require("../controllers/prosecutorController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(isLoggedIn);
router.use(roleMiddleware("prosecutor"));

router.get("/dashboard", prosecutorController.dashboard);
router.get("/case/:id", prosecutorController.viewCase);
router.get("/export/:id", prosecutorController.exportChainPDF);

//view blockchain page 
router.get("/blockchain/:id", prosecutorController.viewBlockchain);

module.exports = router;
