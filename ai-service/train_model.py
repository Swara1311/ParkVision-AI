"""
ParkVision AI - Model Training Script
Trains a RandomForestRegressor to predict available parking slots
based on time-of-day, day-of-week, current occupancy, and historical
patterns. Generates synthetic-but-realistic training data since no
live sensor dataset exists yet, modeling typical Indian urban parking
occupancy curves (rush hour peaks, weekend spikes, night lulls).
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

np.random.seed(42)

def hourly_ratio(hour):
    curve = {0:.05,1:.03,2:.02,3:.02,4:.03,5:.05,6:.10,7:.18,8:.30,9:.42,
             10:.55,11:.65,12:.72,13:.75,14:.70,15:.68,16:.72,17:.80,
             18:.88,19:.92,20:.90,21:.78,22:.55,23:.25}
    return curve[hour]

def generate_dataset(n=20000):
    rows = []
    for _ in range(n):
        total_slots = np.random.choice([120, 150, 180, 220, 260, 300, 350, 380, 400, 420, 450, 500])
        hour = np.random.randint(0, 24)
        day = np.random.randint(0, 7)  # 0=Mon..6=Sun
        weekend_boost = 1.15 if day >= 5 else 1.0

        base_ratio = min(hourly_ratio(hour) * weekend_boost, 0.98)
        noise = np.random.normal(0, 0.06)
        current_ratio = np.clip(base_ratio + noise, 0.0, 0.98)
        current_occupancy = int(total_slots * current_ratio)

        historical_avg_occupancy = int(total_slots * np.clip(hourly_ratio(hour) + np.random.normal(0, 0.04), 0, 0.95))
        eta_minutes = np.random.randint(2, 30)

        # Project occupancy forward by eta_minutes using the curve at future hour
        future_hour = (hour + (eta_minutes // 60)) % 24
        future_ratio = np.clip(hourly_ratio(future_hour) * weekend_boost + np.random.normal(0, 0.05), 0, 0.98)
        actual_available_future = total_slots - int(total_slots * future_ratio)

        rows.append({
            "current_occupancy": current_occupancy,
            "total_slots": total_slots,
            "historical_avg_occupancy": historical_avg_occupancy,
            "current_hour": hour,
            "current_day": day,
            "eta_minutes": eta_minutes,
            "target_available_slots": max(0, actual_available_future),
        })
    return pd.DataFrame(rows)

def main():
    print("Generating synthetic training dataset...")
    df = generate_dataset()

    features = ["current_occupancy", "total_slots", "historical_avg_occupancy",
                "current_hour", "current_day", "eta_minutes"]
    X = df[features]
    y = df["target_available_slots"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"Model trained. MAE: {mae:.2f} slots | R2: {r2:.3f}")

    joblib.dump({"model": model, "features": features, "mae": mae, "r2": r2}, "parking_model.joblib")
    print("Saved model to parking_model.joblib")

if __name__ == "__main__":
    main()