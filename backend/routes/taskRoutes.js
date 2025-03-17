const express = require('express');
const TaskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, TaskController.getAll);
router.post('/', authMiddleware, TaskController.create);
router.put('/:id', authMiddleware, TaskController.updateStatus);

module.exports = router;