const express = require('express');
const router = express.Router();

//agregue esto
const authentication = require('../middlewares/auth');
const userCtrl = require('../controller/chatbotController');

//aca tambien
router.get('/', authentication.isAuth, userCtrl.getChatbot);

module.exports = router;