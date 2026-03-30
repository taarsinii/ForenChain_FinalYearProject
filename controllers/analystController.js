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
// Helper for Watermarking
function addWatermark(doc, text) {
    doc.save();
    doc.rotate(-45, { origin: [300, 400] });
    doc.fontSize(45)
        .fillColor('#cbd5e1')
        .opacity(0.1)
        .text(text, 50, 300, { align: 'center', width: 500 });
    doc.restore();
}

exports.finalizeReport = async (req, res) => {
    const analystId = req.session.user.user_id;
    const { id } = req.params;

    try {
        const reportsDir = path.join(__dirname, "..", "uploads", "reports");
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

        // Fetch Data
        const [[evidence]] = await db.execute(`
            SELECT e.*, u.full_name AS analyst_name 
            FROM evidence e 
            JOIN users u ON u.user_id = ? 
            WHERE e.evidence_id = ?`,
            [analystId, id]);

        const [[analysis]] = await db.execute(
            "SELECT * FROM forensic_analysis WHERE evidence_id=? AND analyst_id=?",
            [id, analystId]
        );

        if (!analysis || analysis.is_finalized === 1) {
            return res.status(400).send("Report cannot be finalized (missing data or already locked).");
        }

        // Lock Record
        await db.execute("UPDATE forensic_analysis SET is_finalized=1 WHERE analysis_id=?", [analysis.analysis_id]);

        const pdfPath = path.join(reportsDir, `report_${id}.pdf`);

        // --- PDF GENERATION START ---
        const doc = new PDFDocument({
            size: "A4",
            margins: { top: 50, bottom: 60, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // ===============================
        // 🎨 HEADER
        // ===============================
        doc
            .rect(0, 0, 612, 60)
            .fill("#0f172a");

        doc
            .fillColor("#ffffff")
            .font("Helvetica-Bold")
            .fontSize(14)
            .text("FORENCHAIN DIGITAL LEDGER SYSTEM", 50, 22);

        // Title
        doc.moveDown(2);

        doc
            .fillColor("#1e293b")
            .font("Helvetica-Bold")
            .fontSize(22)
            .text("FORENSIC ANALYSIS REPORT");

        doc
            .moveTo(50, doc.y + 5)
            .lineTo(200, doc.y + 5)
            .lineWidth(3)
            .strokeColor("#3b82f6")
            .stroke();

        doc.moveDown(1.5);

        // ===============================
        // 📌 CASE INFORMATION (Clean Block)
        // ===============================
        const labelStyle = () =>
            doc.fillColor("#64748b").font("Helvetica-Bold").fontSize(10);

        const valueStyle = () =>
            doc.fillColor("#0f172a").font("Helvetica").fontSize(10);

        function addField(label, value) {
            labelStyle();
            doc.text(label);

            valueStyle();
            doc.text(value);

            doc.moveDown(0.6);
        }

        addField("Case Identifier", evidence.case_id);
        addField("Lead Analyst", evidence.analyst_name);
        addField("Current Status", evidence.current_status.toUpperCase());
        addField("Generation Date", new Date().toLocaleString());
        addField("Protocol Version", "v2.0.4-SECURE");
        addField("Ledger Anchor", "ACTIVE");

        doc.moveDown(1);

        // Divider
        doc
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .lineWidth(1)
            .strokeColor("#e2e8f0")
            .stroke();

        doc.moveDown(1);

        // ===============================
        // 📄 SECTION HELPER
        // ===============================
        function addSection(title, content) {
            // Section Title
            doc
                .fillColor("#3b82f6")
                .font("Helvetica-Bold")
                .fontSize(12)
                .text(title);

            doc.moveDown(0.3);

            // Underline
            doc
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .lineWidth(0.5)
                .strokeColor("#cbd5e1")
                .stroke();

            doc.moveDown(0.6);

            // Content
            doc
                .fillColor("#334155")
                .font("Helvetica")
                .fontSize(10)
                .text(content || "Not Documented.", {
                    width: 495,
                    align: "left",
                    lineGap: 4
                });

            doc.moveDown(1.5);
        }

        // ===============================
        // 📑 REPORT CONTENT
        // ===============================
        addSection("I. EVIDENCE DESCRIPTION", evidence.description);
        addSection("II. FORENSIC TOOLS & ENVIRONMENT", analysis.tools_used);
        addSection("III. ANALYSIS METHODOLOGY", analysis.methodology);
        addSection("IV. OBSERVATIONS & LOGS", analysis.observations);
        addSection("V. FINAL DETERMINATION", analysis.conclusion);

        // ===============================
        // 🔒 WATERMARK (LIGHT + CLEAN)
        // ===============================
        doc.save();
        doc.rotate(-45, { origin: [300, 400] });
        doc
            .fontSize(40)
            .fillColor("#94a3b8")
            .opacity(0.08)
            .text("CONFIDENTIAL", 100, 300, {
                width: 400,
                align: "center"
            });
        doc.restore();

        // ===============================
        // 📎 FOOTER
        // ===============================
        const footerY = doc.page.height - 50;

        doc
            .moveTo(50, footerY - 10)
            .lineTo(545, footerY - 10)
            .lineWidth(0.5)
            .strokeColor("#e2e8f0")
            .stroke();

        doc
            .fillColor("#64748b")
            .font("Helvetica-Oblique")
            .fontSize(8)
            .text(
                "This report is cryptographically hashed and securely anchored within the ForenChain blockchain system. Any unauthorized modification invalidates its integrity and legal admissibility.",
                50,
                footerY,
                {
                    align: "center",
                    width: 495
                }
            );

        doc.end();

        // --- DATABASE & BLOCKCHAIN UPDATES ---
        stream.on("close", async () => {
            const fileBuffer = fs.readFileSync(pdfPath);
            const reportHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

            // Save report link
            await db.execute(`
                INSERT INTO forensic_reports (evidence_id, analyst_id, report_file_path, report_hash, uploaded_at)
                VALUES (?, ?, ?, ?, NOW())`,
                [id, analystId, `uploads/reports/report_${id}.pdf`, reportHash]);

            // Status Update
            await db.execute("UPDATE evidence SET current_status='analysis_pending_supervisor' WHERE evidence_id=?", [id]);

            // Chain of Custody Logic
            const [[last]] = await db.execute("SELECT data_hash FROM evidence_chain WHERE evidence_id=? ORDER BY block_id DESC LIMIT 1", [id]);
            const timestamp = new Date().toISOString();
            const chainHash = generateChainHash({
                previousHash: last.data_hash,
                evidenceId: id,
                action: "Forensic Report Finalized",
                actorId: analystId,
                timestamp,
                extraData: reportHash
            });

            const txHash = await logBlockchainEvent(id, "Forensic Report Finalized", chainHash);

            await db.execute(`
                INSERT INTO evidence_chain (evidence_id, action, actor_id, data_hash, previous_hash, tx_hash)
                VALUES(?, ?, ?, ?, ?, ?)`,
                [id, "Forensic Report Finalized", analystId, chainHash, last.data_hash, txHash]);

            res.redirect("/analyst/reports");
        });

    } catch (err) {
        console.error("PDF Finalize Error:", err);
        res.status(500).send("Critical error during PDF generation.");
    }
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

        // 1️⃣ Find prosecutor
        const [[prosecutor]] = await db.execute(
            "SELECT user_id FROM users WHERE role='prosecutor' LIMIT 1"
        );

        if (!prosecutor) {
            return res.send("No prosecutor available");
        }

        // 2️⃣ Create transfer signature (proof of handover)
        const signatureHash = crypto
            .createHash("sha256")
            .update(`${id}-${analystId}-${prosecutor.user_id}-${Date.now()}`)
            .digest("hex");

        // 3️⃣ Save transfer record
        await db.execute(`
            INSERT INTO transfers
            (evidence_id, sender_id, receiver_id, transfer_type, signature_hash)
            VALUES (?, ?, ?, 'to_prosecutor', ?)
        `, [id, analystId, prosecutor.user_id, signatureHash]);

        // 4️⃣ Update evidence status
        await db.execute(
            "UPDATE evidence SET current_status='completed' WHERE evidence_id=?",
            [id]
        );

        // 🔗 5️⃣ FETCH LAST BLOCK (CRITICAL FIX)
        const [[last]] = await db.execute(
            "SELECT data_hash FROM evidence_chain WHERE evidence_id=? ORDER BY block_id DESC LIMIT 1",
            [id]
        );

        // 6️⃣ CREATE CHAINED BLOCK HASH (FIXED)
        const timestamp = new Date().toISOString();

        const chainHash = generateChainHash({
            previousHash: last.data_hash,
            evidenceId: id,
            action: "Transferred to Prosecutor",
            actorId: analystId,
            timestamp,
            extraData: signatureHash
        });

        // 7️⃣ Blockchain anchor (Ethereum / Testnet)
        const txHash = await logBlockchainEvent(
            id,
            "Transferred to Prosecutor",
            chainHash
        );

        // 🔒 8️⃣ SAVE FULL BLOCK (FIXED)
        await db.execute(`
            INSERT INTO evidence_chain
            (evidence_id, action, actor_id, data_hash, previous_hash, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            id,
            "Transferred to Prosecutor",
            analystId,
            chainHash,
            last.data_hash,
            txHash
        ]);

        // 9️⃣ Audit log
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address, details) VALUES (?, ?, ?, ?)",
            [
                analystId,
                "EVIDENCE_TRANSFERRED_TO_PROSECUTOR",
                req.ip,
                `Evidence ID ${id}, Signature ${signatureHash}`
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

