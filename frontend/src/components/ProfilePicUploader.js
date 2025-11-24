import React, { useState } from "react";
import uploadToCloudinary from "../utils/uploadToCloudinary";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const ProfilePicUploader = () => {
  const { user, token, setUser } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const chooseFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadNow = async () => {
    if (!file) return;

    setLoading(true);

    try {
      // Upload to Cloudinary
      const cloudUrl = await uploadToCloudinary(file);

      // Update backend
      const res = await axios.patch(
        "http://localhost:5000/api/user/profilePic",
        { imageUrl: cloudUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend now returns the actual user directly
      setUser(res.data);

      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Profile picture updated!");
    }

    setLoading(false);
  };

  return (
    <div>
      <h3>Update Profile Picture</h3>

      <input type="file" onChange={chooseFile} />

      {preview && (
        <>
          <img
            src={preview}
            width={120}
            height={120}
            style={{ borderRadius: "50%" }}
          />

          <button onClick={uploadNow} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </>
      )}
    </div>
  );
};

export default ProfilePicUploader;
