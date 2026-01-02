const db = require("../config/db");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");

// ================================
// Show Add Evidence Form 
// ================================
exports.showAddForm = (req, res) => {
    res.render("investigator/addEvidence");
};
// ================================
// Add Evidence 
// ================================
exports.addEvidence = async (req, res) => {
    try {
        const { description } = req.body;
        const userId = req.session?.user?.user_id || null;
        const photo_path = req.file ? req.file.path : null;

        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        const hash = crypto.createHash("sha256").update(description + timestamp).digest("hex");

        const [rows] = await db.execute("SELECT COUNT(*) AS count FROM evidence");
        const nextId = rows[0].count + 1;

        const [result] = await db.execute(
            `INSERT INTO evidence (case_id, description, timestamp_collected, collected_by, photo_path, current_status, initial_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ["CASE-" + nextId.toString().padStart(4, "0"), description, timestamp, userId, photo_path, 'pending_supervisor', hash]
        );

        const evidence_id = result.insertId;

        await db.execute(
            "UPDATE evidence SET case_id=? WHERE evidence_id=?",
            ["CASE-" + nextId.toString().padStart(4, "0"), evidence_id]
        );

        await db.execute(
            `INSERT INTO evidence_chain (evidence_id, action, actor_id, data_hash, previous_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [evidence_id, 'Evidence Collected', userId, hash, '']
        );

        // ================================
        // AUDIT LOG: EVIDENCE REGISTERED 
        // ================================
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [userId, `Added evidence ID: ${evidence_id}`, req.ip]
        );

        res.redirect("/evidence/my-evidence");
    } catch (err) {
        console.error("Error adding evidence:", err);
        res.status(500).send("Error adding evidence");
    }
};

// ================================
// List My Evidence 
// ================================
exports.listMyEvidence = async (req, res) => {
    try {
        const userId = req.session?.user?.user_id || null;
        const [rows] = await db.execute(
            `SELECT * FROM evidence WHERE collected_by=? ORDER BY timestamp_collected DESC`,
            [userId]
        );
        res.render("investigator/myEvidence", { evidenceList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching your evidence");
    }
};

// ================================ 
// Show Transfer Form 
// ================================
exports.showTransferForm = async (req, res) => {
    try {
        const evidence_id = req.params.id;
        const userId = req.session?.user?.user_id || null;

        const [rows] = await db.execute(
            "SELECT * FROM evidence WHERE evidence_id=? AND collected_by=?",
            [evidence_id, userId]
        );

        if (rows.length === 0) return res.send("Evidence not found or not yours");

        res.render("investigator/transferEvidence", { evidence: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading transfer form");
    }
};

// ================================
// Transfer Evidence 
// ================================
exports.transferEvidence = async (req, res) => {
    try {
        const evidence_id = req.params.id;
        const from_user = req.session?.user?.user_id || null;
        const { to_user, transfer_type } = req.body;

        const signature = crypto.createHash("sha256")
            .update(`${evidence_id}-${from_user}-${to_user}-${Date.now()}`)
            .digest("hex");

        await db.execute(
            `INSERT INTO transfers (evidence_id, from_user, to_user, transfer_type, signature_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [evidence_id, from_user, to_user, transfer_type, signature]
        );

        const status = transfer_type === 'to_supervisor' ? 'pending_supervisor' : 'transferred_to_lab';
        await db.execute(
            "UPDATE evidence SET current_status=? WHERE evidence_id=?",
            [status, evidence_id]
        );

        // ================================
        // AUDIT LOG: EVIDENCE TRANSFERRED 
        // ================================
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address) VALUES (?, ?, ?)",
            [from_user, `Transferred evidence ID: ${evidence_id} to user ${to_user}`, req.ip]
        );

        res.redirect("/evidence/my-evidence");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error transferring evidence");
    }
};

// ================================
// View Evidence Details 
// ================================
exports.viewEvidenceDetails = async (req, res) => {
    try {
        const investigatorId = req.session.user.user_id;
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT * FROM evidence 
             WHERE evidence_id = ? AND collected_by = ?`,
            [id, investigatorId]
        );

        if (rows.length === 0) {
            return res.send("Evidence not found");
        }

        res.render("investigator/evidenceDetails", {
            evidence: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading evidence details");
    }
};

// ================================
// Edit Evidence (Rejected) 
// ================================
exports.editEvidenceForm = async (req, res) => {
    const { id } = req.params;
    const investigatorId = req.session.user.user_id;

    const [rows] = await db.execute(
        `SELECT * FROM evidence 
         WHERE evidence_id = ? 
         AND collected_by = ?
         AND current_status = 'rejected'`,
        [id, investigatorId]
    );

    if (rows.length === 0) {
        return res.send("Evidence not found or cannot be edited");
    }

    res.render("investigator/editEvidence", {
        evidence: rows[0]
    });
};

// ================================
// Resubmit Evidence 
// ================================
exports.resubmitEvidence = async (req, res) => {
    const { id } = req.params;
    const investigatorId = req.session.user.user_id;
    const { description } = req.body;

    await db.execute(`
        UPDATE evidence
        SET description = ?,
            current_status = 'pending_supervisor',
            supervisor_reason = NULL
        WHERE evidence_id = ?
        AND collected_by = ?
    `, [description, id, investigatorId]);

    // ================================
    // AUDIT LOG: EVIDENCE RESUBMITTED 
    // ================================
    try {
        await AuditLog.log({
            user_id: investigatorId,
            action: "EVIDENCE_RESUBMITTED",
            details: `Evidence ID ${id} resubmitted after rejection`,
            ip: req.ip
        });
    } catch (logErr) {
        console.error("Audit log failed (EVIDENCE_RESUBMITTED):", logErr);
    }

    res.redirect("/investigator/my-evidence");
};