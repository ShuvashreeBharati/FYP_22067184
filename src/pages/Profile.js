import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "../api/axios_frontend";
import "../style/Profile.css";
import UserHistory from "./UserHistory";

const Profile = () => {
  const { auth, logout, isInitialized } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    created_at: '',
    profile_picture: '/images/default-pfp.png'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    updatedName: '',
    updatedEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    if (!auth?.user?.userId) return;
    try {
      const response = await axios.get(`/api/users/${auth.user.userId}`);
      const { name, email, created_at, profile_picture } = response.data;
      setUserData({
        name,
        email,
        created_at: new Date(created_at).toLocaleDateString(),
        profile_picture: profile_picture || '/images/default-pfp.png'
      });
      setFormData(prev => ({
        ...prev,
        updatedName: name,
        updatedEmail: email
      }));
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate('/login');
      }
      setError(error.response?.data?.error || 'Failed to load user details');
    }
  }, [auth?.user?.userId, logout, navigate]);

  // Initial fetch
  useEffect(() => {
    if (!isInitialized) return;
    if (!auth?.token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchUserDetails();
      } catch (error) {
        console.error('Error initializing profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auth?.token, isInitialized, navigate, fetchUserDetails]);

  // Handle profile info update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(`/api/users/${auth.user.userId}`, {
        name: formData.updatedName,
        email: formData.updatedEmail
      });
      setUserData(prev => ({
        ...prev,
        name: response.data.name,
        email: response.data.email
      }));
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      await axios.put(`/api/users/${auth.user.userId}/password`, {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSuccess('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile picture change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Upload profile picture
  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    if (!formData.profilePicture) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profile_picture', formData.profilePicture);
      const response = await axios.put(
        `/api/users/${auth.user.userId}/picture`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUserData(prev => ({
        ...prev,
        profile_picture: response.data.profile_picture || '/images/default-pfp.png'
      }));
      setPreviewImage('');
      setFormData(prev => ({ ...prev, profilePicture: null }));
      setSuccess('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setError(error.response?.data?.error || 'Failed to update profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) return <div className="loading-container">Loading authentication...</div>;
  if (!auth) return <div className="loading-container">Please log in to view your profile</div>;

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="header">
        <div className="logo">Symptom Diagnosing Tool <span className="icon">➕</span></div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/form">Diagnosis</Link>
          <Link to="/contact">Contact Us</Link>
          {auth?.token ? (
            <button onClick={logout} className="logout-button">Log Out</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      {/* Profile content */}
      <div className="profile-content">
        <h2>User Profile</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="profile-sections">
          {/* User Details */}
          <div className="profile-section user-details">
            <h3>User Details</h3>
            <div className="profile-picture-section">
              <img
                src={previewImage || userData.profile_picture}
                alt="Profile"
                className="profile-picture"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-pfp.png";
                }}
              />
              <form onSubmit={handleProfilePictureUpload}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  id="profile-picture-upload"
                />
                <label htmlFor="profile-picture-upload" className="upload-button">
                  Change Photo
                </label>
                {previewImage && (
                  <button type="submit" className="save-button" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                )}
              </form>
            </div>

            <div className="user-info">
              <div className="info-row"><span className="info-label">Name:</span><span className="info-value">{userData.name}</span></div>
              <div className="info-row"><span className="info-label">Email:</span><span className="info-value">{userData.email}</span></div>
              <div className="info-row"><span className="info-label">Member Since:</span><span className="info-value">{userData.created_at}</span></div>
              <button onClick={() => setIsEditing(!isEditing)} className="edit-button" disabled={isLoading}>
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>

              {isEditing && (
                <form onSubmit={handleProfileUpdate} className="edit-form">
                  <label>New Name:
                    <input
                      type="text"
                      value={formData.updatedName}
                      onChange={(e) => setFormData({ ...formData, updatedName: e.target.value })}
                      required
                    />
                  </label>
                  <label>New Email:
                    <input
                      type="email"
                      value={formData.updatedEmail}
                      onChange={(e) => setFormData({ ...formData, updatedEmail: e.target.value })}
                      required
                    />
                  </label>
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Diagnosis History Preview */}
          <div className="profile-section diagnosis-history">
            <h3>Diagnosis History</h3>
            
            {/* Use UserHistory with previewMode */}
            <UserHistory previewMode={true} />
            
            <Link 
              to="/history" 
              className="show-more-link"
              style={{color: 'black', padding: '10px', display: 'inline-block' }}
            >
              Show More
            </Link>
          </div>

          {/* Account Settings */}
          <div className="profile-section settings">
            <h3>Account Settings</h3>
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <label>Current Password:
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
              </label>
              <label>New Password:
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
              </label>
              <label>Confirm New Password:
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </label>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
