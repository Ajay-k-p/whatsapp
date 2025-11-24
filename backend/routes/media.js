const express = require('express');
const upload = require('../utils/multer');
const auth = require('../middleware/auth');
const { uploadMedia } = require('../controllers/mediaController');

const router = express.Router();

// Upload media → requires auth → multer → controller
router.post('/upload', auth, upload.single('file'), uploadMedia);

module.exports = router;
