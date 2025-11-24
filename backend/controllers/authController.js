const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: "7d",
  });
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    // Validate
    if (!phone || phone.length < 10 || phone.length > 15) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Check duplicate phone
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    // Create user
    const user = new User({ phone, password, name });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password before sending
    user.password = undefined;  // Fixed: Was incomplete in your code

    res.status(201).json({
      message: "Registration successful",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user & include password for comparison
    const user = await User.findOne({ phone }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid phone or password" });

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid phone or password" });

    // Generate token
    const token = generateToken(user._id);

    // Remove password before sending
    user.password = undefined;

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET LOGGED-IN USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};