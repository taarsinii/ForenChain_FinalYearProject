// /models/AuditLog.js
const db = require("../config/db");

const AuditLog = {
    logAction: (user_id, action, user_ip_address) => {
        const sql = `
            INSERT INTO audit_logs (user_id, action, user_ip_address)
            VALUES (?, ?, ?)
        `;
        return db.query(sql, [user_id, action, user_ip_address]);
    },

    getAll: () => {
        const sql = `
            SELECT a.*, u.username 
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.user_id
            ORDER BY timestamp DESC
        `;
        return db.query(sql);
    }
};

module.exports = AuditLog;
