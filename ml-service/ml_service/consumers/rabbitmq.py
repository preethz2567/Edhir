import json
import os
import time
import pika
import psycopg2
import psycopg2.extras

from ml_service.logger import setup_logger
from ml_service.features.feature_extractor import extract_features
from ml_service.models import model_loader

logger = setup_logger(__name__)

RABBIT_HOST = os.getenv("RABBIT_HOST", "rabbitmq")
RABBIT_PORT = int(os.getenv("RABBIT_PORT", "5672"))
QUEUE_NAME = "request.metadata"

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "edhir")
DB_USER = os.getenv("DB_USER", "user")
DB_PASS = os.getenv("DB_PASS", "password")

retry_cache = {}

def get_db_conn():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS
    )

def update_session_score(session_id: str, score: float, conn) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE sessions SET current_score = %s WHERE id = %s::uuid",
            (score, session_id)
        )
    conn.commit()

def on_message(ch, method, properties, body):
    try:
        try:
            data = json.loads(body)
        except json.JSONDecodeError as e:
            logger.error(f"Malformed JSON, routing to DLQ: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        session_id = data.get("sessionId")
        if not session_id:
            logger.error("Missing sessionId, routing to DLQ")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        conn = get_db_conn()
        try:
            # Extract features for scoring
            features = extract_features(str(session_id), conn)
            
            # Use model to score
            score = model_loader.predict(features)
            
            # Persist score
            update_session_score(str(session_id), score, conn)
            
            # Success
            ch.basic_ack(delivery_tag=method.delivery_tag)
            retry_cache.pop(method.delivery_tag, None)
            
        finally:
            conn.close()

    except psycopg2.Error as e:
        attempts = retry_cache.get(method.delivery_tag, 0) + 1
        if attempts >= 3:
            logger.error(f"DB error, max retries reached, routing to DLQ: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            retry_cache.pop(method.delivery_tag, None)
        else:
            logger.warning(f"DB error, transient retry {attempts}/3: {e}")
            retry_cache[method.delivery_tag] = attempts
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            
    except Exception as e:
        logger.error(f"Non-recoverable error, routing to DLQ: {e}", exc_info=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        retry_cache.pop(method.delivery_tag, None)


def start_consumer():
    """Retry-loop: wait for RabbitMQ to be ready, then start consuming."""
    while True:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBIT_HOST, port=RABBIT_PORT)
            )
            channel = connection.channel()
            channel.queue_declare(
                queue=QUEUE_NAME, 
                durable=True,
                arguments={
                    'x-dead-letter-exchange': 'request.metadata.dlx',
                    'x-dead-letter-routing-key': 'request.metadata.dlq'
                }
            )
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=on_message)
            logger.info(f"Consumer started on queue '{QUEUE_NAME}'")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            logger.warning(f"RabbitMQ connection error, retrying in 5s: {e}")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Unexpected consumer error, retrying in 5s: {e}")
            time.sleep(5)
