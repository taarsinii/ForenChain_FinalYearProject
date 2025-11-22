// /utils/logger.js
const db = require("../config/db");

async function logger(req, action) {
    try {
        // Get the user ID from session
        const userId = req.session.user ? req.session.user.id : null;
        const ip = req.ip || req.connection.remoteAddress || "::1";

        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [userId, action, ip]
        );
    } catch (err) {
        console.error("Error writing audit log:", err);
    }
}

module.exports = logger;
