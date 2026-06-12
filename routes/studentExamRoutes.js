const express = require("express");
const router = express.Router();

const studentExamController =
require("../controllers/studentExamController");


// assign student to exam
router.post(
    "/assign",
    studentExamController.assignStudent
);


// get exams of student
router.get(
    "/:studentId",
    studentExamController.getStudentExams
);

module.exports = router;