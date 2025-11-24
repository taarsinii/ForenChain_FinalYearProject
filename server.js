const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

app.use(express.static('public'));

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
    session({
        secret: "MySecretKey123",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,  // set to true only if using HTTPS
            // maxAge not set, so session will last until browser is closed
        }
    })
);

// Public folder
app.use("/public", express.static(path.join(__dirname, "public")));

// ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/", authRoutes);        // /login, /logout, POST login
app.use("/admin", adminRoutes);  // admin dashboard, manage users, audit logs

const evidenceRoutes = require("./routes/evidenceRoutes");
app.use("/investigator", require("./routes/evidenceRoutes"))

// Make sure this is BEFORE your 404 handler
app.use("/evidence", evidenceRoutes);

// Default redirect
app.get("/", (req, res) => res.redirect("/login"));


// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
