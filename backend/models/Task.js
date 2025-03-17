const db = require('../config/db');

class Task {
    static getAll(callback) {
        db.query('SELECT * FROM tasks', callback);
    }

    static create(task, callback) {
        const { title, description, deadline, labels, status, creator_id, assignees } = task;
        db.query(
            'INSERT INTO tasks (title, description, deadline, labels, status, creator_id, assignees) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, deadline, JSON.stringify(labels), status, creator_id, JSON.stringify(assignees)],
            callback
        );
    }

    static updateStatus(taskId, status, callback) {
        db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId], callback);
    }
}

module.exports = Task;