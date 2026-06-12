const db = require("../config/db");

exports.submitExam = (req, res) => {
    const { attempt_id } = req.body;

    if (!attempt_id) {
        return res.status(400).json({
            success: false,
            message: "attempt_id required"
        });
    }

    const checkSql = `
        SELECT status, exam_id
        FROM attempt
        WHERE attempt_id = ?
    `;

    db.query(checkSql, [attempt_id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invalid attempt_id"
            });
        }

        const examId = rows[0].exam_id;

        if (rows[0].status === "SUBMITTED") {
            return db.query(
                "SELECT * FROM result WHERE attempt_id = ?",
                [attempt_id],
                (resultErr, resultRows) => {
                    if (resultErr) {
                        return res.status(500).json({
                            success: false,
                            error: resultErr.message
                        });
                    }

                    return res.json({
                        success: true,
                        message: "Exam already submitted",
                        result: resultRows[0] || null
                    });
                }
            );
        }

        const getAnswers = `
            SELECT
                sa.question_id,
                sa.selected_answer,
                q.correct_answer
            FROM student_answers sa
            JOIN question_bank q ON sa.question_id = q.question_id
            WHERE sa.attempt_id = ?
        `;

        db.query(getAnswers, [attempt_id], (err2, answers) => {
            if (err2) {
                return res.status(500).json({
                    success: false,
                    error: err2.message
                });
            }

            if (answers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No answers found"
                });
            }

            let score = 0;

            answers.forEach((row) => {
                const selected = String(row.selected_answer || "").trim().toUpperCase();
                const correct = String(row.correct_answer || "").trim().toUpperCase();

                if (selected === correct) {
                    score++;
                }
            });

            const updateAttempt = `
                UPDATE attempt
                SET status = 'SUBMITTED',
                    end_time = NOW()
                WHERE attempt_id = ?
            `;

            db.query(updateAttempt, [attempt_id], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        error: updateErr.message
                    });
                }

                const insertResult = `
                    INSERT INTO result
                    (attempt_id, exam_id, total_marks, submitted_at)
                    VALUES (?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        total_marks = VALUES(total_marks),
                        submitted_at = VALUES(submitted_at)
                `;

                db.query(insertResult, [attempt_id, examId, score], (err3) => {
                    if (err3) {
                        return res.status(500).json({
                            success: false,
                            error: err3.message
                        });
                    }

                    res.json({
                        success: true,
                        message: "Exam evaluated successfully",
                        score,
                        total_questions: answers.length
                    });
                });
            });
        });
    });
};
