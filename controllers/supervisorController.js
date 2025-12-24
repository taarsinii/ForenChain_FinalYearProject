const db = require("../config/db");
const crypto = require("crypto");

// ================= Supervisor Dashboard =================
exports.dashboard = (req, res) => {
    res.render("supervisor/dashboard");
};

// ================= List Pending Evidence =================
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

// ================= Approve Evidence =================
exports.approveEvidence = async (req, res) => {
    try {
        const supervisorId = req.session.user.user_id;
        const { id } = req.params;
        const { notes } = req.body;

        await db.execute(
            "UPDATE evidence SET current_status='approved_supervisor', supervisor_notes=? WHERE evidence_id=?",
            [notes || null, id]
        );

        const hash = crypto.createHash("sha256")
            .update(`APPROVE-${id}-${supervisorId}-${Date.now()}`)
            .digest("hex");

        await db.execute(
            `INSERT INTO evidence_chain 
             (evidence_id, action, actor_id, data_hash, previous_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [id, "Approved by Supervisor", supervisorId, hash, ""]
        );

        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [supervisorId, `Approved evidence ID ${id}`, req.ip]
        );

        res.redirect("/supervisor/pending");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error approving evidence");
    }
};

// ================= Reject Evidence (WITH REASON) =================
// Reject evidence
exports.rejectEvidence = async (req, res) => {
    try {
        const supervisorId = req.session.user.user_id;
        const { id } = req.params;
        const { reason } = req.body; // <-- from form

        if (!reason || reason.trim().length < 5) {
            return res.status(400).send("Reason must be at least 5 characters");
        }

        // Update evidence status and reason
        await db.execute(
            "UPDATE evidence SET current_status='rejected', supervisor_reason=? WHERE evidence_id=?",
            [reason, id]
        );

        // Record in evidence chain
        const hash = crypto.createHash("sha256")
            .update(`REJECTED-${id}-${supervisorId}-${Date.now()}`)
            .digest("hex");

        await db.execute(
            `INSERT INTO evidence_chain (evidence_id, action, actor_id, data_hash, previous_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [id, 'Rejected by Supervisor', supervisorId, hash, ""]
        );

        // Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [supervisorId, `Rejected evidence ID: ${id} with reason: ${reason}`, req.ip]
        );

        res.redirect("/supervisor/pending");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error rejecting evidence");
    }
};
