const mongoose = require("mongoose");

const activityCalendarSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    experience: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityExperience", required: false },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    isBlocked: { type: Boolean, default: false },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityCalendar", activityCalendarSchema);
