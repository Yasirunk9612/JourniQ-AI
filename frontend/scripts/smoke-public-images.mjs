import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredAssets = [
  "/images/blue-beach-island.jpg",
  "/images/galle-fort-travel-guide-sri-lanka.jpg",
  "/images/mirissa-sri-lanka.jpg",
  "/images/sri-lanka-highlands.jpg",
  "/images/pol-rotti-coconut-sambol.jpg",
  "/images/yapahuwa-rock-fortress-sri-lanka.jpg",
  "/images/best-relaxation.jpg",
];

const filesToCheck = [
  "app/(public)/page.tsx",
  "app/(public)/about/page.tsx",
  "app/(public)/ai-trip-planner/page.tsx",
  "app/(public)/contact/page.tsx",
  "app/(public)/destinations/page.tsx",
  "app/(public)/experiences/page.tsx",
  "app/(public)/hotels/page.tsx",
  "app/(public)/recommendations/page.tsx",
  "components/public/HeroSection.tsx",
];

const failures = [];

for (const asset of requiredAssets) {
  const filePath = join(root, "public", asset.replace(/^\//, ""));
  if (!existsSync(filePath)) {
    failures.push(`Missing public asset: ${asset}`);
  }
}

const homePage = readFileSync(join(root, "app/(public)/page.tsx"), "utf8");
for (const label of ["Golden beaches", "Misty highlands", "Food trails", "Culture shots"]) {
  if (!homePage.includes(label)) {
    failures.push(`Missing home mood card label: ${label}`);
  }
}

for (const asset of requiredAssets.slice(0, 6)) {
  if (!homePage.includes(asset) && asset !== "/images/best-relaxation.jpg") {
    failures.push(`Home page does not reference expected asset: ${asset}`);
  }
}

for (const file of filesToCheck) {
  const content = readFileSync(join(root, file), "utf8");
  if (/images\.unsplash|source\.unsplash/.test(content)) {
    failures.push(`External placeholder image still found in ${file}`);
  }
}

if (failures.length) {
  console.error("Smoke checks failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Public image smoke checks passed.");
