const db = require("../config/db");
const bcrypt = require("bcrypt");

// Admin dashboard
exports.dashboard = async (req, res) => {
    try {
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [req.session.user.id, "Viewed Admin Dashboard", req.ip]
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
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [req.session.user.id, "Viewed Manage Users page", req.ip]
        );

        const [users] = await db.execute("SELECT user_id, username, role, full_name FROM users");
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

        // Log action
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [req.session.user.id, `Created new user: ${username}`, req.ip]
        );

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

        // Log action
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [req.session.user.id, `Updated user ID: ${id} (${username})`, req.ip]
        );

        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    }
};

// Delete user
// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Get the username first
        const [rows] = await db.execute("SELECT username FROM users WHERE user_id = ?", [id]);
        if (rows.length === 0) return res.send("User not found");
        const deletedUsername = rows[0].username;

        // Delete user
        await db.execute("DELETE FROM users WHERE user_id = ?", [id]);

        // Log action with username
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [req.session.user.id, `Deleted user ID: ${id} (${deletedUsername})`, req.ip]
        );

        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }
};

// ================= Audit Logs =================

// View all audit logs
exports.viewAuditLogs = async (req, res) => {
    try {
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [req.session.user.id, "Viewed Audit Logs", req.ip]
        );

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