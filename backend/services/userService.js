const User = require('../models/User');

class UserService {
    static getAll(callback) {
        User.getAll(callback);
    }

    static create(user, callback) {
        // Primeiro verifica se o usuário já existe
        User.findByUsername(user.username, (err, results) => {
            if (err) return callback(err);
            
            if (results && results.length > 0) {
                return callback({ code: 'ER_DUP_ENTRY', message: 'Username already exists' });
            }

            // Se não existe, cria o novo usuário
            User.create(user, callback);
        });
    }
}

module.exports = UserService;