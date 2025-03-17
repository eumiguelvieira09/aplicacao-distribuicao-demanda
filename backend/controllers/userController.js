const UserService = require('../services/userService');

class UserController {
    static getAll(req, res) {
        UserService.getAll((err, users) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch users' });
            res.json(users);
        });
    }

    static signup(req, res) {
        console.log('Signup attempt:', req.body);
        const user = req.body;

        // Validação básica
        if (!user.username || !user.password) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Validação do role
        const validRoles = ['admin', 'architect', 'user', 'developer'];
        if (!validRoles.includes(user.role)) {
            user.role = 'user'; // Define 'user' como padrão se o role for inválido
        }

        UserService.create(user, (err, result) => {
            if (err) {
                console.error('Signup error:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Username already exists' });
                }
                return res.status(500).json({ 
                    message: 'Failed to register user',
                    error: err.message 
                });
            }
            console.log('User registered successfully:', result);
            res.json({ message: 'User registered successfully' });
        });
    }
}

module.exports = UserController;