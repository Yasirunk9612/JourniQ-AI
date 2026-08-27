const parseStatus = (status, allowed) => {
  if (!status) return null;
  if (!allowed.includes(status)) return { error: `Invalid status. Allowed: ${allowed.join(", ")}` };
  return { value: status };
};

const aiMonitoringTestSchema = (body) => {
  const preferences = String(body.preferences || "").trim();
  const country = String(body.country || "").trim();
  const topNRaw = Number(body.top_n ?? body.topN ?? 5);

  if (preferences.length < 6) return { error: "preferences must be at least 6 characters." };
  if (country.length < 2) return { error: "country is required." };
  if (!Number.isInteger(topNRaw) || topNRaw < 1 || topNRaw > 20) return { error: "top_n must be an integer between 1 and 20." };

  return {
    value: {
      preferences,
      country,
      topN: topNRaw,
    },
  };
};

module.exports = { parseStatus, aiMonitoringTestSchema };
