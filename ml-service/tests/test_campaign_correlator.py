import pytest
from unittest.mock import patch, MagicMock
from ml_service.campaign_correlator import correlate_campaigns

@patch('ml_service.campaign_correlator.get_db_conn')
@patch('ml_service.campaign_correlator.extract_features')
def test_campaign_correlation(mock_extract, mock_get_conn):
    mock_conn = MagicMock()
    mock_get_conn.return_value = mock_conn
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    
    # 4 sessions total. First two are similar, 3 is different, 4 has zero velocity
    mock_cursor.fetchall.side_effect = [
        [
            ("uuid-1", "tenant-1"),
            ("uuid-2", "tenant-1"),
            ("uuid-3", "tenant-1"),
            ("uuid-4", "tenant-1")
        ]
    ]
    
    # Mock extract_features to return synthetic features
    def side_effect_extract(sid, conn, window_secs):
        if sid == "uuid-1":
            return {"inter_request_timing_variance": 0.1, "request_velocity": 10, "path_entropy": 0.5, "session_duration": 100, "header_consistency": 1.0}
        elif sid == "uuid-2":
            return {"inter_request_timing_variance": 0.11, "request_velocity": 10, "path_entropy": 0.5, "session_duration": 101, "header_consistency": 1.0}
        elif sid == "uuid-3":
            return {"inter_request_timing_variance": 5.0, "request_velocity": 1000, "path_entropy": 2.0, "session_duration": 1, "header_consistency": 0.5}
        elif sid == "uuid-4":
            return {"inter_request_timing_variance": 0.0, "request_velocity": 0, "path_entropy": 0.0, "session_duration": 0, "header_consistency": 1.0}
            
    mock_extract.side_effect = side_effect_extract
    
    # Mock existing campaigns (none exist)
    mock_cursor.fetchone.return_value = None
    
    correlate_campaigns()
    
    # Check that INSERT INTO campaigns was called once (for uuid-1 and uuid-2)
    # The length of the cluster should be 2.
    insert_calls = [call for call in mock_cursor.execute.call_args_list if "INSERT INTO campaigns" in call[0][0]]
    assert len(insert_calls) == 1
    
    # The session_count (4th param in INSERT) should be 2
    assert insert_calls[0][0][1][2] == 2
