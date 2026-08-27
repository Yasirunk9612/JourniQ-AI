const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  getDashboard,
  getHotel,
  updateHotel,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getBookings,
  updateBookingStatus,
  getRevenue,
  getMarketInsights,
} = require("../controllers/hotelOwnerController");

const router = express.Router();

router.use(protect, allowRoles("hotel_owner"));

router.get("/dashboard", getDashboard);
router.get("/hotel", getHotel);
router.put("/hotel", updateHotel);
router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);
router.get("/bookings", getBookings);
router.patch("/bookings/:id/status", updateBookingStatus);
router.get("/revenue", getRevenue);
router.get("/market-insights", getMarketInsights);

module.exports = router;
