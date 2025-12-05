const User = require('../models/User');

const searchUsers = async (req, res) => {
  const keyword = req.query.search ? {
    $or: [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ],
  } : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.json(users);
};

const updateProfile = async (req, res) => {
  const { name, about, pic } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, about, pic }, { new: true });
  res.json(user);
};

module.exports = { searchUsers, updateProfile };