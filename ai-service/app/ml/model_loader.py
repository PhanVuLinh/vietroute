import os
import json
from typing import Optional, Dict, Any
import numpy as np
import joblib


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")


class ModelLoader:
    _instance: Optional["ModelLoader"] = None

    def __init__(self):
        self.eta_model = None
        self.demand_model = None
        self.driver_match_model = None
        self.anomaly_detector = None
        self.metadata: Dict[str, Any] = {}
        self.load_models()

    @classmethod
    def get_instance(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        try:
            meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
            if os.path.exists(meta_path):
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)

            eta_path = os.path.join(MODELS_DIR, "eta_model.joblib")
            if os.path.exists(eta_path):
                self.eta_model = joblib.load(eta_path)

            demand_path = os.path.join(MODELS_DIR, "demand_model.joblib")
            if os.path.exists(demand_path):
                self.demand_model = joblib.load(demand_path)

            driver_path = os.path.join(MODELS_DIR, "driver_match_model.joblib")
            if os.path.exists(driver_path):
                self.driver_match_model = joblib.load(driver_path)

            anom_path = os.path.join(MODELS_DIR, "anomaly_detector.joblib")
            if os.path.exists(anom_path):
                self.anomaly_detector = joblib.load(anom_path)

        except Exception as e:
            print(f"[WARN] Khong the tai mot so model: {e}")

    def predict_eta(
        self,
        distance_km: float,
        hour_of_day: int,
        is_rush: int,
        is_weekend: int,
        vehicle_code: int,
        weight_kg: float,
    ) -> Optional[float]:
        if self.eta_model is None:
            return None
        try:
            X = np.array([[distance_km, hour_of_day, is_rush, is_weekend, vehicle_code, weight_kg]])
            pred = float(self.eta_model.predict(X)[0])
            return max(5.0, round(pred, 1))
        except Exception:
            return None

    def predict_demand(
        self,
        wh_code: int,
        weekday: int,
        day_of_month: int,
        month: int,
        is_month_end: int,
    ) -> Optional[int]:
        if self.demand_model is None:
            return None
        try:
            X = np.array([[wh_code, weekday, day_of_month, month, is_month_end]])
            pred = int(round(float(self.demand_model.predict(X)[0])))
            return max(15, pred)
        except Exception:
            return None

    def predict_driver_match_score(
        self,
        proximity_km: float,
        otd_rate: float,
        rating: float,
        utilization_pct: float,
        active_trips: int,
        is_available: int,
    ) -> Optional[float]:
        if self.driver_match_model is None:
            return None
        try:
            X = np.array([[proximity_km, otd_rate, rating, utilization_pct, active_trips, is_available]])
            pred = float(self.driver_match_model.predict(X)[0])
            return float(np.clip(round(pred, 1), 15.0, 99.4))
        except Exception:
            return None

    def detect_anomaly(
        self,
        fuel_l_100km: float,
        route_dev_km: float,
        idle_minutes: float,
    ) -> Optional[Dict[str, Any]]:
        if self.anomaly_detector is None:
            return None
        try:
            X = np.array([[fuel_l_100km, route_dev_km, idle_minutes]])
            pred = int(self.anomaly_detector.predict(X)[0])  # -1 = anomaly, 1 = normal
            score = float(self.anomaly_detector.decision_function(X)[0])
            return {
                "is_anomaly": pred == -1,
                "anomaly_score": round(-score, 3),  # higher score = more anomalous
            }
        except Exception:
            return None
