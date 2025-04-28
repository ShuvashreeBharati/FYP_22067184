import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/Home.css';

const Home = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [profilePicUrl, setProfilePicUrl] = useState('/images/default-pfp.png'); // Default
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const storedProfilePic = localStorage.getItem('profile_pic_url');

    if (storedProfilePic) {
      setProfilePicUrl(storedProfilePic);
    } else if (userData?.profilePicUrl) {
      setProfilePicUrl(userData.profilePicUrl);
    }

    if (userData) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    fetchFeedbacks();

    const handleStorageChange = (event) => {
      if (event.key === 'profile_pic_url') {
        const newProfilePic = event.newValue || '/images/default-pfp.png';
        setProfilePicUrl(newProfilePic);
      }
      if (event.key === 'userData') {
        const updatedUserData = JSON.parse(event.newValue);
        if (updatedUserData) {
          setIsLoggedIn(true);
          if (updatedUserData.profilePicUrl) {
            setProfilePicUrl(updatedUserData.profilePicUrl);
          }
        } else {
          setIsLoggedIn(false);
          setProfilePicUrl('/images/default-pfp.png');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://localhost:3500/api/feedback/fetch-feedback');
      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      const data = await response.json();
      setFeedbackList(data);

      const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
      const avgRating = data.length ? totalRating / data.length : 0;
      setAverageRating(avgRating.toFixed(1));
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData?.userId;

    if (!userId) {
      alert('You must be logged in to submit feedback');
      return;
    }

    if (feedback.trim() === '') {
      alert('Please enter your feedback before submitting.');
      return;
    }

    try {
      const feedbackData = {
        user_id: userId,
        comment: feedback,
        rating: rating,
      };

      const response = await fetch('http://localhost:3500/api/feedback/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
      setFeedback('');
      setRating(0);
      fetchFeedbacks();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleStartEvaluation = () => {
    if (isLoggedIn) {
      navigate('/form');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-text">Symptom Diagnosing Tool</span>
          <span className="logo-plus">+</span>
        </Link>
        <nav className="nav-links">
          <Link to="/contact">Contact Us</Link>
          {!isLoggedIn && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          <Link to="/profile" className="profile-link">
            <img
              src={profilePicUrl}
              alt="Profile"
              className="profile-icon"
            />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to the Symptom Diagnosing Tool</h1>
          <p>Input your symptoms and get reliable, data-backed insights into potential health conditions.</p>
          <button className="cta-button" onClick={handleStartEvaluation}>
            Start the Evaluation
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <h2>Why Choose Our Tool?</h2>
        <div className="feature-cards">
          <div className="card">
            <div className="card-icon">📊</div>
            <h3>Accurate Predictions</h3>
            <p>Our evaluation form with similarity measurements provides reliable disease predictions based on your symptoms.</p>
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

      {/* Testimonials Section */}
      <div className="testimonials">
        <h2>What Our Users Say</h2>

        <div className="average-rating">
          Average Rating: {averageRating} ⭐
        </div>

        <div className="testimonial-carousel">
          {feedbackList.length > 0 ? (
            feedbackList.map((item, index) => (
              <div className="testimonial-card" key={index}>
                <p>"{item.comment}"</p>
                <h4>- {item.name || 'Anonymous'} | ⭐ {item.rating} / 5</h4>
              </div>
            ))
          ) : (
            <>
              <div className="testimonial-card">
                <p>"This tool helped me so much!"</p>
                <h4>- User A</h4>
              </div>
              <div className="testimonial-card">
                <p>"Highly recommend this for quick diagnosis."</p>
                <h4>- User B</h4>
              </div>
              <div className="testimonial-card">
                <p>"The experience was smooth and professional."</p>
                <h4>- User C</h4>
              </div>
            </>
          )}
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

          <div className="rating-stars">
            <span>Rate us: </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  cursor: 'pointer',
                  color: star <= rating ? '#ffc107' : '#ccc',
                  fontSize: '24px'
                }}
              >
                ★
              </span>
            ))}
          </div>

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
