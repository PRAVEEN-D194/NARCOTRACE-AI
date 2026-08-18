import os
import json
import logging
from flask import Flask, render_template, request, jsonify
from pipeline import Member1Pipeline

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("NARCO-TRACE-WebApp")

app = Flask(__name__, template_folder="templates", static_folder="static")

# Initialize Member 1 Pipeline engine
pipeline_engine = Member1Pipeline(use_ml_fallbacks=True)

PRESET_EXAMPLES = [
    {
        "id": "tanglish",
        "title": "Tanglish Dark-Web Request",
        "language": "Tanglish / Code-Mixed",
        "text": "machi 1g ice irukka? contact @dark_seller_tn on telegram. deal at marina beach, 2000 INR crypto only"
    },
    {
        "id": "hinglish",
        "title": "Hinglish Obfuscated Drug Procurement",
        "language": "Hinglish / Leetspeak",
        "text": "bhai 2 p@ck3ts of m@ll! and d3x0 available in Bangaluru? ping me on Session 05f8892a01bc. drop near Koramangala signal, 1.5k UPI"
    },
    {
        "id": "innocent",
        "title": "Innocent Control Query",
        "language": "Code-Mixed (Control)",
        "text": "Hey bhai, is there frozen ice left in the fridge? Marina beach is too hot today."
    },
    {
        "id": "tamil_obscured",
        "title": "Tamil Dark Jargon & Emoji Masking",
        "language": "Tanglish / Dark Jargon",
        "text": "vadi near marina beach ready ah? ❄️ podi samaan 10g iruku, ping @tn_dark_dealer on wickr. ₹5000 UPI only"
    }
]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/examples", methods=["GET"])
def get_examples():
    return jsonify({"status": "SUCCESS", "examples": PRESET_EXAMPLES})

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "UP",
        "module": "NARCO-TRACE Module 1 — Multilingual & Dark-Web NLP Engine",
        "pipeline_active": True
    })

@app.route("/api/analyze", methods=["POST"])
def analyze_text():
    try:
        data = request.get_json(force=True)
        raw_text = data.get("text", "").strip()
        
        if not raw_text:
            return jsonify({"status": "ERROR", "message": "Input text cannot be empty"}), 400
            
        logger.info(f"Received API text analysis request: '{raw_text[:50]}...'")
        result = pipeline_engine.execute(raw_text)
        
        # Convert pydantic output to dict/json
        result_dict = json.loads(result.model_dump_json())
        return jsonify(result_dict)
        
    except Exception as e:
        logger.error(f"Error during text analysis: {e}", exc_info=True)
        return jsonify({
            "status": "ERROR",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting NARCO-TRACE Module 1 Web Server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
