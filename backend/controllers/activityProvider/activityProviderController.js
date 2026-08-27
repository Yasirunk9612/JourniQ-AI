const asyncHandler = require("../../utils/asyncHandler");
const {
  COMMISSION_RATE,
  getOrCreateProfile,
  syncRevenueForBooking,
  buildAiInsights,
  models: { Experience, CommunityProfile, ExperienceBooking, ProviderRevenue, ProviderCalendar },
} = require("../../services/activityProviderService");
const { scoreListingQuality } = require("../../services/aiTourismService");
const { getFrontendUrl, sendEmail } = require("../../utils/emailService");
const { bookingStatusTemplate } = require("../../utils/emailTemplates");

const getDashboard = asyncHandler(async (req, res) => {
  const experiences = await Experience.find({ owner: req.user._id });
  const bookings = await ExperienceBooking.find({ owner: req.user._id }).sort({ date: 1 });
  const revenueRows = await ProviderRevenue.find({ owner: req.user._id });

  const totalRevenue = revenueRows.reduce((sum, r) => sum + r.totalAmount, 0);
  const avgRating = experiences.length > 0 ? experiences.reduce((s, e) => s + (e.rating || 0), 0) / experiences.length : 0;

  const monthAgg = {};
  revenueRows.forEach((row) => {
    const month = new Date(`${row.monthKey}-01`).toLocaleString("en-US", { month: "short" });
    monthAgg[month] = monthAgg[month] || { month, totalRevenue: 0, completed: 0 };
    monthAgg[month].totalRevenue += row.totalAmount;
  });

  const completedByMonth = await ExperienceBooking.aggregate([
    { $match: { owner: req.user._id, status: "completed" } },
    {
      $group: {
        _id: { $dateToString: { format: "%b", date: "$date" } },
        count: { $sum: 1 },
      },
    },
  ]);

  completedByMonth.forEach((m) => {
    monthAgg[m._id] = monthAgg[m._id] || { month: m._id, totalRevenue: 0, completed: 0 };
    monthAgg[m._id].completed = m.count;
  });

  const topExperience = [...experiences].sort((a, b) => (b.bookingsCount || 0) - (a.bookingsCount || 0))[0] || null;

  res.json({
    stats: {
      totalExperiences: experiences.length,
      activeBookings: bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length,
      monthlyRevenue: totalRevenue,
      platformCommission: totalRevenue * COMMISSION_RATE,
      averageRating: Number(avgRating.toFixed(2)),
    },
    revenueTrend: Object.values(monthAgg),
    upcomingBookings: bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).slice(0, 8),
    topExperience,
  });
});

const getExperiences = asyncHandler(async (req, res) => {
  const experiences = await Experience.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ experiences });
});

const createExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.create({ owner: req.user._id, ...req.body });
  res.status(201).json({ message: "Experience created.", experience });
});

const updateExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.findOne({ _id: req.params.id, owner: req.user._id });
  if (!experience) return res.status(404).json({ message: "Experience not found." });
  Object.assign(experience, req.body);
  await experience.save();
  res.json({ message: "Experience updated.", experience });
});

const deleteExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!experience) return res.status(404).json({ message: "Experience not found." });
  res.json({ message: "Experience deleted." });
});

const uploadExperienceImages = asyncHandler(async (req, res) => {
  const exp = await Experience.findOne({ _id: req.params.id, owner: req.user._id });
  if (!exp) return res.status(404).json({ message: "Experience not found." });
  const files = req.files || [];
  const urls = files
    .map((f) => f.path || f.secure_url || f.url || null)
    .filter(Boolean);
  exp.images = [...exp.images, ...urls].slice(0, 15);
  if (!exp.previewImage && urls.length > 0) exp.previewImage = urls[0];
  await exp.save();
  res.status(201).json({ message: "Experience images uploaded.", images: urls, experience: exp });
});

const deleteExperienceImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: "imageUrl is required." });
  const exp = await Experience.findOne({ _id: req.params.id, owner: req.user._id });
  if (!exp) return res.status(404).json({ message: "Experience not found." });

  exp.images = exp.images.filter((img) => img !== imageUrl);
  if (exp.previewImage === imageUrl) exp.previewImage = exp.images[0] || "";
  await exp.save();

  res.json({ message: "Experience image deleted.", experience: exp });
});

const setExperienceMainImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: "imageUrl is required." });
  const exp = await Experience.findOne({ _id: req.params.id, owner: req.user._id });
  if (!exp) return res.status(404).json({ message: "Experience not found." });
  if (!exp.images.includes(imageUrl)) return res.status(400).json({ message: "imageUrl is not part of this experience." });

  exp.previewImage = imageUrl;
  await exp.save();
  res.json({ message: "Main image updated.", experience: exp });
});

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await ExperienceBooking.find({ owner: req.user._id }).sort({ date: -1 });
  res.json({ bookings });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "rejected", "completed"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status." });

  const booking = await ExperienceBooking.findOne({ _id: req.params.id, owner: req.user._id });
  if (!booking) return res.status(404).json({ message: "Booking not found." });

  booking.status = status;
  await booking.save();
  await syncRevenueForBooking(booking);
  if (booking.touristEmail) {
    await sendEmail({
      to: booking.touristEmail,
      ...bookingStatusTemplate({
        name: booking.touristName,
        listingName: booking.experienceTitle,
        bookingId: booking.bookingId,
        status,
        portalUrl: `${getFrontendUrl()}/dashboard/messages`,
        kind: "experience",
      }),
    });
  }

  if (booking.experience) {
    const exp = await Experience.findById(booking.experience);
    if (exp) {
      exp.bookingsCount = await ExperienceBooking.countDocuments({ experience: exp._id, owner: req.user._id, status: { $in: ["confirmed", "completed"] } });
      await exp.save();
    }
  }

  res.json({ message: "Booking status updated.", booking });
});

const getCalendar = asyncHandler(async (req, res) => {
  const events = await ProviderCalendar.find({ owner: req.user._id }).sort({ fromDate: 1 });
  const upcomingBookings = await ExperienceBooking.find({ owner: req.user._id, status: { $in: ["pending", "confirmed"] } }).sort({ date: 1 }).limit(10);
  res.json({ events, upcomingBookings });
});

const updateCalendar = asyncHandler(async (req, res) => {
  const { experienceId, fromDate, toDate, isBlocked, notes } = req.body;
  const event = await ProviderCalendar.create({ owner: req.user._id, experience: experienceId || null, fromDate, toDate, isBlocked: Boolean(isBlocked), notes: notes || "" });
  res.status(201).json({ message: "Calendar updated.", event });
});

const deleteCalendarEvent = asyncHandler(async (req, res) => {
  const event = await ProviderCalendar.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!event) return res.status(404).json({ message: "Calendar event not found." });
  res.json({ message: "Calendar event deleted." });
});

const getRevenue = asyncHandler(async (req, res) => {
  const revenueRows = await ProviderRevenue.find({ owner: req.user._id });
  const bookings = await ExperienceBooking.find({ owner: req.user._id });

  const summary = {
    totalRevenue: revenueRows.reduce((s, r) => s + r.totalAmount, 0),
    commissionPaid: revenueRows.reduce((s, r) => s + r.platformCommission, 0),
    netEarning: revenueRows.reduce((s, r) => s + r.providerEarning, 0),
    completedExperiences: bookings.filter((b) => b.status === "completed").length,
  };

  const monthlyMap = {};
  revenueRows.forEach((r) => {
    const m = new Date(`${r.monthKey}-01`).toLocaleString("en-US", { month: "short" });
    monthlyMap[m] = monthlyMap[m] || { month: m, totalRevenue: 0, commissionPaid: 0, netEarning: 0 };
    monthlyMap[m].totalRevenue += r.totalAmount;
    monthlyMap[m].commissionPaid += r.platformCommission;
    monthlyMap[m].netEarning += r.providerEarning;
  });

  res.json({ summary, monthlyBreakdown: Object.values(monthlyMap) });
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  res.json({ profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  Object.assign(profile, req.body);
  await profile.save();
  res.json({ message: "Profile updated.", profile });
});

const uploadProfileImages = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile(req.user);
  const files = req.files || [];
  const urls = files
    .map((f) => f.path || f.secure_url || f.url || null)
    .filter(Boolean);
  profile.images = [...profile.images, ...urls].slice(0, 15);
  if (!profile.previewImage && urls.length > 0) profile.previewImage = urls[0];
  await profile.save();
  res.status(201).json({ message: "Profile images uploaded.", images: urls, profile });
});

const deleteProfileImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: "imageUrl is required." });
  const profile = await getOrCreateProfile(req.user);
  profile.images = profile.images.filter((img) => img !== imageUrl);
  if (profile.previewImage === imageUrl) profile.previewImage = profile.images[0] || "";
  await profile.save();
  res.json({ message: "Profile image deleted.", profile });
});

const getAiInsightsController = asyncHandler(async (req, res) => {
  const insights = await buildAiInsights(req.user._id);
  const experiences = await Experience.find({ owner: req.user._id });
  const qualityScores = experiences.map((experience) => ({
    id: String(experience._id),
    title: experience.title,
    ...scoreListingQuality({
      title: experience.title,
      description: experience.description,
      images: experience.images || [],
      amenities: experience.includedItems || [],
      price: experience.price,
      location: experience.district || experience.location,
      category: experience.category,
    }),
  }));
  res.json({
    insights: {
      ...insights,
      listingQuality: {
        averageScore: qualityScores.length ? Math.round(qualityScores.reduce((sum, item) => sum + item.score, 0) / qualityScores.length) : 0,
        rows: qualityScores,
      },
    },
  });
});

module.exports = {
  getDashboard,
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  uploadExperienceImages,
  deleteExperienceImage,
  setExperienceMainImage,
  getBookings,
  updateBookingStatus,
  getCalendar,
  updateCalendar,
  deleteCalendarEvent,
  getRevenue,
  getProfile,
  updateProfile,
  uploadProfileImages,
  deleteProfileImage,
  getAiInsights: getAiInsightsController,
};
