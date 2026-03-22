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
            bufferPages: true   // 🔑 REQUIRED
        });

        const fileName = `Chain_of_Custody_${evidence.case_id}.pdf`;
        const filePath = path.join(__dirname, "../public/reports", fileName);

        doc.pipe(fs.createWriteStream(filePath));

        // ================================
        // PDF CONTENT 
        // ================================
        // Title
        doc.font("Helvetica-Bold")
            .fontSize(18)
            .text("CHAIN OF CUSTODY REPORT", { align: "center" });

        doc.moveDown(1.5);

        // Case metadata
        doc.font("Helvetica").fontSize(11);
        doc.text(`Case ID: ${evidence.case_id}`);
        doc.text(`Evidence Description: ${evidence.description}`);
        doc.text(`Current Status: ${evidence.current_status}`);
        doc.text(`Initial Hash: ${evidence.initial_hash}`);
        doc.text(`Final Hash: ${evidence.final_hash || "N/A"}`);
        doc.text("Blockchain Network: Ethereum Sepolia Testnet");

        doc.moveDown(1.5);

        // Chain of custody
        doc.font("Helvetica-Bold")
            .fontSize(14)
            .text("Chain of Custody Log", { underline: true });

        doc.moveDown();

        chain.forEach((c, index) => {
            doc.font("Helvetica-Bold").fontSize(11)
                .text(`Step ${index + 1}: ${c.action}`);

            doc.font("Helvetica").fontSize(10);
            doc.text(`Actor: ${c.username}`);
            doc.text(`Timestamp: ${new Date(c.timestamp).toLocaleString()}`);
            doc.text(`Database Hash: ${c.data_hash}`);
            doc.text(`Blockchain TX Hash: ${c.tx_hash || "N/A"}`);
            doc.moveDown();
        });

        // Forensic report summary
        if (report) {
            doc.addPage();
            doc.font("Helvetica-Bold")
                .fontSize(14)
                .text("Forensic Report Summary", { underline: true });

            doc.moveDown();
            doc.font("Helvetica").fontSize(11);
            doc.text(`Report File: ${report.report_file_path}`);
            doc.text(`Report Hash: ${report.report_hash}`);
            doc.text(`Uploaded At: ${new Date(report.uploaded_at).toLocaleString()}`);
        }

        // Legal notice
        doc.addPage();
        doc.font("Helvetica")
            .fontSize(10)
            .text(
                "This document is generated by a Blockchain-Based Chain of Custody Management System. " +
                "All custody records are protected using cryptographic hashing and blockchain anchoring " +
                "to ensure evidence integrity, authenticity, and compliance with Malaysian Forensic SOPs " +
                "and the Evidence Act 1950.",
                { align: "justify" }
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