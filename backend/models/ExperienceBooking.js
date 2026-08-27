const mongoose = require("mongoose");

const experienceBookingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    experience: { type: mongoose.Schema.Types.ObjectId, ref: "Experience", required: false },
    tourist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
    bookingId: { type: String, required: true, unique: true, index: true },
    touristName: { type: String, required: true, trim: true },
    touristEmail: { type: String, trim: true, lowercase: true, default: "" },
    experienceTitle: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "confirmed", "rejected", "completed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExperienceBooking", experienceBookingSchema);
