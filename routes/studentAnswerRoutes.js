const express = require("express");
const router = express.Router();

const studentAnswerController =
require("../controllers/studentAnswerController");


// save answer
router.post(
    "/save",
    studentAnswerController.saveAnswer
);

module.exports = router;