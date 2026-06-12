const express = require("express");
const router = express.Router();

const attemptController =
require("../controllers/attemptController");

const evaluationController =
require("../controllers/evaluationController");


// ==========================
// START EXAM
// ==========================
router.post(
    "/start",
    attemptController.startExam
);


// ==========================
// SUBMIT EXAM (AUTO EVALUATION)
// ==========================
router.post(
    "/submit",
    evaluationController.submitExam
);


// ==========================
// GET ALL ATTEMPTS
// ==========================
router.get(
    "/all",
    attemptController.getAttempts
);

module.exports = router;