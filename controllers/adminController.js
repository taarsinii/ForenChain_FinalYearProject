const db = require("../config/db");
const bcrypt = require("bcrypt");

// Admin dashboard
exports.dashboard = (req, res) => {
    res.render("administrator/dashboard");
};

// List all users
exports.listUsers = async (req, res) => {
    try {
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
        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user");
    }
};
