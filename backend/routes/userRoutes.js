const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, UserController.getAll);
router.post('/signup', UserController.signup);

module.exports = router;