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
            WHERE e.current_status = 'transferred_to_lab'
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

// Show report form
exports.showReportForm = async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute(
        "SELECT * FROM evidence WHERE evidence_id=?",
        [id]
    );

    if (rows.length === 0) return res.send("Evidence not found");

    const evidence = rows[0];

    // Check if report already exists
    const [reportRows] = await db.execute(
        "SELECT * FROM forensic_reports WHERE evidence_id=?",
        [id]
    );

    res.render("analyst/reportForm", {
        evidence,
        report: reportRows[0] || null
    });
};

// Upload / Save forensic report
exports.uploadReport = async (req, res) => {
    try {
        const analystId = req.session.user.user_id;
        const { id } = req.params;
        const reportFile = req.file; // using multer for file upload
        const additional_notes = req.body.notes || "";

        if (!reportFile) return res.send("Please upload a report PDF");

        // Generate hash
        const fileBuffer = fs.readFileSync(reportFile.path);
        const reportHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        // Save to DB
        await db.execute(
            `INSERT INTO forensic_reports (evidence_id, analyst_id, report_file_path, report_hash, uploaded_at)
            VALUES (?, ?, ?, ?, NOW())`,
            [id, analystId, reportFile.path, reportHash]
        );

        // Update evidence status
        await db.execute(
            "UPDATE evidence SET current_status='report_uploaded' WHERE evidence_id=?",
            [id]
        );

        // Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address, details) VALUES (?, ?, ?, ?)",
            [analystId, `Uploaded forensic report for Evidence ID: ${id}`, req.ip, additional_notes]
        );

        res.redirect("/analyst/incoming");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading report");
    }
};

// View uploaded forensic reports
exports.viewReports = async (req, res) => {
    try {
        const analystId = req.session.user.user_id;

        const [rows] = await db.execute(`
            SELECT 
                fr.report_id,
                fr.report_file_path,
                fr.report_hash,
                fr.uploaded_at,
                e.case_id,
                e.current_status
            FROM forensic_reports fr
            JOIN evidence e ON fr.evidence_id = e.evidence_id
            WHERE fr.analyst_id = ?
            ORDER BY fr.uploaded_at DESC
        `, [analystId]);

        res.render("analyst/reports", { reports: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading forensic reports");
    }
};
