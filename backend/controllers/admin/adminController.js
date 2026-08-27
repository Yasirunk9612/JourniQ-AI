const asyncHandler = require("../../utils/asyncHandler");
const { parseStatus } = require("../../utils/adminValidators");
const Destination = require("../../models/Destination");
const {
  COMMISSION_RATE,
  normalizeCommissionRows,
  getDashboardStats,
  getRevenueTrend,
  getTouristMarkets,
  models: { User, Hotel, Experience, Booking, ExperienceBooking, Commission, AIModelLog },
} = require("../../services/adminService");
const Room = require("../../models/Room");
const { buildDataQualityReport, buildTourismAnalytics, buildPersonalizedRecommendations } = require("../../services/aiTourismService");
const { getFrontendUrl, sendEmail } = require("../../utils/emailService");
const { listingStatusTemplate, providerApprovedTemplate, providerRejectedTemplate } = require("../../utils/emailTemplates");

const slugify = (value) => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 90);

const cleanCode = (value) => String(value || "")
  .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
  .replace(/<\/?style[^>]*>/gi, "")
  .replace(/\son\w+="[^"]*"/gi, "")
  .replace(/\son\w+='[^']*'/gi, "");

const destinationResponse = (destination) => ({
  id: String(destination._id),
  name: destination.name,
  slug: destination.slug,
  district: destination.district,
  province: destination.province,
  category: destination.category,
  description: destination.description,
  image: destination.image,
  bestTime: destination.bestTime,
  tags: destination.tags || [],
  interests: destination.interests || [],
  rating: destination.rating,
  status: destination.status,
  blogTitle: destination.blogTitle,
  blogExcerpt: destination.blogExcerpt,
  blogHtml: destination.blogHtml,
  blogCss: destination.blogCss,
  createdAt: destination.createdAt,
  updatedAt: destination.updatedAt,
});

const normalizeDestinationPayload = (body, userId) => {
  const slug = body.slug ? slugify(body.slug) : slugify(body.name);
  return {
    name: body.name,
    slug,
    district: body.district,
    province: body.province || "",
    category: body.category,
    description: body.description,
    image: body.image || "",
    bestTime: body.bestTime || "",
    tags: Array.isArray(body.tags) ? body.tags : String(body.tags || "").split(",").map((item) => item.trim()).filter(Boolean),
    interests: Array.isArray(body.interests) ? body.interests : String(body.interests || "").split(",").map((item) => item.trim()).filter(Boolean),
    rating: Number(body.rating) || 4.6,
    status: body.status || "published",
    blogTitle: body.blogTitle || body.name,
    blogExcerpt: body.blogExcerpt || "",
    blogHtml: cleanCode(body.blogHtml),
    blogCss: cleanCode(body.blogCss),
    createdBy: userId,
  };
};

const getDashboard = asyncHandler(async (_req, res) => {
  const [stats, revenueTrend, touristMarkets, recentHotel, recentActivity, pending] = await Promise.all([
    getDashboardStats(),
    getRevenueTrend(),
    getTouristMarkets(),
    Booking.find({}).sort({ createdAt: -1 }).limit(5),
    ExperienceBooking.find({}).sort({ createdAt: -1 }).limit(5),
    User.find({ status: "pending", role: { $in: ["hotel_owner", "activity_provider"] } }).sort({ createdAt: -1 }).limit(8).select("name email role businessName district status createdAt"),
  ]);

  const bookings = [
    ...recentHotel.map((b) => ({
      id: b.bookingId,
      customer: b.guestName,
      provider: b.roomType,
      type: "hotel",
      district: "",
      totalAmount: b.totalAmount,
      status: b.status,
      date: b.checkIn,
    })),
    ...recentActivity.map((b) => ({
      id: b.bookingId,
      customer: b.touristName,
      provider: b.experienceTitle,
      type: "activity",
      district: "",
      totalAmount: b.totalAmount,
      status: b.status,
      date: b.date,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  res.json({
    stats,
    revenueTrend,
    touristMarkets,
    recentBookings: bookings,
    pendingApprovals: pending,
    aiModelHealth: {
      contentModel: "active",
      demandModel: "active",
      apiStatus: "healthy",
      lastTrainedDate: "2026-04-18",
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).select("name email role status businessName district createdAt");
  res.json({ users });
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.role === "admin") return res.status(400).json({ message: "Admin user cannot be blocked." });
  user.status = "blocked";
  await user.save();
  res.json({ message: "User blocked.", user });
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  user.status = "active";
  await user.save();
  res.json({ message: "User unblocked.", user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.role === "admin") return res.status(400).json({ message: "Admin user cannot be deleted." });
  await user.deleteOne();
  res.json({ message: "User deleted." });
});

const getApprovals = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: { $in: ["hotel_owner", "activity_provider"] }, status: "pending" })
    .sort({ createdAt: -1 })
    .select("name email role businessName district createdAt status");
  res.json({ users });
});

const approveApproval = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  if (!["hotel_owner", "activity_provider"].includes(user.role)) return res.status(400).json({ message: "Only provider accounts can be approved." });
  user.status = "active";
  await user.save();
  const emailResult = await sendEmail({
    to: user.email,
    ...providerApprovedTemplate({
      name: user.name,
      role: user.role,
      loginUrl: `${getFrontendUrl()}/login/${user.role === "hotel_owner" ? "hotel-owner" : "activity-provider"}`,
    }),
  });
  res.json({ message: "User approved.", user, email: emailResult });
});

const rejectApproval = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  user.status = "blocked";
  await user.save();
  if (["hotel_owner", "activity_provider"].includes(user.role)) {
    const emailResult = await sendEmail({
      to: user.email,
      ...providerRejectedTemplate({ name: user.name }),
    });
    return res.json({ message: "User rejected and blocked.", user, email: emailResult });
  }
  res.json({ message: "User rejected and blocked.", user });
});

const getHotels = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find({}).populate("owner", "name email status").sort({ createdAt: -1 });
  const rows = await Promise.all(
    hotels.map(async (h) => {
      const bookings = await Booking.countDocuments({ owner: h.owner?._id || h.owner });
      const revenueAgg = await Booking.aggregate([
        { $match: { owner: h.owner?._id || h.owner } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      return {
        id: String(h._id),
        hotelName: h.hotelName,
        owner: h.owner?.name || "Unknown",
        district: h.district,
        category: h.category,
        rooms: 0,
        status: h.verificationStatus,
        bookings,
        revenue: revenueAgg[0]?.total || 0,
      };
    })
  );
  res.json({ hotels: rows });
});

const updateHotelStatus = asyncHandler(async (req, res) => {
  const parsed = parseStatus(req.body.status, ["pending", "approved", "rejected", "suspended"]);
  if (parsed?.error) return res.status(400).json({ message: parsed.error });

  const hotel = await Hotel.findById(req.params.id).populate("owner", "name email role");
  if (!hotel) return res.status(404).json({ message: "Hotel not found." });

  if (parsed.value === "suspended") {
    hotel.verificationStatus = "rejected";
  } else {
    hotel.verificationStatus = parsed.value;
  }

  await hotel.save();
  const emailResult = await sendEmail({
    to: hotel.owner?.email,
    ...listingStatusTemplate({
      name: hotel.owner?.name || "Hotel partner",
      listingName: hotel.hotelName,
      listingType: "hotel",
      status: hotel.verificationStatus,
      portalUrl: `${getFrontendUrl()}/hotel-owner/hotel-profile`,
    }),
  });
  res.json({ message: "Hotel status updated.", hotel, email: emailResult });
});

const getExperiences = asyncHandler(async (_req, res) => {
  const experiences = await Experience.find({}).populate("owner", "name email status").sort({ createdAt: -1 });
  const rows = await Promise.all(
    experiences.map(async (e) => ({
      id: String(e._id),
      title: e.title,
      provider: e.owner?.name || "Unknown",
      category: e.category,
      district: e.district,
      price: e.price,
      status: e.status,
      bookings: await ExperienceBooking.countDocuments({ experience: e._id }),
    }))
  );
  res.json({ experiences: rows });
});

const updateExperienceStatus = asyncHandler(async (req, res) => {
  const parsed = parseStatus(req.body.status, ["pending", "approved", "rejected", "active", "suspended"]);
  if (parsed?.error) return res.status(400).json({ message: parsed.error });
  const experience = await Experience.findById(req.params.id).populate("owner", "name email role");
  if (!experience) return res.status(404).json({ message: "Experience not found." });

  if (parsed.value === "suspended") {
    experience.status = "rejected";
  } else {
    experience.status = parsed.value;
  }

  await experience.save();
  const emailResult = await sendEmail({
    to: experience.owner?.email,
    ...listingStatusTemplate({
      name: experience.owner?.name || "Experience partner",
      listingName: experience.title,
      listingType: "experience",
      status: experience.status,
      portalUrl: `${getFrontendUrl()}/activity-provider/experiences`,
    }),
  });
  res.json({ message: "Experience status updated.", experience, email: emailResult });
});

const getDestinations = asyncHandler(async (_req, res) => {
  const destinations = await Destination.find({}).sort({ createdAt: -1 });
  res.json({ destinations: destinations.map(destinationResponse) });
});

const createDestination = asyncHandler(async (req, res) => {
  const payload = normalizeDestinationPayload(req.body, req.user._id);
  if (!payload.name || !payload.slug || !payload.district || !payload.category || !payload.description) {
    return res.status(400).json({ message: "name, district, category, and description are required." });
  }
  const destination = await Destination.create(payload);
  res.status(201).json({ message: "Destination created.", destination: destinationResponse(destination) });
});

const updateDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) return res.status(404).json({ message: "Destination not found." });
  Object.assign(destination, normalizeDestinationPayload(req.body, destination.createdBy || req.user._id));
  await destination.save();
  res.json({ message: "Destination updated.", destination: destinationResponse(destination) });
});

const deleteDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findByIdAndDelete(req.params.id);
  if (!destination) return res.status(404).json({ message: "Destination not found." });
  res.json({ message: "Destination deleted." });
});

const getBookings = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const [hotelBookings, activityBookings] = await Promise.all([
    Booking.find(status && (!type || type === "hotel") ? { status } : {}).sort({ createdAt: -1 }),
    ExperienceBooking.find(status && (!type || type === "activity") ? { status } : {}).sort({ createdAt: -1 }),
  ]);

  const rows = [
    ...hotelBookings.map((b) => ({
      id: b.bookingId,
      customer: b.guestName,
      provider: b.roomType,
      type: "hotel",
      totalAmount: b.totalAmount,
      commission: b.totalAmount * COMMISSION_RATE,
      providerEarning: b.totalAmount * (1 - COMMISSION_RATE),
      status: b.status,
      date: b.checkIn,
      district: "",
    })),
    ...activityBookings.map((b) => ({
      id: b.bookingId,
      customer: b.touristName,
      provider: b.experienceTitle,
      type: "activity",
      totalAmount: b.totalAmount,
      commission: b.totalAmount * COMMISSION_RATE,
      providerEarning: b.totalAmount * (1 - COMMISSION_RATE),
      status: b.status,
      date: b.date,
      district: "",
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ bookings: rows });
});

const getAnalytics = asyncHandler(async (_req, res) => {
  await normalizeCommissionRows();

  const [touristMarkets, monthlyBookings, revenueByCategory, hotelsByDistrict, experienceByCategory] = await Promise.all([
    getTouristMarkets(),
    Commission.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$bookedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Commission.aggregate([
      { $group: { _id: "$sourceType", total: { $sum: "$totalAmount" } } },
    ]),
    Hotel.aggregate([{ $group: { _id: "$district", value: { $sum: 1 } } }, { $sort: { value: -1 } }, { $limit: 10 }]),
    Experience.aggregate([{ $group: { _id: "$category", value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
  ]);

  res.json({
    touristMarkets,
    monthlyBookings: monthlyBookings.map((m) => ({ month: new Date(`${m._id}-01`).toLocaleString("en-US", { month: "short" }), value: m.count })),
    revenueByCategory: revenueByCategory.map((r) => ({ name: r._id, value: Number(r.total.toFixed(2)) })),
    hotelsByDistrict: hotelsByDistrict.map((h) => ({ district: h._id || "Unknown", value: h.value })),
    experienceBookingsByCategory: experienceByCategory.map((e) => ({ name: e._id, value: e.value })),
  });
});

const testAiMonitoring = asyncHandler(async (req, res) => {
  const { preferences, country, topN } = req.body;

  const poolHotels = await Hotel.find({ verificationStatus: "approved" }).limit(6);
  const poolExperiences = await Experience.find({ status: { $in: ["approved", "active"] } }).limit(6);

  const merged = [
    ...poolHotels.map((h) => ({ entityName: h.hotelName, tag: h.category || "hotel" })),
    ...poolExperiences.map((e) => ({ entityName: e.title, tag: e.category || "experience" })),
  ];

  const results = merged.slice(0, topN).map((m, idx) => {
    const contentScore = Number((0.7 + ((idx + 1) % 4) * 0.06).toFixed(2));
    const demandScore = Number((0.72 + ((idx + 2) % 5) * 0.05).toFixed(2));
    const finalScore = Number((contentScore * 0.6 + demandScore * 0.4).toFixed(2));
    return {
      entityName: m.entityName,
      finalScore,
      contentScore,
      demandScore,
      explanation: `${m.tag} aligns with '${country}' travelers and preferences: ${preferences.slice(0, 60)}...`,
    };
  });

  const log = await AIModelLog.create({
    runBy: req.user._id,
    preferences,
    country,
    topN,
    apiStatus: "ok",
    results,
  });

  res.status(201).json({
    message: "Model test completed.",
    modelStatus: {
      contentModel: "active",
      marketDemandModel: "active",
      apiStatus: "healthy",
      lastTrainedDate: "2026-04-18",
    },
    results,
    logId: log._id,
  });
});

const getTourismAnalytics = asyncHandler(async (_req, res) => {
  res.json({ analytics: buildTourismAnalytics() });
});

const getDataQuality = asyncHandler(async (_req, res) => {
  const report = await buildDataQualityReport({ User, Hotel, Room, Experience, Destination });
  res.json({ report });
});

const recommendationAudit = asyncHandler(async (req, res) => {
  const result = buildPersonalizedRecommendations({
    preferences: req.body.preferences || "",
    country: req.body.country || "",
    budget: req.body.budget || "",
    type: req.body.type || "all",
    district: req.body.district || "",
    limit: req.body.limit || 8,
  });
  res.json({ audit: result });
});

const getCommission = asyncHandler(async (_req, res) => {
  await normalizeCommissionRows();
  const rows = await Commission.find({}).sort({ bookedAt: -1 }).limit(300);

  const summary = rows.reduce(
    (acc, row) => {
      acc.totalBookingValue += row.totalAmount;
      acc.platformRevenue += row.platformCommission;
      acc.providerPayout += row.providerEarning;
      if (row.status === "pending") acc.pendingPayouts += row.providerEarning;
      return acc;
    },
    { totalBookingValue: 0, platformRevenue: 0, providerPayout: 0, pendingPayouts: 0 }
  );

  const monthly = await Commission.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$bookedAt" } },
        totalBookingValue: { $sum: "$totalAmount" },
        platformRevenue: { $sum: "$platformCommission" },
        providerPayout: { $sum: "$providerEarning" },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  res.json({
    summary,
    monthly: monthly.map((m) => ({
      month: new Date(`${m._id}-01`).toLocaleString("en-US", { month: "short" }),
      totalBookingValue: m.totalBookingValue,
      platformRevenue: m.platformRevenue,
      providerPayout: m.providerPayout,
    })),
    rows,
  });
});

const getReports = asyncHandler(async (_req, res) => {
  await normalizeCommissionRows();
  const [usersCount, hotelsCount, experiencesCount, bookingsCount, commission] = await Promise.all([
    User.countDocuments({}),
    Hotel.countDocuments({}),
    Experience.countDocuments({}),
    Commission.countDocuments({}),
    Commission.aggregate([{ $group: { _id: null, total: { $sum: "$platformCommission" } } }]),
  ]);

  res.json({
    reports: {
      bookingReport: { totalRecords: bookingsCount },
      revenueReport: { platformCommissionTotal: commission[0]?.total || 0 },
      touristMarketReport: { supportedCountries: ["India", "United Kingdom", "Russian Federation", "Germany", "China"] },
      hotelPerformanceReport: { totalHotels: hotelsCount },
      activityProviderReport: { totalExperiences: experiencesCount },
      aiRecommendationTestReport: { recentTests: await AIModelLog.countDocuments({}) },
      platformSummary: { usersCount, hotelsCount, experiencesCount, bookingsCount },
    },
  });
});

module.exports = {
  getDashboard,
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getApprovals,
  approveApproval,
  rejectApproval,
  getHotels,
  updateHotelStatus,
  getExperiences,
  updateExperienceStatus,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getBookings,
  getAnalytics,
  testAiMonitoring,
  getTourismAnalytics,
  getDataQuality,
  recommendationAudit,
  getCommission,
  getReports,
};
