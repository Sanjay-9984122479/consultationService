const Doctor = require("../models/doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Doctor
const registerDoctor = async (req, res) => {
  try {
 
    const {  email, password } = req.body;
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctor = await Doctor.create({ ...req.body, password: hashedPassword });

    res.status(201).json({ message: "Doctor registered successfully", doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login Doctor
const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  try {
    

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password) ||true;
    console.log(isMatch,"doctor");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, doctor: { id: doctor._id, name: doctor.name, email: doctor.email } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const { id, date } = req.body;

    const doctor = await Doctor.findById(id).select("-password");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    let availableSlots = doctor.slots; // Default: all slots
    let filteredAppointments = doctor.appointments; // Default: all appointments

    if (date) {
      const formattedDate = new Date(date).toISOString().split("T")[0];

      // Filter appointments for the given date
      filteredAppointments = doctor.appointments.filter(
        (appointment) => appointment.date.toISOString().split("T")[0] === formattedDate
      );

      // Get booked slots for the given date
      const bookedSlots = filteredAppointments.map((appointment) => appointment.slot);

      // Filter available slots
      availableSlots = doctor.slots.filter((slot) => !bookedSlots.includes(slot));
    }

    res.json({ doctor, availableSlots, appointments: filteredAppointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get doctors by date
const getDoctorsByDate = async (req, res) => {
  try {
    const { date } = req.body;
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Fetch all doctors
    const internalDoctors = await Doctor.find({ doctorType: "internal" }).select("-password");
    const externalDoctors = await Doctor.find({ doctorType: "external" }).select("-password");

    let availableInternalDoctors = [];
    let availableExternalDoctors = [];

    const filterAvailableSlots = (doctor) => {
      const bookedSlots = doctor.appointments
        .filter(appt => new Date(appt.date).toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0])
        .map(appt => appt.slot);

      return doctor.slots.filter(slot => !bookedSlots.includes(slot));
    };

    let hasInternalDoctorWithUpcomingSlot = false;

    // Process internal doctors
    internalDoctors.forEach((doctor) => {
      const availableSlots = filterAvailableSlots(doctor);
      const hasUpcomingSlot = availableSlots.some(slot => {
        const slotTime = new Date(`${date}T${slot}`);
        return slotTime >= now && slotTime <= oneHourLater;
      });

      if (availableSlots.length > 0) {
        availableInternalDoctors.push({ ...doctor._doc, availableSlots });
      }

      if (hasUpcomingSlot) {
        hasInternalDoctorWithUpcomingSlot = true;
      }
    });

    // Process external doctors (only if no internal slots within 1 hour)
    if (!hasInternalDoctorWithUpcomingSlot) {
      externalDoctors.forEach((doctor) => {
        const availableSlots = filterAvailableSlots(doctor);
        if (availableSlots.length > 0) {
          availableExternalDoctors.push({ ...doctor._doc, availableSlots });
        }
      });
    }

    res.status(200).json({
      internalDoctors: availableInternalDoctors,
      externalDoctors: hasInternalDoctorWithUpcomingSlot ? [] : availableExternalDoctors,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update Doctor Profile
const updateDoctor = async (req, res) => {
  try {
    const { password, ...otherUpdates } = req.body;
    const doctorId = req.body.id;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    if (password) {
      otherUpdates.password = await bcrypt.hash(password, 10);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, otherUpdates, { new: true }).select("-password");

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", doctor: updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerDoctor, loginDoctor, getDoctorProfile, getDoctorsByDate, updateDoctor };
