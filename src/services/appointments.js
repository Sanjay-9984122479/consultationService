const Doctor = require("../models/doctor");
const Client = require("../models/client"); // Ensure Client model is imported
const sendmail = require("../middleware/mailSender");

// Get all appointments by date
exports.getAllAppointments = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });

    const formattedDate = new Date(date);
    const doctors = await Doctor.find({ "appointments.date": formattedDate }).select("name appointments");

    const filteredAppointments = doctors.flatMap((doctor) =>
      doctor.appointments
        .filter((appointment) =>
          appointment.date.toISOString().split("T")[0] === formattedDate.toISOString().split("T")[0]
        )
        .map((appointment) => ({
          doctorName: doctor.name,
          ...appointment._doc,
        }))
    );

    res.status(200).json(filteredAppointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Save appointment API
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, slot } = req.body;

    if (!doctorId || !patientId || !date || !slot) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const patient = await Client.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const formattedDate = new Date(date).toISOString().split("T")[0];

    //  Restrict same patient from booking multiple slots on the same date
    const existingPatientAppointment = patient.appointments.find(
      (appt) => appt.date.toISOString().split("T")[0] === formattedDate
    );

    if (existingPatientAppointment) {
      return res.status(400).json({ message: "You have already booked an appointment on this date." });
    }

  
    const existingDoctorAppointment = doctor.appointments.find(
      (appt) =>
        appt.date.toISOString().split("T")[0] === formattedDate && appt.slot === slot
    );

    if (existingDoctorAppointment) {
      return res.status(400).json({ message: "This slot is already booked." });
    }

    //  Ensure the selected slot is valid for the doctor
    if (!doctor.slots.includes(slot)) {
      return res.status(400).json({ message: "Selected slot is not available" });
    }

    // Create appointment object
    const appointment = {
      patient: {
        id: patient._id,
        name: patient?.name||"",
        age:patient?.age||"",
        email:patient.email,
        gender:patient?.gender||"",
        profile:patient.profile
      },
      doctor: {
        id: doctor._id,
        email:doctor.email,
        name: doctor?.name||"",
        specialization: doctor?.specialization||"",
        profile:doctor?.profile,
        experience:doctor?.experience||"",
        fees:doctor?.fees,
      },
      date: new Date(date),
      slot,
    };
    
    // Save appointment to doctor and patient records
    doctor.appointments.push(appointment);
    patient.appointments.push(appointment);

    await doctor.save();
    await patient.save();

    // Send email to doctor
    const emailMessage = `Dear Dr. ${doctor?.name},\n\nAn appointment has been booked with you.\n\nPatient: ${patient?.name}\nDate: ${formattedDate}\nSlot: ${slot}\n\nPlease check your dashboard for more details.\n\nBest Regards,\nYour Clinic Team`;

    await sendmail(doctor.email,'', emailMessage);

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.addPrescription = async (req, res) => {
  try {
    const { doctorId, patientId, date, slot, prescription } = req.body;

    if (!doctorId || !patientId || !date || !slot || !prescription) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const patient = await Client.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const formattedDate = new Date(date).toISOString().split("T")[0];

    // 🔍 Find appointment in doctor's records
    const doctorAppointment = doctor.appointments.find(
      (appt) => 
        appt.patient.id.toString() === patientId &&
        appt.date.toISOString().split("T")[0] === formattedDate &&
        appt.slot === slot
    );

    if (!doctorAppointment) {
      return res.status(404).json({ error: "Appointment not found in doctor's records" });
    }

    // 🔍 Find appointment in patient's records
    const patientAppointment = patient.appointments.find(
      (appt) => 
        appt.doctor.id.toString() === doctorId &&
        appt.date.toISOString().split("T")[0] === formattedDate &&
        appt.slot === slot
    );

    if (!patientAppointment) {
      return res.status(404).json({ error: "Appointment not found in patient's records" });
    }

    // ✅ Update prescription in both doctor and patient records
    doctorAppointment.prescription = prescription;
    patientAppointment.prescription = prescription;

    await doctor.save();
    await patient.save();

   const emailSubject = `Your Prescription from Dr. ${doctor.name}`;
    const emailBody = `
      Dear ${patient.name},

      Here is your prescription from your appointment with Dr. ${doctor.name}:

       Date: ${formattedDate}
       Slot: ${slot}

       Prescription:
      "${prescription}"

      Stay healthy!
      
      Regards,
      Your Clinic Team
    `;
    await sendmail(patient.email, emailSubject, emailBody);
    res.status(200).json({ message: "Prescription added successfully", prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


