const HotelProfile = require("../models/HotelProfile");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

const seedBookingsIfEmpty = async (ownerId, rooms = []) => {
  const count = await Booking.countDocuments({ owner: ownerId });
  if (count > 0) return;

  const now = new Date();
  const samples = [
    { bookingId: `BK-${String(Date.now()).slice(-6)}01`, guestName: "Emma Roberts", roomType: rooms[0]?.roomType || "Deluxe Room", checkIn: new Date(now.getFullYear(), now.getMonth(), 12), checkOut: new Date(now.getFullYear(), now.getMonth(), 15), totalAmount: 630, status: "confirmed" },
    { bookingId: `BK-${String(Date.now()).slice(-6)}02`, guestName: "Aarav Sharma", roomType: rooms[1]?.roomType || "Family Room", checkIn: new Date(now.getFullYear(), now.getMonth(), 14), checkOut: new Date(now.getFullYear(), now.getMonth(), 17), totalAmount: 435, status: "pending" },
    { bookingId: `BK-${String(Date.now()).slice(-6)}03`, guestName: "Lina Kraus", roomType: rooms[2]?.roomType || "Suite", checkIn: new Date(now.getFullYear(), now.getMonth(), 20), checkOut: new Date(now.getFullYear(), now.getMonth(), 22), totalAmount: 640, status: "completed" },
  ];

  await Booking.insertMany(samples.map((s) => ({ ...s, owner: ownerId })));
};

const getOrCreateHotelProfile = async (owner) => {
  let profile = await HotelProfile.findOne({ owner: owner._id });
  if (!profile) {
    profile = await HotelProfile.create({
      owner: owner._id,
      hotelName: owner.businessName || `${owner.name}'s Hotel`,
      description: "",
      district: owner.district || "",
      address: "",
      latitude: 0,
      longitude: 0,
      category: "Hotel",
      facilities: [],
      images: [],
      verificationStatus: owner.status === "active" ? "approved" : "pending",
    });
  }
  return profile;
};

const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const rooms = await Room.find({ owner: ownerId });
    await seedBookingsIfEmpty(ownerId, rooms);
    const bookings = await Booking.find({ owner: ownerId }).sort({ createdAt: -1 });

    const monthlyMap = new Map();
    bookings.forEach((b) => {
      const d = new Date(b.checkIn);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { month: d.toLocaleString("en-US", { month: "short" }), totalRevenue: 0, completedBookings: 0 });
      }
      const entry = monthlyMap.get(key);
      entry.totalRevenue += b.totalAmount;
      if (b.status === "completed") entry.completedBookings += 1;
    });

    const revenueTrend = Array.from(monthlyMap.values());
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const activeBookings = bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length;
    const availableRooms = rooms.reduce((sum, r) => sum + r.availableRooms, 0);

    return res.json({
      stats: {
        totalRooms: rooms.length,
        activeBookings,
        monthlyRevenue: totalRevenue,
        platformCommission: totalRevenue * 0.03,
        availableRooms,
      },
      revenueTrend,
      recentBookings: bookings.slice(0, 8),
      topInsight: {
        country: "India",
        bestMonths: "Dec - Mar",
        demandScore: 91,
        recommendation: "Increase family package availability and weekend bundles.",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard data." });
  }
};

const getHotel = async (req, res) => {
  try {
    const profile = await getOrCreateHotelProfile(req.user);
    return res.json({ hotel: profile });
  } catch {
    return res.status(500).json({ message: "Failed to fetch hotel profile." });
  }
};

const updateHotel = async (req, res) => {
  try {
    const profile = await getOrCreateHotelProfile(req.user);
    const fields = ["hotelName", "description", "district", "address", "latitude", "longitude", "category", "facilities", "images"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) profile[f] = req.body[f];
    });
    await profile.save();
    return res.json({ message: "Hotel profile updated.", hotel: profile });
  } catch {
    return res.status(500).json({ message: "Failed to update hotel profile." });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json({ rooms });
  } catch {
    return res.status(500).json({ message: "Failed to fetch rooms." });
  }
};

const createRoom = async (req, res) => {
  try {
    const { roomType, description, pricePerNight, capacity, amenities, availableRooms, images, status } = req.body;
    if (!roomType || pricePerNight === undefined || !capacity) {
      return res.status(400).json({ message: "roomType, pricePerNight, and capacity are required." });
    }
    const room = await Room.create({
      owner: req.user._id,
      roomType,
      description: description || "",
      pricePerNight,
      capacity,
      amenities: Array.isArray(amenities) ? amenities : [],
      availableRooms: availableRooms ?? 0,
      images: Array.isArray(images) ? images : [],
      status: status || "active",
    });
    return res.status(201).json({ message: "Room created.", room });
  } catch {
    return res.status(500).json({ message: "Failed to create room." });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, owner: req.user._id });
    if (!room) return res.status(404).json({ message: "Room not found." });

    ["roomType", "description", "pricePerNight", "capacity", "amenities", "availableRooms", "images", "status"].forEach((f) => {
      if (req.body[f] !== undefined) room[f] = req.body[f];
    });
    await room.save();
    return res.json({ message: "Room updated.", room });
  } catch {
    return res.status(500).json({ message: "Failed to update room." });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!room) return res.status(404).json({ message: "Room not found." });
    return res.json({ message: "Room deleted." });
  } catch {
    return res.status(500).json({ message: "Failed to delete room." });
  }
};

const getBookings = async (req, res) => {
  try {
    await seedBookingsIfEmpty(req.user._id);
    const bookings = await Booking.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json({ bookings });
  } catch {
    return res.status(500).json({ message: "Failed to fetch bookings." });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const booking = await Booking.findOne({ _id: req.params.id, owner: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    booking.status = status;
    await booking.save();
    return res.json({ message: "Booking updated.", booking });
  } catch {
    return res.status(500).json({ message: "Failed to update booking." });
  }
};

const getRevenue = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const completedBookings = bookings.filter((b) => b.status === "completed").length;
    const platformCommission = totalRevenue * 0.03;
    const netEarnings = totalRevenue * 0.97;

    const monthly = {};
    bookings.forEach((b) => {
      const d = new Date(b.checkIn);
      const key = d.toLocaleString("en-US", { month: "short" });
      monthly[key] = monthly[key] || { month: key, totalRevenue: 0, completedBookings: 0 };
      monthly[key].totalRevenue += b.totalAmount;
      if (b.status === "completed") monthly[key].completedBookings += 1;
    });

    return res.json({
      summary: { totalRevenue, platformCommission, netEarnings, completedBookings },
      monthlyBreakdown: Object.values(monthly),
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch revenue data." });
  }
};

const getMarketInsights = async (_req, res) => {
  return res.json({
    insights: [
      { country: "India", bestMonths: "Dec - Mar", demandScore: 91, recommendation: "Increase family package availability and weekend bundles." },
      { country: "United Kingdom", bestMonths: "Jan - Apr", demandScore: 87, recommendation: "Promote heritage + coast itineraries with longer stays." },
      { country: "Russian Federation", bestMonths: "Nov - Feb", demandScore: 83, recommendation: "Highlight warm-weather beach and wellness packages." },
      { country: "Germany", bestMonths: "Feb - May", demandScore: 81, recommendation: "Feature eco-tourism and cycling experiences." },
      { country: "China", bestMonths: "Jan - Mar", demandScore: 79, recommendation: "Bundle group-friendly transport and guided excursions." },
    ],
  });
};

module.exports = {
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
};
