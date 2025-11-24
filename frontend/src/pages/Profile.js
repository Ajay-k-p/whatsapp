import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { uploadMedia } from "../services/mediaService"; 
import axios from "axios";
import "../styles/app.css";

const BACK_ARROW_ICON = "←"; 

const Profile = () => {
  const { user, token, setUser } = useAuth();
  
  // UI state for image uploading only
  const [uploading, setUploading] = useState(false);

  // Get data from user context
  const userName = user?.name || "User";
  const phoneNumber = user?.phone || "No number";
  // Use a fallback to ensure we don't crash if profilePic is missing
  const profilePic = user?.profilePic;

  // --- Profile Picture Upload Logic ---
  const uploadProfilePic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Cloudinary & Get URL
      const imageUrl = await uploadMedia(file, token); 

      // 2. Send URL to Backend (to save in DB)
      await axios.patch(
        "http://localhost:5000/api/user/profilePic", 
        { imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. 🔥 THE FIX: Force Update Local State Immediately
      // We use the 'imageUrl' variable directly because we know it's valid.
      // We use a callback (prev) to ensure we don't lose existing data.
      setUser((prev) => ({
        ...prev,          // Keep all existing user data (id, name, email, etc.)
        profilePic: imageUrl // Overwrite ONLY the image with the new URL
      }));

      alert("Profile picture updated!");

    } catch (err) {
      console.error("Profile Picture Upload Error:", err);
      alert("Failed to upload image.");
    }
    setUploading(false);
  };

  return (
    <div className="wa-profile-page-container">
      {/* Top Bar */}
      <div className="wa-profile-header">
        <span className="wa-back-arrow">{BACK_ARROW_ICON}</span>
        <h2 className="wa-profile-title">Profile</h2>
      </div>

      {/* Profile Picture Section */}
      <div className="wa-profile-pic-section">
        <div className="wa-profile-avatar-big">
          {profilePic ? (
            // Key attribute ensures React re-renders if URL changes
            <img 
              key={profilePic} 
              src={profilePic} 
              alt="Profile Avatar" 
              className="wa-avatar-img" 
            />
          ) : (
            <div className="wa-avatar-placeholder-big">{userName.charAt(0)}</div>
          )}
        </div>
        
        {/* Camera Icon / Edit Label */}
        <label className="wa-edit-btn">
          {uploading ? "Uploading..." : "📷 Change Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={uploadProfilePic}
            disabled={uploading}
            hidden
          />
        </label>
      </div>

      {/* Profile Details List */}
      <div className="wa-profile-list">
        
        {/* Name (Fixed) */}
        <div className="wa-profile-item">
          <span className="wa-profile-icon">👤</span>
          <div className="wa-profile-details">
            <span className="wa-profile-label">Name</span>
            <span className="wa-profile-value">{userName}</span>
          </div>
        </div>

        {/* Phone (Fixed) */}
        <div className="wa-profile-item">
          <span className="wa-profile-icon">📞</span>
          <div className="wa-profile-details">
            <span className="wa-profile-label">Phone</span>
            <span className="wa-profile-value wa-phone-fixed">{phoneNumber}</span>
          </div>
        </div>

        {/* Links */}
        <div className="wa-profile-item">
          <span className="wa-profile-icon">🔗</span>
          <div className="wa-profile-details">
            <span className="wa-profile-label">Links</span>
            <span className="wa-profile-link">Add links</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;