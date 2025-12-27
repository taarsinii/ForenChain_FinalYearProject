const db = require("../config/db");
const bcrypt = require("bcrypt");
const path = require("path");
const validator = require("validator");

// Show login page
exports.showLogin = (req, res) => {
    // for "login.ejs" 
    res.render("login");
};

// Handle login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    // ================================
    // 🔐 INPUT VALIDATION
    // ================================
    if (!username || !password) {
        return res.status(400).send("Username and password are required");
    }

    if (!validator.isAlphanumeric(username)) {
        return res.status(400).render("login", { error: "Invalid username format" });
    }

    try {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) return res.send("User not found");

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.send("Incorrect password");

        // SAVE USER SESSION
        req.session.user = {
            user_id: user.user_id,
            role: user.role,
            username: user.username
        };

        // ===== Add audit log entry =====
        try {
            await db.execute(
                "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
                [user.user_id, "User logged in", req.ip]
            );
        } catch (logErr) {
            console.error("Failed to log login action:", logErr);
        }


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
