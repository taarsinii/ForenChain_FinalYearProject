const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
    session({
        secret: "yourSecretKey123",
        resave: false,
        saveUninitialized: false,
    })
);

// Public folder
app.use("/public", express.static(path.join(__dirname, "public")));

// ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/", authRoutes);        // /login, /logout, POST login
app.use("/admin", adminRoutes);  // admin dashboard, manage users, audit logs

// Default redirect
app.get("/", (req, res) => res.redirect("/login"));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
