import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import api from "../api/axios_frontend";
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

  const [formData, setFormData] = useState({
    updatedName: '',
    updatedEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: null
  });

  const [previewImage, setPreviewImage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = JSON.parse(localStorage.getItem('userData'))?.userId;
  const backendUrl = process.env.REACT_APP_NODE_API_URL || 'http://localhost:3500';

  const formatUrl = useCallback((path) => {
    if (!path) return '/images/default-pfp.png';
    if (path.startsWith('http')) return path;
    
    // Remove any leading slashes from path
    const cleanPath = path.replace(/^\/+/, '');
    
    // Remove any trailing slashes from backendUrl
    const cleanBackendUrl = backendUrl.replace(/\/+$/, '');
    
    return `${cleanBackendUrl}/${cleanPath}`;
  }, [backendUrl]);
  

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/users/${userId}`);
      const { name, email, created_at, profile_picture } = response.data;

      setUserData({
        name,
        email,
        created_at: new Date(created_at).toLocaleDateString(),
        profile_picture: formatUrl(profile_picture)
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
  }, [userId, logout, navigate, formatUrl]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!auth?.token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchUserDetails();
      } catch (error) {
        console.error('Error initializing profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auth?.token, isInitialized, fetchUserDetails, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/api/users/${userId}`, {
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
      await api.put(`/api/users/${userId}/password`, {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    if (!formData.profilePicture) return;
  
    const pictureForm = new FormData();
    pictureForm.append('profile_picture', formData.profilePicture);
  
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
  
      const response = await api.put(
        `/api/users/${userId}/picture`,
        pictureForm,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      let newProfilePic = response.data.profile_picture;
  
      // Safely join backend URL and profile picture path
      const formattedPicUrl = `${backendUrl.replace(/\/$/, '')}/${newProfilePic.replace(/^\/+/, '')}`;
  
      // ✨ Save to localStorage
      localStorage.setItem('profile_pic_url', formattedPicUrl);
  
      // ✨ Immediately trigger a 'storage' event so Home page NavBar listens
      window.dispatchEvent(new Event('storage'));
  
      // Update user data state
      setUserData(prev => ({
        ...prev,
        profile_picture: formattedPicUrl
      }));
  
      setPreviewImage('');
      setFormData(prev => ({ ...prev, profilePicture: null }));
      setSuccess('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError(error.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  if (!isInitialized) return <div className="loading-container">Loading authentication...</div>;
  if (!auth) return <div className="loading-container">Please log in to view your profile</div>;

  return (
    <div className="profile-container">
      <header className="header small-header">
        <Link to="/" className="logo small-logo">
          <span className="logo-text">Symptom Diagnosing Tool</span>
          <span className="logo-plus">+</span>
        </Link>
        {auth?.token && (
          <button onClick={logout} className="logout-button small-logout">
            Log Out
          </button>
        )}
      </header>

      <div className="profile-content">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="profile-sections custom-layout">
          {/* Left Section */}
          <div className="left-section">
            <h2>User Details</h2>
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
                  <button 
                    type="submit" 
                    className={`save-button ${isLoading ? 'button-loading' : ''}`} 
                    disabled={isLoading}
                  >
                    {!isLoading ? 'Save' : 'Saving...'}
                  </button>
                )}
              </form>
            </div>

            <div className="user-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{userData.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{userData.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since:</span>
                <span className="info-value">{userData.created_at}</span>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`edit-button ${isLoading ? 'button-loading' : ''}`}
                disabled={isLoading}
              >
                {!isLoading && (isEditing ? 'Cancel Edit' : 'Edit Profile')}
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
                  <button 
                    type="submit" 
                    className={`save-button ${isLoading ? 'button-loading' : ''}`} 
                    disabled={isLoading}
                  >
                    {!isLoading && 'Save Changes'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="right-section">
            <div className="right-top">
              <UserHistory previewMode={true} />
              <Link 
                to="/history" 
                className="show-more-link"
                style={{ color: 'black', padding: '6px', fontSize: '0.9rem', display: 'inline-block' }}
              >
                Show More
              </Link>
            </div>

            <div className="right-bottom">
              <h2>Account Settings</h2>
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
                <button 
                  type="submit" 
                  className={`save-button ${isLoading ? 'button-loading' : ''}`}
                  disabled={isLoading}
                >
                  {!isLoading && 'Change Password'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
