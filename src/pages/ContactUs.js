import React from "react";
import { Link } from "react-router-dom";
import '../ContactUs.css'; // Importing the CSS file

const ContactUs = () => {
  return (
    <div className="contact-container">
      <h2 className="contact-title">Contact Us</h2>
      <p className="contact-description">Reach out for support, feedback, or inquiries. We are here to help!</p>
      
      <form className="contact-form">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          required
        />
        <button type="submit">Submit</button>
      </form>
      
      <Link to="/" className="back-link">Go Back</Link>
    </div>
  );
};

export default ContactUs;
