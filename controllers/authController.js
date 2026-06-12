const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const allowedRoles = ["admin", "faculty", "student"];

        if (!username || !password || !role || !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Valid username, password, and role are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO users (username, password_hash, role)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [username, hashedPassword, role], (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            const userId = result.insertId;
            let roleSql;
            let roleParams;

            if (role === "faculty") {
                roleSql = "INSERT INTO faculty (user_id, department) VALUES (?, ?)";
                roleParams = [userId, "General"];
            }

            if (role === "student") {
                roleSql = "INSERT INTO student (user_id) VALUES (?)";
                roleParams = [userId];
            }

            if (role === "admin") {
                roleSql = "INSERT INTO admin (user_id, email) VALUES (?, ?)";
                roleParams = [userId, `${username}@admin.com`];
            }

            db.query(roleSql, roleParams, (roleErr) => {
                if (roleErr) {
                    return res.status(500).json({
                        success: false,
                        error: roleErr.message
                    });
                }

                return res.json({
                    success: true,
                    message: "User registered successfully",
                    user_id: userId,
                    role
                });
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields required"
        });
    }

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET || "dev_secret_change_me",
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            }
        });
    });
};
