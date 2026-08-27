const User = require("../models/User");
const Hotel = require("../models/Hotel");
const Experience = require("../models/Experience");
const Booking = require("../models/Booking");
const ExperienceBooking = require("../models/ExperienceBooking");
const Commission = require("../models/Commission");
const AIModelLog = require("../models/AIModelLog");
const TouristAnalytics = require("../models/TouristAnalytics");

const COMMISSION_RATE = 0.03;

const normalizeCommissionRows = async () => {
  const hotelBookings = await Booking.find({}, "owner bookingId totalAmount checkIn createdAt");
  const activityBookings = await ExperienceBooking.find({}, "owner bookingId totalAmount date createdAt");

  const ops = [];
  hotelBookings.forEach((b) => {
    const totalAmount = b.totalAmount || 0;
    ops.push({
      updateOne: {
        filter: { sourceType: "hotel", sourceBookingId: b.bookingId },
        update: {
          $set: {
            owner: b.owner,
            totalAmount,
            platformCommission: totalAmount * COMMISSION_RATE,
            providerEarning: totalAmount * (1 - COMMISSION_RATE),
            bookedAt: b.checkIn || b.createdAt || new Date(),
          },
          $setOnInsert: { sourceType: "hotel" },
        },
        upsert: true,
      },
    });
  });

  activityBookings.forEach((b) => {
    const totalAmount = b.totalAmount || 0;
    ops.push({
      updateOne: {
        filter: { sourceType: "activity", sourceBookingId: b.bookingId },
        update: {
          $set: {
            owner: b.owner,
            totalAmount,
            platformCommission: totalAmount * COMMISSION_RATE,
            providerEarning: totalAmount * (1 - COMMISSION_RATE),
            bookedAt: b.date || b.createdAt || new Date(),
          },
          $setOnInsert: { sourceType: "activity" },
        },
        upsert: true,
      },
    });
  });

  if (ops.length > 0) {
    await Commission.bulkWrite(ops, { ordered: false });
  }
};

const getDashboardStats = async () => {
  const [
    totalUsers,
    hotelsCount,
    activitiesCount,
    totalHotelBookings,
    totalActivityBookings,
    pendingApprovals,
    usersByRole,
  ] = await Promise.all([
    User.countDocuments({}),
    Hotel.countDocuments({}),
    Experience.countDocuments({}),
    Booking.countDocuments({}),
    ExperienceBooking.countDocuments({}),
    User.countDocuments({ status: "pending", role: { $in: ["hotel_owner", "activity_provider"] } }),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
  ]);

  await normalizeCommissionRows();
  const commissionRows = await Commission.find({});
  const platformRevenue = commissionRows.reduce((s, r) => s + r.platformCommission, 0);

  const roleMap = usersByRole.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  return {
    totalUsers,
    hotelsCount,
    activityProviders: roleMap.activity_provider || 0,
    totalBookings: totalHotelBookings + totalActivityBookings,
    platformRevenue,
    pendingApprovals,
  };
};

const getRevenueTrend = async () => {
  await normalizeCommissionRows();
  const rows = await Commission.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$bookedAt" } },
        totalRevenue: { $sum: "$totalAmount" },
        commission: { $sum: "$platformCommission" },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  return rows.map((r) => ({
    month: new Date(`${r._id}-01`).toLocaleString("en-US", { month: "short" }),
    revenue: Number(r.totalRevenue.toFixed(2)),
    commission: Number(r.commission.toFixed(2)),
  }));
};

const getTouristMarkets = async () => {
  const fromAnalytics = await TouristAnalytics.aggregate([
    { $group: { _id: "$country", arrivals: { $sum: "$arrivals" } } },
    { $sort: { arrivals: -1 } },
    { $limit: 5 },
  ]);

  if (fromAnalytics.length > 0) {
    return fromAnalytics.map((r) => ({ name: r._id, value: r.arrivals }));
  }

  return [
    { name: "India", value: 38 },
    { name: "United Kingdom", value: 21 },
    { name: "Russian Federation", value: 16 },
    { name: "Germany", value: 14 },
    { name: "China", value: 11 },
  ];
};

module.exports = {
  COMMISSION_RATE,
  normalizeCommissionRows,
  getDashboardStats,
  getRevenueTrend,
  getTouristMarkets,
  models: { User, Hotel, Experience, Booking, ExperienceBooking, Commission, AIModelLog, TouristAnalytics },
};
