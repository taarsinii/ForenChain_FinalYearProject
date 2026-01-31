const db = require("../config/db");
const bcrypt = require("bcrypt");
const validator = require("validator");
const AuditLog = require("../models/AuditLog");

/* ================================
   SHOW HOME
================================ */
exports.showHome = (req, res) => {
    res.render("home");
};

/* ================================
   SHOW LOGIN
================================ */
exports.showLogin = (req, res) => {
    res.render("login", { error: "" });
};

/* ================================
   LOGIN: USERNAME + PASSWORD
================================ */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render("login", { error: "All fields required" });
    }

    if (!validator.isAlphanumeric(username)) {
        return res.render("login", { error: "Invalid username format" });
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
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.render("login", { error: "Incorrect password" });
        }

        // TEMP USER (NOT FULLY AUTHENTICATED)
        req.session.tempUser = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            phone_number: user.phone_number
        };

        await AuditLog.log({
            user_id: user.user_id,
            action: "PASSWORD_VERIFIED",
            ip: req.ip
        });

        res.redirect("/verify-phone");

    } catch (err) {
        console.error(err);
        res.status(500).send("Login failed");
    }
};

/* ================================
   SHOW PHONE VERIFICATION
================================ */
exports.showPhoneVerification = (req, res) => {
    if (!req.session.tempUser) {
        return res.redirect("/login");
    }
    res.render("verifyPhone", { error: "" });
};

/* ================================
   VERIFY PHONE NUMBER
================================ */
exports.verifyPhone = async (req, res) => {
    const { phone } = req.body;

    if (!req.session.tempUser) {
        return res.redirect("/login");
    }

    if (phone !== req.session.tempUser.phone_number) {
        return res.render("verifyPhone", {
            error: "Phone number does not match registered number"
        });
    }

    // SIMULATED OTP
    req.session.otp = "123456";

    await AuditLog.log({
        user_id: req.session.tempUser.user_id,
        action: "PHONE_VERIFIED",
        details: "Phone number matched (OTP simulated)",
        ip: req.ip
    });

    res.redirect("/otp");
};

/* ================================
   SHOW OTP PAGE
================================ */
exports.showOtp = (req, res) => {
    if (!req.session.otp) {
        return res.redirect("/login");
    }
    res.render("otp", { error: "" });
};

/* ================================
   VERIFY OTP
================================ */
exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;

    if (!req.session.tempUser || !req.session.otp) {
        return res.redirect("/login");
    }

    if (otp !== req.session.otp) {
        return res.render("otp", { error: "Invalid OTP" });
    }

    // FULL AUTH SUCCESS
    req.session.user = req.session.tempUser;
    delete req.session.tempUser;
    delete req.session.otp;

    await AuditLog.log({
        user_id: req.session.user.user_id,
        action: "OTP_VERIFIED",
        ip: req.ip
    });

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

/* ================================
   LOGOUT
================================ */
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
