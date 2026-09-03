#!/bin/bash
# run-demo.sh

echo "=========================================="
echo "         Edhir Sidecar Demo"
echo "=========================================="
echo ""
echo "Note: This demo assumes that the main Edhir infrastructure"
echo "(database, message queues) is running via docker-compose.dev.yml."
echo ""

# Make attack script executable
chmod +x attack-samples.sh

echo "------------------------------------------"
echo "Phase 1: Unprotected Application"
echo "------------------------------------------"
echo "Deploying demo-app natively on port 8081..."
docker compose -f unprotected.yml up -d --build
echo "Waiting for demo-app to initialize (5s)..."
sleep 5
echo ""

echo "Executing sample traffic against the unprotected app..."
./attack-samples.sh http://localhost:8081
echo ""
echo "(Notice how the attack requests were accepted by the application and returned HTTP 200 OK)"
echo ""

echo "------------------------------------------"
echo "Phase 2: Protected Application (Sidecar)"
echo "------------------------------------------"
echo "Tearing down unprotected app..."
docker compose -f unprotected.yml down

echo ""
echo "Deploying demo-app hidden behind the Edhir Sidecar proxy (port 8443)..."
docker compose -f protected.yml up -d --build
echo "Waiting for sidecar and app to initialize (20s)..."
sleep 20
echo ""

echo "Generating an API Key for the Sidecar tenant..."
# The proxy-service in protected.yml is exposed on 8443, so we can hit its TenantController to get a key
API_KEY=$(curl -s -X POST -H "Content-Type: application/json" -d '{"appName":"demo-scenario","contactEmail":"demo@example.com","integrationMode":"sidecar"}' http://localhost:8443/tenants)

if [ -z "$API_KEY" ]; then
  echo "Failed to generate API Key! Make sure the Edhir backend infrastructure is running."
  exit 1
fi

echo "Generated API Key: $API_KEY"
echo ""

echo "Executing sample traffic against the protected app..."
./attack-samples.sh http://localhost:8443 $API_KEY
echo ""
echo "(Notice how the clean requests succeed, but the attack requests are intercepted and blocked with a 403 Forbidden)"
echo ""

echo "=========================================="
echo "               Demo Complete!"
echo "=========================================="
echo "Open the Dashboard at: http://localhost:3000/app"
echo "Log in using the generated API Key to view the real-time event feed and security rules applied to this traffic."
echo ""
echo "API KEY: $API_KEY"
echo ""
echo "To clean up, run: docker compose -f protected.yml down"
