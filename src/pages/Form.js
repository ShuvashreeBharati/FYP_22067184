import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Added Link import
import { useAuth } from '../context/AuthProvider';
import api from '../api/axios_frontend';
import '../style/Form.css';

const Form = () => {
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth(); // Removed unused 'auth' destructuring

  useEffect(() => {
    if (location.state?.symptoms) {
      setSymptoms(location.state.symptoms);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSymptomsChange = (e) => {
    setSymptoms(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }
  
    if (!isAuthenticated()) {
      navigate('/auth/login', {
        state: {
          from: location.pathname,
          symptoms: symptoms.trim()
        }
      });
      return;
    }
  
    setLoading(true);
    setError('');
    setResults(null);
  
    try {
      // Format symptoms as array before sending
      const symptomArray = symptoms.split(',')
        .map(s => s.trim())
        .filter(s => s);
  
      if (!symptomArray.length) {
        throw new Error('Please enter valid symptoms separated by commas');
      }
  
      // Send as array (will be converted to JSONB automatically)
      const response = await api.post('/api/diagnose', {
        symptoms: symptomArray // Changed from formattedSymptoms string to array
      });
  
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Diagnosis failed');
      }
  
      setResults({
        predictions: response.data.predictions || [],
        is_anomaly: response.data.is_anomaly || false,
        anomaly_score: response.data.anomaly_score || 0,
        matched_symptoms: response.data.matched_symptoms || [],
      });
  
    } catch (err) {
      console.error('Diagnosis error:', err);
      setError(
        err.message.includes('Failed to fetch')
          ? 'Cannot connect to the server. Please try again later.'
          : err.message
      );
  
      if (err.response?.status === 401) {
        navigate('/auth/login', { state: { from: location.pathname } });
      }
    } finally {
      setLoading(false);
    }
  };

  // Keep resetForm since it's used in the JSX
  const resetForm = () => {
    setResults(null);
    setSymptoms('');
  };

  return (
    <div className="form-container">
      <h1>Symptom Diagnosis</h1>

      {!results ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="symptoms">Describe your symptoms:</label>
            <textarea
              id="symptoms"
              rows="4"
              placeholder="E.g., headache, fever, fatigue (separate with commas)"
              value={symptoms}
              onChange={handleSymptomsChange}
              required
              disabled={loading}
            />
            <div className="example-text">Example: headache, fever, cough</div>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
              <button
                onClick={() => setError('')}
                className="close-error"
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className={loading ? 'loading' : ''}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              'Get Diagnosis'
            )}
          </button>

          {!isAuthenticated() && (
            <p className="login-notice">
              Note: You must be logged in to save your diagnosis history.
            </p>
          )}
        </form>
      ) : (
        <div className="diagnosis-results">
          <h2>Diagnosis Results</h2>

          <div className="anomaly-alert">
            {results.is_anomaly ? (
              <div className="anomaly-warning">
                <h3>⚠️ Unusual Symptom Pattern Detected</h3>
                <p>Anomaly score: {results.anomaly_score?.toFixed(2) || 'N/A'}</p>
                <p>This combination of symptoms is unusual. Please consult a healthcare professional.</p>
              </div>
            ) : (
              <p className="normal-pattern">✓ Normal symptom pattern detected</p>
            )}
          </div>

          <div className="matched-symptoms">
            <h3>Your Reported Symptoms:</h3>
            <ul>
              {results.matched_symptoms?.map((symptom, i) => (
                <li key={i}>{symptom}</li>
              ))}
            </ul>
          </div>

          <div className="predictions-container">
            {(results.predictions || []).map((prediction, index) => (
              <div key={index} className="prediction-card">
                <h3>{prediction.disease_name || 'Possible Condition'}</h3>
                <div className="probability-meter">
                  <div className="probability-bar">
                    <div
                      className="probability-fill"
                      style={{
                        width: `${prediction.confidence || 0}%`
                      }}
                    ></div>
                  </div>
                  <span>
                    {prediction.confidence ? 
                      `${prediction.confidence.toFixed(1)}% confidence` :
                      'Confidence unavailable'}
                  </span>
                </div>
                {prediction.suggestion && (
                  <p className="suggestion">{prediction.suggestion}</p>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button onClick={resetForm} className="new-diagnosis-btn">
              Perform New Diagnosis
            </button>
            {isAuthenticated() && (
              <Link to="/history" className="view-history-btn">
                View Diagnosis History
              </Link>
            )}
          </div>
        </div>
      )}

      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </div>
  );
};

export default Form;