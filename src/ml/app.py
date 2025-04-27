from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import re
import string
import psycopg2
import json
from datetime import datetime
import os
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

load_dotenv()
app = Flask(__name__)
CORS(app)

# ------------------ DB CONFIG ------------------
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'symptom_diagnosing_tool_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'shuvashree'),
    'port': os.getenv('DB_PORT', '5432')
}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

def save_to_db(user_id, symptoms, predictions):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            symptoms_array = [s.strip() for s in symptoms.split(',')]
            cur.execute(
                "INSERT INTO disease_prediction (user_id, symptoms, predictions, created_at) "
                "VALUES (%s, %s::jsonb, %s::jsonb, %s) RETURNING prediction_id",
                (
                    user_id,
                    json.dumps(symptoms_array),
                    json.dumps(predictions),
                    datetime.now()
                )
            )
            pred_id = cur.fetchone()[0]

            for pred in predictions:
                cur.execute(
                    "INSERT INTO user_history "
                    "(user_id, prediction_id, visited_at, predicted_disease, disease_id, confidence, probabilities, disease_name, predicted_description, predicted_precautions) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s::jsonb)",
                    (
                        user_id, pred_id, datetime.now(),
                        pred['disease_name'], pred['disease_id'], pred['confidence'],
                        json.dumps(pred['probabilities']), pred['disease_name'],
                        pred.get('description', 'No description available.'),
                        json.dumps(pred.get('precautions', ['Consult a healthcare professional']))
                    )
                )
        conn.commit()
        return pred_id
    finally:
        conn.close()

# ------------------ Defining the Jaccard Similarity Function ------------------
def jaccard_similarity(user_symptoms, disease_symptoms):
    intersection = np.sum(np.minimum(user_symptoms, disease_symptoms))
    union = np.sum(np.maximum(user_symptoms, disease_symptoms))
    return intersection / union

# ------------------ MODEL & ARTIFACTS ------------------
model_pkg = joblib.load('symptom_disease_prediction_model.joblib')
tfidf_vectorizer = model_pkg['tfidf_vectorizer']
svd_transformer = model_pkg['svd_transformer']
cosine_sim_matrix = model_pkg['cosine_similarity_matrix']
numeric_cols = model_pkg['numeric_cols']
description_column = model_pkg['description_column']
disease_info_dict = model_pkg['disease_info_dict']
df = model_pkg['df']

# ------------------ UTILITY FUNCTIONS ------------------
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return ' '.join(tokens)

def jaccard_similarity(set1, set2):
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union != 0 else 0

# ------------------ FLASK ROUTES ------------------
@app.route('/predict', methods=['POST'])
def predict_or_fetch_info():
    data = request.json

    # Info Fetching
    if 'get_disease_info' in data:
        disease_name = data.get('get_disease_info')
        info = disease_info_dict.get(disease_name, {})
        return jsonify(success=True, description=info.get('description', ''), precautions=info.get('precautions', []))

    if 'get_precautions' in data:
        disease_name = data.get('get_precautions')
        info = disease_info_dict.get(disease_name, {})
        return jsonify(success=True, precautions=info.get('precautions', []))

    # --- NEW: Accept both checkbox & text inputs ---
    raw_selected_symptoms = data.get('selected_symptoms', '')  # From checkboxes
    raw_text_symptoms = data.get('text_symptoms', '')  # From free-text field
    user_id = data.get('user_id')

    if not raw_selected_symptoms and not raw_text_symptoms:
        return jsonify(success=False, error="At least one of selected_symptoms or text_symptoms is required."), 400

    try:
        extracted_symptoms = set()

        # From checkboxes (comma-separated)
        if raw_selected_symptoms:
            checkbox_symptoms = [s.strip().lower() for s in raw_selected_symptoms.split(',')]
            extracted_symptoms.update([symptom for symptom in checkbox_symptoms if symptom in numeric_cols])

        # From text box (full sentence)
        if raw_text_symptoms:
            preprocessed_text = preprocess_text(raw_text_symptoms)
            for token in preprocessed_text.split():
                if token in numeric_cols:
                    extracted_symptoms.add(token)

        if not extracted_symptoms:
            return jsonify(success=False, error="No valid symptoms found."), 400

        combined_input = ' '.join(extracted_symptoms)

        # NLP-based Cosine Similarity
        input_vector = tfidf_vectorizer.transform([combined_input])
        input_vector_reduced = svd_transformer.transform(input_vector)
        desc_similarities = cosine_similarity(input_vector_reduced, cosine_sim_matrix).flatten()

        # Jaccard Similarity
        user_symptom_vector = np.zeros(len(numeric_cols))
        for symptom in extracted_symptoms:
            user_symptom_vector[numeric_cols.index(symptom)] = 1

        jac_similarities = []
        for _, row in df.iterrows():
            disease_vector = row[numeric_cols].values
            jac_sim = jaccard_similarity(set(np.where(user_symptom_vector > 0)[0]), set(np.where(disease_vector > 0)[0]))
            jac_similarities.append(jac_sim)
        jac_similarities = np.array(jac_similarities)
        if jac_similarities.max() > 0:
            jac_similarities /= jac_similarities.max()

        # Combine both similarity scores
        final_scores = jac_similarities * desc_similarities
        top_indices = np.argsort(final_scores)[-3:][::-1]

        predictions = []
        for idx in top_indices:
            disease_name = df.iloc[idx]['disease']
            info = disease_info_dict.get(disease_name, {})
            predictions.append({
                'disease_id': int(idx),
                'disease_name': disease_name,
                'confidence': float(final_scores[idx] * 100),
                'probabilities': [
                    {
                        'disease': df.iloc[i]['disease'],
                        'probability': float(final_scores[i])
                    } for i in range(len(final_scores))
                ],
                'description': info.get('description', 'No description available.'),
                'precautions': info.get('precautions', ['Consult a healthcare professional'])
            })

        pred_id = save_to_db(user_id, ','.join(extracted_symptoms), predictions) if user_id else None

        return jsonify({
            'success': True,
            'prediction_id': pred_id,
            'predictions': predictions,
            'model_version': '1.0'
        })

    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

# ------------------ USER HISTORY ------------------

@app.route('/history', methods=['GET'])
def get_user_history():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify(success=False, error="Missing user_id"), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT prediction_id, visited_at, predicted_disease, confidence, predicted_description, predicted_precautions
                FROM user_history
                WHERE user_id = %s
                ORDER BY visited_at DESC
            """, (user_id,))
            rows = cur.fetchall()

            history = []
            for row in rows:
                history.append({
                    'prediction_id': row[0],
                    'visited_at': row[1].isoformat(),
                    'predicted_disease': row[2],
                    'confidence': float(row[3]),
                    'predicted_description': row[4],
                    'predicted_precautions': row[5]
                })

        return jsonify(success=True, history=history)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500
    finally:
        conn.close()


# ------------------ RUN APP ------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
