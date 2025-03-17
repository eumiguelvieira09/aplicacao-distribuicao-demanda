const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
    static login(username, password, callback) {
        User.findByUsername(username, (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null, 'User not found');

            const user = results[0];
            if (bcrypt.compareSync(password, user.password)) {
                const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
                callback(null, token);
            } else {
                callback(null, null, 'Invalid Credentials');
            }
        });
    }
}

module.exports = AuthService;
