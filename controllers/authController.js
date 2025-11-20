const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.showLogin = (req, res) => {
    res.sendFile("login.html", { root: "views" });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);

    if (rows.length === 0) {
        return res.send("User not found");
    }

    const user = rows[0];

    // Check password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return res.send("Incorrect password");
    }

    // Store session
    req.session.user = {
        id: user.user_id,
        role: user.role,
        name: user.full_name
    };

    // Redirect by role
    switch (user.role) {
        case "admin":
            res.redirect("/admin/dashboard");
            break;
        case "investigator":
            res.redirect("/investigator/dashboard");
            break;
        case "supervisor":
            res.redirect("/supervisor/dashboard");
            break;
        case "analyst":
            res.redirect("/analyst/dashboard");
            break;
        case "prosecutor":
            res.redirect("/prosecutor/dashboard");
            break;
        default:
            res.send("Role not recognized");
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
};
