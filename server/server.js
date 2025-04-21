// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// Setup Express and HTTP Server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------
// DATABASE SETUP WITH SEQUELIZE
// --------------------------
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql'
});

// Define models
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING }
});

const Project = sequelize.define('Project', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT
});

const Snippet = sequelize.define('Snippet', {
  content: DataTypes.TEXT,
  language: DataTypes.STRING
});

// Relationships
User.hasMany(Project);
Project.belongsTo(User);

Project.hasMany(Snippet);
Snippet.belongsTo(Project);

// --------------------------
// ROUTES
// --------------------------

// Auth: Register
app.post('/api/auth/register',
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashedPassword });
      res.status(201).json({ message: 'User registered', userId: user.id });
    } catch (err) {
      res.status(500).json({ error: 'User registration failed' });
    }
  }
);

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'devspace_secret');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to protect routes
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devspace_secret');
    req.user = await User.findByPk(decoded.id);
    next();
  } catch {
    res.sendStatus(403);
  }
};

// Get all projects for logged-in user
app.get('/api/projects', authenticate, async (req, res) => {
  const projects = await Project.findAll({ where: { UserId: req.user.id } });
  res.json(projects);
});

// Create new project
app.post('/api/projects', authenticate, async (req, res) => {
  const { title, description } = req.body;
  const project = await Project.create({ title, description, UserId: req.user.id });
  res.status(201).json(project);
});

// Get snippets for a project
app.get('/api/projects/:id/snippets', authenticate, async (req, res) => {
  const snippets = await Snippet.findAll({ where: { ProjectId: req.params.id } });
  res.json(snippets);
});

// Create snippet in a project
app.post('/api/projects/:id/snippets', authenticate, async (req, res) => {
  const { content, language } = req.body;
  const snippet = await Snippet.create({ content, language, ProjectId: req.params.id });
  res.status(201).json(snippet);
});

// Get current user profile
app.get('/api/users/me', authenticate, async (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, email: req.user.email });
});

// --------------------------
// WEBSOCKETS
// --------------------------
io.on('connection', socket => {
  console.log('A user connected:', socket.id);

  // Join a project room
  socket.on('joinRoom', roomId => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Receive code update and broadcast to others
  socket.on('codeUpdate', ({ roomId, content }) => {
    socket.to(roomId).emit('receiveCode', content);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --------------------------
// START SERVER AND CONNECT DB
// --------------------------
sequelize.sync()
  .then(() => {
    console.log('Database connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
  });