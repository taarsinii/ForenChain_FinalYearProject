const db = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ================================
// FUNCTION ADD FOOTER (FOR REPORT)
// ================================
function addFooter(doc) {
    const range = doc.bufferedPageRange(); // { start, count }

    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.font("Helvetica")
            .fontSize(9)
            .fillColor("gray")
            .text(
                `Generated on: ${new Date().toLocaleString()} | Page ${i - range.start + 1} of ${range.count}`,
                50,
                doc.page.height - 40,
                { align: "center" }
            );
    }
}

// ================================
// Prosecutor Dashboard
// ================================
exports.dashboard = async (req, res) => {
    try {
        const [cases] = await db.execute(`
            SELECT e.*, u.username AS investigator
            FROM evidence e
            JOIN users u ON e.collected_by = u.user_id
            WHERE e.current_status='completed'
            ORDER BY e.timestamp_collected DESC
        `);

        res.render("prosecutor/dashboard", { cases });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading cases");
    }
};

// ================================
// View Case 
// ================================
exports.viewCase = async (req, res) => {
    const { id } = req.params;

    const [evidence] = await db.execute(
        "SELECT * FROM evidence WHERE evidence_id=?",
        [id]
    );

    const [chain] = await db.execute(
        "SELECT * FROM evidence_chain WHERE evidence_id=? ORDER BY block_id ASC",
        [id]
    );

    const [report] = await db.execute(
        "SELECT * FROM forensic_reports WHERE evidence_id=?",
        [id]
    );

    res.render("prosecutor/viewCase", {
        evidence: evidence[0],
        chain,
        report: report[0]
    });
};

exports.exportChainPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.user_id;

        // ================================
        // 1️. Fetch evidence
        // ================================
        const [evidenceRows] = await db.execute(
            "SELECT * FROM evidence WHERE evidence_id=?",
            [id]
        );
        const evidence = evidenceRows[0];

        // ================================
        // 2️. Fetch chain of custody
        // ================================
        const [chain] = await db.execute(
            "SELECT ec.*, u.username FROM evidence_chain ec JOIN users u ON ec.actor_id=u.user_id WHERE evidence_id=? ORDER BY block_id ASC",
            [id]
        );

        // ================================
        // 3️. Fetch forensic report
        // ================================
        const [reportRows] = await db.execute(
            "SELECT * FROM forensic_reports WHERE evidence_id=?",
            [id]
        );
        const report = reportRows[0];

        // ================================
        // 4️. Create PDF
        // ================================
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
            bufferPages: true
        });

        const fileName = `Chain_of_Custody_${evidence.case_id}.pdf`;
        const filePath = path.join(__dirname, "../public/reports", fileName);
        doc.pipe(fs.createWriteStream(filePath));

        // --- HEADER SECTION ---
        doc.font("Helvetica-Bold").fontSize(18).text("CHAIN OF CUSTODY REPORT", { align: "center" });
        doc.moveDown(1);

        // Horizontal Rule
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
        doc.moveDown(1);

        // --- METADATA SECTION ---
        doc.font("Helvetica-Bold").fontSize(11).text("Case Details:");
        doc.font("Helvetica").fontSize(10);
        const metadata = [
            ["Case ID:", evidence.case_id],
            ["Description:", evidence.description],
            ["Current Status:", evidence.current_status],
            ["Initial Hash:", evidence.initial_hash],
            ["Final Hash:", evidence.final_hash || "N/A"],
            ["Network:", "Ethereum Sepolia Testnet"]
        ];

        metadata.forEach(([label, value]) => {
            doc.text(`${label} `, { continued: true }).font("Helvetica-Bold").text(value).font("Helvetica");
        });

        doc.moveDown(2);

        // --- LOG SECTION ---
        doc.font("Helvetica-Bold").fontSize(14).text("Chain of Custody Log", { underline: true });
        doc.moveDown(0.5);

        chain.forEach((c, index) => {
            // Check if we are near the bottom of the page to prevent "orphaned" headers
            if (doc.y > 700) doc.addPage();

            doc.font("Helvetica-Bold").fontSize(11).fillColor("#2c3e50")
                .text(`Step ${index + 1}: ${c.action}`);

            doc.font("Helvetica").fontSize(10).fillColor("black");
            doc.text(`Actor: ${c.username}`);
            doc.text(`Timestamp: ${new Date(c.timestamp).toLocaleString()}`);
            doc.text(`Database Hash: `, { continued: true }).fontSize(9).text(c.data_hash);
            doc.fontSize(10).text(`Blockchain TX: `, { continued: true }).fontSize(9).text(c.tx_hash || "N/A");
            doc.moveDown(0.8);
        });

        // --- FORENSIC SUMMARY (Only add page if there's no room) ---
        if (report) {
            if (doc.y > 600) doc.addPage(); // Smart page break
            else doc.moveDown(2);

            doc.font("Helvetica-Bold").fontSize(14).text("Forensic Report Summary", { underline: true });
            doc.moveDown(0.5);
            doc.font("Helvetica").fontSize(11);
            doc.text(`Report File: ${report.report_file_path}`);
            doc.text(`Report Hash: ${report.report_hash}`);
            doc.text(`Uploaded At: ${new Date(report.uploaded_at).toLocaleString()}`);
        }

        // --- LEGAL NOTICE ---
        // Move to bottom of the current page or next page
        if (doc.y > 650) doc.addPage();
        else doc.moveDown(3);

        doc.rect(50, doc.y, 495, 60).fill("#f9f9f9"); // Light gray box for notice
        doc.fillColor("#444444").fontSize(9).text(
            "This document is generated by a Blockchain-Based Chain of Custody Management System. " +
            "All custody records are protected using cryptographic hashing and blockchain anchoring " +
            "to ensure evidence integrity and compliance with the Evidence Act 1950.",
            55, doc.y + 10, { width: 485, align: "justify" }
        );

        addFooter(doc);
        doc.end();

        // ================================
        // 5. Audit log
        // ================================
        await db.execute(
            "INSERT INTO audit_logs (user_id, action, user_ip_address, details) VALUES (?, ?, ?, ?)",
            [userId, "Exported Chain of Custody PDF", req.ip, `Evidence ID ${id}`]
        );

        // ================================
        // 6. Download
        // ================================
        res.download(filePath);

    } catch (err) {
        console.error(err);
        res.status(500).send("PDF generation failed");
    }
};

const { generateChainHash } = require("../utils/hashChain");

// ================================
// View Blockchain Page 
// ================================
exports.viewBlockchain = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Fetch custody chain 
        const [chain] = await db.execute(`
            SELECT 
                ec.block_id,
                ec.evidence_id,
                ec.actor_id,
                ec.action,
                ec.timestamp,
                ec.data_hash AS db_hash,
                ec.previous_hash,
                ec.tx_hash,
                u.username AS actor
            FROM evidence_chain ec
            JOIN users u ON ec.actor_id = u.user_id
            WHERE ec.evidence_id = ?
            ORDER BY ec.block_id ASC
        `, [id]);

        if (chain.length === 0) {
            return res.send("No blockchain records found");
        }

        // 2️⃣ Verify each block (REAL VERIFICATION)
        const chainWithStatus = chain.map((c, index) => {

            // 🔗 Determine previous hash
            let previousHash = null;
            if (index > 0) {
                previousHash = chain[index - 1].db_hash;
            }

            // 🔐 Recalculate hash
            let recalculatedHash;
            try {
                recalculatedHash = generateChainHash({
                    previousHash: previousHash,
                    evidenceId: c.evidence_id,
                    action: c.action,
                    actorId: c.actor_id,
                    timestamp: new Date(c.timestamp).toISOString(),
                    extraData: ""
                });
            } catch (err) {
                console.error("Hash recalculation error:", err);
                recalculatedHash = null;
            }

            // ✅ Compare hashes
            const hashMatch = (recalculatedHash === c.db_hash);

            // 🔗 Check blockchain anchoring
            const blockchainExists = c.tx_hash ? true : false;

            // 🎯 Final status logic
            let status = "Verified";
            if (!hashMatch) {
                status = "Tampered";
            } else if (!blockchainExists) {
                status = "Not Anchored";
            }

            return {
                ...c,
                recalculatedHash,
                status
            };
        });

        // 3️⃣ Send to frontend
        res.render("prosecutor/blockchainView", {
            evidenceId: id,
            chain: chainWithStatus
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Blockchain verification failed");
    }
};