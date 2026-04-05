const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { db, User, Task } = require('./database/setup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());


function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Access denied. No token provided.' 
        });
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please log in again.' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token. Please log in again.' 
            });
        } else {
            return res.status(401).json({ 
                error: 'Token verification failed.' 
            });
        }
    }
}


async function testConnection() {
    try {
        await db.authenticate();
        console.log('Database connected.');
    } catch (error) {
        console.error('DB connection error:', error);
    }
}
testConnection();


app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Task API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Task Management API',
        endpoints: {
            register: 'POST /api/register',
            login: 'POST /api/login',
            tasks: 'GET /api/tasks'
        }
    });
});


app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User created', user });

    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});


app.get('/api/tasks', requireAuth, async (req, res) => {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    res.json(tasks);
});


app.post('/api/tasks', requireAuth, async (req, res) => {
    const { title, description } = req.body;

    const task = await Task.create({
        title,
        description,
        userId: req.user.id
    });

    res.status(201).json(task);
});

app.put('/api/tasks/:id', requireAuth, async (req, res) => {
    const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) return res.status(404).json({ error: 'Not found' });

    await task.update(req.body);
    res.json(task);
});

app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
    const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) return res.status(404).json({ error: 'Not found' });

    await task.destroy();
    res.json({ message: 'Deleted' });
});

app.get('/api/info', (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        status: "Running in production"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});