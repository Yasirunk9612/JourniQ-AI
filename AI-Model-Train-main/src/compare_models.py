import pandas as pd
from pathlib import Path

RESULTS_DIR = Path("results")

files = [
    "random_forest_results.csv",
    "knn_results.csv",
    "svm_results.csv",
    "xgboost_results.csv",
    "adaboost_results.csv",
    "svm_lstm_results.csv",
    "knn_lstm_results.csv"
]

all_results = []

for file in files:
    path = RESULTS_DIR / file
    if path.exists():
        df = pd.read_csv(path)
        all_results.append(df)

comparison = pd.concat(all_results, ignore_index=True)
comparison = comparison.sort_values(by="f1_score", ascending=False)

comparison.to_csv(RESULTS_DIR / "model_comparison.csv", index=False)

print("\nFinal Model Comparison:")
print(comparison)
print("\nSaved: results/model_comparison.csv")
