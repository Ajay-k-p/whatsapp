const Status = require('../models/Status');

exports.createStatus = async (req, res) => {
  try {
    const { content, media, type } = req.body;
    const status = new Status({ user: req.user.id, content, media, type });
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({ user: { $in: req.user.contacts } }).populate('user');
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};