import joblib
import pandas as pd
from pathlib import Path
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

MODEL_DIR = Path("models")
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

X_train = joblib.load(MODEL_DIR / "X_train.pkl")
X_test = joblib.load(MODEL_DIR / "X_test.pkl")
y_train = joblib.load(MODEL_DIR / "y_train.pkl")
y_test = joblib.load(MODEL_DIR / "y_test.pkl")

base_model = DecisionTreeClassifier(
    max_depth=2,
    random_state=42
)

model = AdaBoostClassifier(
    estimator=base_model,
    n_estimators=100,
    learning_rate=0.5,
    random_state=42
)

print("Training AdaBoost...")
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

metrics = {
    "model": "AdaBoost",
    "accuracy": accuracy_score(y_test, y_pred),
    "precision": precision_score(y_test, y_pred),
    "recall": recall_score(y_test, y_pred),
    "f1_score": f1_score(y_test, y_pred)
}

print(metrics)
print(classification_report(y_test, y_pred))

joblib.dump(model, MODEL_DIR / "adaboost_model.pkl")
pd.DataFrame([metrics]).to_csv(RESULTS_DIR / "adaboost_results.csv", index=False)

print("AdaBoost model saved.")