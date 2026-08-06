from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI()

class SessionMetadata(BaseModel):
    timing: float
    path_sequence: list[str]

@app.post("/score")
def score(metadata: SessionMetadata):
    anomaly_score = random.uniform(0, 1)
    return {"anomaly_score": anomaly_score, "is_anomaly": anomaly_score > 0.8}

@app.get("/score")
def score_get():
    return {"status": "ML Service is up", "mock_score": 0.12}
