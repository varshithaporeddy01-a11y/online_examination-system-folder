const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// TEST ROUTE
router.get("/test", (req, res) => {
    res.json({ message: "Auth route working" });
});

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// PROTECTED ROUTE
router.get("/profile", verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected data accessed",
        user: req.user
    });
});

module.exports = router;