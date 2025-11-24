// backend/config/cloudinary.js

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dlehzvsaw",
  api_key: "371436127597955",
  api_secret: "Ad_L0HOLp7rKxmYHpxiqYAwq6ZE",
  secure: true,
});

module.exports = cloudinary;
