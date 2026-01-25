const db = require("../config/db");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");
const { logBlockchainEvent } = require("../utils/blockchainLogger");
const fs = require("fs");
const path = require("path");
const { generateChainHash } = require("../utils/hashChain");

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
        const userId = req.session.user.user_id;
        const photoPath = req.file ? req.file.path : null;

        if (!photoPath) return res.send("Evidence file required");

        // 1️⃣ HASH THE ACTUAL FILE (CRITICAL)
        const fileBuffer = fs.readFileSync(photoPath);
        const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        // 2️⃣ Generate Case ID
        const [[{ count }]] = await db.execute("SELECT COUNT(*) AS count FROM evidence");
        const caseId = "CASE-" + String(count + 1).padStart(4, "0");

        // 3️⃣ Insert evidence
        const [result] = await db.execute(`
            INSERT INTO evidence
            (case_id, description, timestamp_collected, collected_by, photo_path, current_status, initial_hash)
            VALUES (?, ?, NOW(), ?, ?, 'pending_supervisor', ?)
        `, [caseId, description, userId, photoPath, fileHash]);

        const evidenceId = result.insertId;

        // 4️⃣ GENESIS BLOCK
        const timestamp = new Date().toISOString();
        const chainHash = generateChainHash({
            previousHash: null,
            evidenceId,
            action: "Evidence Collected",
            actorId: userId,
            timestamp,
            extraData: fileHash
        });

        const txHash = await logBlockchainEvent(evidenceId, "Evidence Collected");

        await db.execute(`
            INSERT INTO evidence_chain
            (evidence_id, action, actor_id, data_hash, previous_hash, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [evidenceId, "Evidence Collected", userId, chainHash, null, txHash]);

        await AuditLog.log({
            user_id: userId,
            action: "EVIDENCE_COLLECTED",
            details: `Evidence ${caseId} collected`,
            ip: req.ip
        });

        res.redirect("/evidence/my-evidence");

    } catch (err) {
        console.error(err);
        res.status(500).send("Evidence upload failed");
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
exports.transferToAnalyst = async (req, res) => {
    try {
        const evidence_id = req.params.id;
        const investigatorId = req.session.user.user_id;

        // 1. Find analyst automatically
        const [[analyst]] = await db.execute(
            "SELECT user_id FROM users WHERE role='analyst' LIMIT 1"
        );

        if (!analyst) return res.send("No analyst available");

        // 2. Create transfer
        const signature = crypto.createHash("sha256")
            .update(`${evidence_id}-${investigatorId}-${analyst.user_id}-${Date.now()}`)
            .digest("hex");

        await db.execute(`
            INSERT INTO transfers
            (evidence_id, sender_id, receiver_id, transfer_type, signature_hash)
            VALUES (?, ?, ?, 'to_lab', ?)
        `, [evidence_id, investigatorId, analyst.user_id, signature]);

        // 3. Update evidence status
        await db.execute(
            "UPDATE evidence SET current_status='transferred_to_lab' WHERE evidence_id=?",
            [evidence_id]
        );

        // 4. Blockchain
        const txHash = await logBlockchainEvent(evidence_id, "Transferred to Analyst");

        await db.execute(`
            INSERT INTO evidence_chain
            (evidence_id, action, actor_id, data_hash, previous_hash, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            evidence_id,
            "Transferred to Analyst",
            investigatorId,
            signature,
            null,
            txHash
        ]);

        // 5. Audit log
        await AuditLog.log({
            user_id: investigatorId,
            action: "EVIDENCE_TRANSFERRED_TO_ANALYST",
            details: `Evidence ID ${evidence_id} transferred to Analyst ID ${analyst.user_id}`,
            ip: req.ip
        });

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
exports.editEvidence = async (req, res) => {
    const evidenceId = req.params.id;
    const userId = req.session.user.user_id;

    const [rows] = await db.execute(
        `SELECT * FROM evidence
         WHERE evidence_id = ?
         AND collected_by = ?
         AND current_status = 'rejected_supervisor'`,
        [evidenceId, userId]
    );

    if (rows.length === 0) {
        return res.status(403).send("Evidence not found or cannot be edited");
    }

    res.render("investigator/editEvidence", { evidence: rows[0] });
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
