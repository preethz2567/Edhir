import os
import time
import psycopg2
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

from ml_service.logger import setup_logger
from ml_service.features.feature_extractor import extract_features

logger = setup_logger(__name__)

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "edhir")
DB_USER = os.getenv("DB_USER", "user")
DB_PASS = os.getenv("DB_PASS", "password")

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')

def train():
    logger.info("Starting model training job...")
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
            user=DB_USER, password=DB_PASS
        )
    except Exception as e:
        logger.error(f"Failed to connect to database for training: {e}")
        return
        
    try:
        # Fetch recent "allowed" sessions (normal traffic)
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT session_id 
                FROM requests 
                WHERE verdict = 'allow'
                  AND timestamp >= NOW() - INTERVAL '24 hours'
            """)
            rows = cur.fetchall()
            
        if not rows:
            logger.warning("No recent allowed sessions found. Skipping training.")
            return
            
        session_ids = [row[0] for row in rows]
        
        # Extract features for all these sessions
        data = []
        for sid in session_ids:
            features = extract_features(str(sid), conn, window_secs=3600)
            data.append(features)
            
        df = pd.DataFrame(data)
        
        # Assume 1% contamination in our "normal" traffic
        contamination_rate = 0.01
        
        logger.info(f"Training IsolationForest on {len(df)} samples with contamination={contamination_rate}")
        
        feature_names = [
            "inter_request_timing_variance",
            "request_velocity",
            "path_entropy",
            "session_duration",
            "header_consistency"
        ]
        
        clf = IsolationForest(contamination=contamination_rate, random_state=42)
        clf.fit(df[feature_names])
        
        timestamp = int(time.time())
        model_filename = f"iso_forest_{timestamp}.joblib"
        model_path = os.path.join(MODELS_DIR, model_filename)
        
        joblib.dump(clf, model_path)
        logger.info(f"Model saved successfully to {model_path}")
        
    except Exception as e:
        logger.error(f"Error during training: {e}", exc_info=True)
    finally:
        conn.close()
        
if __name__ == "__main__":
    train()
