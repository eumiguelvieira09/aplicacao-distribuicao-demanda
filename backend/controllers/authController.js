const AuthService = require('../services/authService');

class AuthController {
    static login(req, res) {
        console.log('Login attempt:', req.body);
        const { username, password } = req.body;
    
        // Validação básica
        if (!username || !password) {
            console.log('Missing credentials');
            return res.status(400).json({ message: 'Username and password are required' });
        }
    
        AuthService.login(username, password, (err, token, message) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ message: 'Something went wrong!' });
            }
            if (!token) {
                console.log('Authentication failed:', message);
                return res.status(400).json({ message: message || 'Invalid Credentials' });
            }
            console.log('Login successful for user:', username);
            res.json({ token });
        });
    }
}

module.exports = AuthController;