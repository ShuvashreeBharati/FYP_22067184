from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import psycopg2
import json
from datetime import datetime
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database config
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'symptom_diagnosing_tool_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'shuvashree'),
    'port': os.getenv('DB_PORT', '5432')
}

# Load ML models and disease data
model_pkg = joblib.load('hybrid_model_package.joblib')
model = model_pkg['supervised_model']
anomaly_detector = model_pkg['anomaly_detector']
symptom_features = model_pkg['feature_names']

# Load disease names and precautions
df = pd.read_csv('final_dataset.csv', encoding='latin1')
disease_names = df['disease'].to_dict()
df['precautions'] = df[[f'precaution_{i}' for i in range(1,5)]].apply(
    lambda row: '. '.join(str(x) for x in row if pd.notna(x)), axis=1)
precautions = df['precautions'].to_dict()

def get_db():
    return psycopg2.connect(**DB_CONFIG)

def save_to_db(user_id, symptoms, predictions, is_anomaly, anomaly_score):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Store symptoms as JSONB array
            symptoms_array = [s.strip() for s in symptoms.split(',')]
            
            # Insert into disease_prediction
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
            
            # Insert into user_history
            for pred in predictions:
                cur.execute(
                    "INSERT INTO user_history "
                    "(user_id, prediction_id, visited_at, is_anomaly, anomaly_score, "
                    "predicted_disease, disease_id, confidence, probabilities, disease_name) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)",
                    (
                        user_id, pred_id, datetime.now(), is_anomaly, anomaly_score,
                        pred['disease_name'], pred['disease_id'], pred['confidence'],
                        json.dumps(pred['probabilities']), pred['disease_name']
                    )
                )
        conn.commit()
        return pred_id
    finally:
        conn.close()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    symptoms = data.get('symptoms', '').strip()
    user_id = data.get('user_id')
    
    if not symptoms:
        return jsonify(success=False, error="Symptoms required"), 400

    try:
        # Convert symptoms to features
        X = np.zeros(len(symptom_features))
        symptoms_list = [s.strip().lower() for s in symptoms.split(',')]
        
        for i, feat in enumerate(symptom_features):
            X[i] = any(sym in feat.lower() for sym in symptoms_list)
        X = X.reshape(1, -1)

        # Get predictions
        proba = model.predict_proba(X)[0]
        anomaly_score = float(anomaly_detector.decision_function(X)[0])
        is_anomaly = bool(anomaly_detector.predict(X)[0] == -1)
        top_diseases = np.argsort(proba)[-3:][::-1]
        
        predictions = [{
            'disease_id': int(idx),
            'disease_name': disease_names.get(idx, f"Disease {idx}"),
            'confidence': float(proba[idx] * 100),
            'probabilities': [{
                'disease': disease_names.get(i, f"Disease {i}"), 
                'probability': float(p)
            } for i, p in enumerate(proba)],
            'anomaly': is_anomaly,
            'suggestion': precautions.get(idx, 'Consult a healthcare professional')
        } for idx in top_diseases]

        # Save to DB if user_id exists
        pred_id = save_to_db(user_id, symptoms, predictions, is_anomaly, anomaly_score) if user_id else None

        return jsonify({
            'success': True,
            'prediction_id': pred_id,
            'predictions': predictions,
            'anomaly_score': anomaly_score,
            'is_anomaly': is_anomaly,
            'model_version': '1.0'
        })

    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)