import axios from 'axios';

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', '<your-cloudinary-upload-preset>');
  try {
    const response = await axios.post('https://api.cloudinary.com/v1_1/<your-cloudinary-cloud-name>/upload', formData);
    return response.data.secure_url;
  } catch (err) {
    throw new Error('Cloudinary upload failed: ' + err.message);
  }
};

export default uploadToCloudinary;