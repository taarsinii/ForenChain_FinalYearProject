const db = require("../config/db");
const crypto = require("crypto");

// ================= Dashboard =================
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

        res.render("supervisor/pendingEvidence", { evidenceList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading pending evidence");
    }
};

// ================= Review Evidence Page =================
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

// ================= Approve Evidence =================
// Approve evidence
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

        // Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address, details) VALUES (?, ?, ?, ?)",
            [supervisorId, `Approved evidence ID: ${id}`, req.ip, supervisor_notes || '']
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
        const { supervisor_reason } = req.body;

        if (!supervisor_reason || supervisor_reason.trim().length < 5) {
            return res.status(400).send("Rejection reason must be at least 5 characters");
        }

        // Update evidence status + save reason
        await db.execute(
            "UPDATE evidence SET current_status='rejected', supervisor_reason=? WHERE evidence_id=?",
            [supervisor_reason, id]
        );

        // Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address, details) VALUES (?, ?, ?, ?)",
            [supervisorId, `Rejected evidence ID: ${id}`, req.ip, supervisor_reason]
        );


        res.redirect("/supervisor/pending");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error rejecting evidence");
    }
};
