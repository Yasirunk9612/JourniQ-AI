const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: false,
    },
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    bookingId: { type: String, required: true, unique: true, index: true },
    guestName: { type: String, required: true, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true, default: "" },
    roomType: { type: String, required: true, trim: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
