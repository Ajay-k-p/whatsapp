import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { uploadMedia } from "../services/mediaService";

const MediaUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { token } = useContext(AuthContext);

  const handleChoose = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
  };

  const handleSend = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadMedia(file, token);
      onUpload(url, file.type);
      setFile(null); // reset after sending
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
    setUploading(false);
  };

  const cancel = () => setFile(null);

  return (
    <div className="wa-media-wrapper">
      {/* FILE INPUT */}
      <input
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={handleChoose}
        className="wa-file-input"
      />

      {/* SHOW SELECTED FILE NAME + SEND BUTTON */}
      {file && (
        <div className="wa-media-preview">
          <span className="wa-media-name">{file.name}</span>

          <button
            className="wa-media-send-btn"
            onClick={handleSend}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Send"}
          </button>

          <button className="wa-media-cancel" onClick={cancel}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
