import os
import glob
import time
import joblib
import pandas as pd
from typing import Dict, Any, Optional

from ml_service.logger import setup_logger

logger = setup_logger(__name__)
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')

# The currently loaded model in memory
_loaded_model = None

def load_latest_model() -> bool:
    """
    Finds and loads the latest IsolationForest model from saved_models.
    Returns True if successful, False if no model exists (cold start).
    """
    global _loaded_model
    try:
        model_files = glob.glob(os.path.join(MODELS_DIR, 'iso_forest_*.joblib'))
        if not model_files:
            logger.warning("No saved model found. System will operate in degraded mode.")
            return False
            
        # Sort by timestamp in filename to get the latest
        latest_model_path = sorted(model_files)[-1]
        _loaded_model = joblib.load(latest_model_path)
        logger.info(f"Loaded model successfully: {os.path.basename(latest_model_path)}")
        return True
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

def is_model_loaded() -> bool:
    return _loaded_model is not None

def predict(features: Dict[str, float]) -> float:
    """
    Given a feature dictionary, returns an anomaly score between 0 and 100.
    If no model is loaded, falls back to a simple request_velocity threshold.
    """
    global _loaded_model
    
    # Degraded Mode Fallback
    if _loaded_model is None:
        velocity = features.get("request_velocity", 0.0)
        # Assuming window is 60s, VELOCITY_MAX = 20 / 60 = 0.33 req/s
        raw_score = min(velocity / (20.0 / 60.0), 1.0) * 100.0
        logger.debug("Operating in DEGRADED MODE (fallback velocity scoring).")
        return round(raw_score, 2)
        
    # Feature vector must match training order
    feature_names = [
        "inter_request_timing_variance",
        "request_velocity",
        "path_entropy",
        "session_duration",
        "header_consistency"
    ]
    
    # IsolationForest decision_function returns > 0 for inliers and < 0 for outliers.
    # We want to map this to an anomaly score (0-100), where 100 is highly anomalous.
    df = pd.DataFrame([features])[feature_names]
    decision = _loaded_model.decision_function(df)[0]
    
    # decision typically ranges from roughly -0.5 (very anomalous) to 0.5 (very normal)
    # Map decision -> 0-100 score
    # Normal (decision > 0) -> lower scores
    # Outlier (decision < 0) -> higher scores
    
    if decision > 0:
        score = max(0.0, 50.0 - (decision * 100.0))
    else:
        score = min(100.0, 50.0 + (abs(decision) * 100.0))
        
    return round(score, 2)
