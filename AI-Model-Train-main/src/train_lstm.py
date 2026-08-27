import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import math

DATA_PATH = Path("data/tourism_ai_master_dataset_v2_full.csv")
MODEL_DIR = Path("models")
RESULTS_DIR = Path("results")
MODEL_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

df = pd.read_csv(DATA_PATH)

monthly = df.groupby(["year", "month_num"])["total_foreign_arrivals_month"].mean().reset_index()
monthly = monthly.sort_values(["year", "month_num"])

values = monthly["total_foreign_arrivals_month"].values.reshape(-1, 1)

scaler = MinMaxScaler()
scaled_values = scaler.fit_transform(values)

sequence_length = 3

X = []
y = []

for i in range(len(scaled_values) - sequence_length):
    X.append(scaled_values[i:i + sequence_length])
    y.append(scaled_values[i + sequence_length])

X = np.array(X)
y = np.array(y)

split_index = int(len(X) * 0.8)

X_train, X_test = X[:split_index], X[split_index:]
y_train, y_test = y[:split_index], y[split_index:]

model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(sequence_length, 1)),
    Dropout(0.2),
    LSTM(32),
    Dropout(0.2),
    Dense(1)
])

model.compile(
    optimizer="adam",
    loss="mse"
)

print("Training LSTM...")
model.fit(
    X_train,
    y_train,
    epochs=80,
    batch_size=8,
    validation_data=(X_test, y_test),
    callbacks=[EarlyStopping(patience=10, restore_best_weights=True)],
    verbose=1
)

pred_scaled = model.predict(X_test)

pred = scaler.inverse_transform(pred_scaled)
actual = scaler.inverse_transform(y_test)

mse = mean_squared_error(actual, pred)
rmse = math.sqrt(mse)
mae = mean_absolute_error(actual, pred)

metrics = {
    "model": "LSTM",
    "mse": mse,
    "rmse": rmse,
    "mae": mae
}

print(metrics)

model.save(MODEL_DIR / "lstm_demand_model.keras")
joblib.dump(scaler, MODEL_DIR / "lstm_scaler.pkl")

pd.DataFrame([metrics]).to_csv(RESULTS_DIR / "lstm_results.csv", index=False)

print("LSTM model saved.")