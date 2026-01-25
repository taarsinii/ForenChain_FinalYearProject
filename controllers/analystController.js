const db = require("../config/db");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { logBlockchainEvent } = require("../utils/blockchainLogger");
const { generateChainHash } = require("../utils/hashChain");

// ================================
// Analyst Dashboard
// ================================
exports.dashboard = (req, res) => {
    res.render("analyst/dashboard");
};

// ================================
// Incoming Evidence
// ================================
exports.incomingEvidence = async (req, res) => {
    const [rows] = await db.execute(`
        SELECT e.*, u.username AS investigator
        FROM evidence e
        JOIN users u ON e.collected_by = u.user_id
        WHERE e.current_status = 'transferred_to_lab'
    `);
    res.render("analyst/incomingEvidence", { evidenceList: rows });
};

// ================================
// View Evidence (READ ONLY)
// ================================
exports.viewEvidence = async (req, res) => {
    const analystId = req.session.user.user_id;
    const { id } = req.params;

    const [[evidence]] = await db.execute(`
        SELECT e.*, u.username AS investigator
        FROM evidence e
        JOIN users u ON e.collected_by = u.user_id
        WHERE e.evidence_id =?
    `, [id]);

    const [[analysis]] = await db.execute(`
        SELECT * FROM forensic_analysis
        WHERE evidence_id =? AND analyst_id =?
    `, [id, analystId]);

    res.render("analyst/viewEvidence", {
        evidence,
        analysis,
        saved: req.query.saved
    });
};

// ================================
// Download Original Evidence File (Image)
// ================================
exports.downloadEvidence = async (req, res) => {
    try {
        const { id } = req.params;

        const [[evidence]] = await db.execute(
            "SELECT photo_path FROM evidence WHERE evidence_id=?",
            [id]
        );

        if (!evidence || !evidence.photo_path) {
            return res.status(404).send("Evidence file not found");
        }

        const filePath = path.join(__dirname, "..", evidence.photo_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send("File does not exist on server");
        }

        res.download(filePath);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error downloading evidence file");
    }
};


// ================================
// Show Analysis Form
// ================================
exports.showAnalysisForm = async (req, res) => {
    const analystId = req.session.user.user_id;
    const { id } = req.params;

    const [[evidence]] = await db.execute(
        "SELECT * FROM evidence WHERE evidence_id=?",
        [id]
    );

    const [[analysis]] = await db.execute(
        "SELECT * FROM forensic_analysis WHERE evidence_id=? AND analyst_id=?",
        [id, analystId]
    );

    res.render("analyst/analysisForm", { evidence, analysis });
};

// ================================
// Save / Update Analysis (DRAFT)
// ================================
exports.saveAnalysis = async (req, res) => {
    const analystId = req.session.user.user_id;
    const { id } = req.params;
    const { tools_used, methodology, observations, conclusion } = req.body;

    const [[existing]] = await db.execute(
        "SELECT * FROM forensic_analysis WHERE evidence_id=? AND analyst_id=?",
        [id, analystId]
    );

    if (existing) {
        await db.execute(`
            UPDATE forensic_analysis
            SET tools_used =?, methodology =?, observations =?, conclusion =?
    WHERE evidence_id =? AND analyst_id =?
        `, [tools_used, methodology, observations, conclusion, id, analystId]);
    } else {
        await db.execute(`
            INSERT INTO forensic_analysis
    (evidence_id, analyst_id, tools_used, methodology, observations, conclusion)
VALUES(?, ?, ?, ?, ?, ?)
    `, [id, analystId, tools_used, methodology, observations, conclusion]);
    }

    res.redirect(`/analyst/view/${id}?saved=1`);
};

// Ensure reports directory exists
const reportsDir = path.join(__dirname, "..", "uploads", "reports");

if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// ================================
// Finalize & Generate PDF
// ================================
function addWatermark(doc, text) {
    doc.save();
    doc.rotate(-45, { origin: [300, 400] });
    doc.fontSize(50)
        .fillColor('gray')
        .opacity(0.15)
        .text(text, 100, 300, { align: 'center' });
    doc.restore();
}

exports.finalizeReport = async (req, res) => {
    const analystId = req.session.user.user_id;
    const { id } = req.params;

    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, "..", "uploads", "reports");
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const [[evidence]] = await db.execute(`
        SELECT e.*, u.full_name AS analyst_name
        FROM evidence e
        JOIN users u ON u.user_id = ?
    WHERE e.evidence_id = ?
        `, [analystId, id]);

    const [[analysis]] = await db.execute(
        "SELECT * FROM forensic_analysis WHERE evidence_id=? AND analyst_id=?",
        [id, analystId]
    );

    if (!analysis) {
        return res.send("No analysis found. Please save analysis before finalizing.");
    }

    if (analysis.is_finalized === 1) {
        return res.send("This forensic report has already been finalized.");
    }

    // Lock analysis
    await db.execute(
        "UPDATE forensic_analysis SET is_finalized=1 WHERE analysis_id=?",
        [analysis.analysis_id]
    );

    const pdfPath = path.join(reportsDir, `report_${id}.pdf`);
    const doc = new PDFDocument({
        size: "A4",
        margins: {
            top: 72,
            bottom: 72,
            left: 72,
            right: 72
        }
    });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // Watermark
    addWatermark(doc, "FORENSIC REPORT - CONFIDENTIAL");

    // ================================
    // TITLE
    // ================================
    doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("FORENSIC ANALYSIS REPORT", { align: "center" });

    doc.moveDown(1.5);

    // ================================
    // CASE METADATA
    // ================================
    doc.font("Helvetica").fontSize(11);

    doc.text(`Case ID: ${evidence.case_id} `);
    doc.text(`Analyst: ${evidence.analyst_name} `);
    doc.text(`Generated On: ${new Date().toLocaleString()} `);
    doc.text(`System: ForenChain – Blockchain Chain of Custody`);

    doc.moveDown(1);

    // ================================
    // EVIDENCE DETAILS
    // ================================
    doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("1. Evidence Details", { underline: true });

    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(11);
    doc.text(`Description: ${evidence.description} `);
    doc.text(`Current Status: ${evidence.current_status} `);

    doc.moveDown(1);

    // ================================
    // FORENSIC ANALYSIS
    // ================================
    doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("2. Forensic Analysis", { underline: true });

    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(11).text("Tools Used:");
    doc.font("Helvetica").text(analysis.tools_used || "-");

    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(11).text("Methodology:");
    doc.font("Helvetica").text(analysis.methodology || "-");

    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(11).text("Observations:");
    doc.font("Helvetica").text(analysis.observations || "-");

    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").fontSize(11).text("Conclusion:");
    doc.font("Helvetica").text(analysis.conclusion || "-");

    doc.moveDown(2);

    // ================================
    // FOOTER
    // ================================
    doc
        .font("Helvetica-Oblique")
        .fontSize(9)
        .fillColor("gray")
        .text(
            "This forensic report is system-generated and digitally preserved. Any modification invalidates evidentiary integrity.",
            { align: "center" }
        );

    doc.end();

    // ✅ WAIT UNTIL FILE IS FULLY CLOSED
    stream.on("close", async () => {
        const fileBuffer = fs.readFileSync(pdfPath);
        const reportHash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

        await db.execute(`
    INSERT INTO forensic_reports
    (evidence_id, analyst_id, report_file_path, report_hash, uploaded_at)
    VALUES (?, ?, ?, ?, NOW())
`, [
            id,
            analystId,
            `uploads/reports/report_${id}.pdf`,
            reportHash
        ]);

        // Update evidence status
        await db.execute(
            "UPDATE evidence SET current_status='analysis_pending_supervisor' WHERE evidence_id=?",
            [id]
        );

        // get last hash
        const [[last]] = await db.execute(
            "SELECT data_hash FROM evidence_chain WHERE evidence_id=? ORDER BY block_id DESC LIMIT 1",
            [id]
        );

        const timestamp = new Date().toISOString();

        const chainHash = generateChainHash({
            previousHash: last.data_hash,
            evidenceId: id,
            action: "Forensic Report Finalized",
            actorId: analystId,
            timestamp,
            extraData: reportHash
        });

        // 🔗 BLOCKCHAIN ANCHOR (MISSING PART FIXED)
        const txHash = await logBlockchainEvent(
            id,
            "Forensic Report Finalized",
            chainHash
        );

        // 🔒 SAVE TO CHAIN
        await db.execute(`
    INSERT INTO evidence_chain
    (evidence_id, action, actor_id, data_hash, previous_hash, tx_hash)
VALUES(?, ?, ?, ?, ?, ?)
    `, [id, "Forensic Report Finalized", analystId, chainHash, last.data_hash, txHash]);


        res.redirect("/analyst/reports");
    });
};

// ================================
// View Generated Reports
// ================================
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
        res.status(500).send("Error loading reports");
    }
};

// ==================================
// Evidence Ready for Prosecutor
// ==================================
exports.readyForProsecutor = async (req, res) => {
    try {
        const analystId = req.session.user.user_id;

        const [rows] = await db.execute(`
            SELECT e.evidence_id, e.case_id, e.description, e.current_status
            FROM evidence e
            JOIN forensic_reports fr ON e.evidence_id = fr.evidence_id
            WHERE fr.analyst_id = ?
    AND e.current_status = 'analysis_approved_supervisor'
        `, [analystId]);

        res.render("analyst/readyForProsecutor", { evidenceList: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading cases for prosecutor");
    }
};

// ================================
// Transfer Evidence to Prosecutor
// ================================
exports.transferToProsecutor = async (req, res) => {
    try {
        const analystId = req.session.user.user_id;
        const { id } = req.params;

        // Find a prosecutor
        const [[prosecutor]] = await db.execute(
            "SELECT user_id FROM users WHERE role='prosecutor' LIMIT 1"
        );

        if (!prosecutor) {
            return res.send("No prosecutor available");
        }

        // Create signature hash
        const signatureHash = crypto
            .createHash("sha256")
            .update(`${id} -${analystId} -${prosecutor.user_id} -${Date.now()} `)
            .digest("hex");

        // Save transfer
        await db.execute(`
            INSERT INTO transfers
    (evidence_id, sender_id, receiver_id, transfer_type, signature_hash)
VALUES(?, ?, ?, 'to_prosecutor', ?)
    `, [id, analystId, prosecutor.user_id, signatureHash]);

        // Update evidence
        await db.execute(
            "UPDATE evidence SET current_status='completed' WHERE evidence_id=?",
            [id]
        );

        // Blockchain log
        const txHash = await logBlockchainEvent(id, "Transferred to Prosecutor");

        await db.execute(`
            INSERT INTO evidence_chain
    (evidence_id, action, actor_id, data_hash, tx_hash)
VALUES(?, ?, ?, ?, ?)
        `, [
            id,
            "Transferred to Prosecutor",
            analystId,
            signatureHash,
            txHash
        ]);

        // Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address, details) VALUES (?, ?, ?, ?)",
            [
                analystId,
                "Transferred evidence to prosecutor",
                req.ip,
                `Evidence ID ${id}, Signature ${signatureHash} `
            ]
        );

        res.redirect("/analyst/ready");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error transferring evidence");
    }
};

exports.submitForSupervisorReview = async (req, res) => {
    const analystId = req.session.user.user_id;
    const { id } = req.params;

    await db.execute(
        "UPDATE evidence SET current_status='analysis_pending_supervisor' WHERE evidence_id=?",
        [id]
    );

    await AuditLog.log({
        user_id: analystId,
        action: "ANALYSIS_SUBMITTED_FOR_SUPERVISOR_REVIEW",
        details: `Evidence ID ${id} `,
        ip: req.ip
    });

    res.redirect("/analyst/dashboard");
};
