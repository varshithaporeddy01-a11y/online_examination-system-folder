const db = require("../config/db");

exports.startExam = (req, res) => {
    const { student_user_id, exam_id } = req.body;

    if (!student_user_id || !exam_id) {
        return res.status(400).json({
            success: false,
            message: "student_user_id and exam_id required"
        });
    }

    const assignmentSql = `
        SELECT *
        FROM student_exam
        WHERE student_user_id = ? AND exam_id = ?
    `;

    db.query(assignmentSql, [student_user_id, exam_id], (assignErr, assignedRows) => {
        if (assignErr) {
            return res.status(500).json({
                success: false,
                error: assignErr.message
            });
        }

        if (assignedRows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Student is not assigned to this exam"
            });
        }

        const checkSql = `
            SELECT *
            FROM attempt
            WHERE student_user_id = ?
              AND exam_id = ?
              AND status = 'ONGOING'
            LIMIT 1
        `;

        db.query(checkSql, [student_user_id, exam_id], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            if (rows.length > 0) {
                return res.json({
                    success: true,
                    message: "Exam already started",
                    attempt_id: rows[0].attempt_id,
                    start_time: rows[0].start_time
                });
            }

            const sql = `
                INSERT INTO attempt (student_user_id, exam_id, status, start_time)
                VALUES (?, ?, 'ONGOING', NOW())
            `;

            db.query(sql, [student_user_id, exam_id], (err2, result) => {
                if (err2) {
                    return res.status(500).json({
                        success: false,
                        error: err2.message
                    });
                }

                res.json({
                    success: true,
                    message: "Exam started",
                    attempt_id: result.insertId,
                    start_time: new Date()
                });
            });
        });
    });
};

exports.getAttempts = (req, res) => {
    const sql = `
        SELECT
            a.*,
            u.username AS student_name,
            e.title AS exam_title
        FROM attempt a
        LEFT JOIN users u ON a.student_user_id = u.user_id
        LEFT JOIN examination e ON a.exam_id = e.exam_id
        ORDER BY a.start_time DESC
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
            attempts: results
        });
    });
};
