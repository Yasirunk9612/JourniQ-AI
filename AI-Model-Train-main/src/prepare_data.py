import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack


DATA_PATH = Path("data/tourism_ai_master_dataset_v2_full.csv")
MODEL_DIR = Path("models")
RESULTS_DIR = Path("results")

MODEL_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)


print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully")
print("Shape:", df.shape)
print("Columns:", df.columns.tolist())


# =========================
# Target column
# =========================

TARGET_COL = "recommendation_label"

if TARGET_COL not in df.columns:
    raise ValueError("recommendation_label column not found in dataset.")

df = df.dropna(subset=[TARGET_COL])
df[TARGET_COL] = df[TARGET_COL].astype(int)


# =========================
# Text feature
# =========================

TEXT_COL = "ml_text_features"

if TEXT_COL not in df.columns:
    raise ValueError("ml_text_features column not found in dataset.")

df[TEXT_COL] = df[TEXT_COL].fillna("").astype(str)


# =========================
# Numeric features
# =========================

numeric_cols = [
    "rooms",
    "latitude",
    "longitude",
    "has_coordinates",
    "total_foreign_arrivals_month",
    "month_share_of_known_year_arrivals",
    "district_total_entities",
    "selected_site_count_in_district"
]

available_numeric_cols = []

for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").replace(
            [np.inf, -np.inf], 0
        ).fillna(0)
        available_numeric_cols.append(col)

print("\nNumeric columns used:")
print(available_numeric_cols)


# =========================
# Train test split
# =========================

X_text_raw = df[TEXT_COL]
X_num_raw = df[available_numeric_cols]
y = df[TARGET_COL]

print("\nTarget value counts:")
print(y.value_counts())


X_text_train, X_text_test, X_num_train, X_num_test, y_train, y_test = train_test_split(
    X_text_raw,
    X_num_raw,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# =========================
# TF-IDF text encoding
# =========================

print("\nTraining TF-IDF vectorizer...")

tfidf = TfidfVectorizer(
    max_features=5000,
    stop_words="english",
    ngram_range=(1, 2)
)

X_text_train_tfidf = tfidf.fit_transform(X_text_train)
X_text_test_tfidf = tfidf.transform(X_text_test)

print("TF-IDF train shape:", X_text_train_tfidf.shape)
print("TF-IDF test shape:", X_text_test_tfidf.shape)


# =========================
# Numeric scaling
# =========================

print("\nScaling numeric features...")

scaler = StandardScaler()

X_num_train_scaled = scaler.fit_transform(X_num_train)
X_num_test_scaled = scaler.transform(X_num_test)


# =========================
# Combine text + numeric features
# =========================

X_train = hstack([X_text_train_tfidf, X_num_train_scaled])
X_test = hstack([X_text_test_tfidf, X_num_test_scaled])

print("\nFinal training matrix shape:", X_train.shape)
print("Final testing matrix shape:", X_test.shape)


# =========================
# Save files
# =========================

joblib.dump(X_train, MODEL_DIR / "X_train.pkl")
joblib.dump(X_test, MODEL_DIR / "X_test.pkl")
joblib.dump(y_train, MODEL_DIR / "y_train.pkl")
joblib.dump(y_test, MODEL_DIR / "y_test.pkl")

joblib.dump(tfidf, MODEL_DIR / "tfidf_vectorizer.pkl")
joblib.dump(scaler, MODEL_DIR / "numeric_scaler.pkl")
joblib.dump(available_numeric_cols, MODEL_DIR / "numeric_columns.pkl")

df.to_pickle(MODEL_DIR / "prepared_master_dataframe.pkl")

print("\nData preparation completed successfully.")
print("Saved files:")
print("- models/X_train.pkl")
print("- models/X_test.pkl")
print("- models/y_train.pkl")
print("- models/y_test.pkl")
print("- models/tfidf_vectorizer.pkl")
print("- models/numeric_scaler.pkl")
print("- models/numeric_columns.pkl")
print("- models/prepared_master_dataframe.pkl")
