const express = require('express');
const { createStatus, getStatuses } = require('../controllers/statusController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createStatus);
router.get('/', auth, getStatuses);

module.exports = router;