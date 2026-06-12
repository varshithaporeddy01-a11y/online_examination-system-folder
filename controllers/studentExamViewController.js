const db = require("../config/db");


// ==========================
// GET EXAM PAPER FOR STUDENT
// ==========================
exports.getExamPaper = (req, res) => {

    const examId = req.params.examId;

    const sql = `
        SELECT
            e.exam_id,
            e.title,
            e.duration_minutes,
            q.question_id,
            q.content,
            q.question_type
        FROM examination e
        JOIN exam_questions eq
            ON e.exam_id = eq.exam_id
        JOIN question_bank q
            ON eq.question_id = q.question_id
        WHERE e.exam_id = ?
    `;

    db.query(sql, [examId], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: "No questions found"
            });
        }

        res.json({
            success: true,

            exam: {
                exam_id: results[0].exam_id,
                title: results[0].title,
                duration: results[0].duration_minutes
            },

            questions: results.map(q => ({
                question_id: q.question_id,
                content: q.content,
                question_type: q.question_type
            }))
        });
    });
};