const User = require("../models/User");

// --- Function to update Name and About ---
exports.updateProfileDetails = async (req, res) => {
  try {
    // ✅ FIX: Changed from _id to id to match your auth middleware
    const userId = req.user.id; 
    const { name, about } = req.body;

    // Build an object containing only the fields provided by the frontend
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (about !== undefined) updates.about = about;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update fields provided (name or about)." });
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates }, 
      { new: true, runValidators: true }
    ).select('-password'); 

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(updatedUser);

  } catch (err) {
    console.error("Profile detail update error:", err);
    res.status(500).json({ error: "Failed to update profile details" });
  }
};

// --- Function to update Profile Picture ---
exports.updateProfilePic = async (req, res) => {
  try {
    // ✅ FIX: Changed from _id to id to match your auth middleware
    const userId = req.user.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic: imageUrl } }, 
      { new: true }
    );

    res.json(updatedUser);

  } catch (err) {
    console.error("Profile picture update error:", err);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
};