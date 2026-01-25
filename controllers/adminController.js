const bcrypt = require("bcrypt");
const db = require("../config/db");
const validator = require("validator");
const AuditLog = require("../models/AuditLog");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const allowedRoles = [
    "administrator",
    "investigator",
    "supervisor",
    "analyst",
    "prosecutor"
];
// ================================
// Admin Dashboard 
// ================================
// (No audit log here – page views are not audit events) ---CORRECTED 31/12
exports.dashboard = async (req, res) => {
    res.render("administrator/dashboard");
};

// ================================
// Manage Users 
// ================================
// List all users (no audit log – read-only view)
exports.listUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT user_id, username, role, full_name FROM users"
        );

        res.render("administrator/manageUsers", { users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching users");
    }
};

// ================================
// Add New User 
// ================================
exports.addUser = async (req, res) => {
    try {
        const { username, password, role, full_name } = req.body;
        const userId = req.session?.user?.user_id || null;

        // ================================
        // Input Validation 
        // ================================
        if (!validator.isAlphanumeric(username)) {
            return res.status(400).send("Invalid username format");
        }

        if (!validator.isAlpha(full_name.replace(/\s/g, ""))) {
            return res.status(400).send("Full name must contain letters only");
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).send("Invalid role selected");
        }

        if (!password || password.length < 8) {
            return res.status(400).send("Password must be at least 8 characters");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, role, full_name]
        );

        // ================================
        // AUDIT LOG: USER CREATED 
        // ================================
        try {
            await AuditLog.log({
                user_id: userId,
                action: "USER_CREATED",
                details: `Username: ${username}, Role: ${role}`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("Audit log failed (USER_CREATED):", logErr);
        }

        res.redirect("/admin/users");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding user");
    }
};

// ================================
// Show Edit User Form 
// ================================
exports.showEditForm = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE user_id = ?", [id]);
        if (rows.length === 0) return res.send("User not found");
        res.render("administrator/editUser", { user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching user");
    }
};

// ================================
// Edit User 
// ================================
exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, full_name, password } = req.body;
        const userId = req.session?.user?.user_id || null;

        // ================================
        // Validation
        // ================================
        if (!validator.isAlphanumeric(username)) {
            return res.status(400).send("Invalid username format");
        }

        if (!validator.isAlpha(full_name.replace(/\s/g, ""))) {
            return res.status(400).send("Full name must contain letters only");
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).send("Invalid role selected");
        }

        if (password && password.length < 8) {
            return res.status(400).send("Password must be at least 8 characters");
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute(
                "UPDATE users SET username=?, role=?, full_name=?, password_hash=? WHERE user_id=?",
                [username, role, full_name, hashedPassword, id]
            );
        } else {
            await db.execute(
                "UPDATE users SET username=?, role=?, full_name=? WHERE user_id=?",
                [username, role, full_name, id]
            );
        }

        // ================================
        // AUDIT LOG: USER UPDATED 
        // ================================
        try {
            await AuditLog.log({
                user_id: userId,
                action: "USER_UPDATED",
                details: `User ID: ${id}, Username: ${username}, Role: ${role}`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("Audit log failed (USER_UPDATED):", logErr);
        }

        res.redirect("/admin/users");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    }
};

// ================================
// Delete User 
// ================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.user_id || null;

        const [rows] = await db.execute(
            "SELECT username FROM users WHERE user_id = ?",
            [id]
        );

        if (rows.length === 0) return res.send("User not found");

        const deletedUsername = rows[0].username;

        await db.execute(
            "DELETE FROM users WHERE user_id = ?",
            [id]
        );

        // ================================
        // AUDIT LOG: USER DELETED 
        // ================================
        try {
            await AuditLog.log({
                user_id: userId,
                action: "USER_DELETED",
                details: `User ID: ${id}, Username: ${deletedUsername}`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("Audit log failed (USER_DELETED):", logErr);
        }

        res.redirect("/admin/users");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }
};

// ================================
// Create Database Backup
// ================================
exports.createBackup = async (req, res) => {
    try {
        const userId = req.session.user.user_id;

        const backupFileName = `backup_${Date.now()}.sql`;
        const backupPath = path.join(__dirname, "../backups", backupFileName);

        // ⚠️ Replace credentials with your .env values
        const MYSQLDUMP_PATH = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"`;

        const command = `${MYSQLDUMP_PATH} -u root -pTaarsinii123! forenchain_system > "${backupPath}"`;

        exec(command, async (error) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Backup failed");
            }

            // Save backup log
            await db.execute(
                "INSERT INTO backup_logs (backup_file_path, created_by) VALUES (?, ?)",
                [backupFileName, userId]
            );

            // Audit log
            await AuditLog.log({
                user_id: userId,
                action: "DATABASE_BACKUP_CREATED",
                details: `Backup file: ${backupFileName}`,
                ip: req.ip
            });

            res.redirect("/admin/backups");
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Backup error");
    }
};

// ================================
// Restore Database Backup
// ================================
exports.restoreBackup = async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const { backupFile } = req.body;

        if (!backupFile) {
            return res.status(400).send("No backup file selected");
        }

        const backupPath = path.join(__dirname, "../backups", backupFile);

        if (!fs.existsSync(backupPath)) {
            return res.status(404).send("Backup file not found");
        }

        const MYSQL_PATH = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe"`;

        const command = `${MYSQL_PATH} -u root -pTaarsinii123! forenchain_system < "${backupPath}"`;

        exec(command, async (error) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Restore failed");
            }

            await AuditLog.log({
                user_id: userId,
                action: "DATABASE_RESTORED",
                details: `Restored from backup: ${backupFile}`,
                ip: req.ip
            });

            res.redirect("/admin/backups");
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Restore error");
    }
};

// ================================
// View Backup Logs
// ================================
exports.viewBackups = async (req, res) => {
    try {
        const [backups] = await db.execute(`
            SELECT b.*, u.username
            FROM backup_logs b
            LEFT JOIN users u ON b.created_by = u.user_id
            ORDER BY b.created_at DESC
        `);

        res.render("administrator/backup", { backups });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading backups");
    }
};

// ================================
// View Audit Logs 
// ================================
exports.viewAuditLogs = async (req, res) => {
    try {
        const [logs] = await db.execute(`
            SELECT a.*, u.username
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.user_id
            ORDER BY a.log_id DESC
        `);

        res.render("administrator/auditLogs", { logs });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching audit logs");
    }
};
