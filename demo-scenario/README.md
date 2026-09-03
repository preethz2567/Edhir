# Edhir Sidecar Integration Demo

This directory contains a scriptable, self-contained demonstration of deploying the Edhir Sidecar proxy in front of an existing, unprotected application.

## Prerequisites
Ensure the main Edhir backend infrastructure (Postgres, RabbitMQ, Redis, etc.) is currently running via the main `docker-compose.dev.yml` file in the root `infra/` directory. The sidecar relies on these backend services.

## Automated Demonstration

We provide a single, automated script that runs the full Before & After scenario.

To run the automated demo, simply execute:
```bash
./run-demo.sh
```

**What the script does:**
1. Starts the demo app standalone (`unprotected.yml`) on port 8080.
2. Fires a mix of clean and malicious requests against it, demonstrating that the malicious payloads successfully reach the application (HTTP 200).
3. Stops the standalone app and starts the protected stack (`protected.yml`), placing the Edhir proxy on port 8443 and hiding the demo app behind it.
4. Generates a fresh API Key.
5. Fires the exact same requests against port 8443, demonstrating that the clean requests succeed while the malicious payloads are blocked by the proxy (HTTP 403 Forbidden).
6. Provides you with the API Key so you can log into the dashboard and see the live logs.

---

## Manual Demonstration

If you prefer to run the steps manually, follow this guide:

### 1. Unprotected Application
Deploy the unprotected application directly exposed to the host:
```bash
docker compose -f unprotected.yml up -d
```

Send an attack payload:
```bash
curl -i "http://localhost:8080/products?category=1'+UNION+SELECT+*+FROM+users--"
```
Notice how the application accepts the request and returns a `200 OK`.

Tear down the unprotected app:
```bash
docker compose -f unprotected.yml down
```

### 2. Protected Application
Deploy the sidecar proxy in front of the application:
```bash
docker compose -f protected.yml up -d
```

Wait 10 seconds for the proxy to initialize, then generate a new tenant API Key:
```bash
curl -s -X POST -H "Content-Type: application/json" -d '{"appName":"manual-demo","contactEmail":"demo@example.com","integrationMode":"sidecar"}' http://localhost:8443/tenants
```

### 3. Verify Protection
Using the generated `<API_KEY>` from the previous step, send the exact same attack payload to the proxy port (8443):
```bash
curl -i -H "X-Api-Key: <API_KEY>" "http://localhost:8443/products?category=1'+UNION+SELECT+*+FROM+users--"
```
Notice how the request is now blocked at the edge and returns a `403 Forbidden` with the text: `Edhir: request blocked by rule ...`.

### 4. View in Dashboard
1. Navigate to [http://localhost:3000/app](http://localhost:3000/app).
2. Choose "Already have an API Key? Log in".
3. Paste your generated `<API_KEY>`.
4. Navigate to **Live Traffic** to see the blocked SQL Injection attempt recorded in real-time.

### 5. Cleanup
To stop the protected demo stack:
```bash
docker compose -f protected.yml down
```
