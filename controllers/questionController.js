


// ==========================
// ADD QUESTION (MCQ + AUTO-EVAL READY)
// ==========================
const db = require("../config/db");


// ==========================
// ADD QUESTION (UPDATED)
// ==========================
exports.addQuestion = (req, res) => {

    const {
        faculty_user_id,
        content,
        difficulty_level,
        subject_topic,
        tags,
        correct_answer,

        option_a,
        option_b,
        option_c,
        option_d

    } = req.body;

    // validation
    if (
        !faculty_user_id ||
        !content ||
        !difficulty_level ||
        !correct_answer ||
        !option_a ||
        !option_b ||
        !option_c ||
        !option_d
    ) {
        return res.status(400).json({
            success: false,
            message: "MCQ questions require faculty, content, difficulty, correct answer, and options A-D"
        });
    }

    const normalizedAnswer = String(correct_answer).trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(normalizedAnswer)) {
        return res.status(400).json({
            success: false,
            message: "Correct answer must be A, B, C, or D"
        });
    }

    const sql = `
        INSERT INTO question_bank
        (
            faculty_user_id,
            content,
            question_type,
            difficulty_level,
            subject_topic,
            tags,
            correct_answer,
            option_a,
            option_b,
            option_c,
            option_d
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            faculty_user_id,
            content,
            "MCQ",
            difficulty_level,
            subject_topic || null,
            tags || null,
            normalizedAnswer,
            option_a,
            option_b,
            option_c,
            option_d
        ],

        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Question added successfully",
                question_id: result.insertId
            });
        }
    );
};


// ==========================
// GET ALL QUESTIONS
// ==========================
exports.getQuestions = (req, res) => {

    const sql = `
        SELECT
            question_id,
            faculty_user_id,
            content,
            question_type,
            difficulty_level,
            subject_topic,
            tags,
            correct_answer,
            option_a,
            option_b,
            option_c,
            option_d,
            created_at
        FROM question_bank
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            questions: results
        });
    });
};
