import json
from pathlib import Path
import sys

import joblib
import pandas as pd
from scipy.sparse import hstack


ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "AI-Model-Train-main" / "models"
RESULTS_DIR = ROOT / "AI-Model-Train-main" / "results"

TEXT_COL = "ml_text_features"


def normalize(value):
    return str(value or "").strip()


def lower(value):
    return normalize(value).lower()


def entity_type(row):
    if str(row.get("is_stay", "")) == "1" or "stay" in lower(row.get("platform_section")):
        return "hotel"
    if str(row.get("is_food", "")) == "1":
        return "food"
    if str(row.get("is_activity", "")) == "1":
        return "activity"
    if str(row.get("is_experience", "")) == "1" or "experience" in lower(row.get("platform_section")):
        return "experience"
    if str(row.get("is_wellness", "")) == "1":
        return "wellness"
    if str(row.get("is_booking_service", "")) == "1":
        return "travel_service"
    return lower(row.get("entity_group")) or "tourism"


def tokens(value):
    stop = {"and", "or", "the", "for", "with", "from", "near", "trip", "travel", "tour", "hotel", "stay", "sri", "lanka"}
    cleaned = "".join(ch if ch.isalnum() or ch.isspace() or ch == "-" else " " for ch in lower(value))
    return [part for part in cleaned.split() if len(part) > 2 and part not in stop]


def read_model_summary():
    path = RESULTS_DIR / "model_comparison.csv"
    if not path.exists():
        return {"selectedModel": "SVM", "modelUse": "live pkl inference", "accuracy": None, "precision": None, "recall": None, "f1Score": None, "note": "Live SVM model loaded; comparison CSV unavailable."}
    rows = pd.read_csv(path).sort_values("f1_score", ascending=False)
    best = rows.iloc[0]
    return {
        "selectedModel": str(best["model"]),
        "modelUse": "live pkl inference",
        "accuracy": float(best["accuracy"]),
        "precision": float(best["precision"]),
        "recall": float(best["recall"]),
        "f1Score": float(best["f1_score"]),
        "note": "Live SVM .pkl inference is used for recommendation probability; LSTM remains demand/trend support, not a validated live hybrid.",
    }


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    preferences = normalize(payload.get("preferences"))
    country = normalize(payload.get("country"))
    budget = normalize(payload.get("budget"))
    requested_type = lower(payload.get("type") or "all")
    district = lower(payload.get("district"))
    limit = max(1, min(int(payload.get("limit") or 12), 24))

    df = joblib.load(MODEL_DIR / "prepared_master_dataframe.pkl").copy()
    model = joblib.load(MODEL_DIR / "svm_model.pkl")
    tfidf = joblib.load(MODEL_DIR / "tfidf_vectorizer.pkl")
    scaler = joblib.load(MODEL_DIR / "numeric_scaler.pkl")
    numeric_columns = joblib.load(MODEL_DIR / "numeric_columns.pkl")

    df[TEXT_COL] = df[TEXT_COL].fillna("").astype(str)
    df["_entity_type"] = df.apply(entity_type, axis=1)

    if requested_type != "all":
        if requested_type == "hotel":
            df = df[df["_entity_type"] == "hotel"]
        elif requested_type == "experience":
            df = df[df["_entity_type"].isin(["experience", "activity", "food", "wellness"])]
        else:
            mask = (df["platform_section"].fillna("").str.lower() + " " + df["subcategory"].fillna("").str.lower()).str.contains(requested_type, na=False)
            df = df[mask]

    if district:
        df = df[df["district"].fillna("").str.lower().str.contains(district, na=False)]

    if df.empty:
        print(json.dumps({"model": read_model_summary(), "recommendations": [], "preferenceSummary": {"country": country or "Any country", "budget": budget or "Any budget", "type": requested_type, "district": district or "All Sri Lanka", "terms": tokens(preferences)}}))
        return

    text_features = tfidf.transform(df[TEXT_COL])
    numeric = df[numeric_columns].apply(pd.to_numeric, errors="coerce").fillna(0)
    numeric_features = scaler.transform(numeric)
    matrix = hstack([text_features, numeric_features])

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(matrix)[:, 1]
    else:
        probabilities = model.decision_function(matrix)
        probabilities = (probabilities - probabilities.min()) / max((probabilities.max() - probabilities.min()), 1e-9)

    preference_terms = tokens(f"{preferences} {district} {budget}")
    scored = []
    for idx, (_, row) in enumerate(df.iterrows()):
        search_text = lower(f"{row.get('entity_name')} {row.get('entity_group')} {row.get('platform_section')} {row.get('subcategory')} {row.get('district')} {row.get('season_type')} {row.get(TEXT_COL)} {row.get('text_features')}")
        matched = sorted({term for term in preference_terms if term in search_text})
        content_score = len(matched) / len(preference_terms) if preference_terms else 0.35
        demand_score = min(1.0, float(row.get("total_foreign_arrivals_month") or 0) / 300000)
        country_score = 1.0 if country and lower(row.get("country")) == lower(country) else 0.0
        live_probability = float(probabilities[idx])
        final_score = min(0.99, (live_probability * 0.45) + (content_score * 0.35) + (demand_score * 0.12) + (country_score * 0.08))
        reasons = []
        if matched:
            reasons.append(f"Matches {', '.join(matched[:3])} interests")
        if live_probability:
            reasons.append(f"SVM model predicts {round(live_probability * 100)}% recommendation probability")
        if row.get("season_type"):
            reasons.append(f"{row.get('month_name') or 'Selected month'} is tagged as {row.get('season_type')}")
        if not reasons:
            reasons.append("Recommended from trained tourism score and seasonal demand")

        scored.append({
            "id": normalize(row.get("entity_id")),
            "name": normalize(row.get("entity_name")),
            "district": normalize(row.get("district")),
            "category": normalize(row.get("subcategory") or row.get("platform_section") or row.get("entity_group")),
            "type": normalize(row.get("_entity_type")),
            "finalScore": final_score,
            "contentScore": content_score,
            "countryDemandScore": max(country_score, demand_score),
            "popularityScore": min(1.0, float(row.get("popularity_score") or 0) / 100),
            "season": normalize(row.get("season_type")),
            "bestMonth": normalize(row.get("month_name")),
            "country": normalize(row.get("country")),
            "explanation": reasons,
        })

    unique = {}
    for item in sorted(scored, key=lambda value: value["finalScore"], reverse=True):
        key = item["id"] or f"{item['name']}:{item['district']}"
        if key not in unique:
            unique[key] = item
    scored = list(unique.values())[:limit]
    print(json.dumps({
        "model": read_model_summary(),
        "recommendations": scored,
        "preferenceSummary": {
            "country": country or "Any country",
            "budget": budget or "Any budget",
            "type": requested_type,
            "district": district or "All Sri Lanka",
            "terms": preference_terms,
        },
    }))


if __name__ == "__main__":
    main()
