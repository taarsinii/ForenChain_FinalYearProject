const db = require("../config/db");
const fs = require("fs");
const crypto = require("crypto");

// Show Add Evidence Form
exports.showAddForm = (req, res) => {
    res.render("investigator/addEvidence");
};

// Add Evidence POST
// Add Evidence POST
exports.addEvidence = async (req, res) => {
    try {
        const { description } = req.body;
        const collected_by = req.session.user.user_id;
        const photo_path = req.file ? req.file.path : null;

        // Timestamp in MySQL format
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

        // Generate initial hash (before case_id, can include description+timestamp)
        const hash = crypto.createHash("sha256")
            .update(description + timestamp)
            .digest("hex");

        // Step 1: Count existing records to create new CaseID
        const [rows] = await db.execute("SELECT COUNT(*) AS count FROM evidence");
        const nextId = rows[0].count + 1;

        // Step 2: Insert evidence with generated case_id
        const [result] = await db.execute(
            `INSERT INTO evidence (case_id, description, timestamp_collected, collected_by, photo_path, current_status, initial_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [("CASE-" + nextId.toString().padStart(4, "0")), description, timestamp, collected_by, photo_path, 'pending_supervisor', hash]
        );

        const evidence_id = result.insertId;

        // Generate CaseID based on evidence_id
        const generatedCaseID = "CASE-" + evidence_id.toString().padStart(4, "0");

        // Update the evidence record with generated CaseID
        await db.execute(
            "UPDATE evidence SET case_id=? WHERE evidence_id=?",
            [("CASE-" + nextId.toString().padStart(4, "0")), evidence_id]
        );

        // Insert first block in evidence_chain
        await db.execute(
            `INSERT INTO evidence_chain (evidence_id, action, actor_id, data_hash, previous_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [evidence_id, 'Evidence Collected', collected_by, hash, '']
        );

        res.redirect("/evidence/my-evidence");

    } catch (err) {
        console.error("Error adding evidence:", err);
        res.status(500).send("Error adding evidence");
    }
};

// List My Submitted Evidence
exports.listMyEvidence = async (req, res) => {
    try {
        const user_id = req.session.user.user_id;
        const [rows] = await db.execute(
            `SELECT * FROM evidence WHERE collected_by=? ORDER BY timestamp_collected DESC`,
            [user_id]
        );
        res.render("investigator/myEvidence", { evidenceList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching your evidence");
    }
};

// Show Transfer Form
exports.showTransferForm = async (req, res) => {
    try {
        const evidence_id = req.params.id;
        const [rows] = await db.execute(
            "SELECT * FROM evidence WHERE evidence_id=? AND collected_by=?",
            [evidence_id, req.session.user.user_id]
        );

        if (rows.length === 0) return res.send("Evidence not found or not yours");

        res.render("investigator/transferEvidence", { evidence: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading transfer form");
    }
};

// Transfer Evidence POST
exports.transferEvidence = async (req, res) => {
    try {
        const evidence_id = req.params.id;
        const from_user = req.session.user.user_id;
        const { to_user, transfer_type } = req.body;

        // Generate hash for transfer signature
        const signature = crypto.createHash("sha256")
            .update(`${evidence_id}-${from_user}-${to_user}-${Date.now()}`)
            .digest("hex");

        await db.execute(
            `INSERT INTO transfers (evidence_id, from_user, to_user, transfer_type, signature_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [evidence_id, from_user, to_user, transfer_type, signature]
        );

        // Update evidence status
        let status = transfer_type === 'to_supervisor' ? 'pending_supervisor' : 'transferred_to_lab';
        await db.execute(
            "UPDATE evidence SET current_status=? WHERE evidence_id=?",
            [status, evidence_id]
        );

        res.redirect("/evidence/my-evidence");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error transferring evidence");
    }
};
