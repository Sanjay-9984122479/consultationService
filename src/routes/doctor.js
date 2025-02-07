const express = require("express");
const { registerDoctor, loginDoctor, getDoctorProfile,getDoctorsByDate, updateDoctor } = require("../services/doctors");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.post("/profile", getDoctorProfile);
router.post("/getByDate",getDoctorsByDate)
router.post("/update",updateDoctor)

module.exports = router;
