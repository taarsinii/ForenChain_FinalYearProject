const db = require("../config/db");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");  // <-- ADD THIS

// Admin dashboard
exports.dashboard = (req, res) => {
    // Log viewing dashboard
    logger(req, "Viewed Admin Dashboard");

    res.render("administrator/dashboard");
};

// List all users
exports.listUsers = async (req, res) => {
    try {
        const [users] = await db.execute("SELECT user_id, username, role, full_name FROM users");

        // Log viewing user list
        logger(req, "Viewed Manage Users page");

        res.render("administrator/manageUsers", { users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching users");
    }
};

// Add new user
exports.addUser = async (req, res) => {
    try {
        const { username, password, role, full_name } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)",
            [username, hashed, role, full_name]
        );

        // Log creation
        logger(req, `Created new user: ${username}`);

        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding user");
    }
};

// Show edit form
exports.showEditForm = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE user_id=?", [id]);
        if (rows.length === 0) return res.send("User not found");

        // Log viewing edit form
        logger(req, `Viewed edit form for user ID: ${id}`);

        res.render("administrator/editUser", { user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching user");
    }
};

// Edit user
exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, full_name, password } = req.body;

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await db.execute(
                "UPDATE users SET username=?, role=?, full_name=?, password_hash=? WHERE user_id=?",
                [username, role, full_name, hashed, id]
            );
        } else {
            await db.execute(
                "UPDATE users SET username=?, role=?, full_name=? WHERE user_id=?",
                [username, role, full_name, id]
            );
        }

        // Log update
        logger(req, `Updated user ID: ${id} (${username})`);

        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute("DELETE FROM users WHERE user_id=?", [id]);

        // Log deletion
        logger(req, `Deleted user ID: ${id}`);

        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }
};

// View Audit Logs
exports.viewAuditLogs = async (req, res) => {
    try {
        const [logs] = await db.execute(
            `SELECT audit_logs.*, users.username 
             FROM audit_logs 
             LEFT JOIN users ON audit_logs.user_id = users.user_id
             ORDER BY audit_logs.timestamp DESC`
        );

        logger(req, "Viewed Audit Logs");

        res.render("administrator/auditLogs", { logs });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading audit logs");
    }
};