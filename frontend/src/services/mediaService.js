import axios from "axios";

// Base backend URL from .env
const API = process.env.REACT_APP_API_URL;

export const uploadMedia = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("file", file);  // MUST be 'file'

    const response = await axios.post(
      `${API}/api/media/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Backend returns: { success: true, url: "uploaded-url" }
    return response.data.url;

  } catch (error) {
    console.error("Media Upload Error:", error);
    throw error.response?.data || { error: "Upload failed" };
  }
};
