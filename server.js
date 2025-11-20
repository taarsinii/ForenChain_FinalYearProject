const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
    session({
        secret: "yourSecretKey123",
        resave: false,
        saveUninitialized: false
    })
);

// Static public files
app.use("/public", express.static(path.join(__dirname, "public")));

// VIEW ENGINE (for now serve HTML files directly)
app.use(express.static(path.join(__dirname, "views")));

// ROUTES
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));