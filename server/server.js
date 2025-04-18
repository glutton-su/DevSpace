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
