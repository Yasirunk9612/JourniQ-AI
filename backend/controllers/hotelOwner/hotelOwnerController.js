const asyncHandler = require("../../utils/asyncHandler");
const {
  COMMISSION_RATE,
  getOrCreateHotel,
  syncRevenueFromBooking,
  getMarketInsights,
  models: { Hotel, Room, Booking, Availability, HotelRevenue },
} = require("../../services/hotelOwnerService");
const { buildProviderTrends, scoreListingQuality } = require("../../services/aiTourismService");
const { getFrontendUrl, sendEmail } = require("../../utils/emailService");
const { bookingStatusTemplate } = require("../../utils/emailTemplates");

const ensureSeedBookings = async (ownerId, rooms) => {
  const count = await Booking.countDocuments({ owner: ownerId });
  if (count > 0) return;
  const now = new Date();
  const samples = [
    { bookingId: `BK-${String(Date.now()).slice(-6)}01`, guestName: "Emma Roberts", roomType: rooms[0]?.roomType || "Deluxe Room", checkIn: new Date(now.getFullYear(), now.getMonth(), 12), checkOut: new Date(now.getFullYear(), now.getMonth(), 15), totalAmount: 630, status: "confirmed" },
    { bookingId: `BK-${String(Date.now()).slice(-6)}02`, guestName: "Aarav Sharma", roomType: rooms[1]?.roomType || "Family Room", checkIn: new Date(now.getFullYear(), now.getMonth(), 14), checkOut: new Date(now.getFullYear(), now.getMonth(), 17), totalAmount: 435, status: "pending" },
  ];
  const docs = await Booking.insertMany(samples.map((s) => ({ ...s, owner: ownerId })));
  await Promise.all(docs.map((d) => syncRevenueFromBooking(d)));
};

const getDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const rooms = await Room.find({ owner: ownerId });
  await ensureSeedBookings(ownerId, rooms);
  const bookings = await Booking.find({ owner: ownerId }).sort({ createdAt: -1 });

  const monthly = {};
  bookings.forEach((b) => {
    const m = new Date(b.checkIn).toLocaleString("en-US", { month: "short" });
    monthly[m] = monthly[m] || { month: m, totalRevenue: 0, completedBookings: 0 };
    monthly[m].totalRevenue += b.totalAmount;
    if (b.status === "completed") monthly[m].completedBookings += 1;
  });

  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const activeBookings = bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length;

  res.json({
    stats: {
      totalRooms: rooms.length,
      activeBookings,
      monthlyRevenue: totalRevenue,
      platformCommission: totalRevenue * COMMISSION_RATE,
      availableRooms: rooms.reduce((s, r) => s + r.availableRooms, 0),
    },
    revenueTrend: Object.values(monthly),
    recentBookings: bookings.slice(0, 10),
    topInsight: getMarketInsights(req.user.district || "")[0],
  });
});

const getHotel = asyncHandler(async (req, res) => {
  const hotel = await getOrCreateHotel(req.user);
  res.json({ hotel });
});

const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await getOrCreateHotel(req.user);
  const allowedFields = ["hotelName", "description", "district", "address", "latitude", "longitude", "category", "facilities"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) hotel[field] = req.body[field];
  });
  await hotel.save();
  res.json({ message: "Hotel profile updated.", hotel });
});

const getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ rooms });
});

const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create({ owner: req.user._id, ...req.body });
  res.status(201).json({ message: "Room created.", room });
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ _id: req.params.id, owner: req.user._id });
  if (!room) return res.status(404).json({ message: "Room not found." });
  const allowedFields = ["roomType", "description", "pricePerNight", "capacity", "amenities", "availableRooms", "status"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) room[field] = req.body[field];
  });
  await room.save();
  res.json({ message: "Room updated.", room });
});

const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!room) return res.status(404).json({ message: "Room not found." });
  res.json({ message: "Room deleted." });
});

const updateAvailability = asyncHandler(async (req, res) => {
  const { roomId, fromDate, toDate, availableRooms, blocked, seasonalPrice } = req.body;
  const room = await Room.findOne({ _id: roomId, owner: req.user._id });
  if (!room) return res.status(404).json({ message: "Room not found." });

  const record = await Availability.create({
    owner: req.user._id,
    room: roomId,
    fromDate,
    toDate,
    availableRooms,
    blocked: Boolean(blocked),
    seasonalPrice: seasonalPrice ?? null,
  });

  room.availableRooms = availableRooms;
  await room.save();

  res.status(201).json({ message: "Availability updated.", availability: record, room });
});

const getBookings = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ owner: req.user._id });
  await ensureSeedBookings(req.user._id, rooms);
  const bookings = await Booking.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ bookings });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "rejected", "completed"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status." });

  const booking = await Booking.findOne({ _id: req.params.id, owner: req.user._id });
  if (!booking) return res.status(404).json({ message: "Booking not found." });

  booking.status = status;
  await booking.save();
  await syncRevenueFromBooking(booking);
  if (booking.guestEmail) {
    await sendEmail({
      to: booking.guestEmail,
      ...bookingStatusTemplate({
        name: booking.guestName,
        listingName: booking.roomType,
        bookingId: booking.bookingId,
        status,
        portalUrl: `${getFrontendUrl()}/dashboard/messages`,
        kind: "hotel",
      }),
    });
  }

  res.json({ message: "Booking status updated.", booking });
});

const getRevenue = asyncHandler(async (req, res) => {
  const revenueRows = await HotelRevenue.find({ owner: req.user._id });

  const summary = revenueRows.reduce(
    (acc, row) => {
      acc.totalRevenue += row.totalAmount;
      acc.platformCommission += row.platformCommission;
      acc.netEarnings += row.hotelEarning;
      return acc;
    },
    { totalRevenue: 0, platformCommission: 0, netEarnings: 0 }
  );

  const completedBookings = await Booking.countDocuments({ owner: req.user._id, status: "completed" });

  const monthlyMap = {};
  revenueRows.forEach((r) => {
    const monthLabel = new Date(`${r.monthKey}-01`).toLocaleString("en-US", { month: "short" });
    monthlyMap[monthLabel] = monthlyMap[monthLabel] || { month: monthLabel, totalRevenue: 0, completedBookings: 0 };
    monthlyMap[monthLabel].totalRevenue += r.totalAmount;
  });

  const completedByMonth = await Booking.aggregate([
    { $match: { owner: req.user._id, status: "completed" } },
    {
      $group: {
        _id: { $dateToString: { format: "%b", date: "$checkIn" } },
        count: { $sum: 1 },
      },
    },
  ]);

  completedByMonth.forEach((c) => {
    monthlyMap[c._id] = monthlyMap[c._id] || { month: c._id, totalRevenue: 0, completedBookings: 0 };
    monthlyMap[c._id].completedBookings = c.count;
  });

  res.json({
    summary: { ...summary, completedBookings },
    monthlyBreakdown: Object.values(monthlyMap),
  });
});

const getMarketInsightsController = asyncHandler(async (req, res) => {
  res.json({
    insights: getMarketInsights(req.user.district || ""),
    note: "These insights use the trained Sri Lankan tourism dataset and the selected SVM recommendation model metrics. LSTM is treated as demand-support data, not a validated live hybrid.",
  });
});

const getAiInsightsController = asyncHandler(async (req, res) => {
  const hotel = await getOrCreateHotel(req.user);
  const rooms = await Room.find({ owner: req.user._id });
  const trends = buildProviderTrends({ district: hotel.district || req.user.district || "", category: hotel.category || "", providerType: "hotel" });
  const quality = scoreListingQuality({
    title: hotel.hotelName,
    description: hotel.description,
    images: hotel.images || [],
    amenities: [...(hotel.facilities || []), ...rooms.flatMap((room) => room.amenities || [])],
    price: rooms.length ? Math.min(...rooms.map((room) => room.pricePerNight || 0)) : null,
    location: hotel.district,
    category: hotel.category,
  });
  res.json({
    insights: {
      ...trends,
      listingQuality: quality,
      roomCount: rooms.length,
      activeRooms: rooms.filter((room) => room.status === "active").length,
      photoSlots: { hotel: `${(hotel.images || []).length}/15`, rooms: `${rooms.reduce((sum, room) => sum + (room.images || []).length, 0)}/${rooms.length * 5}` },
    },
  });
});

const uploadHotelImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const urls = files
    .map((f) => f.path || f.secure_url || f.url || null)
    .filter(Boolean);
  const hotel = await getOrCreateHotel(req.user);
  hotel.images = [...hotel.images, ...urls].slice(0, 15);
  if (!hotel.previewImage && urls.length > 0) {
    hotel.previewImage = urls[0];
  }
  await hotel.save();
  res.status(201).json({ message: "Images uploaded.", images: urls, hotel });
});

const deleteHotelImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: "imageUrl is required." });

  const hotel = await getOrCreateHotel(req.user);
  hotel.images = hotel.images.filter((img) => img !== imageUrl);

  if (hotel.previewImage === imageUrl) {
    hotel.previewImage = hotel.images[0] || "";
  }

  await hotel.save();
  res.json({ message: "Image deleted.", hotel });
});

const uploadRoomImages = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ _id: req.params.id, owner: req.user._id });
  if (!room) return res.status(404).json({ message: "Room not found." });

  const files = req.files || [];
  const urls = files
    .map((f) => f.path || f.secure_url || f.url || null)
    .filter(Boolean);

  const remainingSlots = Math.max(0, 5 - (room.images?.length || 0));
  const acceptedUrls = urls.slice(0, remainingSlots);
  room.images = [...(room.images || []), ...acceptedUrls].slice(0, 5);
  await room.save();

  res.status(201).json({ message: "Room images uploaded.", images: acceptedUrls, room });
});

const deleteRoomImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: "imageUrl is required." });

  const room = await Room.findOne({ _id: req.params.id, owner: req.user._id });
  if (!room) return res.status(404).json({ message: "Room not found." });

  room.images = room.images.filter((img) => img !== imageUrl);
  await room.save();

  res.json({ message: "Room image deleted.", room });
});

module.exports = {
  getDashboard,
  getHotel,
  updateHotel,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateAvailability,
  getBookings,
  updateBookingStatus,
  getRevenue,
  getMarketInsights: getMarketInsightsController,
  getAiInsights: getAiInsightsController,
  uploadHotelImages,
  deleteHotelImage,
  uploadRoomImages,
  deleteRoomImage,
};
