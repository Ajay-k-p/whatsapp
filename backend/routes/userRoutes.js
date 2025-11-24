const express = require("express");
const router = express.Router();

// Update controller imports to include the new function
const auth = require("../middleware/auth");
const { updateProfilePic, updateProfileDetails } = require("../controllers/userController");
const User = require("../models/User");

// --- GET logged-in user profile ---
router.get("/me", auth, async (req, res) => {
 try {
  const user = await User.findById(req.user.id);
  res.json(user);
 } catch (err) {
  res.status(500).json({ error: "Cannot load profile" });
 }
});

// --- PATCH Update Profile Details (Name, About) ---
// This resolves the "Cannot PATCH /api/user/profile" 404 error.
router.patch("/profile", auth, updateProfileDetails); // <--- NEW ROUTE ADDED

// --- PATCH Update Profile Picture ---
router.patch("/profilePic", auth, updateProfilePic);

module.exports = router;