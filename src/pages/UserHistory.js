import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from '../api/axios_frontend';
import { useNavigate } from "react-router-dom";
import "../style/UserHistory.css";

const UserHistory = ({ previewMode = false }) => { 
  const { auth, logout, isInitialized } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!auth?.token) return;

    setIsRefreshing(true);
    try {
      const response = await axios.get('/api/users/userHistory');
      setHistory(response.data.history || response.data || []);
    } catch (error) {
      console.error('Error fetching diagnosis history:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate('/login');
      }
      setError(error.response?.data?.error || 'Failed to load diagnosis history');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [auth?.token, logout, navigate]);

  useEffect(() => {
    if (!isInitialized || !auth?.token) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [auth?.token, isInitialized, navigate, fetchHistory]);

  const handleRefreshHistory = () => {
    setIsLoading(true);
    fetchHistory();
  };

  if (isLoading) {
    return <div className="loading-container">Loading your diagnosis history...</div>;
  }

  const displayedHistory = previewMode ? history.slice(0, 3) : history;

  return (
    <div className={previewMode ? "preview-history" : "history-container"}>
      {!previewMode && (
        <header className="header">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-text">Symptom Diagnosing Tool</span>
          <span className="logo-plus">+</span>
          </div>
        </header>
      )}

      <div className="history-content">
        <h2 className={previewMode ? "small-heading" : ""}>
          {previewMode ? "Recent Diagnoses" : "Your Diagnosis History"}
        </h2>

        {error && <p className="error-message">{error}</p>}

        {!previewMode && (
          <div className="history-controls">
            <button
              onClick={handleRefreshHistory}
              className="refresh-button"
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        )}

        {displayedHistory.length === 0 ? (
          <div className="empty-history">
            <p>No diagnosis history available</p>
            {!previewMode && (
              <button className="diagnose-button" onClick={() => navigate('/form')}>
                Get Diagnosed Now
              </button>
            )}
          </div>
        ) : (
          <>
            {previewMode ? (
              <div className="history-items">
                {displayedHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-diagnosis">
                      <strong>Disease:</strong> {item.predicted_disease}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="history-scroll-container">
                <div className="history-items">
                  {displayedHistory.map((item, index) => (
                    <div key={index} className="history-item">
                      <div className="history-diagnosis">
                        <strong>Disease:</strong> {item.predicted_disease}
                      </div>
                      <div className="history-description">
                        <strong>Description:</strong> {item.predicted_description || 'N/A'}
                      </div>
                      <div className="history-precautions">
                        <strong>Precautions:</strong> {Array.isArray(item.predicted_precautions) ? item.predicted_precautions.join(', ') : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserHistory;
