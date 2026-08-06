# Edhir

Edhir is a time-boxed academic build focused on analyzing session request metadata to detect anomalies using a machine learning model, while providing a resilient reverse proxy and a real-time dashboard for monitoring.

| Component | Technology |
|---|---|
| Proxy Service | Java, Spring Boot, Maven, Resilience4j |
| ML Service | Python, FastAPI, scikit-learn |
| Demo App | Python, Flask |
| Dashboard | React, Vite, Tailwind CSS |
| Infrastructure | Docker Compose, Redis, RabbitMQ, PostgreSQL |

## Repository Structure

```text
edhir/
├── docs/                      # Documentation (SRS, problem statement, project plan)
├── proxy-service/             # Java Spring Boot reverse proxy with Resilience4j & Bucket4j
├── ml-service/                # Python FastAPI service for machine learning anomaly scoring
├── demo-app/                  # Flask target web app (fake login, product listing)
├── dashboard/                 # React + Vite dashboard for real-time monitoring
├── docker-compose.yml         # Local development orchestration
└── .github/workflows/ci.yml   # GitHub Actions CI pipeline
```

**Status:** Week 1, in development
