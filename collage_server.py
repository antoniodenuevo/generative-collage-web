#
# 
#  
# This is the same as v4 but with translation in canvas
#
# In this iteration you can save images by pressing 's'
# Images are not re-sized to canvas size and have random positions
# 
# Last edited feb 18 2025
#
#


import os
import random
import json
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

script_dir = os.path.dirname(os.path.abspath(__file__))

root_folder = os.path.join(script_dir, "product_images")
cutouts_folder = os.path.join(root_folder, "cut_outs")
text_file = os.path.join(script_dir, "product_texts.json")
renders_folder = os.path.join(script_dir, "renders")  # ✅ Folder for saved renders

# Ensure render directory exists
os.makedirs(renders_folder, exist_ok=True)

@app.route("/get_cutout", methods=["GET"])
def get_cutout():
    try:
        cutout_files = [f for f in os.listdir(cutouts_folder) if f.endswith((".jpg", ".png"))]
        if not cutout_files:
            return jsonify({"error": "No cutouts available"}), 404
        selected_cutout = random.choice(cutout_files)
        return jsonify({"cutout": f"/cut_outs/{selected_cutout}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_text", methods=["GET"])
def get_text():
    try:
        if not os.path.exists(text_file):
            return jsonify({"error": "Text file not found"}), 404
        with open(text_file, "r") as file:
            data = json.load(file)
        if "1" not in data:
            return jsonify({"error": "No text available"}), 404
        random_text = random.choice(data["1"])
        return jsonify({"text": random_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/cut_outs/<filename>")
def serve_cutout(filename):
    return send_from_directory(cutouts_folder, filename)

# ✅ New route: Save renders
@app.route("/save_render", methods=["POST"])
def save_render():
    try:
        file = request.files["image"]
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
        filename = f"render_{timestamp}.png"
        file.save(os.path.join(renders_folder, filename))
        return jsonify({"message": "Render saved", "filename": filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
