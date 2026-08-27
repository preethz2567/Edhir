import pytest
import math
from unittest.mock import MagicMock
from ml_service.features.feature_extractor import extract_features

def test_extract_features_empty():
    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    mock_cursor.fetchall.return_value = []

    features = extract_features("test-session", mock_conn, window_secs=60)
    
    assert features["request_velocity"] == 0.0
    assert features["path_entropy"] == 0.0
    assert features["session_duration"] == 0.0
    assert features["inter_request_timing_variance"] == 0.0

def test_extract_features_calculation():
    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    
    # Rows: (path, timestamp_epoch)
    mock_cursor.fetchall.return_value = [
        ("/login", 100.0),
        ("/login", 102.0),
        ("/dashboard", 105.0)
    ]

    features = extract_features("test-session", mock_conn, window_secs=60)
    
    # Velocity: 3 reqs / 60s
    assert features["request_velocity"] == 3 / 60.0
    
    # Session duration: 105 - 100 = 5.0
    assert features["session_duration"] == 5.0
    
    # Path entropy: 
    # /login count: 2 (prob 2/3)
    # /dashboard count: 1 (prob 1/3)
    p_login = 2.0 / 3.0
    p_dash = 1.0 / 3.0
    expected_entropy = -(p_login * math.log2(p_login) + p_dash * math.log2(p_dash))
    assert math.isclose(features["path_entropy"], expected_entropy)
    
    # Variance:
    # Intervals: (102-100)=2.0, (105-102)=3.0
    # Mean: 2.5
    # Variance: ((2-2.5)^2 + (3-2.5)^2) / 2 = (0.25 + 0.25) / 2 = 0.25
    assert features["inter_request_timing_variance"] == 0.25
