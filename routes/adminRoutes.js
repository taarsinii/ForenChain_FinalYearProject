const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// ============================
// Admin Dashboard
// ============================
router.get("/dashboard", adminController.dashboard);

// ============================
// Manage Users
// ============================
router.get("/users", adminController.listUsers);
router.post("/users/add", adminController.addUser);
router.get("/users/edit/:id", adminController.showEditForm);
router.post("/users/edit/:id", adminController.editUser);
router.post("/users/delete/:id", adminController.deleteUser);

// ============================
// Audit Logs
// ============================
router.get("/audit-logs", adminController.viewAuditLogs);

// ============================
// Backup & Restore
// ============================
router.get("/backups", adminController.viewBackups);
router.post("/backup/create", adminController.createBackup);
router.post("/backup/restore", adminController.restoreBackup);

module.exports = router;
