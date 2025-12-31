const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "7d" }
  );
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    // Validate phone
    if (!phone || phone.length < 10 || phone.length > 15) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Validate password
    if (!password || password.length < 4) {
      return res.status(400).json({
        error: "Password must be at least 4 characters long",
      });
    }

    // Check duplicate phone
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        error: "Phone number already registered",
      });
    }

    // Auto-generate name if not provided
    const userName = name || `User_${phone.slice(-4)}`;

    // Create user
    const user = await User.create({
      phone,
      password,
      name: userName,
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password before sending
    user.password = undefined;

    res.status(201).json({
      message: "Registration successful",
      user,
      token,
    });

  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({ user, token });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("GetMe Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
