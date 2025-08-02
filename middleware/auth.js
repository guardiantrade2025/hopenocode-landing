const jwt = require('jsonwebtoken');

// In-memory user storage (replace with database in production)
const users = [];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Register new user
const registerUser = (userData) => {
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const user = {
        id: 'user_' + Date.now(),
        email: userData.email,
        password: userData.password, // In production, hash this
        name: userData.name,
        role: 'user',
        created: new Date().toISOString(),
        subscriptions: [],
        orders: []
    };

    users.push(user);
    return user;
};

// Login user
const loginUser = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        throw new Error('Invalid credentials');
    }
    return user;
};

module.exports = {
    authenticateToken,
    generateToken,
    registerUser,
    loginUser,
    users
}; 