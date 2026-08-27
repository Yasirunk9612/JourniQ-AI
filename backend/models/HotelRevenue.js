const mongoose = require("mongoose");

const hotelRevenueSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    monthKey: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    platformCommission: { type: Number, required: true },
    hotelEarning: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HotelRevenue", hotelRevenueSchema);
