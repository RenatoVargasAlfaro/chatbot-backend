const express = require('express');
const router = express.Router();

const userCtrl = require('../controller/chatbotController');

router.post('/', userCtrl.getChatbot);

module.exports = router;