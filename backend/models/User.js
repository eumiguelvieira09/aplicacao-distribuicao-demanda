const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static findByUsername(username, callback) {
        console.log('Executando query para username:', username); // Log para depuração
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) {
                console.error('Erro na query:', err); // Log para depuração
                return callback(err);
            }
            console.log('Resultados da query:', results); // Log para depuração
            callback(null, results);
        });
    }

    static create(user, callback) {
        const { username, password, role } = user;
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], callback);
    }

    static getAll(callback) {
        db.query('SELECT id, username FROM users', callback);
    }

    static findByIds(ids, callback) {
        if (!ids || ids.length === 0) {
            return callback(null, []);
        }

        const placeholders = ids.map(() => '?').join(',');
        const query = `SELECT id, username FROM users WHERE id IN (${placeholders})`;
        
        db.query(query, ids, (err, results) => {
            if (err) {
                console.error('Erro ao buscar usuários por IDs:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }
}

module.exports = User;