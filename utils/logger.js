// /utils/logger.js
const AuditLog = require("../models/AuditLog");

const logger = async (req, action) => {
    try {
        const user_id = req.session.userId;
        const user_ip_address = req.ip || "Unknown";

        await AuditLog.logAction(user_id, action, user_ip_address);
    } catch (err) {
        console.error("Audit logging failed:", err);
    }
};

module.exports = logger;
