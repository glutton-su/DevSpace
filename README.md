# DevSpace - Collaborative Code Sharing Platform

A modern, full-stack web application for collaborative code sharing, project management, and real-time collaboration.

## 🚀 Features

- **User Authentication & Authorization** - Secure JWT-based authentication with role-based access control
- **Code Snippet Management** - Create, share, and organize code snippets with syntax highlighting
- **Project Collaboration** - Real-time collaborative editing with WebSocket support
- **File Management** - Upload and manage project assets and code files
- **User Profiles** - Customizable user profiles with statistics and activity tracking
- **Moderation System** - Admin/moderator tools for content management
- **Real-time Notifications** - Instant notifications for collaboration events
- **Responsive Design** - Modern UI with dark/light theme support

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with Sequelize ORM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Multer** for file uploads
- **Helmet** for security headers
- **Rate limiting** and input validation

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Monaco Editor** for code editing
- **Socket.IO Client** for real-time features

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn
- Docker (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DevSpace
```

### 2. Environment Setup

#### Backend Environment
```bash
cd server
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DB_NAME=devspace_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### Frontend Environment
```bash
cd client
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

### 3. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE devspace_db;
CREATE USER 'devspace_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON devspace_db.* TO 'devspace_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Run the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

#### Production Mode
```bash
# Backend
cd server
npm run prod

# Frontend
cd client
npm run build
npm run preview
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Copy environment file
cp server/env.example .env

# Edit .env with your production values
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Individual Containers
```bash
# Build and run backend
cd server
docker build -t devspace-server .
docker run -p 5000:5000 --env-file .env devspace-server

# Build and run frontend
cd client
docker build -t devspace-client .
docker run -p 3000:3000 devspace-client
```

## 📁 Project Structure

```
DevSpace/
├── server/                 # Backend API
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── uploads/          # File uploads
│   └── server.js         # Main server file
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API services
│   └── public/           # Static assets
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Code Snippets
- `GET /api/code` - Get all snippets
- `POST /api/code` - Create new snippet
- `GET /api/code/:id` - Get snippet details
- `PUT /api/code/:id` - Update snippet
- `DELETE /api/code/:id` - Delete snippet

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search` - Search users

### Files
- `POST /api/files/avatar` - Upload avatar
- `POST /api/files/code` - Upload code files
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** with bcrypt
- **Rate Limiting** on sensitive endpoints
- **Input Validation** and sanitization
- **CORS Protection** with configurable origins
- **Security Headers** with Helmet
- **XSS Protection** with input sanitization
- **SQL Injection Protection** with Sequelize

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

- **Winston** for structured logging
- **Health check** endpoints
- **Error tracking** with error boundaries
- **Performance monitoring** ready for integration

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Strong JWT secrets
- Database credentials
- CORS origins
- File upload limits
- Rate limiting settings

### Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Rate limiting configured
- [ ] Error logging enabled

### Performance Optimization
- [ ] Database indexing
- [ ] CDN for static assets
- [ ] Image optimization
- [ ] Code splitting
- [ ] Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@devspace.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release
- User authentication and authorization
- Code snippet management
- Project collaboration
- Real-time features
- File management
- Moderation system 