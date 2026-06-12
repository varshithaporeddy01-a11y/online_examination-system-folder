const express = require("express");
const router = express.Router();

const studentExamViewController =
require("../controllers/studentExamViewController");

router.get(
    "/paper/:examId",
    studentExamViewController.getExamPaper
);

module.exports = router;