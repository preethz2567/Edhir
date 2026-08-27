import threading
import os
import psycopg2
from fastapi import FastAPI, HTTPException

from ml_service.logger import setup_logger
from ml_service.models import model_loader
from ml_service.consumers.rabbitmq import start_consumer

logger = setup_logger(__name__)

app = FastAPI(title="Edhir ML Service")

# ── Config from environment ────────────
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

@app.on_event("startup")
def startup_event():
    logger.info("Starting ML Service API...")
    
    # Load model if available
    model_loader.load_latest_model()
    
    # Start RabbitMQ consumer thread
    consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    consumer_thread.start()

@app.get("/health")
def health_check():
    """Checks model loading status and database connectivity."""
    status = {
        "status": "UP",
        "model_loaded": model_loader.is_model_loaded(),
        "database": "UNKNOWN"
    }
    
    try:
        conn = get_db_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        conn.close()
        status["database"] = "UP"
    except Exception as e:
        logger.error(f"Health check DB connection failed: {e}")
        status["database"] = "DOWN"
        status["status"] = "DOWN"
        
    if status["status"] == "DOWN":
        raise HTTPException(status_code=503, detail=status)
        
    return status

@app.get("/score")
def score_get():
    """Legacy health check fallback."""
    return {"status": "ML Service is up", "model_loaded": model_loader.is_model_loaded()}
