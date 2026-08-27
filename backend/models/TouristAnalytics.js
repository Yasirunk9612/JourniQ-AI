const mongoose = require("mongoose");

const touristAnalyticsSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, index: true },
    monthKey: { type: String, required: true, index: true },
    arrivals: { type: Number, required: true, min: 0 },
    bookings: { type: Number, required: true, min: 0 },
    revenue: { type: Number, required: true, min: 0 },
    demandScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

touristAnalyticsSchema.index({ country: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model("TouristAnalytics", touristAnalyticsSchema);
