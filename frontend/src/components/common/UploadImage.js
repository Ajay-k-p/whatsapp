import React, { useState } from 'react';
import axios from 'axios';

const UploadImage = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'whatsapp-preset'); // Replace with your Cloudinary upload preset name (create one in your dashboard)
    try {
      const { data } = await axios.post('https://api.cloudinary.com/v1_1/dlehzvsaw/image/upload', formData); // Updated with your CLOUDINARY_CLOUD_NAME
      onUpload(data.secure_url);
    } catch (error) {
      console.error('Upload failed');
    }
    setUploading(false);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default UploadImage;