const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Z5x44i+SaV+D',
    database: 'kanban_architecture'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// Middleware para autenticação
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, 'your_jwt_secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

// Rotas de autenticação
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            if (bcrypt.compareSync(password, user.password)) {
                const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(400).send('Invalid Credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Rotas de tarefas
app.get('/api/tasks', authMiddleware, (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) throw err;
        const tasks = results.map(task => ({
            ...task,
            assignees: task.assignees && typeof task.assignees === 'string' && task.assignees.trim() !== '' ? JSON.parse(task.assignees) : [],
            labels: task.labels && typeof task.labels === 'string' && task.labels.trim() !== '' ? JSON.parse(task.labels) : [],
        }));
        res.json(tasks);
    });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
    const { title, description, deadline, labels, status, creator_id, assignees } = req.body;

    // Garante que assignees e labels sejam arrays
    const taskAssignees = Array.isArray(assignees) ? assignees : [];
    const taskLabels = Array.isArray(labels) ? labels : [];

    db.query(
        'INSERT INTO tasks (title, description, deadline, labels, status, creator_id, assignees) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description, deadline, JSON.stringify(taskLabels), status, creator_id, JSON.stringify(taskAssignees)],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Failed to create task' });
            }

            // Retorna todos os campos da tarefa criada
            const newTask = {
                id: results.insertId,
                title,
                description,
                deadline,
                labels: taskLabels,
                status,
                creator_id,
                assignees: taskAssignees,
            };
            res.json(newTask);
        }
    );
});

// Rotas de tarefas
app.put('/api/tasks/:id', authMiddleware, (req, res) => {
    const { status } = req.body;
    const taskId = req.params.id;

    // Lista de status válidos
    const validStatuses = ['todo', 'in_progress', 'doing', 'done', 'closed', 'canceled'];

    // Verifica se o status é válido
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status inválido' });
    }

    db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Erro ao atualizar o status da tarefa' });
        }
        res.json({ message: 'Status da tarefa atualizado com sucesso' });
    });
});

// Rota para listar usuários
app.get('/api/users', authMiddleware, (req, res) => {
    db.query('SELECT id, username FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Rota de cadastro
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    // Verifica se o usuário já existe
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Criptografa a senha
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Insere o novo usuário no banco de dados
        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, 'architect'], (err, results) => {
            if (err) throw err;
            res.json({ message: 'User registered successfully' });
        });
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});