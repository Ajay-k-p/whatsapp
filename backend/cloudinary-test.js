const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dlehzvsaw",
  api_key: "371436127597955",
  api_secret: "Ad_L0HOLp7rKxmYHpxiqYAwq6ZE",
});

cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "whatsapp_clone/test" },
  (error, result) => {
    if (error) {
      console.log("\n❌ CLOUDINARY TEST FAILED ❌");
      console.log(error);
    } else {
      console.log("\n✅ CLOUDINARY TEST SUCCESSFUL!");
      console.log("URL:", result.secure_url);
    }
  }
);
