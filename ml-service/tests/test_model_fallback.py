import pytest
from unittest.mock import patch
from ml_service.models import model_loader

@patch('ml_service.models.model_loader.glob.glob')
def test_fallback_when_no_model(mock_glob):
    # Simulate no model files found
    mock_glob.return_value = []
    
    # Force _loaded_model to None
    model_loader._loaded_model = None
    
    loaded = model_loader.load_latest_model()
    assert not loaded
    assert not model_loader.is_model_loaded()
    
    features = {
        "request_velocity": 10.0 / 60.0 # 10 requests in 60s
    }
    
    # With VELOCITY_MAX = 20 / 60, this is 50% max -> score 50.0
    score = model_loader.predict(features)
    assert score == 50.0

    features_max = {
        "request_velocity": 30.0 / 60.0 # Exceeds VELOCITY_MAX
    }
    score_max = model_loader.predict(features_max)
    assert score_max == 100.0

@patch('ml_service.models.model_loader.glob.glob')
@patch('ml_service.models.model_loader.joblib.load')
def test_model_loaded(mock_joblib_load, mock_glob):
    mock_glob.return_value = ['/path/to/iso_forest_123.joblib']
    
    mock_model = mock_joblib_load.return_value
    mock_model.decision_function.return_value = [-0.1]  # anomalous
    
    loaded = model_loader.load_latest_model()
    assert loaded
    assert model_loader.is_model_loaded()
    
    features = {
        "inter_request_timing_variance": 0.0,
        "request_velocity": 0.0,
        "path_entropy": 0.0,
        "session_duration": 0.0,
        "header_consistency": 1.0
    }
    
    score = model_loader.predict(features)
    # decision = -0.1 -> score = min(100, 50 + 0.1 * 100) = 60.0
    assert score == 60.0
