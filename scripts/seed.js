const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "online_exam_system",
        ssl: process.env.DB_SSL === "true"
            ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
            : undefined
    };

const password = "Password@123";

const facultyUsers = [
    ["faculty_algorithms", "Algorithms"],
    ["faculty_database", "Database Systems"],
    ["faculty_networks", "Computer Networks"],
    ["faculty_security", "Cyber Security"],
    ["faculty_ai", "Artificial Intelligence"]
];

const studentUsers = [
    ["student_aarav", 3],
    ["student_ananya", 3],
    ["student_isha", 4],
    ["student_kabir", 4],
    ["student_meera", 5],
    ["student_nihal", 5],
    ["student_priya", 6],
    ["student_rohan", 6],
    ["student_saanvi", 7],
    ["student_vihaan", 7]
];

const topics = [
    "Data Structures",
    "Algorithms",
    "Database Management Systems",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Object Oriented Programming",
    "Web Technologies",
    "Computer Architecture",
    "Compiler Design",
    "Artificial Intelligence",
    "Machine Learning",
    "Cyber Security",
    "Cloud Computing",
    "Distributed Systems"
];

const questionTemplates = [
    {
        difficulty: "EASY",
        tag: "core concept",
        content: (topic) => `Which option best describes a core concept in ${topic}?`,
        options: [
            "A fundamental principle used to solve computing problems",
            "A random naming style",
            "A hardware color code",
            "A screen brightness setting"
        ],
        answer: "A"
    },
    {
        difficulty: "MEDIUM",
        tag: "practical use",
        content: (topic) => `In ${topic}, what is the main reason for using structured design?`,
        options: [
            "To make systems easier to reason about and maintain",
            "To remove all documentation",
            "To avoid testing",
            "To slow down execution intentionally"
        ],
        answer: "A"
    },
    {
        difficulty: "MEDIUM",
        tag: "quality check",
        content: (topic) => `Which practice improves reliability while working with ${topic}?`,
        options: [
            "Changing requirements without review",
            "Testing important behavior with clear expected results",
            "Ignoring edge cases",
            "Deleting logs before debugging"
        ],
        answer: "B"
    },
    {
        difficulty: "HARD",
        tag: "advanced decision",
        content: (topic) => `When choosing a solution in ${topic}, what should be evaluated first?`,
        options: [
            "Only the shortest variable names",
            "The tradeoff between correctness, performance, and maintainability",
            "The number of colors in the UI",
            "Whether comments can replace working code"
        ],
        answer: "B"
    }
];

async function insertUser(connection, username, role, extra) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
        [username, passwordHash, role]
    );

    const userId = result.insertId;
    if (role === "faculty") {
        await connection.execute(
            "INSERT INTO faculty (user_id, department) VALUES (?, ?)",
            [userId, extra.department]
        );
    } else {
        await connection.execute(
            "INSERT INTO student (user_id, current_semester, major_program) VALUES (?, ?, ?)",
            [userId, extra.semester, "Computer Science and Engineering"]
        );
    }

    return userId;
}

async function main() {
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");

        for (const table of [
            "result",
            "student_answers",
            "attempt",
            "student_exam",
            "exam_questions",
            "question_bank",
            "examination",
            "admin",
            "student",
            "faculty",
            "users"
        ]) {
            await connection.query(`TRUNCATE TABLE ${table}`);
        }

        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        await connection.query("ALTER TABLE question_bank MODIFY question_type ENUM('MCQ') NOT NULL DEFAULT 'MCQ'");

        const facultyIds = [];
        for (const [username, department] of facultyUsers) {
            facultyIds.push(await insertUser(connection, username, "faculty", { department }));
        }

        const studentIds = [];
        for (const [username, semester] of studentUsers) {
            studentIds.push(await insertUser(connection, username, "student", { semester }));
        }

        const examIds = [];
        const scheduledBase = new Date("2026-06-01T09:00:00");
        let questionCount = 0;

        for (let index = 0; index < topics.length; index += 1) {
            const topic = topics[index];
            const facultyId = facultyIds[index % facultyIds.length];
            const scheduledAt = new Date(scheduledBase);
            scheduledAt.setDate(scheduledBase.getDate() + index);
            const scheduledTime = scheduledAt.toISOString().slice(0, 19).replace("T", " ");

            const [examResult] = await connection.execute(
                "INSERT INTO examination (faculty_user_id, title, duration_minutes, scheduled_time, randomize_questions, reschedule_allowed) VALUES (?, ?, ?, ?, 1, 0)",
                [facultyId, `${topic} MCQ Assessment`, 30 + (index % 3) * 15, scheduledTime]
            );
            const examId = examResult.insertId;
            examIds.push(examId);

            for (const template of questionTemplates) {
                const [questionResult] = await connection.execute(
                    `INSERT INTO question_bank
                    (faculty_user_id, content, question_type, difficulty_level, subject_topic, tags, correct_answer, option_a, option_b, option_c, option_d)
                    VALUES (?, ?, 'MCQ', ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        facultyId,
                        template.content(topic),
                        template.difficulty,
                        topic,
                        `${topic}, ${template.tag}, cse`,
                        template.answer,
                        template.options[0],
                        template.options[1],
                        template.options[2],
                        template.options[3]
                    ]
                );
                questionCount += 1;
                await connection.execute(
                    "INSERT INTO exam_questions (exam_id, question_id) VALUES (?, ?)",
                    [examId, questionResult.insertId]
                );
            }
        }

        for (const studentId of studentIds) {
            for (const examId of examIds) {
                await connection.execute(
                    "INSERT INTO student_exam (student_user_id, exam_id) VALUES (?, ?)",
                    [studentId, examId]
                );
            }
        }

        await connection.commit();
        console.log("Seed completed.");
        console.log(`Users: ${facultyIds.length + studentIds.length} (${facultyIds.length} faculty, ${studentIds.length} students)`);
        console.log(`Exams: ${examIds.length}`);
        console.log(`Questions: ${questionCount}`);
        console.log(`Sample login: faculty_algorithms / ${password}`);
        console.log(`Sample login: student_aarav / ${password}`);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
});
