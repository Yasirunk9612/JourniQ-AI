const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Experience = require("../models/Experience");
const Destination = require("../models/Destination");
const { buildPersonalizedRecommendations, getModelSummary } = require("./aiTourismService");

const lower = (value) => String(value || "").toLowerCase();

const detectIntent = (message) => {
  const text = lower(message);
  if (/support|admin|help|problem|issue|refund|account|approve|approval/.test(text)) return "support";
  if (/hotel|stay|room|villa|resort|guest house/.test(text)) return "hotel";
  if (/experience|activity|surf|hiking|safari|food|village|wellness|cycling|camping/.test(text)) return "experience";
  if (/destination|place|visit|where|ella|galle|kandy|sigiriya|beach/.test(text)) return "destination";
  if (/plan|itinerary|trip|days|day/.test(text)) return "trip";
  return "recommendation";
};

const extractDistrict = (message) => {
  const districts = ["galle", "ella", "kandy", "colombo", "matara", "nuwara eliya", "badulla", "anuradhapura", "trincomalee", "sigiriya"];
  const text = lower(message);
  return districts.find((district) => text.includes(district)) || "";
};

const extractKeywords = (message) =>
  lower(message)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 12);

const itemAction = (label, href, type = "link") => ({ label, href, type });

const searchHotels = async ({ message, district }) => {
  const query = { verificationStatus: "approved" };
  if (district) query.district = { $regex: district, $options: "i" };
  const hotels = await Hotel.find(query).populate("owner", "name").sort({ createdAt: -1 }).limit(5);
  const roomAgg = await Room.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$owner", minPrice: { $min: "$pricePerNight" }, totalRooms: { $sum: "$availableRooms" } } },
  ]);
  const roomMap = new Map(roomAgg.map((row) => [String(row._id), row]));
  const keywords = extractKeywords(message);
  return hotels
    .map((hotel) => {
      const stats = roomMap.get(String(hotel.owner?._id || hotel.owner));
      const score = keywords.filter((word) => lower(`${hotel.hotelName} ${hotel.description} ${hotel.district} ${hotel.category} ${(hotel.facilities || []).join(" ")}`).includes(word)).length;
      return {
        title: hotel.hotelName,
        subtitle: `${hotel.district} • ${hotel.category || "Hotel"}${stats?.minPrice ? ` • from $${stats.minPrice}` : ""}`,
        description: hotel.description || "Approved Sri Lankan stay on JourniQ.",
        href: `/hotels/${hotel._id}`,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};

const searchExperiences = async ({ message, district }) => {
  const query = { status: { $in: ["approved", "active"] } };
  if (district) query.district = { $regex: district, $options: "i" };
  const keywords = extractKeywords(message);
  const experiences = await Experience.find(query).populate("owner", "name businessName").sort({ createdAt: -1 }).limit(6);
  return experiences
    .map((experience) => {
      const score = keywords.filter((word) => lower(`${experience.title} ${experience.description} ${experience.category} ${experience.district} ${experience.location}`).includes(word)).length;
      return {
        title: experience.title,
        subtitle: `${experience.district} • ${experience.category}${experience.price ? ` • $${experience.price}` : ""}`,
        description: experience.description,
        href: `/experiences/${experience._id}`,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};

const searchDestinations = async ({ message, district, user }) => {
  const query = { status: "published" };
  if (district) {
    query.$or = [
      { district: { $regex: district, $options: "i" } },
      { name: { $regex: district, $options: "i" } },
    ];
  }
  const keywords = extractKeywords(message);
  const destinations = await Destination.find(query).sort({ createdAt: -1 }).limit(6);
  const preferenceText = [
    ...(user?.touristPreferences?.interests || []),
    ...(user?.touristPreferences?.activityTypes || []),
    ...(user?.touristPreferences?.preferredDistricts || []),
  ].join(" ");
  return destinations
    .map((destination) => {
      const text = lower(`${destination.name} ${destination.description} ${destination.category} ${destination.district} ${(destination.tags || []).join(" ")} ${(destination.interests || []).join(" ")}`);
      const score = keywords.filter((word) => text.includes(word)).length + extractKeywords(preferenceText).filter((word) => text.includes(word)).length;
      return {
        title: destination.name,
        subtitle: `${destination.district} • ${destination.category}`,
        description: destination.blogExcerpt || destination.description,
        href: `/destinations/${destination.slug}`,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};

const buildAssistantReply = async ({ message, user }) => {
  const intent = detectIntent(message);
  const district = extractDistrict(message);
  const preferences = user?.touristPreferences || {};
  const preferenceText = [
    message,
    ...(preferences.interests || []),
    ...(preferences.travelStyles || []),
    ...(preferences.activityTypes || []),
    ...(preferences.accommodationTypes || []),
    preferences.pace || "",
  ].join(", ");

  if (intent === "support") {
    return {
      intent,
      answer: "I can hand this over to JourniQ support. Use the help chat so an admin can see your issue and reply from the support inbox.",
      actions: [itemAction("Open help chat", "/help", "support")],
      items: [],
      model: getModelSummary(),
    };
  }

  const [hotels, experiences, destinations] = await Promise.all([
    ["hotel", "trip", "recommendation"].includes(intent) ? searchHotels({ message, district }) : [],
    ["experience", "trip", "recommendation"].includes(intent) ? searchExperiences({ message, district }) : [],
    ["destination", "trip", "recommendation"].includes(intent) ? searchDestinations({ message, district, user }) : [],
  ]);

  const recommendations = buildPersonalizedRecommendations({
    preferences: preferenceText,
    country: user?.country || "",
    budget: (preferences.budgets || [])[0] || "",
    type: intent === "hotel" ? "hotel" : intent === "experience" ? "experience" : "all",
    district,
    limit: 4,
  });

  const items = [...destinations, ...hotels, ...experiences].slice(0, 6);
  const hasItems = items.length > 0;
  const answerByIntent = {
    hotel: hasItems ? "Here are real approved stays from JourniQ that match your question." : "I could not find approved hotels matching that exact request yet.",
    experience: hasItems ? "These real community/activity experiences match your request." : "I could not find matching approved experiences yet.",
    destination: hasItems ? "These destination stories look relevant for your travel idea." : "I could not find a matching published destination story yet.",
    trip: "For a trip plan, start with these places and listings. Open the AI Trip Planner to turn them into a day-by-day itinerary.",
    recommendation: hasItems ? "I matched your message with JourniQ listings and your preference signals." : "I used the trained recommender, but the public listings are still limited for this request.",
  };

  return {
    intent,
    answer: answerByIntent[intent] || answerByIntent.recommendation,
    actions: [
      itemAction("Plan with AI", district ? `/ai-trip-planner?destination=${encodeURIComponent(district)}` : "/ai-trip-planner", "planner"),
      itemAction("See recommendations", "/recommendations", "recommendations"),
    ],
    items,
    recommendations: recommendations.recommendations.slice(0, 4),
    model: recommendations.model,
  };
};

module.exports = { buildAssistantReply };
