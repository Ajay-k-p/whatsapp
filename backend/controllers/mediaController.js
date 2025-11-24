const cloudinary = require("../utils/cloudinary"); // FIXED PATH
const streamifier = require("streamifier");

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let options = {
      folder: "whatsapp_clone/messages",
      resource_type: "auto",
    };

    if (req.file.mimetype.startsWith("audio/")) {
      options.resource_type = "video"; // Required for audio/webm
    }

    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const uploadedUrl = await uploadStream();

    res.json({
      success: true,
      url: uploadedUrl,
    });

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
};
