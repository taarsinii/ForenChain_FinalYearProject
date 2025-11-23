const bcrypt = require("bcrypt");
const db = require("../config/db");
const validator = require("validator");

const allowedRoles = [
    "administrator",
    "investigator",
    "supervisor",
    "analyst",
    "prosecutor"
];

// ================= Admin Dashboard =================
exports.dashboard = async (req, res) => {
    try {
        const userId = req.session?.user?.user_id || null;

        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [userId, "Viewed Admin Dashboard", req.ip]
        );
    } catch (err) {
        console.error("Audit log failed:", err);
    }

    res.render("administrator/dashboard");
};

// ================= Manage Users =================

// List all users
exports.listUsers = async (req, res) => {
    try {
        const userId = req.session?.user?.user_id || null;

        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [userId, "Viewed Manage Users page", req.ip]
        );

        const [users] = await db.execute(
            "SELECT user_id, username, role, full_name FROM users"
        );

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
        const userId = req.session?.user?.user_id || null;

        // ================= Input Validation =================
        if (!validator.isAlphanumeric(username)) return res.status(400).send("Invalid username format");
        if (!validator.isAlpha(full_name.replace(/\s/g, ""))) return res.status(400).send("Full name must contain letters only");
        if (!allowedRoles.includes(role)) return res.status(400).send("Invalid role selected");
        if (!password || password.length < 6) return res.status(400).send("Password must be at least 6 characters");

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, role, full_name]
        );

        // Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [userId, `Created new user: ${username}`, req.ip]
        );

        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding user");
    }
};

// Show edit user form
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

// Edit user
exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, full_name, password } = req.body;
        const userId = req.session?.user?.user_id || null;

        // ================= Validation =================
        if (!validator.isAlphanumeric(username)) return res.status(400).send("Invalid username format");
        if (!validator.isAlpha(full_name.replace(/\s/g, ""))) return res.status(400).send("Full name must contain letters only");
        if (!allowedRoles.includes(role)) return res.status(400).send("Invalid role selected");
        if (password && password.length < 6) return res.status(400).send("Password must be at least 6 characters");

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

        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [userId, `Updated user ID: ${id} (${username})`, req.ip]
        );

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
        const userId = req.session?.user?.user_id || null;

        const [rows] = await db.execute("SELECT username FROM users WHERE user_id=?", [id]);
        if (rows.length === 0) return res.send("User not found");

        const deletedUsername = rows[0].username;
        await db.execute("DELETE FROM users WHERE user_id=?", [id]);

        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [userId, `Deleted user ID: ${id} (${deletedUsername})`, req.ip]
        );

        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }
};

// View audit logs (logging removed here)
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
