import joblib
import pandas as pd
from pathlib import Path
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

MODEL_DIR = Path("models")
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

X_train = joblib.load(MODEL_DIR / "X_train.pkl")
X_test = joblib.load(MODEL_DIR / "X_test.pkl")
y_train = joblib.load(MODEL_DIR / "y_train.pkl")
y_test = joblib.load(MODEL_DIR / "y_test.pkl")

base_svm = LinearSVC(
    class_weight="balanced",
    random_state=42,
    max_iter=5000
)

model = CalibratedClassifierCV(base_svm)

print("Training SVM...")
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

metrics = {
    "model": "SVM",
    "accuracy": accuracy_score(y_test, y_pred),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred)
}

print(metrics)
print(classification_report(y_test, y_pred))

joblib.dump(model, MODEL_DIR / "svm_model.pkl")
pd.DataFrame([metrics]).to_csv(RESULTS_DIR / "svm_results.csv", index=False)

print("SVM model saved.")