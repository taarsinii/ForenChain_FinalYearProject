const db = require("../config/db");
const crypto = require("crypto");

// Analyst Dashboard
exports.dashboard = (req, res) => {
    res.render("analyst/dashboard");
};

// List incoming evidence (approved & transferred)
exports.listIncomingEvidence = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, u.username AS investigator
            FROM evidence e
            JOIN users u ON e.collected_by = u.user_id
            WHERE e.current_status = 'transferred_to_lab'
            ORDER BY e.timestamp_collected DESC
        `);

        res.render("analyst/incomingEvidence", { evidenceList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading incoming evidence");
    }
};

// Upload report page
exports.viewUploadReport = async (req, res) => {
    const { id } = req.params;

    const [rows] = await db.execute(
        "SELECT * FROM evidence WHERE evidence_id = ?",
        [id]
    );

    if (rows.length === 0) return res.send("Evidence not found");

    res.render("analyst/uploadReport", { evidence: rows[0] });
};

// Submit forensic report
exports.submitReport = async (req, res) => {
    try {
        const analystId = req.session.user.user_id;
        const { id } = req.params;

        const reportHash = crypto
            .createHash("sha256")
            .update(`FORENSIC-REPORT-${id}-${Date.now()}`)
            .digest("hex");

        // Update evidence
        await db.execute(`
            UPDATE evidence
            SET current_status = 'report_uploaded',
                final_hash = ?
            WHERE evidence_id = ?
        `, [reportHash, id]);

        // Audit log
        await db.execute(`
            INSERT INTO audit_logs (user_id, action, user_ip_address)
            VALUES (?, ?, ?)
        `, [analystId, `Uploaded forensic report for evidence ${id}`, req.ip]);

        res.redirect("/analyst/incoming");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading report");
    }
};
