# Edhir

Edhir is a production-grade Security Proxy and Threat Detection Platform.

## Architecture

*(Architecture Diagram Placeholder: To be added)*

Edhir acts as a reverse proxy in front of tenant applications, intercepting and evaluating traffic against a rule engine (detecting SQLi, XSS, Path Traversal, etc.), enforcing rate limits, and streaming request metadata for machine learning analysis.

## Services

| Service | Port | Description |
|---|---|---|
| Proxy Service (Java) | 8080 | Core proxy, rate limiter, and rule engine. |
| ML Service (Python) | 8000 | Threat detection via machine learning. |
| Dashboard (React) | 3000 | Frontend UI for tenants to view traffic and alerts. |
| Demo App (Python) | 5000 | Mock target application for proxy forwarding. |
| PostgreSQL | 5433 | Stores tenants, security rules, and request history. |
| Redis | 6379 | Token-bucket rate limiting and caching. |
| RabbitMQ | 5672, 15672 | Message broker for asynchronous metadata streaming. |

## Documentation

See the `docs/` folder for more detailed architectural and API documentation.
- [Security Policy](SECURITY.md)

## Local Setup

We use Docker Compose to spin up all services locally. We have separated environment configurations into the `infra/` folder.

1. Ensure Docker Desktop is running.
2. The environment variables for local development are pre-configured in `infra/.env.dev`.
3. Start the stack:
   ```bash
   docker compose -f infra/docker-compose.dev.yml --env-file infra/.env.dev up -d --build
   ```
4. Access the Dashboard at [http://localhost:3000](http://localhost:3000).

## Pre-commit Hooks

This repository enforces coding standards using `pre-commit`. 
To set this up locally, install `pre-commit` (e.g., `pip install pre-commit`) and run:
```bash
pre-commit install
```
This ensures Java (spotless), Python (black, flake8), and JS (eslint, prettier) are formatted before every commit.
