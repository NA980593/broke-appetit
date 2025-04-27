import os
import base64
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify
from walmart import search_walmart

app = Flask(__name__)


# API_KEY = os.environ.get("GOOGLE_API_KEY") # Get API key from environment variable
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set")

genai.configure(api_key=API_KEY)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error initializing Gemini model: {e}")
    model = None


@app.route('/walmart', methods=['POST'])
def walmart():
    results = {}
    """
    Receives an array of ingredients, searches Walmart for each,
    and returns a dictionary with ingredient names as keys
    and lists of product results as values.
    """
    data = request.get_json()

    if not data or 'ingredients' not in data or not isinstance(data.get('ingredients'), list):
        return jsonify({"error": "JSON must contain an 'ingredients' key with a list value"}), 400

    ingredients_for_walmart = data['ingredients']

    for ingredient in ingredients_for_walmart:
        if isinstance(ingredient, str) and ingredient.strip():
            print(f"Searching Walmart for: {ingredient}")
            results[ingredient] = (search_walmart(ingredient.strip()))
        else:
            print(f"Skipping invalid ingredient: {ingredient}")

    return jsonify(results), 200


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recipe')
def recipe():
    return render_template('recipe.html')

@app.route('/recognize-food', methods=['POST'])
def recognize_food():
    if not model:
        return jsonify({"error": "Gemini model not initialized correctly."}), 500

    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400

    image_data_url = data['image']

    try:
        header, base64_string = image_data_url.split(',')
        image_bytes = base64.b64decode(base64_string)

        mime_type = 'image/jpeg'
        if 'data:image/png' in header:
             mime_type = 'image/png'
        elif 'data:image/jpeg' in header:
             mime_type = 'image/jpeg'
    except Exception as e:
            print(f"Error decoding image data: {e}")
            return jsonify({"error": "Invalid image data format"}), 400

    prompt = "What is the main food item visible in this image? Be as specific as possible. Only name the food and do not say anything else. If no food is present, say 'null'."


    image_part = {
        'mime_type': mime_type,
        'data': image_bytes
    }

    try:
        response = model.generate_content([prompt, image_part])

        gemini_response_text = response.text

        if "null" in gemini_response_text:
             food_result = "No food detected."
        else:
             food_result = gemini_response_text

        return jsonify({"foodName": food_result})

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        error_message = str(e)
        if hasattr(e, 'response') and e.response.error:
             error_message = f"API Error: {e.response.error.message}"

        return jsonify({"error": f"Failed to get response from Gemini API: {error_message}"}), 500



@app.route('/recognize-ingredients', methods=['POST'])
def recognize_ingredients():
    if not model:
        return jsonify({"error": "Gemini model not initialized correctly."}), 500

    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400

    image_data_url = data['image']

    try:
        header, base64_string = image_data_url.split(',')
        image_bytes = base64.b64decode(base64_string)

        mime_type = 'image/jpeg'
        if 'data:image/png' in header:
             mime_type = 'image/png'
        elif 'data:image/jpeg' in header:
             mime_type = 'image/jpeg'
    except Exception as e:
            print(f"Error decoding image data: {e}")
            return jsonify({"error": "Invalid image data format"}), 400

    prompt = "Read all the ingredients in this recipe. Respond with the list of each and every ingredient all lowercase, no spaces between individual ingredients but if the ingredient is more than one word space is allowed there, and separated by commas so they can be parsed later by code. Do not include measurements or ingredient preparation information like thinly sliced, minced, etc. If no food or ingredient is present, say 'null'."


    image_part = {
        'mime_type': mime_type,
        'data': image_bytes
    }

    try:
        response = model.generate_content([prompt, image_part])

        gemini_response_text = response.text

        if "null" in gemini_response_text:
             food_result = "No ingredients detected."
        else:
             food_result = gemini_response_text

        return jsonify({"foodName": food_result})

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        error_message = str(e)
        if hasattr(e, 'response') and e.response.error:
             error_message = f"API Error: {e.response.error.message}"

        return jsonify({"error": f"Failed to get response from Gemini API: {error_message}"}), 500




if __name__ == '__main__':
    app.run(debug=True)