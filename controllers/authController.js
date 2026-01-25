const db = require("../config/db");
const bcrypt = require("bcrypt");
const validator = require("validator");
const AuditLog = require("../models/AuditLog");

/*
====================================================
AUTH CONTROLLER FUNCTION:
- Password authentication
- OTP (second-factor) verification (simulated)
- Full audit trail
====================================================
*/

// ================================
// SHOW HOME PAGE
// ================================
exports.showHome = (req, res) => {
    res.render("home");
};

// ================================
// SHOW LOGIN PAGE
// ================================
exports.showLogin = (req, res) => {
    res.render("login", { error: "" });   // ✅ always pass error
};

// ================================
// HANDLE LOGIN (PASSWORD STEP)
// ================================
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render("login", {
            error: "Username and password are required"
        });
    }

    if (!validator.isAlphanumeric(username)) {
        return res.render("login", {
            error: "Invalid username format"
        });
    }

    try {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.render("login", { error: "User not found" });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.render("login", { error: "Incorrect password" });
        }

        // STORE USER TEMPORARILY (OTP NOT VERIFIED)
        req.session.tempUser = {
            user_id: user.user_id,
            username: user.username,
            role: user.role
        };

        // HARD-CODED OTP (DEMO)
        req.session.otp = "123456";

        // Audit log
        await AuditLog.log({
            user_id: user.user_id,
            action: "LOGIN_PASSWORD_VERIFIED",
            details: `Role: ${user.role}`,
            ip: req.ip
        });

        return res.redirect("/otp");

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Login failed");
    }
};

// ================================
// SHOW OTP PAGE
// ================================
exports.showOtp = (req, res) => {
    res.render("otp", { error: "" });   // ✅ always pass error
};

// ================================
// VERIFY OTP
// ================================
exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;

    if (!req.session.tempUser || !req.session.otp) {
        return res.redirect("/login");
    }

    if (otp !== req.session.otp) {
        return res.render("otp", { error: "Invalid OTP" });   // ✅ safe
    }

    // ✅ OTP VERIFIED (user login)
    req.session.user = req.session.tempUser;
    delete req.session.tempUser;
    delete req.session.otp;

    // Audit log
    await AuditLog.log({
        user_id: req.session.user.user_id,
        action: "OTP_VERIFIED",
        details: "Second-factor authentication simulated",
        ip: req.ip
    });

    // ROLE-BASED REDIRECT
    switch (req.session.user.role) {
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
            return res.redirect("/login");
    }
};

// ================================
// HANDLE LOGOUT
// ================================
exports.logout = async (req, res) => {
    if (req.session.user) {
        await AuditLog.log({
            user_id: req.session.user.user_id,
            action: "USER_LOGOUT",
            ip: req.ip
        });
    }

    req.session.destroy(() => {
        res.redirect("/login");
    });
};
