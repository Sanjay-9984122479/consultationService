const express = require("express");
const { getAllAppointments, bookAppointment, addPrescription } = require("../services/appointments");

const router = express.Router();

router.get("/getAll", getAllAppointments);
router.post("/addAppointment", bookAppointment); // New route for booking an appointment
router.post("/addPrescription", addPrescription);
module.exports = router;
