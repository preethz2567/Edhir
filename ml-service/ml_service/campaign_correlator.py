import os
import psycopg2
import pandas as pd
from datetime import datetime, timedelta
from sklearn.metrics.pairwise import cosine_similarity
import uuid

from ml_service.logger import setup_logger
from ml_service.features.feature_extractor import extract_features

logger = setup_logger(__name__)

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "edhir")
DB_USER = os.getenv("DB_USER", "user")
DB_PASS = os.getenv("DB_PASS", "password")

def get_db_conn():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS
    )

def correlate_campaigns():
    logger.info("Starting campaign correlation job...")
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            # Find sessions active in the last 6 hours that are not yet blocked completely
            # or maybe just all sessions. Let's say all sessions in last 6 hours.
            cur.execute("""
                SELECT id, tenant_id 
                FROM sessions 
                WHERE last_seen_at >= NOW() - INTERVAL '6 hours'
            """)
            sessions = cur.fetchall()
            
        if not sessions:
            logger.info("No active sessions found for correlation.")
            return

        # Extract features for all these sessions
        feature_list = []
        session_meta = []
        for sid_uuid, tenant_id in sessions:
            sid = str(sid_uuid)
            features = extract_features(sid, conn, window_secs=6 * 3600)
            # Only consider sessions that actually have requests (velocity > 0)
            if features.get("request_velocity", 0) > 0:
                feature_list.append([
                    features["inter_request_timing_variance"],
                    features["request_velocity"],
                    features["path_entropy"],
                    features["session_duration"],
                    features["header_consistency"]
                ])
                session_meta.append({"id": sid, "tenant_id": tenant_id})
                
        if len(feature_list) < 2:
            logger.info("Not enough active sessions to correlate.")
            return

        # Compute cosine similarity
        df = pd.DataFrame(feature_list)
        sim_matrix = cosine_similarity(df)

        # Find pairs with similarity > 0.90
        visited = set()
        clusters = []

        for i in range(len(session_meta)):
            if i in visited:
                continue
            
            cluster = [i]
            visited.add(i)
            for j in range(i + 1, len(session_meta)):
                if j not in visited and sim_matrix[i][j] > 0.90:
                    cluster.append(j)
                    visited.add(j)
                    
            if len(cluster) > 1:
                clusters.append(cluster)

        # Create or update campaigns
        for cluster in clusters:
            # We group them under the same tenant_id. 
            # (Assuming attackers might target the same tenant, or cross-tenant. Let's group per tenant for now).
            # For simplicity, we just create a campaign for these sessions.
            
            # Find if any of them already belongs to a campaign
            existing_campaign_id = None
            with conn.cursor() as cur:
                for idx in cluster:
                    cur.execute("SELECT campaign_id FROM sessions WHERE id = %s::uuid", (session_meta[idx]["id"],))
                    row = cur.fetchone()
                    if row and row[0]:
                        existing_campaign_id = row[0]
                        break
            
            tenant_id_for_campaign = session_meta[cluster[0]]["tenant_id"]
            
            with conn.cursor() as cur:
                if not existing_campaign_id:
                    existing_campaign_id = str(uuid.uuid4())
                    cur.execute("""
                        INSERT INTO campaigns (id, tenant_id, first_seen, last_seen, session_count, severity)
                        VALUES (%s::uuid, %s::uuid, NOW(), NOW(), %s, 'medium')
                    """, (existing_campaign_id, tenant_id_for_campaign, len(cluster)))
                else:
                    cur.execute("""
                        UPDATE campaigns 
                        SET session_count = session_count + %s,
                            last_seen = NOW()
                        WHERE id = %s::uuid
                    """, (len(cluster), existing_campaign_id))
                    
                # Update sessions
                for idx in cluster:
                    cur.execute("""
                        UPDATE sessions
                        SET campaign_id = %s::uuid
                        WHERE id = %s::uuid
                    """, (existing_campaign_id, session_meta[idx]["id"]))
                    
        conn.commit()
        logger.info(f"Correlated {len(clusters)} campaigns.")
        
    except Exception as e:
        logger.error(f"Error during campaign correlation: {e}", exc_info=True)
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    correlate_campaigns()
