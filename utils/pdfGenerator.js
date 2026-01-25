const PDFDocument = require("pdfkit");
const fs = require("fs");

exports.generateForensicPDF = (evidence, report, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        // ===== WATERMARK =====
        doc.opacity(0.1)
            .fontSize(60)
            .text("FORENSIC REPORT", 100, 300, { rotate: 45 });

        doc.opacity(1);

        // ===== CONTENT =====
        doc.fontSize(18).text("Forensic Analysis Report", { align: "center" });
        doc.moveDown();

        doc.fontSize(12)
            .text(`Case ID: ${evidence.case_id}`)
            .text(`Description: ${evidence.description}`)
            .text(`Investigator: ${evidence.investigator}`)
            .text(`Collected At: ${evidence.timestamp_collected}`)
            .moveDown();

        doc.text("Tools Used:")
            .text(report.tools_used || "N/A")
            .moveDown();

        doc.text("Observations:")
            .text(report.observations || "N/A")
            .moveDown();

        doc.text("Findings:")
            .text(report.findings || "N/A")
            .moveDown();

        doc.text("Conclusion:")
            .text(report.conclusion || "N/A");

        doc.end();

        stream.on("finish", resolve);
        stream.on("error", reject);
    });
};
