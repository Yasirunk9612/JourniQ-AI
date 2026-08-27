const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const DATASET_PATH = path.resolve(__dirname, "../../AI-Model-Train-main/data/tourism_ai_master_dataset_v2_full.csv");
const MODEL_COMPARISON_PATH = path.resolve(__dirname, "../../AI-Model-Train-main/results/model_comparison.csv");
const SVM_SCRIPT_PATH = path.resolve(__dirname, "../ml/svm_recommend.py");

let cachedRows = null;
let cachedModelSummary = null;

const parseCsv = (text) => {
  const rows = [];
  let field = "";
  let row = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalize = (value) => String(value || "").trim();
const lower = (value) => normalize(value).toLowerCase();

const tokenize = (value) => {
  const stopWords = new Set(["and", "or", "the", "for", "with", "from", "near", "trip", "travel", "tour", "hotel", "stay", "sri", "lanka"]);
  return lower(value)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));
};

const readDatasetRows = () => {
  if (cachedRows) return cachedRows;
  if (!fs.existsSync(DATASET_PATH)) {
    cachedRows = [];
    return cachedRows;
  }

  const csv = fs.readFileSync(DATASET_PATH, "utf8");
  const [headers, ...records] = parseCsv(csv);

  cachedRows = records.map((record) => {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = record[index] || "";
    });
    return row;
  });

  return cachedRows;
};

const getModelSummary = () => {
  if (cachedModelSummary) return cachedModelSummary;
  if (!fs.existsSync(MODEL_COMPARISON_PATH)) {
    cachedModelSummary = {
      selectedModel: "SVM",
      modelUse: "trained dataset ranking",
      accuracy: null,
      precision: null,
      recall: null,
      f1Score: null,
      note: "Model comparison file was not found. Recommendations use trained dataset scores only.",
    };
    return cachedModelSummary;
  }

  const [, ...records] = parseCsv(fs.readFileSync(MODEL_COMPARISON_PATH, "utf8"));
  const ranked = records
    .map((record) => ({
      selectedModel: record[0],
      accuracy: toNumber(record[1], null),
      precision: toNumber(record[2], null),
      recall: toNumber(record[3], null),
      f1Score: toNumber(record[4], null),
    }))
    .filter((row) => row.selectedModel)
    .sort((a, b) => toNumber(b.f1Score) - toNumber(a.f1Score));

  const best = ranked[0] || {};
  cachedModelSummary = {
    selectedModel: best.selectedModel || "SVM",
    modelUse: "recommendation classification",
    accuracy: best.accuracy ?? null,
    precision: best.precision ?? null,
    recall: best.recall ?? null,
    f1Score: best.f1Score ?? null,
    note: "SVM is used as the practical recommendation model; LSTM remains demand/trend support because the existing hybrid scripts use a fixed LSTM placeholder.",
  };
  return cachedModelSummary;
};

const getEntityType = (row) => {
  if (row.is_stay === "1" || lower(row.platform_section).includes("stay")) return "hotel";
  if (row.is_food === "1") return "food";
  if (row.is_activity === "1") return "activity";
  if (row.is_experience === "1" || lower(row.platform_section).includes("experience")) return "experience";
  if (row.is_wellness === "1") return "wellness";
  if (row.is_booking_service === "1") return "travel_service";
  return lower(row.entity_group) || "tourism";
};

const explainRecommendation = ({ row, matchedTerms, country, budget }) => {
  const reasons = [];
  if (matchedTerms.length > 0) reasons.push(`Matches ${matchedTerms.slice(0, 3).join(", ")} interests`);
  if (country && lower(row.country) === lower(country)) reasons.push(`Aligned with ${country} visitor demand in the trained dataset`);
  if (row.season_type) reasons.push(`${row.month_name || "Selected month"} is tagged as ${row.season_type}`);
  if (budget) reasons.push(`Fits the ${budget} preference using destination and category signals`);
  if (reasons.length === 0) reasons.push("Recommended from trained tourism score, destination strength, and seasonal demand");
  return reasons;
};

const buildPersonalizedRecommendations = ({ preferences = "", country = "", budget = "", type = "all", district = "", limit = 12 }) => {
  if (process.env.DISABLE_LIVE_SVM_RECOMMENDER !== "true" && fs.existsSync(SVM_SCRIPT_PATH)) {
    const result = spawnSync("python3", [SVM_SCRIPT_PATH], {
      input: JSON.stringify({ preferences, country, budget, type, district, limit }),
      encoding: "utf8",
      timeout: 20000,
      maxBuffer: 1024 * 1024 * 8,
    });

    if (result.status === 0 && result.stdout) {
      try {
        return JSON.parse(result.stdout);
      } catch {
        // Fall back to the JS trained-data ranker below.
      }
    }
  }

  const rows = readDatasetRows();
  const preferenceTokens = tokenize(`${preferences} ${district} ${budget}`);
  const requestedType = lower(type);
  const requestedDistrict = lower(district);

  const scoredRows = rows
    .map((row) => {
      const entityType = getEntityType(row);
      if (requestedType && requestedType !== "all") {
        if (requestedType === "hotel" && entityType !== "hotel") return null;
        if (requestedType === "experience" && !["experience", "activity", "food", "wellness"].includes(entityType)) return null;
        if (!["hotel", "experience"].includes(requestedType) && !lower(`${row.platform_section} ${row.entity_group} ${row.subcategory}`).includes(requestedType)) return null;
      }
      if (requestedDistrict && !lower(row.district).includes(requestedDistrict)) return null;

      const searchableText = `${row.entity_name} ${row.entity_group} ${row.platform_section} ${row.subcategory} ${row.district} ${row.season_type} ${row.ml_text_features} ${row.text_features}`;
      const text = lower(searchableText);
      const matchedTerms = Array.from(new Set(preferenceTokens.filter((token) => text.includes(token))));
      const contentScore = preferenceTokens.length ? matchedTerms.length / preferenceTokens.length : 0.35;
      const aiScore = Math.min(1, toNumber(row.final_ai_score) / 100);
      const popularityScore = Math.min(1, toNumber(row.popularity_score) / 100);
      const demandScore = Math.min(1, toNumber(row.total_foreign_arrivals_month) / 300000);
      const countryScore = country && lower(row.country) === lower(country) ? 1 : 0;
      const recommendationBoost = row.recommendation_label === "1" ? 0.12 : 0;
      const finalScore = Math.min(0.99, (contentScore * 0.42) + (aiScore * 0.28) + (popularityScore * 0.12) + (demandScore * 0.1) + (countryScore * 0.08) + recommendationBoost);

      return {
        id: row.entity_id,
        name: row.entity_name,
        district: row.district,
        category: row.subcategory || row.platform_section || row.entity_group,
        type: entityType,
        finalScore,
        contentScore,
        countryDemandScore: Math.max(countryScore, demandScore),
        popularityScore,
        season: row.season_type,
        bestMonth: row.month_name,
        country: row.country,
        explanation: explainRecommendation({ row, matchedTerms, country, budget }),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.finalScore - a.finalScore);

  const uniqueRows = new Map();
  scoredRows.forEach((item) => {
    const key = item.id || `${item.name}:${item.district}`;
    if (!uniqueRows.has(key)) uniqueRows.set(key, item);
  });
  const scored = Array.from(uniqueRows.values()).slice(0, Math.max(1, Math.min(Number(limit) || 12, 24)));

  return {
    model: getModelSummary(),
    recommendations: scored,
    preferenceSummary: {
      country: country || "Any country",
      budget: budget || "Any budget",
      type: type || "all",
      district: district || "All Sri Lanka",
      terms: preferenceTokens,
    },
  };
};

const mostCommon = (rows, field, limit = 5) => {
  const counts = new Map();
  rows.forEach((row) => {
    const value = normalize(row[field]);
    if (!value) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
};

const buildProviderTrends = ({ district = "", category = "", providerType = "hotel" } = {}) => {
  const rows = readDatasetRows();
  const districtQuery = lower(district);
  const categoryQuery = lower(category);
  const providerRows = rows.filter((row) => {
    const entityType = getEntityType(row);
    const typeOk = providerType === "hotel" ? entityType === "hotel" : ["experience", "activity", "food", "wellness"].includes(entityType);
    const districtOk = !districtQuery || lower(row.district).includes(districtQuery);
    const categoryOk = !categoryQuery || lower(`${row.subcategory} ${row.platform_section} ${row.entity_group}`).includes(categoryQuery);
    return typeOk && districtOk && categoryOk;
  });
  const baseRows = providerRows.length ? providerRows : rows;
  const countryRows = mostCommon(baseRows, "country", 5);
  const monthRows = mostCommon(baseRows, "month_name", 4);
  const categoryRows = mostCommon(baseRows, "subcategory", 5);
  const avgDemand = baseRows.reduce((sum, row) => sum + Math.min(100, toNumber(row.final_ai_score)), 0) / Math.max(baseRows.length, 1);
  const avgPopularity = baseRows.reduce((sum, row) => sum + Math.min(100, toNumber(row.popularity_score)), 0) / Math.max(baseRows.length, 1);
  const demandScore = Math.round((avgDemand * 0.7) + (avgPopularity * 0.3));
  const topCategory = categoryRows[0]?.[0] || (providerType === "hotel" ? "Boutique Villas" : "Village culture");
  const topMonth = monthRows[0]?.[0] || "December";
  const topCountry = countryRows[0]?.[0] || "India";

  return {
    model: getModelSummary(),
    targetCountries: countryRows.map(([name]) => name),
    bestMonths: monthRows.map(([name]) => name),
    trendingCategories: categoryRows.map(([name]) => name),
    demandScore,
    suggestedPriceRange: providerType === "hotel" ? "$45 - $140 per night" : "$25 - $95 per guest",
    cards: [
      `${topCategory} has the strongest trained-data signal${district ? ` around ${district}` : ""}.`,
      `${topMonth} shows strong seasonal demand for this provider type.`,
      `${topCountry} appears as a high-value source market in the tourism dataset.`,
    ],
    datasetRowsUsed: baseRows.length,
  };
};

const buildTourismAnalytics = () => {
  const rows = readDatasetRows();
  const countries = mostCommon(rows, "country", 8).map(([name, value]) => ({ name, value }));
  const districts = mostCommon(rows, "district", 8).map(([name, value]) => ({ name, value }));
  const categories = mostCommon(rows, "subcategory", 8).map(([name, value]) => ({ name, value }));
  const months = mostCommon(rows, "month_name", 12).map(([name, value]) => ({ name, value }));
  const avgScore = rows.reduce((sum, row) => sum + Math.min(100, toNumber(row.final_ai_score)), 0) / Math.max(rows.length, 1);
  const recommendedRows = rows.filter((row) => row.recommendation_label === "1").length;
  return {
    model: getModelSummary(),
    datasetRows: rows.length,
    avgAiScore: Math.round(avgScore),
    recommendedRows,
    countries,
    districts,
    categories,
    months,
  };
};

const scoreListingQuality = ({ title = "", description = "", images = [], tags = [], amenities = [], price = null, location = "", category = "" }) => {
  const checks = [
    { key: "name", label: "Clear public name/title", complete: title.trim().length >= 2, weight: 12 },
    { key: "description", label: "Detailed description", complete: description.trim().split(/\s+/).filter(Boolean).length >= 80, weight: 22 },
    { key: "images", label: "Strong image gallery", complete: images.length >= 5, weight: 18 },
    { key: "amenities", label: "Amenities or included items", complete: [...amenities, ...tags].length >= 5, weight: 16 },
    { key: "price", label: "Pricing is configured", complete: price !== null && price !== undefined && Number(price) >= 0, weight: 12 },
    { key: "location", label: "Location/district is clear", complete: location.trim().length >= 2, weight: 10 },
    { key: "category", label: "Category signal is present", complete: category.trim().length >= 2, weight: 10 },
  ];
  const score = checks.reduce((sum, check) => sum + (check.complete ? check.weight : 0), 0);
  return {
    score,
    grade: score >= 85 ? "Excellent" : score >= 68 ? "Good" : score >= 45 ? "Needs work" : "Incomplete",
    checks,
    actions: checks.filter((check) => !check.complete).map((check) => check.label),
  };
};

const buildDataQualityReport = async ({ User, Hotel, Room, Experience, Destination }) => {
  const [tourists, hotels, rooms, experiences, destinations] = await Promise.all([
    User.find({ role: "tourist" }).select("touristPreferences touristBehavior"),
    Hotel.find({}).select("hotelName description images facilities verificationStatus district category"),
    Room.find({}).select("description images amenities status"),
    Experience.find({}).select("title description images includedItems status district category"),
    Destination.find({}).select("name description image interests blogHtml status"),
  ]);

  const touristsWithPreferences = tourists.filter((user) => {
    const prefs = user.touristPreferences || {};
    return ["interests", "travelStyles", "budgets", "preferredDistricts", "activityTypes", "accommodationTypes"].some((key) => (prefs[key] || []).length > 0) || Boolean(prefs.pace);
  }).length;

  const qualityRows = [
    { label: "Tourists with preferences", value: touristsWithPreferences, total: tourists.length },
    { label: "Hotels with 5+ images", value: hotels.filter((item) => (item.images || []).length >= 5).length, total: hotels.length },
    { label: "Hotels with facilities", value: hotels.filter((item) => (item.facilities || []).length >= 5).length, total: hotels.length },
    { label: "Rooms with photos", value: rooms.filter((item) => (item.images || []).length > 0).length, total: rooms.length },
    { label: "Experiences with 5+ images", value: experiences.filter((item) => (item.images || []).length >= 5).length, total: experiences.length },
    { label: "Destinations with preference tags", value: destinations.filter((item) => (item.interests || []).length > 0).length, total: destinations.length },
    { label: "Destinations with blog posts", value: destinations.filter((item) => String(item.blogHtml || "").trim().length > 0).length, total: destinations.length },
  ];

  return {
    model: getModelSummary(),
    summary: {
      tourists: tourists.length,
      hotels: hotels.length,
      rooms: rooms.length,
      experiences: experiences.length,
      destinations: destinations.length,
    },
    qualityRows: qualityRows.map((row) => ({
      ...row,
      percent: row.total ? Math.round((row.value / row.total) * 100) : 0,
    })),
    actions: qualityRows
      .filter((row) => row.total > 0 && row.value / row.total < 0.7)
      .map((row) => `Improve ${row.label.toLowerCase()} to strengthen recommendations.`),
  };
};

module.exports = {
  buildPersonalizedRecommendations,
  buildProviderTrends,
  buildTourismAnalytics,
  buildDataQualityReport,
  scoreListingQuality,
  getModelSummary,
};
