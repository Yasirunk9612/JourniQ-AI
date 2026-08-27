const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { allowRoles } = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/uploadMiddleware");
const { validateRequest } = require("../../middleware/validationMiddleware");
const { roomSchema, hotelSchema } = require("../../utils/hotelOwnerValidators");
const controller = require("../../controllers/hotelOwner/hotelOwnerController");

const router = express.Router();
router.use(protect, allowRoles("hotel_owner"));

router.get("/dashboard", controller.getDashboard);
router.get("/hotel", controller.getHotel);
router.put("/hotel", validateRequest(hotelSchema), controller.updateHotel);
router.post("/hotel/images", upload.array("images", 15), controller.uploadHotelImages);
router.delete("/hotel/images", controller.deleteHotelImage);

router.get("/rooms", controller.getRooms);
router.post("/rooms", validateRequest(roomSchema), controller.createRoom);
router.put("/rooms/:id", validateRequest(roomSchema), controller.updateRoom);
router.delete("/rooms/:id", controller.deleteRoom);
router.post("/rooms/:id/images", upload.array("images", 5), controller.uploadRoomImages);
router.delete("/rooms/:id/images", controller.deleteRoomImage);

router.post("/availability", controller.updateAvailability);
router.get("/bookings", controller.getBookings);
router.patch("/bookings/:id/status", controller.updateBookingStatus);
router.get("/revenue", controller.getRevenue);
router.get("/market-insights", controller.getMarketInsights);
router.get("/ai-insights", controller.getAiInsights);

module.exports = router;
