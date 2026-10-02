from fastapi import APIRouter, BackgroundTasks, HTTPException
import json
import os
from typing import Dict, Any
from app.ml.model_loader import ModelLoader

router = APIRouter()

METADATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models", "model_metadata.json")


def _run_training_job():
    """Background task to run train_all_models and reload ModelLoader."""
    try:
        from app.ml.train import train_all_models
        train_all_models()
        # Reload models in memory
        loader = ModelLoader.get_instance()
        loader.load_all()
    except Exception as e:
        print(f"[RE-TRAIN ERROR] {e}")


@router.get("/model-info")
def get_model_info() -> Dict[str, Any]:
    """Trả về siêu dữ liệu và chỉ số hiệu năng R2/MAE của các mô hình AI Machine Learning đã huấn luyện."""
    loader = ModelLoader.get_instance()
    meta = {}
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception as e:
            meta = {"error": f"Failed to read metadata: {e}"}

    return {
        "status": "ready" if loader.is_ready() else "loading",
        "modelsLoaded": {
            "etaModel": loader.eta_model is not None,
            "demandModel": loader.demand_model is not None,
            "driverMatchModel": loader.driver_match_model is not None,
            "anomalyDetector": loader.anomaly_detector is not None,
        },
        "metadata": meta,
    }


@router.post("/train")
def trigger_training(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """Kích hoạt tiến trình huấn luyện lại mô hình AI (Scikit-Learn Machine Learning Pipeline)."""
    background_tasks.add_task(_run_training_job)
    return {
        "status": "accepted",
        "message": "Tiến trình huấn luyện mô hình AI đã được kích hoạt ngầm (Async Background Training Pipeline).",
    }
