const db = require("../config/db");


// ==========================
// ASSIGN STUDENT TO EXAM
// ==========================
exports.assignStudent = (req, res) => {

    const { student_user_id, exam_id } = req.body;

    if (!student_user_id || !exam_id) {
        return res.status(400).json({
            success: false,
            message: "student_user_id and exam_id required"
        });
    }

    const sql = `
        INSERT INTO student_exam
        (student_user_id, exam_id)
        VALUES (?, ?)
    `;

    db.query(sql, [student_user_id, exam_id], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Student assigned to exam"
        });
    });
};


// ==========================
// GET EXAMS OF STUDENT
// ==========================
exports.getStudentExams = (req, res) => {

    const studentId = req.params.studentId;

    const sql = `
        SELECT
            e.exam_id,
            e.title,
            e.duration_minutes,
            e.scheduled_time
        FROM student_exam se
        JOIN examination e
        ON se.exam_id = e.exam_id
        WHERE se.student_user_id = ?
    `;

    db.query(sql, [studentId], (err, results) => {

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