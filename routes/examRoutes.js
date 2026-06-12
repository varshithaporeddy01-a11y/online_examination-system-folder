const express = require("express");
const router = express.Router();

const examController = require("../controllers/examController");

// create exam
router.post("/create", examController.createExam);

// get all exams
router.get("/all", examController.getExams);
router.get("/paper/:examId", examController.getExamPaper);

module.exports = router;