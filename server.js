const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(session({
    secret: "yourSecretKey123",
    resave: false,
    saveUninitialized: false
}));

// Serve public files
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// Default route
app.get("/", (req, res) => res.redirect("/login"));

app.get("/admin/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "views/administrator/dashboard.html"));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));