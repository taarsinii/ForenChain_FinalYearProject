const db = require("../config/db");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// Analyst Dashboard
exports.dashboard = (req, res) => {
    res.render("analyst/dashboard");
};

// List Incoming Evidence
exports.incomingEvidence = async (req, res) => {
    try {
        const analystId = req.session.user.user_id;

        const [rows] = await db.execute(`
            SELECT e.*, u.username AS investigator
            FROM evidence e
            JOIN users u ON e.collected_by = u.user_id
            WHERE e.current_status = 'approved_supervisor'
            ORDER BY e.timestamp_collected DESC
        `);

        res.render("analyst/incomingEvidence", { evidenceList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading incoming evidence");
    }
};

// View single evidence and allow download
exports.viewEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            "SELECT e.*, u.username AS investigator FROM evidence e JOIN users u ON e.collected_by = u.user_id WHERE e.evidence_id=?",
            [id]
        );

        if (rows.length === 0) return res.send("Evidence not found");

        res.render("analyst/viewEvidence", { evidence: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading evidence");
    }
};

// Download evidence file
exports.downloadEvidence = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            "SELECT photo_path FROM evidence WHERE evidence_id=?",
            [id]
        );

        if (!rows[0] || !rows[0].photo_path) return res.send("No file to download");

        res.download(path.join(__dirname, "../" + rows[0].photo_path));
    } catch (err) {
        console.error(err);
        res.status(500).send("Error downloading file");
    }
};
