const Experience = require("../models/Experience");
const CommunityProfile = require("../models/CommunityProfile");
const ExperienceBooking = require("../models/ExperienceBooking");
const ProviderRevenue = require("../models/ProviderRevenue");
const ProviderCalendar = require("../models/ProviderCalendar");
const { buildProviderTrends } = require("./aiTourismService");

const COMMISSION_RATE = 0.03;

const getOrCreateProfile = async (owner) => {
  let profile = await CommunityProfile.findOne({ owner: owner._id });
  if (!profile) {
    profile = await CommunityProfile.create({
      owner: owner._id,
      providerName: owner.name,
      businessName: owner.businessName || "",
      district: owner.district || "",
      contactNumber: owner.phone || "",
      verificationStatus: owner.status === "active" ? "approved" : "pending",
    });
  }
  return profile;
};

const calculateBookingEarnings = (totalAmount) => ({
  platformCommission: totalAmount * COMMISSION_RATE,
  providerEarning: totalAmount * (1 - COMMISSION_RATE),
});

const syncRevenueForBooking = async (booking) => {
  const monthKey = new Date(booking.date).toISOString().slice(0, 7);
  const calc = calculateBookingEarnings(booking.totalAmount);
  const existing = await ProviderRevenue.findOne({ booking: booking._id });

  if (existing) {
    existing.monthKey = monthKey;
    existing.totalAmount = booking.totalAmount;
    existing.platformCommission = calc.platformCommission;
    existing.providerEarning = calc.providerEarning;
    await existing.save();
    return existing;
  }

  return ProviderRevenue.create({ owner: booking.owner, booking: booking._id, monthKey, totalAmount: booking.totalAmount, ...calc });
};

const buildAiInsights = async (ownerId) => {
  const bookings = await ExperienceBooking.find({ owner: ownerId });
  const experiences = await Experience.find({ owner: ownerId });

  const trainedTrends = buildProviderTrends({
    district: experiences[0]?.district || "",
    category: experiences[0]?.category || "",
    providerType: "experience",
  });
  const countryHints = trainedTrends.targetCountries.length ? trainedTrends.targetCountries : ["India", "United Kingdom", "Germany", "Russian Federation", "China"];
  const monthCounter = {};
  bookings.forEach((b) => {
    const month = new Date(b.date).toLocaleString("en-US", { month: "long" });
    monthCounter[month] = (monthCounter[month] || 0) + 1;
  });
  const bestMonths = Object.entries(monthCounter).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m]) => m);

  const catCounter = {};
  experiences.forEach((e) => {
    catCounter[e.category] = (catCounter[e.category] || 0) + (e.bookingsCount || 0);
  });
  const trendingCategories = Object.entries(catCounter).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);

  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const avgTicket = bookings.length ? totalRevenue / bookings.length : 0;
  const demandScore = Math.min(98, Math.round((bookings.length * 7 + experiences.length * 5) / 2 + 40));

  return {
    targetCountries: countryHints,
    model: trainedTrends.model,
    bestMonths: bestMonths.length ? bestMonths : trainedTrends.bestMonths,
    trendingCategories: trendingCategories.length ? trendingCategories : trainedTrends.trendingCategories,
    suggestedPriceRange: avgTicket ? `$${Math.max(15, Math.round(avgTicket * 0.7))} - $${Math.round(avgTicket * 1.3)}` : "$30 - $95 per guest",
    demandScore: Math.max(demandScore, trainedTrends.demandScore),
    cards: trainedTrends.cards,
  };
};

module.exports = {
  COMMISSION_RATE,
  getOrCreateProfile,
  calculateBookingEarnings,
  syncRevenueForBooking,
  buildAiInsights,
  models: { Experience, CommunityProfile, ExperienceBooking, ProviderRevenue, ProviderCalendar },
};
