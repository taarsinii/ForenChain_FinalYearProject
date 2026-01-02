// models/AuditLog.js
const db = require("../config/db");

const AuditLog = {
    log: async ({ user_id, action, details = null, ip }) => {
        try {
            await db.execute(
                `INSERT INTO audit_logs 
                 (user_id, action, details, user_ip_address)
                 VALUES (?, ?, ?, ?)`,
                [user_id || null, action, details, ip]
            );
        } catch (err) {
            console.error("Audit log failed:", err);
        }
    },

    getAll: async () => {
        const [rows] = await db.execute(`
            SELECT a.*, u.username
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.user_id
            ORDER BY a.log_id DESC
        `);
        return rows;
    }
};

module.exports = AuditLog;
