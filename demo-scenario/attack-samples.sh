#!/bin/bash
# attack-samples.sh

TARGET_URL=${1:-http://localhost:8081}
API_KEY=$2

HEADERS=""
if [ -n "$API_KEY" ]; then
  HEADERS="-H X-Api-Key:$API_KEY"
fi

echo "Firing requests against $TARGET_URL..."
echo ""

echo "--- [1/4] Clean GET Request ---"
echo "GET /products"
curl -s -i $HEADERS "$TARGET_URL/products" | head -n 1
echo ""

echo "--- [2/4] Clean POST Request ---"
echo "POST /login"
curl -s -i -X POST $HEADERS -d "username=admin&password=admin123" "$TARGET_URL/login" | head -n 1
echo ""

echo "--- [3/4] Attack: SQL Injection in query ---"
echo "GET /products?category=1'+UNION+SELECT+*+FROM+users--"
# The Edhir proxy will block this payload with a 403 Forbidden. The standalone app would return a 200 or 404.
curl -s -i $HEADERS "$TARGET_URL/products?category=1'+UNION+SELECT+*+FROM+users--" | head -n 1
echo ""

echo "--- [4/4] Attack: XSS in form body ---"
echo "POST /login"
# The Edhir proxy will block this payload with a 403 Forbidden. 
curl -s -i -X POST $HEADERS -d "username=<script>alert('xss')</script>" "$TARGET_URL/login" | head -n 1
echo ""
