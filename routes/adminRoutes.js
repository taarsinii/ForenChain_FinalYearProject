const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect all admin routes
router.use(authMiddleware);
router.use(roleMiddleware("administrator"));

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Manage Users
router.get("/users", adminController.listUsers);
router.post("/users/add", adminController.addUser);
router.get("/users/edit/:id", adminController.showEditForm);
router.post("/users/edit/:id", adminController.editUser);
router.post("/users/delete/:id", adminController.deleteUser);

router.get("/audit-logs", adminController.viewAuditLogs);

module.exports = router;