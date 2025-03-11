import { Link } from "react-router-dom";
import "../Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="header">
        <div className="logo">
          Symptom Diagnosing Tool <span className="icon">➕</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <span className="profile-icon" role="img" aria-label="Profile">⚫</span>
        </nav>
      </header>

      {/* Start the Evaluation Button */}
      <div className="start-evaluation">
        <Link to="/form" className="start-button">Start the Evaluation</Link>
      </div>

      {/* Single Section Containing All Information */}
      <div className="info-section">
        <div className="section">
          <h2>About This Tool</h2>
          <p>This AI-powered tool helps users assess symptoms efficiently and receive timely advice.</p>
        </div>

        <div className="section">
          <h2>How It Works</h2>
          <ul>
            <li>Step 1: Enter Symptoms</li>
            <li>Step 2: Receive Analysis</li>
            <li>Step 3: View Recommendations</li>
            <li>Step 4: Take Action</li>
          </ul>
        </div>

        <div className="section">
          <h2>About Us</h2>
          <p>Discover how this tool helps users identify symptoms and receive health guidance.</p>
          <Link to="/about" className="learn-more-link">Learn more about us.</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Symptom Diagnosing Tool. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;