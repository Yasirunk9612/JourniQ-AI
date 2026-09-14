import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:5008";
const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
const runLive = process.env.RUN_LIVE === "1";
const failures = [];
const warnings = [];
const passed = [];

function pass(name) {
  passed.push(name);
}

function fail(name, detail) {
  failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

function warn(name, detail) {
  warnings.push(`${name}${detail ? `: ${detail}` : ""}`);
}

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function expectFile(relativePath) {
  if (existsSync(join(root, relativePath))) pass(`file exists: ${relativePath}`);
  else fail("missing file", relativePath);
}

function expectIncludes(relativePath, snippets) {
  const content = read(relativePath);
  for (const snippet of snippets) {
    if (content.includes(snippet)) pass(`${relativePath} includes ${snippet}`);
    else fail(`${relativePath} missing expected code`, snippet);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

async function checkLiveApi() {
  const endpoints = [
    ["GET", "/api/health"],
    ["GET", "/api/public/destinations"],
    ["GET", "/api/public/hotels"],
    ["GET", "/api/public/experiences"],
  ];

  for (const [method, path] of endpoints) {
    try {
      const { response } = await request(path, { method });
      if (response.ok) pass(`live API ${method} ${path}`);
      else fail(`live API ${method} ${path}`, `HTTP ${response.status}`);
    } catch (error) {
      fail(`live API ${method} ${path}`, error.message);
    }
  }

  try {
    const { response, body } = await request("/api/public/recommendations", {
      method: "POST",
      body: JSON.stringify({ preferences: "beach culture food", country: "Sri Lanka", type: "all", limit: 3 }),
    });
    if (response.ok && Array.isArray(body?.recommendations)) pass("live API POST /api/public/recommendations");
    else fail("live API POST /api/public/recommendations", `HTTP ${response.status}`);
  } catch (error) {
    fail("live API POST /api/public/recommendations", error.message);
  }
}

async function checkLiveFrontend() {
  const pages = ["/", "/destinations", "/hotels", "/experiences", "/recommendations", "/ai-trip-planner", "/login", "/register"];
  for (const page of pages) {
    try {
      const response = await fetch(`${frontendBaseUrl}${page}`);
      if (response.ok) pass(`frontend page ${page}`);
      else fail(`frontend page ${page}`, `HTTP ${response.status}`);
    } catch (error) {
      fail(`frontend page ${page}`, error.message);
    }
  }
}

async function checkOptionalAuth() {
  const email = process.env.TEST_TOURIST_EMAIL;
  const password = process.env.TEST_TOURIST_PASSWORD;
  if (!email || !password) {
    warn("tourist auth live test skipped", "set TEST_TOURIST_EMAIL and TEST_TOURIST_PASSWORD");
    return;
  }

  try {
    const login = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role: "tourist" }),
    });
    const token = login.body?.token;
    if (!login.response.ok || !token) {
      fail("tourist login", `HTTP ${login.response.status}`);
      return;
    }
    pass("tourist login");

    const me = await request("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    if (me.response.ok && me.body?.user) pass("tourist /api/auth/me");
    else fail("tourist /api/auth/me", `HTTP ${me.response.status}`);
  } catch (error) {
    fail("tourist auth live test", error.message);
  }
}

function checkSourceContracts() {
  const requiredAssets = [
    "frontend/public/images/blue-beach-island.jpg",
    "frontend/public/images/galle-fort-travel-guide-sri-lanka.jpg",
    "frontend/public/images/mirissa-sri-lanka.jpg",
    "frontend/public/images/sri-lanka-highlands.jpg",
    "frontend/public/images/pol-rotti-coconut-sambol.jpg",
    "frontend/public/images/yapahuwa-rock-fortress-sri-lanka.jpg",
    "frontend/public/images/best-relaxation.jpg",
  ];
  requiredAssets.forEach(expectFile);

  expectIncludes("frontend/app/(public)/page.tsx", [
    "Golden beaches",
    "Misty highlands",
    "Food trails",
    "Culture shots",
    "/images/mirissa-sri-lanka.jpg",
    "/images/pol-rotti-coconut-sambol.jpg",
  ]);

  expectIncludes("backend/server.js", [
    "app.get(\"/api/health\"",
    "app.use(\"/api/auth\"",
    "app.use(\"/api/public\"",
    "setupChatSocket(io)",
  ]);

  expectIncludes("backend/routes/public/publicRoutes.js", [
    "router.get(\"/hotels\"",
    "router.get(\"/destinations\"",
    "router.get(\"/experiences\"",
    "router.post(\"/recommendations\"",
    "router.post(\"/bookings/hotel\"",
    "router.post(\"/bookings/experience\"",
  ]);
}

function checkPythonSvm() {
  const script = join(root, "backend/ml/svm_recommend.py");
  expectFile("backend/ml/svm_recommend.py");
  const result = spawnSync("python3", [script], {
    input: JSON.stringify({ preferences: "beach culture food", country: "Sri Lanka", type: "all", limit: 3 }),
    encoding: "utf8",
    cwd: root,
    timeout: 30000,
  });

  if (result.error) {
    fail("python SVM recommender", result.error.message);
    return;
  }
  if (result.status !== 0) {
    fail("python SVM recommender", result.stderr || `exit ${result.status}`);
    return;
  }
  try {
    const output = JSON.parse(result.stdout);
    if (output.model && Array.isArray(output.recommendations) && output.preferenceSummary) {
      pass("python SVM recommender output shape");
    } else {
      fail("python SVM recommender output shape", "missing model/recommendations/preferenceSummary");
    }
  } catch (error) {
    fail("python SVM recommender JSON parse", error.message);
  }
}

function checkBackendSyntax() {
  const result = spawnSync("zsh", ["-lc", "find backend -path '*/node_modules' -prune -o -name '*.js' -print | xargs -n 1 node --check"], {
    cwd: root,
    encoding: "utf8",
    timeout: 30000,
  });
  if (result.status === 0) pass("backend JavaScript syntax");
  else fail("backend JavaScript syntax", result.stderr || result.stdout);
}

checkSourceContracts();
checkPythonSvm();
checkBackendSyntax();

if (runLive) {
  await checkLiveApi();
  await checkLiveFrontend();
  await checkOptionalAuth();
} else {
  warn("live API/frontend tests skipped", "set RUN_LIVE=1 after starting frontend and backend");
}

console.log(`\nPassed: ${passed.length}`);
for (const item of passed) console.log(`✓ ${item}`);

if (warnings.length) {
  console.log(`\nWarnings: ${warnings.length}`);
  for (const item of warnings) console.log(`! ${item}`);
}

if (failures.length) {
  console.error(`\nFailed: ${failures.length}`);
  for (const item of failures) console.error(`✗ ${item}`);
  process.exit(1);
}

console.log("\nFull-system checks passed.");
