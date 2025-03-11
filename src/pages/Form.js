import React from 'react';
import { Link } from 'react-router-dom';
import '../Form.css'; // Create a new CSS file for form styles

const Form = () => {
  return (
    <div className="form-container">
      <h1>Evaluation Form</h1>
      <form>
        <div className="form-group">
          <label htmlFor="symptoms">Enter Your Symptoms:</label>
          <textarea id="symptoms" name="symptoms" rows="4" required></textarea>
        </div>
        <button type="submit" className="submit-button">Submit</button>
      </form>
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
};

export default Form;