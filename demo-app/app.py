"""
demo-app — a minimal Flask application that acts as the protected backend
that Edhir's proxy-service sits in front of.

Routes:
  GET  /            — HTML index page
  POST /login       — Simple login endpoint (intentionally vulnerable-looking
                      for demo/testing purposes; no real auth storage)
  GET  /products    — Returns a JSON list of products

The proxy's RuleEngine will fire when a SQLi or XSS pattern is sent to
any of these routes via the proxy; the request will never reach this app.
"""

from flask import Flask, request, jsonify, render_template_string
import os

app = Flask(__name__)

# Intentionally small set of "users" for demo/test purposes only
DEMO_USERS = {
    "admin": "admin123",
    "alice": "password1",
    "bob": "letmein",
}

PRODUCTS = [
    {"id": 1, "name": "Widget A", "price": 9.99, "category": "widgets"},
    {"id": 2, "name": "Gadget Pro", "price": 49.99, "category": "gadgets"},
    {"id": 3, "name": "Doohickey X", "price": 24.99, "category": "accessories"},
    {"id": 4, "name": "Thingamajig Plus", "price": 14.99, "category": "accessories"},
    {"id": 5, "name": "Gizmo 3000", "price": 99.99, "category": "gadgets"},
]

INDEX_HTML = """
<!DOCTYPE html>
<html>
<head><title>Demo Shop</title></head>
<body>
  <h1>Welcome to Demo Shop</h1>
  <p>This is the backend application protected by <strong>Edhir</strong>.</p>
  <ul>
    <li><a href="/products">Browse Products</a></li>
    <li><a href="/login-page">Login</a></li>
  </ul>
</body>
</html>
"""

LOGIN_HTML = """
<!DOCTYPE html>
<html>
<head><title>Login – Demo Shop</title></head>
<body>
  <h1>Login</h1>
  <form method="POST" action="/login">
    <label>Username: <input type="text" name="username" /></label><br>
    <label>Password: <input type="password" name="password" /></label><br>
    <button type="submit">Login</button>
  </form>
</body>
</html>
"""


@app.route("/")
def index():
    return render_template_string(INDEX_HTML)


@app.route("/login-page")
def login_page():
    return render_template_string(LOGIN_HTML)


@app.route("/login", methods=["POST"])
def login():
    """
    POST /login
    Accepts JSON body {"username": "...", "password": "..."} or form data.
    Returns 200 with a session token stub on success, 401 on failure.

    Note: this endpoint is intentionally a demo target. Sending payloads like
    username=' OR 1=1-- via the proxy will be blocked by the RuleEngine
    before this function is ever called.
    """
    if request.is_json:
        data = request.get_json(silent=True) or {}
    else:
        data = request.form

    username = data.get("username", "")
    password = data.get("password", "")

    if DEMO_USERS.get(username) == password:
        return jsonify({
            "status": "ok",
            "message": f"Welcome, {username}!",
            "token": f"demo-token-{username}-abc123",
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "Invalid credentials",
        }), 401


@app.route("/products", methods=["GET"])
def products():
    """
    GET /products?category=<category>
    Returns a JSON list of products, optionally filtered by category.
    """
    category = request.args.get("category")
    result = PRODUCTS
    if category:
        result = [p for p in PRODUCTS if p["category"] == category]

    return jsonify({
        "products": result,
        "count": len(result),
    }), 200


@app.route("/feedback", methods=["POST"])
def feedback():
    """
    POST /feedback
    Accepts any form data (like an XSS payload) and returns 200 OK.
    """
    return jsonify({"status": "received", "message": "Thank you for your feedback!"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
