const { default: mongoose } = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
    {
      patient: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
        name: { type: String, required: true },
        mobile: { type: String },
        email:{type:String},
        age:{type:String},
        gender:{type:String},
        profile:{type:String}
      },
      doctor: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        name: { type: String, required: true },
        email:{type:String},
        specialization: { type: String },
        experience:{type:String},
        fees:{type:String},
        profile:{type:String}
      },
      date: { type: Date, required: true },
      slot: { type: String, required: true },
      prescription: { type: String, default: "" },
    },
    { timestamps: true }
  );

  module.exports = {AppointmentSchema}