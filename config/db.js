const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === "true"
            ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
            : undefined
    };

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.log("DB Connection Failed:", err.message);
    } else {
        console.log("MySQL Connected Successfully");
    }
});

module.exports = db;
