// models/AuditLog.js
const db = require("../config/db");

const AuditLog = {
    logAction: async (user_id, action, user_ip_address) => {
        try {
            await db.execute(
                "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
                [user_id || null, action, user_ip_address]
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
