const cron = require("node-cron");
const Doctor = require("../models/doctor");
const sendMail = require("./mailSender");

const sendReminders = async () => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    const doctors = await Doctor.find({ "appointments.date": { $gte: now, $lte: reminderTime } });

    for (const doctor of doctors) {
      for (const appointment of doctor.appointments) {
        const appointmentTime = new Date(appointment.date);
        if (appointmentTime >= now && appointmentTime <= reminderTime) {
          const patientEmail = appointment.patient.email;
          const patientName = appointment.patient.name;
          const doctorName = doctor.name;
          const slot = appointment.slot;

          const emailSubject = " Appointment Reminder";
          const emailBody = `
            Dear ${patientName},

            This is a reminder for your upcoming appointment with Dr. ${doctorName}.

             Date: ${appointmentTime.toISOString().split("T")[0]}
             Time Slot: ${slot}

            Please be on time for your consultation.

            Regards,  
            Your Clinic Team
          `;

          // Send Email
          await sendMail(patientEmail, emailSubject, emailBody);
          console.log(` Reminder sent to ${patientEmail} for ${appointmentTime}`);
        }
      }
    }
  } catch (error) {
    console.error(" Error sending reminders:", error);
  }
};

// Run every 10 minutes to check for upcoming appointments
cron.schedule("*/10 * * * *", () => {
  console.log("🔄 Running appointment reminders...");
  sendReminders();
});

module.exports = sendReminders;
