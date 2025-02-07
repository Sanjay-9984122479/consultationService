const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUser } = require("../services/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/profile", getUserProfile);
router.post("/update",updateUser );

module.exports = router;
