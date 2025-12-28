const db = require("../config/db");

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
