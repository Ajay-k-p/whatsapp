import axios from 'axios';

const API_URL = 'http://localhost:5000/api/media/upload'; 
// If deployed: replace localhost with your server URL

export const uploadMedia = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // MUST be 'file'

    const response = await axios.post(
      API_URL,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Let browser set boundary
        },
      }
    );

    // Your backend returns:  { success: true, url: "..." }
    return response.data.url;

  } catch (error) {
    console.error("Media Upload Error:", error);
    throw error.response?.data || { error: "Upload failed" };
  }
};
