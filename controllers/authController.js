const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Admin registers users
exports.registerUser = (req, res) => {
    const { username, password, role } = req.body;

    const hashed = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(sql, [username, hashed, role], (err) => {
        if (err) return res.status(500).json({ message: "Error creating user" });

        res.json({ message: "User created successfully" });
    });
};

// Login
exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, data) => {
        if (err || data.length === 0)
            return res.status(400).json({ message: "Invalid username" });

        const user = data[0];

        const match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(400).json({ message: "Wrong password" });

        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login success",
            token,
            role: user.role
        });
    });
};
