const db = require("../config/db");


// ==========================
// CREATE RESULT
// ==========================
exports.createResult = (req, res) => {

    const {
        attempt_id,
        exam_id,
        total_marks
    } = req.body;

    if (!attempt_id || !exam_id) {
        return res.status(400).json({
            success: false,
            message: "attempt_id and exam_id required"
        });
    }

    const sql = `
        INSERT INTO result
        (
            attempt_id,
            exam_id,
            total_marks,
            submitted_at,
            is_published
        )
        VALUES (?, ?, ?, NOW(), false)
    `;

    db.query(
        sql,
        [attempt_id, exam_id, total_marks || 0],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Result created successfully",
                result_id: result.insertId
            });
        }
    );
};


// ==========================
// GET ALL RESULTS
// ==========================
exports.getResults = (req, res) => {

    const sql = `
        SELECT * FROM result
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
            results: results
        });
    });
};


// ==========================
// PUBLISH RESULT
// ==========================
exports.publishResult = (req, res) => {

    const { result_id } = req.body;

    const sql = `
        UPDATE result
        SET is_published = true
        WHERE result_id = ?
    `;

    db.query(sql, [result_id], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Result published"
        });
    });
};