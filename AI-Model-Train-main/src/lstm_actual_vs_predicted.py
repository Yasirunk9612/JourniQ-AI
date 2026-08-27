import numpy as np
import pandas as pd
from pathlib import Path
from tensorflow.keras.models import load_model
import joblib

DATA_PATH = Path("data/tourism_ai_master_dataset_v2_full.csv")
MODEL_PATH = Path("models/lstm_demand_model.keras")
SCALER_PATH = Path("models/lstm_scaler.pkl")
RESULTS_DIR = Path("results")
OUTPUT_PATH = RESULTS_DIR / "lstm_actual_vs_predicted.csv"


def main():
    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        raise FileNotFoundError(
            "LSTM model or scaler not found. Run: python src/train_lstm.py"
        )

    df = pd.read_csv(DATA_PATH)
    monthly = (
        df.groupby(["year", "month_num"])["total_foreign_arrivals_month"]
        .mean()
        .reset_index()
        .sort_values(["year", "month_num"])
    )

    values = monthly["total_foreign_arrivals_month"].values.reshape(-1, 1)
    scaler = joblib.load(SCALER_PATH)
    scaled_values = scaler.transform(values)

    sequence_length = 3
    x_rows = []
    target_indexes = []

    for index in range(len(scaled_values) - sequence_length):
        x_rows.append(scaled_values[index:index + sequence_length])
        target_indexes.append(index + sequence_length)

    x_rows = np.array(x_rows)
    split_index = int(len(x_rows) * 0.8)

    x_test = x_rows[split_index:]
    test_indexes = target_indexes[split_index:]
    actual = values[test_indexes]

    model = load_model(MODEL_PATH)
    predicted_scaled = model.predict(x_test, verbose=0)
    predicted = scaler.inverse_transform(predicted_scaled)

    result = monthly.iloc[test_indexes][["year", "month_num"]].copy()
    result["actual_tourism_demand"] = actual.flatten().round(0).astype(int)
    result["predicted_tourism_demand"] = predicted.flatten().round(0).astype(int)
    result["difference"] = (
        result["actual_tourism_demand"] - result["predicted_tourism_demand"]
    )

    RESULTS_DIR.mkdir(exist_ok=True)
    result.to_csv(OUTPUT_PATH, index=False)

    print("\nLSTM Actual vs Predicted Tourism Demand")
    print(result.to_string(index=False))
    print(f"\nSaved: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
