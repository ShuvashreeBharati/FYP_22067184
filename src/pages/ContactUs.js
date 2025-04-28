import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios_frontend";
import '../style/ContactUs.css';

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData?.userId || null;

      const enquiryPayload = {
        user_id: userId,
        subject: `Message from ${formData.name} (${formData.email})`,
        message: formData.message,
      };

      await axios.post('/api/enquiry/send-enquiry', enquiryPayload);

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to send your message. Please try again later.');
    }
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
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
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
