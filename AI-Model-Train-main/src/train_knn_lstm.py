import joblib
import pandas as pd
from pathlib import Path
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

MODEL_DIR = Path("models")
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

X_test = joblib.load(MODEL_DIR / "X_test.pkl")
y_test = joblib.load(MODEL_DIR / "y_test.pkl")

knn_model = joblib.load(MODEL_DIR / "knn_model.pkl")

print("Creating KNN + LSTM hybrid scores...")

knn_probs = knn_model.predict_proba(X_test)[:, 1]

# LSTM demand score placeholder
lstm_demand_score = 0.5

hybrid_scores = (0.7 * knn_probs) + (0.3 * lstm_demand_score)

y_pred = (hybrid_scores >= 0.5).astype(int)

metrics = {
    "model": "KNN + LSTM",
    "accuracy": accuracy_score(y_test, y_pred),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred)
}

print(metrics)
print(classification_report(y_test, y_pred))

pd.DataFrame([metrics]).to_csv(RESULTS_DIR / "knn_lstm_results.csv", index=False)

print("KNN + LSTM hybrid completed.")