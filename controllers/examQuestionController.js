const db = require("../config/db");


// ==========================
// ASSIGN QUESTION TO EXAM
// ==========================
exports.assignQuestion = (req, res) => {

    const { exam_id, question_id } = req.body;

    if (!exam_id || !question_id) {
        return res.status(400).json({
            success: false,
            message: "exam_id and question_id required"
        });
    }

    const sql = `
        INSERT INTO exam_questions
        (exam_id, question_id)
        VALUES (?, ?)
    `;

    db.query(sql, [exam_id, question_id], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Question assigned to exam"
        });
    });
};


// ==========================
// GET QUESTIONS OF EXAM
// ==========================
exports.getExamQuestions = (req, res) => {

    const examId = req.params.examId;

    const sql = `
        SELECT
            q.question_id,
            q.content,
            q.question_type,
            q.difficulty_level
        FROM exam_questions eq
        JOIN question_bank q
        ON eq.question_id = q.question_id
        WHERE eq.exam_id = ?
    `;

    db.query(sql, [examId], (err, results) => {

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