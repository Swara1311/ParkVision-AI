"""
ParkVision AI - Prediction Logic
Loads the trained model and turns a raw prediction into the full
output contract the frontend expects (probability, search time,
confidence, recommendation).
"""
import os
import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "parking_model.joblib")

_bundle = None

def load_model():
    global _bundle
    if _bundle is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "parking_model.joblib not found. Run `python train_model.py` first."
            )
        _bundle = joblib.load(MODEL_PATH)
    return _bundle

def predict(current_occupancy, total_slots, historical_avg_occupancy,
            current_hour, current_day, eta_minutes):
    bundle = load_model()
    model = bundle["model"]
    features = bundle["features"]

    X = np.array([[current_occupancy, total_slots, historical_avg_occupancy,
                    current_hour, current_day, eta_minutes]])

    raw_pred = model.predict(X)[0]
    predicted_available = int(np.clip(round(raw_pred), 0, total_slots))

    success_probability = round((predicted_available / total_slots) * 100, 1) if total_slots else 0

    # Estimated search time: fewer available slots -> longer search
    availability_ratio = predicted_available / total_slots if total_slots else 0
    estimated_search_time = max(1, round((1 - availability_ratio) * 15))

    # Confidence derived from model's tree-vote agreement (std across trees)
    tree_preds = np.array([tree.predict(X)[0] for tree in model.estimators_])
    std_dev = tree_preds.std()
    confidence_score = round(max(50, 100 - std_dev * 3), 1)

    if success_probability >= 70:
        recommendation = "High chance of finding a spot — head straight there."
    elif success_probability >= 40:
        recommendation = "Moderate availability — have a backup option ready."
    else:
        recommendation = "Low availability expected — consider an alternate parking location."

    return {
        "predicted_available_slots": predicted_available,
        "success_probability": success_probability,
        "estimated_search_time_minutes": estimated_search_time,
        "confidence_score": confidence_score,
        "recommendation": recommendation,
    }