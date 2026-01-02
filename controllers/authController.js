const db = require("../config/db");
const bcrypt = require("bcrypt");
const path = require("path");
const validator = require("validator");
const AuditLog = require("../models/AuditLog");

// ================================
// SHOW LOGIN PAGE
// ================================
exports.showLogin = (req, res) => {
    res.render("login");
};

// ================================
// HANDLE LOGIN
// ================================
exports.login = async (req, res) => {
    const { username, password } = req.body;

    // ================================
    // INPUT VALIDATION
    // ================================
    if (!username || !password) {
        return res.status(400).render("login", {
            error: "Username and password are required"
        });
    }

    if (!validator.isAlphanumeric(username)) {
        return res.status(400).render("login", {
            error: "Invalid username format"
        });
    }

    try {
        // ================================
        // FETCH USER
        // ================================
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.render("login", {
                error: "User not found"
            });
        }

        const user = rows[0];

        // ================================
        // PASSWORD CHECK
        // ================================
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.render("login", {
                error: "Incorrect password"
            });
        }

        // ================================
        // SAVE USER SESSION
        // ================================
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            role: user.role
        };

        // ================================
        // AUDIT LOG: USER LOGIN
        // ================================
        try {
            await AuditLog.log({
                user_id: user.user_id,
                action: "USER_LOGIN",
                details: `Role: ${user.role}`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("Audit log failed (login):", logErr);
        }

        // ================================
        // ROLE-BASED REDIRECT
        // ================================
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
        console.error("Login error:", err);
        return res.status(500).send("Login failed");
    }
};

// ================================
// HANDLE LOGOUT
// ================================
exports.logout = async (req, res) => {

    if (req.session.user) {
        try {
            await AuditLog.log({
                user_id: req.session.user.user_id,
                action: "USER_LOGOUT",
                ip: req.ip
            });
        } catch (logErr) {
            console.error("Audit log failed (logout):", logErr);
        }
    }

    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Error logging out");
        }
        res.redirect("/login");
    });
};