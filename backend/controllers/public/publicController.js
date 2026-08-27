const asyncHandler = require("../../utils/asyncHandler");
const Hotel = require("../../models/Hotel");
const Room = require("../../models/Room");
const Experience = require("../../models/Experience");
const Destination = require("../../models/Destination");
const Booking = require("../../models/Booking");
const ExperienceBooking = require("../../models/ExperienceBooking");
const User = require("../../models/User");
const { buildPersonalizedRecommendations } = require("../../services/aiTourismService");
const { ChatMessage, conversationResponse, getOrCreateListingConversation, messageResponse } = require("../../services/chatService");
const { buildAssistantReply } = require("../../services/aiAssistantService");
const { getFrontendUrl, sendMany } = require("../../utils/emailService");
const { bookingRequestTemplate, travelerBookingReceivedTemplate, formatDate } = require("../../utils/emailTemplates");

const nextId = (prefix) => `${prefix}-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

const emitBookingChat = async (req, conversation) => {
  const io = req.app.get("io");
  if (!io || !conversation) return;
  const lastMessage = await ChatMessage.findOne({ conversation: conversation._id }).populate("sender", "name email role profileImage businessName").sort({ createdAt: -1 });
  const payload = {
    conversation: conversationResponse(conversation),
    message: lastMessage ? messageResponse(lastMessage) : null,
  };
  conversation.participants.forEach((participant) => {
    const userId = String(participant.user?._id || participant.user);
    io.to(`user:${userId}`).emit("chat:message", payload);
  });
};

const destinationPayload = (destination, matchScore = null, matchReasons = []) => ({
  id: String(destination._id),
  slug: destination.slug,
  name: destination.name,
  district: destination.district,
  province: destination.province,
  category: destination.category,
  description: destination.description,
  image: destination.image,
  bestTime: destination.bestTime,
  tags: destination.tags || [],
  interests: destination.interests || [],
  rating: destination.rating,
  blogTitle: destination.blogTitle,
  blogExcerpt: destination.blogExcerpt,
  matchScore,
  matchReasons,
});

const scoreDestinationForUser = (destination, user) => {
  const preferences = user?.touristPreferences || {};
  const preferenceTerms = [
    ...(preferences.interests || []),
    ...(preferences.preferredDistricts || []),
    ...(preferences.activityTypes || []),
    ...(preferences.accommodationTypes || []),
    ...(preferences.travelStyles || []),
    ...(preferences.budgets || []),
    preferences.pace || "",
  ].map((item) => String(item).toLowerCase()).filter(Boolean);

  const text = [
    destination.name,
    destination.district,
    destination.province,
    destination.category,
    destination.description,
    ...(destination.tags || []),
    ...(destination.interests || []),
  ].join(" ").toLowerCase();
  const matches = Array.from(new Set(preferenceTerms.filter((term) => text.includes(term.toLowerCase()))));
  const score = preferenceTerms.length ? Math.min(0.98, 0.45 + (matches.length / preferenceTerms.length) * 0.5 + (destination.rating || 0) / 100) : null;
  const reasons = matches.length ? matches.slice(0, 3).map((term) => `Matches your ${term} preference`) : [];
  return { score, reasons };
};

const getPublicDestinations = asyncHandler(async (req, res) => {
  const { category, region, search } = req.query;
  const query = { status: "published" };
  if (category && category !== "All") query.category = { $regex: String(category), $options: "i" };
  if (region && region !== "All") query.province = { $regex: String(region), $options: "i" };
  if (search) {
    query.$or = [
      { name: { $regex: String(search), $options: "i" } },
      { district: { $regex: String(search), $options: "i" } },
      { category: { $regex: String(search), $options: "i" } },
      { tags: { $regex: String(search), $options: "i" } },
      { interests: { $regex: String(search), $options: "i" } },
    ];
  }

  const rows = await Destination.find(query).sort({ createdAt: -1 });
  const destinations = rows
    .map((destination) => {
      const scored = scoreDestinationForUser(destination, req.user);
      return destinationPayload(destination, scored.score, scored.reasons);
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0) || b.rating - a.rating);

  res.json({ destinations, personalized: Boolean(req.user?.touristPreferences), count: destinations.length });
});

const getPublicDestinationBySlug = asyncHandler(async (req, res) => {
  const destination = await Destination.findOne({ slug: req.params.slug, status: "published" });
  if (!destination) return res.status(404).json({ message: "Destination not found." });
  const scored = scoreDestinationForUser(destination, req.user);
  res.json({
    destination: {
      ...destinationPayload(destination, scored.score, scored.reasons),
      blogHtml: destination.blogHtml,
      blogCss: destination.blogCss,
      createdAt: destination.createdAt,
      updatedAt: destination.updatedAt,
    },
  });
});

const getPublicHotels = asyncHandler(async (req, res) => {
  const { district, type } = req.query;
  const query = { verificationStatus: "approved" };
  if (district) query.district = { $regex: String(district), $options: "i" };
  if (type) query.category = { $regex: String(type), $options: "i" };

  const hotels = await Hotel.find(query).populate("owner", "name").sort({ createdAt: -1 });

  const roomAgg = await Room.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: "$owner",
        totalRooms: { $sum: "$availableRooms" },
        minPrice: { $min: "$pricePerNight" },
      },
    },
  ]);

  const roomMap = new Map(roomAgg.map((r) => [String(r._id), r]));

  const rows = hotels.map((h) => {
    const stats = roomMap.get(String(h.owner?._id || h.owner));
    return {
      id: String(h._id),
      ownerId: String(h.owner?._id || h.owner),
      name: h.hotelName,
      district: h.district,
      type: h.category || "Hotel",
      rooms: stats?.totalRooms || 0,
      rating: 4.6,
      price: stats?.minPrice ? `$${stats.minPrice} / night` : "Contact for price",
      image: h.previewImage || h.images?.[0] || "",
      images: h.images || [],
      facilities: h.facilities || [],
      description: h.description || "Authentic Sri Lankan stay experience.",
      ownerName: h.owner?.name || "Hotel Owner",
    };
  });

  res.json({ hotels: rows });
});

const getPublicHotelById = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findOne({ _id: req.params.id, verificationStatus: "approved" }).populate("owner", "name");
  if (!hotel) return res.status(404).json({ message: "Hotel not found." });

  const rooms = await Room.find({ owner: hotel.owner?._id || hotel.owner, status: "active" }).sort({ pricePerNight: 1 });
  const minPrice = rooms.length > 0 ? Math.min(...rooms.map((room) => room.pricePerNight)) : null;

  res.json({
    hotel: {
      id: String(hotel._id),
      ownerId: String(hotel.owner?._id || hotel.owner),
      name: hotel.hotelName,
      district: hotel.district,
      address: hotel.address,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      type: hotel.category || "Hotel",
      rooms: rooms.reduce((sum, room) => sum + room.availableRooms, 0),
      rating: 4.6,
      price: minPrice ? `$${minPrice} / night` : "Contact for price",
      image: hotel.previewImage || hotel.images?.[0] || "",
      images: hotel.images || [],
      facilities: hotel.facilities || [],
      description: hotel.description || "Authentic Sri Lankan stay experience.",
      ownerName: hotel.owner?.name || "Hotel Owner",
    },
    rooms: rooms.map((room) => ({
      id: String(room._id),
      roomType: room.roomType,
      description: room.description,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      amenities: room.amenities || [],
      availableRooms: room.availableRooms,
      images: room.images || [],
      status: room.status,
    })),
  });
});

const getPublicExperiences = asyncHandler(async (req, res) => {
  const { district, category } = req.query;
  const query = { status: { $in: ["approved", "active"] } };
  if (district) query.district = { $regex: String(district), $options: "i" };
  if (category) query.category = { $regex: String(category), $options: "i" };

  const experiences = await Experience.find(query).populate("owner", "name").sort({ createdAt: -1 });
  res.json({
    experiences: experiences.map((e) => ({
      id: String(e._id),
      ownerId: String(e.owner?._id || e.owner),
      name: e.title,
      title: e.title,
      category: e.category,
      district: e.district,
      description: e.description,
      image: e.previewImage || e.images?.[0] || "",
      images: e.images || [],
      price: e.price,
      duration: e.duration,
      maxGuests: e.maxGuests,
      rating: e.rating || 0,
      bookingsCount: e.bookingsCount || 0,
      ownerName: e.owner?.name || "Provider",
      includedItems: e.includedItems || [],
      safetyNotes: e.safetyNotes || "",
      location: e.location || "",
    })),
  });
});

const getPublicExperienceById = asyncHandler(async (req, res) => {
  const experience = await Experience.findOne({
    _id: req.params.id,
    status: { $in: ["approved", "active"] },
  }).populate("owner", "name businessName");

  if (!experience) return res.status(404).json({ message: "Experience not found." });

  res.json({
    experience: {
      id: String(experience._id),
      ownerId: String(experience.owner?._id || experience.owner),
      name: experience.title,
      title: experience.title,
      category: experience.category,
      district: experience.district,
      location: experience.location,
      description: experience.description,
      image: experience.previewImage || experience.images?.[0] || "",
      images: experience.images || [],
      price: experience.price,
      duration: experience.duration,
      maxGuests: experience.maxGuests,
      rating: experience.rating || 0,
      bookingsCount: experience.bookingsCount || 0,
      ownerName: experience.owner?.businessName || experience.owner?.name || "Provider",
      includedItems: experience.includedItems || [],
      safetyNotes: experience.safetyNotes || "",
    },
  });
});

const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const payload = {
    preferences: req.body.preferences || req.query.preferences || "",
    country: req.body.country || req.query.country || "",
    budget: req.body.budget || req.query.budget || "",
    type: req.body.type || req.query.type || "all",
    district: req.body.district || req.query.district || "",
    limit: req.body.limit || req.query.limit || 12,
  };
  const result = buildPersonalizedRecommendations({
    ...payload,
  });

  if (req.user?.role === "tourist") {
    req.user.touristBehavior = req.user.touristBehavior || {};
    req.user.touristBehavior.recommendationSearches = [
      ...(req.user.touristBehavior.recommendationSearches || []),
      {
        preferences: payload.preferences,
        country: payload.country,
        budget: payload.budget,
        type: payload.type,
        district: payload.district,
      },
    ].slice(-20);
    await req.user.save();
  }

  res.json(result);
});

const getTouristAiProfile = asyncHandler(async (req, res) => {
  const prefs = req.user.touristPreferences || {};
  const behavior = req.user.touristBehavior || {};
  const terms = [
    ...(prefs.interests || []),
    ...(prefs.travelStyles || []),
    ...(prefs.budgets || []),
    ...(prefs.preferredDistricts || []),
    ...(prefs.activityTypes || []),
    ...(prefs.accommodationTypes || []),
    prefs.pace || "",
  ].filter(Boolean);
  const recommendationInput = {
    preferences: terms.join(", "),
    country: req.user.country || "",
    budget: (prefs.budgets || [])[0] || "",
    type: "all",
    district: (prefs.preferredDistricts || [])[0] || "",
    limit: 8,
  };
  const result = buildPersonalizedRecommendations(recommendationInput);
  const style =
    (prefs.activityTypes || []).includes("Adventure") || (prefs.interests || []).includes("Adventure")
      ? "Adventure seeker"
      : (prefs.interests || []).some((item) => /culture|heritage|village/i.test(item))
        ? "Culture explorer"
        : (prefs.interests || []).some((item) => /beach|wellness/i.test(item))
          ? "Coastal relaxer"
          : "Sri Lanka discovery traveler";
  res.json({
    profile: {
      style,
      terms,
      preferences: prefs,
      behavior,
      completeness: Math.min(100, Math.round((terms.length / 10) * 100)),
      recommendations: result.recommendations,
      model: result.model,
    },
  });
});

const chatWithAiAssistant = asyncHandler(async (req, res) => {
  const message = String(req.body.message || "").trim();
  if (!message) return res.status(400).json({ message: "Message is required." });
  if (message.length > 1200) return res.status(400).json({ message: "Message is too long." });
  const reply = await buildAssistantReply({ message, user: req.user || null });
  res.json({ reply });
});

const trackTripPlannerInput = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "tourist") {
    return res.status(401).json({ message: "Tourist login is required to save planner behavior." });
  }

  req.user.touristBehavior = req.user.touristBehavior || {};
  req.user.touristBehavior.tripPlannerInputs = [
    ...(req.user.touristBehavior.tripPlannerInputs || []),
    {
      destination: req.body.destination || "",
      startDate: req.body.startDate || "",
      endDate: req.body.endDate || "",
      travellers: Number(req.body.travellers) || 1,
      budget: req.body.budget || "",
      interests: req.body.interests || "",
      pace: req.body.pace || "",
      accommodation: req.body.accommodation || "",
      activities: req.body.activities || "",
      start: req.body.start || "",
      notes: req.body.notes || "",
    },
  ].slice(-20);

  const interestValues = String(req.body.interests || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const activityValues = String(req.body.activities || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  req.user.touristPreferences = req.user.touristPreferences || {};
  req.user.touristPreferences.interests = Array.from(new Set([...(req.user.touristPreferences.interests || []), ...interestValues])).slice(-20);
  req.user.touristPreferences.activityTypes = Array.from(new Set([...(req.user.touristPreferences.activityTypes || []), ...activityValues])).slice(-20);
  req.user.touristPreferences.budgets = Array.from(new Set([...(req.user.touristPreferences.budgets || []), req.body.budget].filter(Boolean))).slice(-10);
  req.user.touristPreferences.accommodationTypes = Array.from(new Set([...(req.user.touristPreferences.accommodationTypes || []), req.body.accommodation].filter(Boolean))).slice(-10);
  req.user.touristPreferences.pace = req.body.pace || req.user.touristPreferences.pace || "";

  await req.user.save();
  res.json({ message: "Trip planner behavior saved." });
});

const createHotelBooking = asyncHandler(async (req, res) => {
  const { hotelId, roomId, checkIn, checkOut, guests = 1 } = req.body;
  if (!hotelId || !checkIn || !checkOut) {
    return res.status(400).json({ message: "hotelId, checkIn, and checkOut are required." });
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel || hotel.verificationStatus !== "approved") {
    return res.status(404).json({ message: "Hotel not found." });
  }

  let room = null;
  if (roomId) {
    room = await Room.findOne({ _id: roomId, owner: hotel.owner });
  }
  if (!room) {
    room = await Room.findOne({ owner: hotel.owner, status: "active" }).sort({ pricePerNight: 1 });
  }
  if (!room) {
    return res.status(400).json({ message: "No active rooms available for this hotel." });
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));
  const totalAmount = nights * room.pricePerNight;

  const booking = await Booking.create({
    owner: hotel.owner,
    room: room._id,
    tourist: req.user._id,
    bookingId: nextId("HBK"),
    guestName: req.user.name,
    guestEmail: req.user.email,
    roomType: room.roomType,
    checkIn: inDate,
    checkOut: outDate,
    totalAmount,
    status: "pending",
  });

  if (req.user?.role === "tourist") {
    req.user.touristBehavior = req.user.touristBehavior || {};
    req.user.touristBehavior.hotelBookings = (req.user.touristBehavior.hotelBookings || 0) + 1;
    req.user.touristBehavior.lastBookedDistricts = Array.from(new Set([...(req.user.touristBehavior.lastBookedDistricts || []), hotel.district].filter(Boolean))).slice(-10);
    req.user.touristBehavior.lastBookedCategories = Array.from(new Set([...(req.user.touristBehavior.lastBookedCategories || []), hotel.category].filter(Boolean))).slice(-10);
    await req.user.save();
  }

  const conversation = await getOrCreateListingConversation({
    tourist: req.user,
    contextType: "hotel",
    contextId: hotel._id,
    initialMessage: `Booking request sent for ${hotel.hotelName}: ${room.roomType}, ${nights} night${nights === 1 ? "" : "s"}, ${guests} guest${Number(guests) === 1 ? "" : "s"}.`,
  });
  await emitBookingChat(req, conversation);

  const owner = await User.findById(hotel.owner);
  const dateLabel = `${formatDate(inDate)} to ${formatDate(outDate)}`;
  await sendMany([
    owner?.email
      ? {
          to: owner.email,
          ...bookingRequestTemplate({
            travelerName: req.user.name,
            listingName: `${hotel.hotelName} - ${room.roomType}`,
            bookingId: booking.bookingId,
            dateLabel,
            totalAmount,
            portalUrl: `${getFrontendUrl()}/hotel-owner/bookings`,
            kind: "hotel",
          }),
        }
      : null,
    {
      to: req.user.email,
      ...travelerBookingReceivedTemplate({
        name: req.user.name,
        listingName: `${hotel.hotelName} - ${room.roomType}`,
        bookingId: booking.bookingId,
        dateLabel,
        totalAmount,
        kind: "hotel",
      }),
    },
  ]);

  res.status(201).json({ message: "Hotel booking created.", booking });
});

const createExperienceBooking = asyncHandler(async (req, res) => {
  const { experienceId, date, guests = 1 } = req.body;
  if (!experienceId || !date) {
    return res.status(400).json({ message: "experienceId and date are required." });
  }

  const experience = await Experience.findById(experienceId);
  if (!experience || !["approved", "active"].includes(experience.status)) {
    return res.status(404).json({ message: "Experience not found." });
  }

  const guestsCount = Number(guests);
  if (!Number.isFinite(guestsCount) || guestsCount < 1 || guestsCount > experience.maxGuests) {
    return res.status(400).json({ message: `guests must be between 1 and ${experience.maxGuests}.` });
  }

  const totalAmount = experience.price * guestsCount;
  const booking = await ExperienceBooking.create({
    owner: experience.owner,
    experience: experience._id,
    tourist: req.user._id,
    bookingId: nextId("ABK"),
    touristName: req.user.name,
    touristEmail: req.user.email,
    experienceTitle: experience.title,
    date: new Date(date),
    guests: guestsCount,
    totalAmount,
    status: "pending",
  });

  if (req.user?.role === "tourist") {
    req.user.touristBehavior = req.user.touristBehavior || {};
    req.user.touristBehavior.experienceBookings = (req.user.touristBehavior.experienceBookings || 0) + 1;
    req.user.touristBehavior.lastBookedDistricts = Array.from(new Set([...(req.user.touristBehavior.lastBookedDistricts || []), experience.district].filter(Boolean))).slice(-10);
    req.user.touristBehavior.lastBookedCategories = Array.from(new Set([...(req.user.touristBehavior.lastBookedCategories || []), experience.category].filter(Boolean))).slice(-10);
    await req.user.save();
  }

  const conversation = await getOrCreateListingConversation({
    tourist: req.user,
    contextType: "experience",
    contextId: experience._id,
    initialMessage: `Experience booking request sent for ${experience.title}: ${guestsCount} guest${guestsCount === 1 ? "" : "s"} on ${new Date(date).toDateString()}.`,
  });
  await emitBookingChat(req, conversation);

  const owner = await User.findById(experience.owner);
  const dateLabel = formatDate(date);
  await sendMany([
    owner?.email
      ? {
          to: owner.email,
          ...bookingRequestTemplate({
            travelerName: req.user.name,
            listingName: experience.title,
            bookingId: booking.bookingId,
            dateLabel,
            totalAmount,
            portalUrl: `${getFrontendUrl()}/activity-provider/bookings`,
            kind: "experience",
          }),
        }
      : null,
    {
      to: req.user.email,
      ...travelerBookingReceivedTemplate({
        name: req.user.name,
        listingName: experience.title,
        bookingId: booking.bookingId,
        dateLabel,
        totalAmount,
        kind: "experience",
      }),
    },
  ]);

  res.status(201).json({ message: "Experience booking created.", booking });
});

module.exports = {
  getPublicHotels,
  getPublicDestinations,
  getPublicDestinationBySlug,
  getPublicHotelById,
  getPublicExperiences,
  getPublicExperienceById,
  getPersonalizedRecommendations,
  getTouristAiProfile,
  chatWithAiAssistant,
  trackTripPlannerInput,
  createHotelBooking,
  createExperienceBooking,
};
