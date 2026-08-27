import collections
import math
from typing import Dict, Any

def extract_features(session_id: str, conn, window_secs: int = 60) -> Dict[str, float]:
    """
    Extracts behavioral features from raw request records in PostgreSQL.
    
    Args:
        session_id (str): The session to extract features for.
        conn: A psycopg2 connection to the database.
        window_secs (int): How far back in seconds to look for requests.
        
    Returns:
        dict: A dictionary of computed features.
    """
    # Default values for zero requests
    features = {
        "inter_request_timing_variance": 0.0,
        "request_velocity": 0.0,
        "path_entropy": 0.0,
        "session_duration": 0.0,
        "header_consistency": 1.0  # Placeholder, as headers are not in DB
    }
    
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT path, extract(epoch from timestamp) as ts 
            FROM requests 
            WHERE session_id = %s::uuid 
              AND timestamp >= NOW() - INTERVAL '%s seconds'
            ORDER BY timestamp ASC
            """,
            (session_id, window_secs)
        )
        rows = cur.fetchall()
        
    if not rows:
        return features
        
    count = len(rows)
    features["request_velocity"] = count / float(window_secs)
    
    # Path entropy
    path_counts = collections.Counter(row[0] for row in rows)
    entropy = 0.0
    for path, path_count in path_counts.items():
        p = path_count / count
        entropy -= p * math.log2(p)
    features["path_entropy"] = entropy
    
    # Session duration
    first_ts = rows[0][1]
    last_ts = rows[-1][1]
    duration = last_ts - first_ts
    features["session_duration"] = float(duration)
    
    # Inter-request timing variance
    if count > 1:
        intervals = [rows[i][1] - rows[i-1][1] for i in range(1, count)]
        mean_interval = sum(intervals) / len(intervals)
        variance = sum((x - mean_interval) ** 2 for x in intervals) / len(intervals)
        features["inter_request_timing_variance"] = float(variance)
        
    return features
