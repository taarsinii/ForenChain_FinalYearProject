const db = require("../config/db");
const bcrypt = require("bcrypt");
const path = require("path");

// Show login page
exports.showLogin = (req, res) => {
    res.sendFile(path.join(__dirname, "../views/login.html"));
};

// Handle login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) return res.send("User not found");

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.send("Incorrect password");

        // Optional: store session info
        req.session.user = {
            id: user.user_id,
            username: user.username,
            role: user.role
        };

        // Role-based redirect
        switch (user.role) {
            case "administrator":
                return res.redirect("/admin/dashboard");
            case "investigator":
                return res.redirect("/investigator/dashboard");
            case "supervisor":
                return res.redirect("/supervisor/dashboard");
            case "analyst":
                return res.redirect("/analyst/dashboard");
            case "prosecutor":
                return res.redirect("/prosecutor/dashboard");
            default:
                return res.send("Unknown role");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Login error");
    }
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Error logging out");
        res.redirect("/login");
    });
};