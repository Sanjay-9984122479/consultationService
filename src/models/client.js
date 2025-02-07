const mongoose = require("mongoose");
const { AppointmentSchema } = require("./appointment");

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: { type: String },
    mobile: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String },
    communication: { type: String },
    occupation: { type: String },
    address: { type: String },
    age: { type: Number },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    appointments: [AppointmentSchema],
  },
  { timestamps: true }
);


module.exports = mongoose.model("Client", ClientSchema);
