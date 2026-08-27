const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { allowRoles } = require("../../middleware/roleMiddleware");
const { validateRequest } = require("../../middleware/validationMiddleware");
const upload = require("../../middleware/activityProviderUploadMiddleware");
const { experienceSchema, profileSchema } = require("../../utils/activityProviderValidators");
const controller = require("../../controllers/activityProvider/activityProviderController");

const router = express.Router();
router.use(protect, allowRoles("activity_provider"));

router.get("/dashboard", controller.getDashboard);
router.get("/experiences", controller.getExperiences);
router.post("/experiences", validateRequest(experienceSchema), controller.createExperience);
router.put("/experiences/:id", controller.updateExperience);
router.delete("/experiences/:id", controller.deleteExperience);
router.post("/experiences/:id/images", upload.array("images", 15), controller.uploadExperienceImages);
router.delete("/experiences/:id/images", controller.deleteExperienceImage);
router.patch("/experiences/:id/images/main", controller.setExperienceMainImage);

router.get("/bookings", controller.getBookings);
router.patch("/bookings/:id/status", controller.updateBookingStatus);

router.get("/calendar", controller.getCalendar);
router.put("/calendar", controller.updateCalendar);
router.delete("/calendar/:id", controller.deleteCalendarEvent);

router.get("/revenue", controller.getRevenue);
router.get("/profile", controller.getProfile);
router.put("/profile", validateRequest(profileSchema), controller.updateProfile);
router.post("/profile/images", upload.array("images", 15), controller.uploadProfileImages);
router.delete("/profile/images", controller.deleteProfileImage);

router.get("/ai-insights", controller.getAiInsights);

module.exports = router;
