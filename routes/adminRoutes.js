const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { isLoggedIn } = require("../middleware/authMiddleware"); // ✅ Destructure the function
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect all admin routes
router.use(isLoggedIn); // pass the middleware function itself
router.use(roleMiddleware("administrator")); // call it with role string

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Manage Users
router.get("/users", adminController.listUsers);
router.post("/users/add", adminController.addUser);
router.get("/users/edit/:id", adminController.showEditForm);
router.post("/users/edit/:id", adminController.editUser);
router.post("/users/delete/:id", adminController.deleteUser);

// Audit logs
router.get("/audit-logs", adminController.viewAuditLogs);

module.exports = router;
