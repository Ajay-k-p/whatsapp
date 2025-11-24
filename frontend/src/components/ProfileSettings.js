import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import uploadToCloudinary from '../utils/cloudinaryUpload';
import axios from "axios";

const ProfileSettings = () => {
  const { user, token, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [loading, setLoading] = useState(false);

  // Upload Profile Picture
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      // Upload to Cloudinary
      const url = await uploadToCloudinary(file);

      // Temp preview
      setProfilePic(url);

      // Update backend
      const res = await axios.patch(
        "http://localhost:5000/api/user/profilePic",
        { imageUrl: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // update global user context
      setUser(res.data);

    } catch (err) {
      console.error(err);
      alert("Profile picture upload failed");
    }

    setLoading(false);
  };

  // Save Name + Profile Pic (optional extra)
  const saveChanges = async () => {
    try {
      const res = await axios.patch(
        "http://localhost:5000/api/user/profilePic",
        {
          imageUrl: profilePic
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data);
      alert("Profile updated!");

    } catch (err) {
      alert("Saving failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Profile Settings</h2>

      {/* NAME UPDATE */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        style={{ display: "block", marginBottom: 12, padding: 8 }}
      />

      {/* PROFILE IMAGE */}
      <input type="file" onChange={handleUpload} />

      {/* PREVIEW */}
      {profilePic && (
        <img
          src={profilePic}
          alt="Profile"
          style={{ width: "100px", borderRadius: "50%", marginTop: 10 }}
        />
      )}

      {loading && <p>Uploading...</p>}

      {/* SAVE BUTTON */}
      <button onClick={saveChanges} style={{ marginTop: 20 }}>
        Save
      </button>
    </div>
  );
};

export default ProfileSettings;
