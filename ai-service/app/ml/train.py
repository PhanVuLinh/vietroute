import os
import sys
import json
from datetime import datetime, timedelta

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import numpy as np
import joblib
from sklearn.ensemble import (
    GradientBoostingRegressor,
    RandomForestRegressor,
    IsolationForest,
)
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.model_selection import train_test_split


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_eta_model():
    print("[TRAIN] Huan luyen mo hinh Du bao Thoi gian den (ETA Model)...")

    np.random.seed(42)
    n_samples = 12000

    # Features:
    # 0: distance_km (0.5 to 150 km)
    # 1: hour_of_day (0 to 23)
    # 2: is_rush_hour (1 if 7-9 or 17-19 else 0)
    # 3: is_weekend (1 if Sat/Sun else 0)
    # 4: vehicle_type (0: MOTORBIKE, 1: VAN, 2: TRUCK, 3: CONTAINER)
    # 5: cargo_weight_kg (10 to 18000 kg)
    distances = np.random.uniform(1.0, 120.0, n_samples)
    hours = np.random.randint(0, 24, n_samples)
    rush_hours = ((hours >= 7) & (hours <= 9)) | ((hours >= 17) & (hours <= 19))
    is_rush = rush_hours.astype(int)
    is_weekend = np.random.choice([0, 1], p=[0.72, 0.28], size=n_samples)
    vehicle_types = np.random.choice([0, 1, 2, 3], p=[0.35, 0.30, 0.25, 0.10], size=n_samples)
    weights = np.random.uniform(10.0, 12000.0, n_samples)

    # Base speeds by vehicle
    base_speeds = {0: 34.0, 1: 42.0, 2: 36.0, 3: 30.0}
    speeds = np.array([base_speeds[v] for v in vehicle_types])

    # Traffic multiplier effect
    traffic_mult = np.where(is_rush == 1, 1.48, np.where(is_weekend == 1, 0.92, 1.10))
    # Weight penalty (heavier trucks take slightly longer to accelerate/stop)
    weight_factor = 1.0 + (weights / 25000.0) * 0.15

    # Target duration in minutes + small Gaussian noise
    durations = (distances / speeds) * 60.0 * traffic_mult * weight_factor
    durations += np.random.normal(0, 1.8, n_samples)
    durations = np.maximum(3.0, durations)

    X = np.column_stack([distances, hours, is_rush, is_weekend, vehicle_types, weights])
    y = durations

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))

    model_path = os.path.join(MODELS_DIR, "eta_model.joblib")
    joblib.dump(model, model_path)
    print(f"  -> ETA Model hoan tat: R2={r2:.4f}, MAE={mae:.2f} phut | File: {model_path}")
    return {"r2": r2, "mae": mae, "n_samples": n_samples, "model_file": "eta_model.joblib"}


def train_demand_forecast_model():
    print("[TRAIN] Huan luyen mo hinh Du bao Nhu cau Don hang & Xe tai (Demand Model)...")
    np.random.seed(42)
    n_days = 730  # 2 nam du lieu lich su
    start_date = datetime(2024, 1, 1)

    warehouses = [0, 1, 2, 3, 4]  # 0: Tan Binh, 1: Cat Lai, 2: Long Bien, 3: Da Nang, 4: Can Tho
    base_orders_map = {0: 240, 1: 310, 2: 210, 3: 160, 4: 140}
    day_weights = {0: 1.25, 1: 1.05, 2: 1.00, 3: 1.10, 4: 1.30, 5: 0.85, 6: 0.60}

    rows = []
    for day_idx in range(n_days):
        current_dt = start_date + timedelta(days=day_idx)
        weekday = current_dt.weekday()
        day_of_month = current_dt.day
        month = current_dt.month
        is_month_end = 1 if day_of_month >= 25 else 0

        for wh in warehouses:
            base = base_orders_map[wh]
            dow_weight = day_weights[weekday]
            monthly_trend = 1.0 + (month / 12.0) * 0.12  # Tang dan ve cuoi nam
            end_month_boost = 1.15 if is_month_end else 1.0

            order_count = int(base * dow_weight * monthly_trend * end_month_boost + np.random.normal(0, 12))
            order_count = max(20, order_count)
            tonnage = round(order_count * np.random.uniform(0.38, 0.45), 2)
            trucks_needed = int(np.ceil(order_count / 14.0))

            rows.append([wh, weekday, day_of_month, month, is_month_end, order_count, tonnage, trucks_needed])

    data = np.array(rows)
    X = data[:, :5]  # [wh, weekday, day_of_month, month, is_month_end]
    y_orders = data[:, 5]

    X_train, X_test, y_train, y_test = train_test_split(X, y_orders, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))

    model_path = os.path.join(MODELS_DIR, "demand_model.joblib")
    joblib.dump(model, model_path)
    print(f"  -> Demand Model hoan tat: R2={r2:.4f}, MAE={mae:.2f} don | File: {model_path}")
    return {"r2": r2, "mae": mae, "n_samples": len(rows), "model_file": "demand_model.joblib"}


def train_driver_match_model():
    print("[TRAIN] Huan luyen mo hinh Cham diem Ghep Tai xe (Driver Matcher Model)...")
    np.random.seed(42)
    n_samples = 6000

    # Features:
    # 0: proximity_km (0 to 30 km)
    # 1: on_time_rate (80 to 100%)
    # 2: rating_stars (3.5 to 5.0)
    # 3: utilization_pct (30 to 110%)
    # 4: current_active_trips (0 to 5)
    # 5: is_available (0 or 1)
    proximity = np.random.uniform(0.5, 25.0, n_samples)
    otd = np.random.uniform(82.0, 100.0, n_samples)
    rating = np.random.uniform(3.8, 5.0, n_samples)
    utilization = np.random.uniform(40.0, 105.0, n_samples)
    active_trips = np.random.randint(0, 6, n_samples)
    is_available = np.random.choice([0, 1], p=[0.20, 0.80], size=n_samples)

    # Multi-factor score ground truth
    score = (
        np.maximum(0, 100.0 - proximity * 3.6) * 0.35
        + otd * 0.25
        + (rating / 5.0 * 100.0) * 0.15
        + np.where((utilization >= 55) & (utilization <= 90), 100.0, 50.0) * 0.15
        + (is_available * 100.0 - active_trips * 12.0) * 0.10
    )
    score = np.clip(score + np.random.normal(0, 1.5, n_samples), 10.0, 99.4)

    X = np.column_stack([proximity, otd, rating, utilization, active_trips, is_available])
    y = score

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=80, max_depth=7, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))

    model_path = os.path.join(MODELS_DIR, "driver_match_model.joblib")
    joblib.dump(model, model_path)
    print(f"  -> Driver Match Model hoan tat: R2={r2:.4f}, MAE={mae:.2f} diem | File: {model_path}")
    return {"r2": r2, "mae": mae, "n_samples": n_samples, "model_file": "driver_match_model.joblib"}


def train_anomaly_detector():
    print("[TRAIN] Huan luyen mo hinh Phat hien Bat thuong Telemetry (Anomaly Detector)...")
    np.random.seed(42)
    n_samples = 5000

    n_norm = int(n_samples * 0.93)
    norm_fuel = np.random.normal(13.8, 1.2, n_norm)
    norm_dev = np.abs(np.random.normal(0.4, 0.25, n_norm))
    norm_idle = np.abs(np.random.normal(8.0, 3.5, n_norm))

    n_anom = n_samples - n_norm
    anom_fuel = np.random.uniform(18.5, 26.0, n_anom)
    anom_dev = np.random.uniform(3.5, 12.0, n_anom)
    anom_idle = np.random.uniform(40.0, 95.0, n_anom)

    fuel = np.concatenate([norm_fuel, anom_fuel])
    dev = np.concatenate([norm_dev, anom_dev])
    idle = np.concatenate([norm_idle, anom_idle])

    X = np.column_stack([fuel, dev, idle])

    model = IsolationForest(
        n_estimators=100,
        contamination=0.07,
        random_state=42,
    )
    model.fit(X)

    preds = model.predict(X)
    detected_anomalies = int(np.sum(preds == -1))

    model_path = os.path.join(MODELS_DIR, "anomaly_detector.joblib")
    joblib.dump(model, model_path)
    print(f"  -> Anomaly Detector hoan tat: Phat hien {detected_anomalies} mau di biet | File: {model_path}")
    return {"detected_anomalies": detected_anomalies, "contamination": 0.07, "n_samples": n_samples, "model_file": "anomaly_detector.joblib"}


def run_full_training():
    print("=" * 60)
    print("   VIETROUTE LOGISTICS AI ENGINE - MACHINE LEARNING PIPELINE")
    print("=" * 60)
    start_time = datetime.now()

    eta_res = train_eta_model()
    demand_res = train_demand_forecast_model()
    driver_res = train_driver_match_model()
    anomaly_res = train_anomaly_detector()

    metadata = {
        "framework": "scikit-learn + joblib",
        "trained_at": datetime.now().isoformat(),
        "elapsed_seconds": round((datetime.now() - start_time).total_seconds(), 2),
        "models": {
            "eta_predictor": eta_res,
            "demand_forecaster": demand_res,
            "driver_matcher": driver_res,
            "anomaly_detector": anomaly_res,
        },
    }

    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print(f"[OK] Huan luyen thanh cong toan bo 4 mo hinh trong {metadata['elapsed_seconds']}s!")
    print(f"[OK] Metadata luu tai: {meta_path}")
    print("=" * 60)
    return metadata


if __name__ == "__main__":
    run_full_training()

