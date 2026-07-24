from flask import Flask, request, jsonify
from flask_cors import CORS
from planner import generate_content_pack

app = Flask(__name__)
CORS(app)  # allow frontend calls


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})


@app.route("/generate-content", methods=["POST"])
def generate_content_route():
    payload = request.get_json(force=True) or {}

    print("\n==================== /generate-content ====================")
    print("✅ payload keys:", list(payload.keys()))

    try:
        pack = generate_content_pack(payload)
        print("✅ Content pack generated for subject:", pack["metadata"]["subject"])
        print("=============================================================\n")
        return jsonify(pack)
    except Exception as e:
        print("❌ Error generating content:", str(e))
        print("=============================================================\n")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)