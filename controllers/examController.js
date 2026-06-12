const db = require("../config/db");

// CREATE EXAM
exports.createExam = (req, res) => {

    const {
        title,
        duration_minutes,
        scheduled_time,
        faculty_user_id
    } = req.body;

    if (!title || !duration_minutes || !scheduled_time || !faculty_user_id) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO examination 
        (title, duration_minutes, scheduled_time, faculty_user_id)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, duration_minutes, scheduled_time, faculty_user_id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Exam created successfully",
                exam_id: result.insertId
            });
        }
    );
};


// GET ALL EXAMS
exports.getExams = (req, res) => {

    const sql = `
        SELECT 
            exam_id,
            title,
            duration_minutes,
            scheduled_time,
            faculty_user_id,
            created_at
        FROM examination
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
            exams: results
        });
    });
};
// ==========================
// GET EXAM PAPER (FULL QUESTIONS)
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
            q.question_type,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d
        FROM examination e
        JOIN exam_questions eq ON e.exam_id = eq.exam_id
        JOIN question_bank q ON eq.question_id = q.question_id
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
                message: "No questions found for this exam"
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
                question_type: q.question_type,
                options: {
                    A: q.option_a,
                    B: q.option_b,
                    C: q.option_c,
                    D: q.option_d
                }
            }))
        });
    });
};