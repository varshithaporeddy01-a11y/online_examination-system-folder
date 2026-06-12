const express = require("express");
const router = express.Router();

const resultController =
require("../controllers/resultController");


// create result
router.post(
    "/create",
    resultController.createResult
);


// get results
router.get(
    "/all",
    resultController.getResults
);


// publish result
router.put(
    "/publish",
    resultController.publishResult
);

module.exports = router;