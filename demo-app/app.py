from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login")
def login():
    return "<h2>Fake Login Page</h2>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
