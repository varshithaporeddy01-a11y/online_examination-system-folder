const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const questionRoutes = require("./routes/questionRoutes");
const examQuestionRoutes = require("./routes/examQuestionRoutes");
const studentExamRoutes = require("./routes/studentExamRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const resultRoutes = require("./routes/resultRoutes");
const studentExamViewRoutes = require("./routes/studentExamViewRoutes");
const studentAnswerRoutes = require("./routes/studentAnswerRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "test.html"));
});

app.get("/api/health", (req, res) => {
    db.query("SELECT 1 AS ok", (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Connected to MySQL"
        });
    });
});

app.get("/api/tables", (req, res) => {
    db.query("SHOW TABLES", (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        const key = rows[0] ? Object.keys(rows[0])[0] : null;
        res.json({
            success: true,
            tables: key ? rows.map((row) => row[key]) : []
        });
    });
});

app.post("/api/query", (req, res) => {
    const { sql } = req.body;

    if (!sql || typeof sql !== "string") {
        return res.status(400).json({
            success: false,
            message: "sql is required"
        });
    }

    db.query(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            rows
        });
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exam-questions", examQuestionRoutes);
app.use("/api/student-exams", studentExamRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/student-exam", studentExamViewRoutes);
app.use("/api/student-answers", studentAnswerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`OES server running on http://localhost:${PORT}`);
});
