const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { AppointmentSchema } = require("./appointment");


const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    age: { type: Number, required: [true, "Age is required"], min: 25 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    mobile: { type: String, required: [true, "Mobile number is required"], match: [/^\d{10}$/, "Invalid mobile number"] },
    state: { type: String },
    communication:{type:String},
    doctorType:{type:String},
    regNo:{type:String},
    experience:{type:String},
    gender:{type:String},
    fees:{type:String},
    address:{type:String},
    dob:{type:Date},
    city: { type: String },
    profile: { type: String, required: [true, "Profile image URL is required"] },
    password: { type: String },
    specialization: { type: String, required: [true, "Specialization is required"] },
    availabilityDates: [
      {
        day: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
    slots: [{ type: String, required: true }],
    appointments: [AppointmentSchema],
  },
  { timestamps: true }
);

DoctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Doctor = mongoose.model("Doctor", DoctorSchema);
module.exports = Doctor;
