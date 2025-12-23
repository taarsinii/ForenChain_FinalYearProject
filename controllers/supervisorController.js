const db = require("../config/db");
const crypto = require("crypto");

// Supervisor Dashboard
exports.dashboard = async (req, res) => {
    res.render("supervisor/dashboard");
};

// List evidence pending approval
exports.listPendingEvidence = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, u.username AS investigator
            FROM evidence e
            JOIN users u ON e.collected_by = u.user_id
            WHERE e.current_status = 'pending_supervisor'
            ORDER BY e.timestamp_collected DESC
        `);

        res.render("supervisor/reviewEvidence", { evidenceList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading pending evidence");
    }
};

// Review single evidence
exports.reviewEvidence = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(`
            SELECT e.*, u.username AS investigator
            FROM evidence e
            JOIN users u ON e.collected_by = u.user_id
            WHERE e.evidence_id = ?
        `, [id]);

        if (rows.length === 0) return res.send("Evidence not found");

        res.render("supervisor/reviewEvidence", {
            evidenceList: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error reviewing evidence");
    }
};

// Approve evidence
exports.approveEvidence = async (req, res) => {
    try {
        const supervisorId = req.session.user.user_id;
        const { id } = req.params;

        // Update evidence status
        await db.execute(
            "UPDATE evidence SET current_status='approved_supervisor' WHERE evidence_id=?",
            [id]
        );

        // Create blockchain entry
        const hash = crypto.createHash("sha256")
            .update(`APPROVED-${id}-${Date.now()}`)
            .digest("hex");

        await db.execute(`
            INSERT INTO evidence_chain (evidence_id, action, actor_id, data_hash, previous_hash)
            VALUES (?, ?, ?, ?, ?)
        `, [id, "Approved by Supervisor", supervisorId, hash, ""]);

        // Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [supervisorId, `Approved evidence ID: ${id}`, req.ip]
        );

        res.redirect("/supervisor/pending");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error approving evidence");
    }
};

// Reject evidence
exports.rejectEvidence = async (req, res) => {
    try {
        const supervisorId = req.session.user.user_id;
        const { id } = req.params;

        await db.execute(
            "UPDATE evidence SET current_status='pending_supervisor' WHERE evidence_id=?",
            [id]
        );

        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [supervisorId, `Rejected evidence ID: ${id}`, req.ip]
        );

        res.redirect("/supervisor/pending");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error rejecting evidence");
    }
};
