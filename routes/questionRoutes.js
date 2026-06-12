const express = require("express");
const router = express.Router();

const questionController = require("../controllers/questionController");

// add question
router.post("/add", questionController.addQuestion);

// get all questions
router.get("/all", questionController.getQuestions);

module.exports = router;