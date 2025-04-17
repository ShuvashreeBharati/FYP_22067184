import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../style/ContactUs.css';


const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true); // Set the form as submitted
  };

  return (
    <div className="contact-container">
      {!submitted ? (
        <>
          <h2 className="contact-title">Contact Us</h2>
          <p className="contact-description">
            Reach out for support, feedback, or inquiries. We are here to help!
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
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
          <Link to="/" className="go-back-link">Go Back</Link>
        </>
      ) : (
        <div className="thank-you-message">
          <h2>Thank You!</h2>
          <p>Your message has been successfully sent. We'll get back to you shortly.</p>
          <Link to="/" className="go-back-link">Return to Home</Link>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
