const mysql = require("mysql2/promise");
const db = mysql.createPool({

    host: "localhost",
    user: "root",
    password: "Taarsinii123!",
    database: "forenchain_system"

});

module.exports = db;