const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Availability = require("../models/Availability");
const HotelRevenue = require("../models/HotelRevenue");
const { buildProviderTrends } = require("./aiTourismService");

const COMMISSION_RATE = 0.03;

const getOrCreateHotel = async (owner) => {
  let hotel = await Hotel.findOne({ owner: owner._id });
  if (!hotel) {
    hotel = await Hotel.create({
      owner: owner._id,
      hotelName: owner.businessName || `${owner.name}'s Hotel`,
      district: owner.district || "",
      verificationStatus: owner.status === "active" ? "approved" : "pending",
    });
  }
  return hotel;
};

const calculateRevenueRecord = (booking) => {
  const totalAmount = booking.totalAmount;
  return {
    totalAmount,
    platformCommission: totalAmount * COMMISSION_RATE,
    hotelEarning: totalAmount * (1 - COMMISSION_RATE),
  };
};

const syncRevenueFromBooking = async (booking) => {
  const monthKey = new Date(booking.checkIn).toISOString().slice(0, 7);
  const calc = calculateRevenueRecord(booking);
  const existing = await HotelRevenue.findOne({ booking: booking._id });
  if (existing) {
    existing.monthKey = monthKey;
    existing.totalAmount = calc.totalAmount;
    existing.platformCommission = calc.platformCommission;
    existing.hotelEarning = calc.hotelEarning;
    await existing.save();
    return existing;
  }
  return HotelRevenue.create({ owner: booking.owner, booking: booking._id, monthKey, ...calc });
};

const getMarketInsights = (district = "") => {
  const trends = buildProviderTrends({ district, providerType: "hotel" });
  return trends.targetCountries.map((country, index) => ({
    country,
    bestMonths: trends.bestMonths.join(", "),
    demandScore: Math.max(45, Math.min(98, trends.demandScore - (index * 3))),
    recommendation: trends.cards[index % trends.cards.length],
    model: trends.model.selectedModel,
  }));
};

module.exports = {
  COMMISSION_RATE,
  getOrCreateHotel,
  calculateRevenueRecord,
  syncRevenueFromBooking,
  getMarketInsights,
  models: { Hotel, Room, Booking, Availability, HotelRevenue },
};
