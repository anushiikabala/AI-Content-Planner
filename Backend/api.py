from flask import Flask, request, jsonify
from flask_cors import CORS
from planner import generate_plan

app = Flask(__name__)
CORS(app)  # allow frontend calls

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/generate-plan", methods=["POST"])
def generate_plan_route():
    payload = request.get_json(force=True) or {}
    plan = generate_plan(payload)  # returns dict matching ContentPlan
    print("Received:", payload.keys())
    return jsonify(plan)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)