const mongoose = require("mongoose");

const activityRevenueSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityBooking", required: true },
    monthKey: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    platformCommission: { type: Number, required: true },
    providerEarning: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityRevenue", activityRevenueSchema);
