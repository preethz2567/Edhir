import requests
import time
import random
import uuid

# Base URL for the proxy service
BASE_URL = "http://localhost:8080"

# 1. Register a new tenant to get an API key
def register_tenant():
    print("Registering a new tenant...")
    payload = {
        "appName": f"LoadGenApp-{str(uuid.uuid4())[:8]}",
        "contactEmail": "admin@loadgen.local",
        "integrationMode": "sidecar"
    }
    try:
        response = requests.post(f"{BASE_URL}/tenants", json=payload)
        response.raise_for_status()
        api_key = response.text
        print(f"Successfully registered tenant. API Key: {api_key}")
        return api_key
    except Exception as e:
        print(f"Failed to register tenant: {e}")
        return None

# 2. Generate traffic
def generate_traffic(api_key):
    print("Starting traffic generation. Press Ctrl+C to stop.")
    paths = ["/login", "/dashboard", "/api/data", "/checkout", "/products", "/admin", "/search"]
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
        "python-requests/2.31.0",
        "BadBot/1.0"
    ]
    query_params = [
        "",
        "?id=123",
        "?q=test",
        "?select=sleep(10)", # simulates malicious query
        "?admin=true",
        "?page=2"
    ]
    
    # 85% normal requests, 15% malicious or edge case
    query_weights = [0.3, 0.2, 0.2, 0.05, 0.05, 0.2]
    
    headers = {
        "X-Api-Key": api_key
    }
    
    while True:
        path = random.choice(paths)
        query = random.choices(query_params, weights=query_weights, k=1)[0]
        url = f"{BASE_URL}{path}{query}"
        
        # Simulate different clients
        headers["User-Agent"] = random.choice(user_agents)
        # Randomize IP header to simulate different users/sessions
        headers["X-Forwarded-For"] = f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"
        
        try:
            # Randomly pick GET or POST
            if random.random() > 0.8:
                resp = requests.post(url, headers=headers, json={"data": "test"})
            else:
                resp = requests.get(url, headers=headers)
            print(f"[{resp.status_code}] {resp.request.method} {url}")
        except Exception as e:
            print(f"Request failed: {url} - {e}")
        
        # Sleep a bit to not overwhelm it completely, but generate decent traffic
        time.sleep(random.uniform(0.1, 1.0))

if __name__ == "__main__":
    key = register_tenant()
    if key:
        generate_traffic(key)
