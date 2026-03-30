const db = require("../config/db");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");
const { logBlockchainEvent } = require("../utils/blockchainLogger");
const { generateChainHash } = require("../utils/hashChain");

// ================================
// Supervisor Dashboard
// ================================
exports.dashboard = (req, res) => {
    res.render("supervisor/dashboard");
};

// ================================
// List Pending Evidence
// ================================
exports.listPendingEvidence = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, u.username AS investigator, u.username AS investigator_username,u.full_name AS investigator_full_name
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
// Review Evidence
// ================================
exports.reviewEvidence = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(`
            SELECT e.*, u.username AS investigator, u.username AS investigator_username,u.full_name AS investigator_full_name
            FROM evidence e
            JOIN users u ON e.collected_by = u.user_id
            WHERE e.evidence_id = ?
        `, [id]);


        if (rows.length === 0) {
            return res.send("Evidence not found");
        }

        res.render("supervisor/reviewEvidence", {
            evidence: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading evidence");
    }
};

// ================================
// Approve Evidence
// ================================
exports.approveEvidence = async (req, res) => {
    const supervisorId = req.session.user.user_id;
    const { id } = req.params;
    const { supervisor_notes } = req.body;

    // 1️⃣ Get last chain hash
    const [[last]] = await db.execute(
        "SELECT data_hash FROM evidence_chain WHERE evidence_id=? ORDER BY block_id DESC LIMIT 1",
        [id]
    );

    const timestamp = new Date().toISOString();

    const newHash = generateChainHash({
        previousHash: last.data_hash,
        evidenceId: id,
        action: "Approved by Supervisor",
        actorId: supervisorId,
        timestamp,
        extraData: supervisor_notes || ""
    });
    // i have added the hash
    const txHash = await logBlockchainEvent(
        id,
        "Approved by Supervisor",
        newHash
    );

    await db.execute(`
        INSERT INTO evidence_chain
        (evidence_id, action, actor_id, data_hash, previous_hash, tx_hash)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [id, "Approved by Supervisor", supervisorId, newHash, last.data_hash, txHash]);

    await db.execute(
        "UPDATE evidence SET current_status='approved_supervisor', supervisor_notes=? WHERE evidence_id=?",
        [supervisor_notes, id]
    );

    await AuditLog.log({
        user_id: supervisorId,
        action: "EVIDENCE_APPROVED",
        details: `Evidence ID ${id}`,
        ip: req.ip
    });

    res.redirect("/supervisor/pending");
};


// ================================
// Reject Evidence
// ================================
exports.rejectEvidence = async (req, res) => {
    try {
        const supervisorId = req.session.user.user_id;
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === "") {
            return res.send("Rejection reason is required");
        }

        await db.execute(`
            UPDATE evidence
            SET current_status='rejected_supervisor',
                supervisor_reason=?
            WHERE evidence_id=?
        `, [reason, id]);

        // Audit log
        await AuditLog.log({
            user_id: supervisorId,
            action: "EVIDENCE_REJECTED",
            details: `Evidence ID ${id}. Reason: ${reason}`,
            ip: req.ip
        });

        res.redirect("/supervisor/pending");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error rejecting evidence");
    }
};

exports.listPendingAnalysis = async (req, res) => {
    const [rows] = await db.execute(`
        SELECT e.*, u.username AS analyst
        FROM evidence e
        JOIN forensic_analysis fa ON e.evidence_id = fa.evidence_id
        JOIN users u ON fa.analyst_id = u.user_id
        WHERE e.current_status='analysis_pending_supervisor'
    `);

    res.render("supervisor/pendingAnalysis", { evidenceList: rows });
};

exports.reviewAnalysis = async (req, res) => {
    const { id } = req.params;

    const [[evidence]] = await db.execute(
        "SELECT * FROM evidence WHERE evidence_id=?",
        [id]
    );

    const [[analysis]] = await db.execute(
        "SELECT * FROM forensic_analysis WHERE evidence_id=?",
        [id]
    );

    res.render("supervisor/reviewAnalysis", { evidence, analysis });
};

exports.approveAnalysis = async (req, res) => {
    const supervisorId = req.session.user.user_id;
    const { id } = req.params;
    const videoPath = req.file ? req.file.path : null;

    await db.execute(`
        UPDATE evidence
        SET current_status='analysis_approved_supervisor',
            supervisor_video_path=?
        WHERE evidence_id=?
    `, [videoPath, id]);

    await AuditLog.log({
        user_id: supervisorId,
        action: "ANALYSIS_APPROVED_WITH_VIDEO",
        details: `Evidence ID ${id}`,
        ip: req.ip
    });

    // Get last chain hash
    const [[last]] = await db.execute(
        "SELECT data_hash FROM evidence_chain WHERE evidence_id=? ORDER BY block_id DESC LIMIT 1",
        [id]
    );

    const timestamp = new Date().toISOString();

    const chainHash = generateChainHash({
        previousHash: last.data_hash,
        evidenceId: id,
        action: "Analysis Approved by Supervisor",
        actorId: supervisorId,
        timestamp,
        extraData: videoPath || ""
    });

    const txHash = await logBlockchainEvent(
        id,
        "Analysis Approved by Supervisor",
        chainHash
    );

    await db.execute(`
  INSERT INTO evidence_chain
  (evidence_id, action, actor_id, data_hash, previous_hash, tx_hash)
  VALUES (?, ?, ?, ?, ?, ?)
`, [
        id,
        "Analysis Approved by Supervisor",
        supervisorId,
        chainHash,
        last.data_hash,
        txHash
    ]);

    res.redirect("/supervisor/dashboard");

};
