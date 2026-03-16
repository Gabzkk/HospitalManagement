const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/auth/login', authController.login);
router.post('/auth/mock-login', authController.mockLogin);
router.get('/auth/me', authenticateToken, authController.me);

module.exports = router;
