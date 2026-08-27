const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { allowRoles } = require("../../middleware/roleMiddleware");
const { validateRequest } = require("../../middleware/validationMiddleware");
const { aiMonitoringTestSchema } = require("../../utils/adminValidators");
const controller = require("../../controllers/admin/adminController");

const router = express.Router();
router.use(protect, allowRoles("admin"));

router.get("/dashboard", controller.getDashboard);
router.get("/users", controller.getUsers);
router.patch("/users/:id/block", controller.blockUser);
router.patch("/users/:id/unblock", controller.unblockUser);
router.delete("/users/:id", controller.deleteUser);

router.get("/approvals", controller.getApprovals);
router.patch("/approvals/:id/approve", controller.approveApproval);
router.patch("/approvals/:id/reject", controller.rejectApproval);

router.get("/hotels", controller.getHotels);
router.patch("/hotels/:id/status", controller.updateHotelStatus);

router.get("/experiences", controller.getExperiences);
router.patch("/experiences/:id/status", controller.updateExperienceStatus);

router.get("/destinations", controller.getDestinations);
router.post("/destinations", controller.createDestination);
router.put("/destinations/:id", controller.updateDestination);
router.delete("/destinations/:id", controller.deleteDestination);

router.get("/bookings", controller.getBookings);
router.get("/analytics", controller.getAnalytics);
router.post("/ai-monitoring/test", validateRequest(aiMonitoringTestSchema), controller.testAiMonitoring);
router.get("/tourism-analytics", controller.getTourismAnalytics);
router.get("/data-quality", controller.getDataQuality);
router.post("/recommendation-audit", controller.recommendationAudit);
router.get("/commission", controller.getCommission);
router.get("/reports", controller.getReports);

module.exports = router;
