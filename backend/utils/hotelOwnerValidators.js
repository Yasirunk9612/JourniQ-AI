const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
};

const roomSchema = (body) => {
  const errors = [];
  if (!body.roomType || typeof body.roomType !== "string") errors.push("roomType is required");
  if (body.pricePerNight === undefined || Number.isNaN(Number(body.pricePerNight))) errors.push("pricePerNight must be a number");
  if (body.capacity === undefined || Number.isNaN(Number(body.capacity))) errors.push("capacity must be a number");

  if (errors.length > 0) return { error: errors.join(", "), value: null };

  const value = {
      roomType: body.roomType.trim(),
      description: (body.description || "").trim(),
      pricePerNight: Number(body.pricePerNight),
      capacity: Number(body.capacity),
      amenities: parseArrayField(body.amenities),
      availableRooms: body.availableRooms !== undefined ? Number(body.availableRooms) : 0,
      status: body.status || "active",
  };
  if (Array.isArray(body.images)) value.images = body.images;

  return { error: null, value };
};

const hotelSchema = (body) => {
  if (!body.hotelName || typeof body.hotelName !== "string") {
    return { error: "hotelName is required", value: null };
  }

  const value = {
      hotelName: body.hotelName.trim(),
      description: (body.description || "").trim(),
      district: (body.district || "").trim(),
      address: (body.address || "").trim(),
      latitude: body.latitude !== undefined ? Number(body.latitude) : 0,
      longitude: body.longitude !== undefined ? Number(body.longitude) : 0,
      category: (body.category || "Hotel").trim(),
      facilities: parseArrayField(body.facilities),
  };
  if (Array.isArray(body.images)) value.images = body.images;

  return { error: null, value };
};

module.exports = { roomSchema, hotelSchema };
