import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/Home.css';

const Home = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState(null); // This line should define the setUserId function

  // Fetch the user ID from localStorage or a global state/context (assuming you store the user ID after login)
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id'); // Assuming you store user_id in localStorage
    if (storedUserId) {
      setUserId(storedUserId); // Set the user_id from localStorage
    }
  }, []);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();

    if (!userId) {
      alert('You must be logged in to submit feedback');
      return;
    }

    // Here you can submit the feedback along with user_id to your backend API
    const feedbackData = {
      user_id: userId, // Include the logged-in user's ID
      feedback: feedback,
    };

    // Example of sending feedback to the backend (you can replace this with actual API logic)
    fetch('http://localhost:3500/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })
      .then((response) => response.json())
      .then((data) => {
        setSubmitted(true);
        setFeedback('');
      })
      .catch((error) => {
        console.error('Error submitting feedback:', error);
      });
  };

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="logo">
          Symptom Diagnosing Tool <span className="icon">➕</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile" className="profile-icon" role="img" aria-label="Profile">⚫</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to the Symptom Diagnosing Tool</h1>
          <p>Input your symptoms and get reliable, data-backed insights into potential health conditions.</p>
          <Link to="/form" className="cta-button">Start the Evaluation</Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <h2>Why Choose Our Tool?</h2>
        <div className="feature-cards">
          <div className="card">
            <div className="card-icon">📊</div>
            <h3>Accurate Predictions</h3>
            <p>Our machine learning models provide reliable disease predictions based on your symptoms.</p>
          </div>
          <div className="card">
            <div className="card-icon">💡</div>
            <h3>Personalized Advice</h3>
            <p>Receive tailored first aid and preventive measures for your specific condition.</p>
          </div>
          <div className="card">
            <div className="card-icon">📂</div>
            <h3>Diagnosis History</h3>
            <p>Track your health over time with a detailed record of past diagnoses.</p>
          </div>
        </div>
      </div>

      {/* User Feedback Section */}
      <div className="feedback-section">
        <h2>We Value Your Feedback</h2>
        <p>Your feedback helps us improve our services. Please share your thoughts below (optional).</p>
        <form onSubmit={handleFeedbackSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            rows="5"
          ></textarea>
          <button type="submit" className="submit-button">Submit Feedback</button>
        </form>
        {submitted && (
          <p className="success-message">Thank you for your feedback!</p>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Symptom Diagnosing Tool. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
