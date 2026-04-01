const db = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const contract = require("../utils/blockchain");

// ================================
// FUNCTION ADD FOOTER (FOR REPORT)
// ================================
function addFooter(doc) {
    const range = doc.bufferedPageRange();

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

// ================================
// Export Chain of Custody PDF
// ================================
exports.exportChainPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.user_id;

        const [evidenceRows] = await db.execute(
            "SELECT * FROM evidence WHERE evidence_id=?",
            [id]
        );
        const evidence = evidenceRows[0];

        if (!evidence) {
            return res.status(404).send("Evidence not found");
        }

        const [chain] = await db.execute(
            `SELECT ec.*, u.username
             FROM evidence_chain ec
             JOIN users u ON ec.actor_id = u.user_id
             WHERE ec.evidence_id = ?
             ORDER BY ec.block_id ASC`,
            [id]
        );

        const [reportRows] = await db.execute(
            "SELECT * FROM forensic_reports WHERE evidence_id=?",
            [id]
        );
        const report = reportRows[0];

        const fileName = `Chain_of_Custody_${evidence.case_id}.pdf`;
        const filePath = path.join(__dirname, "../public/reports", fileName);

        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
            bufferPages: true
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.font("Helvetica-Bold")
            .fontSize(18)
            .text("CHAIN OF CUSTODY REPORT", { align: "center" });
        doc.moveDown(1);

        doc.moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .strokeColor("#cccccc")
            .stroke();
        doc.moveDown(1);

        // Metadata
        doc.font("Helvetica-Bold").fontSize(11).text("Case Details:");
        doc.font("Helvetica").fontSize(10);

        const metadata = [
            ["Case ID:", evidence.case_id],
            ["Description:", evidence.description],
            ["Current Status:", evidence.current_status],
            ["Initial Hash:", evidence.initial_hash || "N/A"],
            ["Final Hash:", evidence.final_hash || "N/A"],
            ["Network:", "Ethereum Sepolia Testnet"]
        ];

        metadata.forEach(([label, value]) => {
            doc.font("Helvetica-Bold").text(label, { continued: true });
            doc.font("Helvetica").text(` ${value}`);
        });

        doc.moveDown(2);

        // Chain log
        doc.font("Helvetica-Bold")
            .fontSize(14)
            .text("Chain of Custody Log", { underline: true });

        doc.moveDown(0.5);

        chain.forEach((c, index) => {
            if (doc.y > 700) doc.addPage();

            doc.font("Helvetica-Bold")
                .fontSize(11)
                .fillColor("#2c3e50")
                .text(`Step ${index + 1}: ${c.action}`);

            doc.font("Helvetica")
                .fontSize(10)
                .fillColor("black");

            doc.text(`Actor: ${c.username}`);
            doc.text(`Timestamp: ${new Date(c.timestamp).toLocaleString()}`);
            doc.text(`Database Hash: ${c.data_hash}`);
            doc.text(`Previous Hash: ${c.previous_hash || "GENESIS"}`);
            doc.text(`Blockchain TX: ${c.tx_hash || "N/A"}`);
            doc.moveDown(0.8);
        });

        // Report summary
        if (report) {
            if (doc.y > 600) doc.addPage();
            else doc.moveDown(2);

            doc.font("Helvetica-Bold")
                .fontSize(14)
                .text("Forensic Report Summary", { underline: true });

            doc.moveDown(0.5);
            doc.font("Helvetica").fontSize(11);
            doc.text(`Report File: ${report.report_file_path}`);
            doc.text(`Report Hash: ${report.report_hash}`);
            doc.text(`Uploaded At: ${new Date(report.uploaded_at).toLocaleString()}`);
        }

        // Legal notice
        if (doc.y > 650) doc.addPage();
        else doc.moveDown(3);

        const legalY = doc.y;
        doc.rect(50, legalY, 495, 60).fill("#f9f9f9");

        doc.fillColor("#444444")
            .fontSize(9)
            .text(
                "This document is generated by a Blockchain-Based Chain of Custody Management System. All custody records are protected using cryptographic hashing and blockchain anchoring to ensure evidence integrity and compliance with the Evidence Act 1950.",
                55,
                legalY + 10,
                { width: 485, align: "justify" }
            );

        addFooter(doc);
        doc.end();

        stream.on("finish", async () => {
            await db.execute(
                "INSERT INTO audit_logs (user_id, action, user_ip_address, details) VALUES (?, ?, ?, ?)",
                [userId, "Exported Chain of Custody PDF", req.ip, `Evidence ID ${id}`]
            );

            res.download(filePath);
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("PDF generation failed");
    }
};

// ================================
// View Blockchain Page
// ================================
exports.viewBlockchain = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 Get chain from database
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

        // 🔹 Fetch blockchain (on-chain events)
        let onChainEvents = [];
        try {
            onChainEvents = await contract.getEvents(Number(id));
        } catch (err) {
            console.error("Failed to fetch blockchain events:", err.message);
        }

        // 🔥 NEW: CHAIN TAMPER PROPAGATION LOGIC
        let chainBroken = false;

        const chainWithStatus = chain.map((c, index) => {
            const previousDbHash = index === 0 ? null : chain[index - 1].db_hash;

            // ============================
            // 1. Internal Chain Check
            // ============================
            let internalMatch = false;

            if (index === 0) {
                internalMatch =
                    c.previous_hash === null ||
                    c.previous_hash === "" ||
                    c.previous_hash === undefined;
            } else {
                internalMatch = c.previous_hash === previousDbHash;
            }

            // 🔥 CRITICAL FIX: propagate tampering forward
            if (!internalMatch || chainBroken) {
                chainBroken = true;
            }

            // ============================
            // 2. Blockchain Verification
            // ============================
            let blockchainHash = null;
            let blockchainMatch = false;

            const matchingEvent = onChainEvents.find(
                (e) => e.dataHash === c.db_hash
            );

            if (matchingEvent) {
                blockchainHash = matchingEvent.dataHash;
                blockchainMatch = true;
            }

            // ============================
            // 3. Final Status Decision
            // ============================
            let status = "Verified";

            if (chainBroken) {
                status = "Tampered";
            } else if (!c.tx_hash) {
                status = "Not Anchored";
            } else if (!blockchainMatch) {
                status = "Tampered";
            }

            return {
                ...c,
                blockchain_hash: blockchainHash,
                internalMatch,
                blockchainMatch,
                status
            };
        });

        // 🔹 Render to UI
        res.render("prosecutor/blockchainView", {
            evidenceId: id,
            chain: chainWithStatus
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Blockchain verification failed");
    }
};