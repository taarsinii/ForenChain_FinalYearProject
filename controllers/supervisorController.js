const db = require("../config/db");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");

// ================================
// Supervisor Dashboard 
// ================================
exports.dashboard = (req, res) => {
    res.render("supervisor/dashboard");
};

// ================================
// View Pending Evidence
// ================================
exports.listPendingEvidence = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, u.username AS investigator
            FROM evidence e
            JOIN users u ON e.collected_by = u.user_id
            WHERE e.current_status = 'pending_supervisor'
            ORDER BY e.timestamp_collected DESC
        `);

        res.render("supervisor/pendingEvidence", { evidenceList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading pending evidence");
    }
};

// ================================
// Review Evidence Page 
// ================================
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

        res.render("supervisor/reviewEvidence", { evidence: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading evidence");
    }
};

// ================================
// Approve Evidence 
// ================================
exports.approveEvidence = async (req, res) => {
    try {
        const supervisorId = req.session.user.user_id;
        const { id } = req.params;
        const { supervisor_notes } = req.body; // <-- Get notes from textarea

        // Update evidence status + save notes
        await db.execute(
            "UPDATE evidence SET current_status='approved_supervisor', supervisor_notes=? WHERE evidence_id=?",
            [supervisor_notes || null, id]
        );

        // Create blockchain entry
        const hash = crypto.createHash("sha256")
            .update(`APPROVED-${id}-${Date.now()}`)
            .digest("hex");

        await db.execute(
            `INSERT INTO evidence_chain (evidence_id, action, actor_id, data_hash, previous_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [id, "Approved by Supervisor", supervisorId, hash, ""]
        );

        // ================================
        // AUDIT LOG: EVIDENCE APPROVED 
        // ================================
        try {
            await AuditLog.log({
                user_id: supervisorId,
                action: "EVIDENCE_APPROVED",
                details: `Evidence ID ${id}. Notes: ${supervisor_notes || "None"}`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("Audit log failed (EVIDENCE_APPROVED):", logErr);
        }

        res.redirect("/supervisor/pending-evidence");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error approving evidence");
    }
};

// ================================
// Reject Evidence (WITH REASON)
// ================================
exports.rejectEvidence = async (req, res) => {
    try {
        const supervisorId = req.session.user.user_id;
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === "") {
            return res.send("Rejection reason is required");
        }

        await db.execute(
            `UPDATE evidence 
             SET current_status = 'rejected_supervisor',
                 supervisor_reason = ?
             WHERE evidence_id = ?`,
            [reason, id]
        );

        // ================================
        // AUDIT LOG: EVIDENCE REJECTED
        // ================================
        try {
            await AuditLog.log({
                user_id: supervisorId,
                action: "EVIDENCE_REJECTED",
                details: `Evidence ID ${id}. Reason: ${reason}`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("Audit log failed (EVIDENCE_REJECTED):", logErr);
        }

        res.redirect("/supervisor/pending-evidence");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error rejecting evidence");
    }
};
