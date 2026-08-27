const express = require("express");
const { optionalProtect, protect } = require("../../middleware/authMiddleware");
const { allowRoles } = require("../../middleware/roleMiddleware");
const controller = require("../../controllers/public/publicController");

const router = express.Router();

router.get("/hotels", controller.getPublicHotels);
router.get("/destinations", optionalProtect, controller.getPublicDestinations);
router.get("/destinations/:slug", optionalProtect, controller.getPublicDestinationBySlug);
router.get("/hotels/:id", controller.getPublicHotelById);
router.get("/experiences", controller.getPublicExperiences);
router.get("/experiences/:id", controller.getPublicExperienceById);
router.post("/recommendations", optionalProtect, controller.getPersonalizedRecommendations);
router.post("/ai-assistant/chat", optionalProtect, controller.chatWithAiAssistant);
router.get("/tourist-ai-profile", protect, allowRoles("tourist"), controller.getTouristAiProfile);
router.post("/trip-planner/track", protect, allowRoles("tourist"), controller.trackTripPlannerInput);

router.post("/bookings/hotel", protect, allowRoles("tourist"), controller.createHotelBooking);
router.post("/bookings/experience", protect, allowRoles("tourist"), controller.createExperienceBooking);

module.exports = router;
