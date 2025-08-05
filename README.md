# DevSpace - Collaborative Code Snippet Platform

![DevSpace Logo](client/public/DevSpace%20Collaborative%20code%20sharing.png)

A modern, collaborative platform for developers to create, share, and collaborate on code snippets within organized projects. Built with React, Node.js, and MySQL.

## 🚀 Features

### 📁 Project Management
- **Organized Projects**: Group related code snippets into projects for better organization
- **Public/Private Projects**: Control visibility of your projects and snippets
- **Project Collaboration**: Invite team members to collaborate on projects
- **Rich Project Descriptions**: Add detailed descriptions and tags to projects

### 💻 Code Snippet Management
- **Syntax Highlighting**: Support for 50+ programming languages
- **Code Editor**: Built-in Monaco editor with auto-completion and formatting
- **File Organization**: Organize snippets with file paths and custom tags
- **Version Control**: Track changes and updates to your code snippets
- **Export/Import**: Download snippets as files for local development

### 👥 Collaboration System
- **Project-Level Collaboration**: Add collaborators to entire projects
- **Role-Based Permissions**: Owner, Admin, Editor, and Viewer roles
- **Strict Permission Enforcement**: Only project owners and explicit collaborators can edit snippets
- **Collaboration Management**: Easy adding/removing of team members
- **Secure Access Control**: Edit buttons and pages only visible to authorized users
- **Protected Backend**: Server-side validation prevents unauthorized edits

### 🌟 Social Features
- **Star System**: Star your favorite snippets
- **Fork Functionality**: Create your own copies of public snippets
- **Public Discovery**: Browse community-shared code snippets
- **User Profiles**: Showcase your projects and contributions

## 🔐 Authentication & Security
- **Secure Registration/Login**: JWT-based authentication
- **Profile Management**: Update personal information, email, and password
- **Account Security**: Strong password requirements and secure sessions
- **Privacy Controls**: Manage visibility of your profile and projects
- **Strict Permission Enforcement**: 
  - Only project owners and explicit collaborators can edit snippets
  - Edit UI elements only shown to authorized users
  - Server-side validation prevents unauthorized access
  - Immediate permission revocation when collaborators are removed

### 🎨 User Experience
- **Dark/Light Themes**: Beautiful responsive design with theme switching
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Search & Filter**: Powerful search across snippets and projects
- **Tag Organization**: Categorize content with custom tags
- **Comprehensive Documentation**: Built-in docs page with usage guides

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code-like code editor
- **Prism.js** - Syntax highlighting
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize ORM** - Database management
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Multer** - File upload handling

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands
- **Nodemon** - Development server auto-restart

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/devspace.git
cd devspace
```

### 2. Install Dependencies

#### Install All Dependencies (Recommended)
```bash
npm run install:all
```

#### Or Install Manually

**Backend Dependencies**
```bash
cd server
npm install
```

**Frontend Dependencies**
```bash
cd ../client
npm install
```

**Root Dependencies (for development scripts)**
```bash
cd ..
npm install
```

### 3. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE devspace_db;
CREATE USER 'devspace_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON devspace_db.* TO 'devspace_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Configure Environment Variables
Create `.env` file in the `server` directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=devspace_db
DB_USER=devspace_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

Create `.env` file in the `client` directory:
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### 4. Initialize Database
The database tables will be created automatically when you start the server for the first time.

### 5. Start the Application

#### Development Mode (Recommended)
From the root directory, run both frontend and backend:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

#### Manual Development Mode
If you prefer to run services separately:
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
# Build frontend
npm run build

# Start backend
npm start
```

## 📖 Usage Guide

### Getting Started

1. **Register an Account**
   - Navigate to `/register`
   - Fill in your details (username, email, password, full name)
   - Login with your credentials

2. **Create Your First Project**
   - Go to the Projects page
   - Click "Create New Project"
   - Add a name, description, and choose visibility
   - Save your project

3. **Add Code Snippets**
   - Open your project
   - Click "Add Snippet"
   - Enter title, select language, and paste your code
   - Configure visibility and collaboration settings
   - Save the snippet

### Collaboration Workflow

1. **Create a Project**
   - Go to the Projects page
   - Click "Create New Project"
   - Add collaborators during creation or after

2. **Add Collaborators to Projects**
   - Open your project settings
   - Click "Manage Collaborators"
   - Search for users and add them with appropriate roles (Editor, Admin)
   - Only project collaborators can edit snippets within the project

3. **Manage Team Members**
   - View all collaborators in project settings
   - Remove collaborators when needed (they lose edit access immediately)
   - Transfer project ownership if required
   - Edit permissions are strictly enforced - only owners and explicit collaborators see edit options

4. **Snippet Permissions**
   - Edit buttons only appear for project owners and collaborators
   - Edit page access is restricted to authorized users
   - Backend validates permissions on all edit/delete operations
   - Removed collaborators cannot edit snippets even if they have direct links

### Project Organization

- **Tags**: Use tags to categorize snippets (`#javascript`, `#tutorial`, `#api`)
- **File Paths**: Organize snippets with logical file paths (`src/components/Button.jsx`)
- **Descriptions**: Add detailed descriptions for context
- **Visibility**: Choose between public (discoverable) and private projects

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
GET  /api/auth/refresh     - Refresh JWT token
```

### Project Endpoints
```
GET    /api/projects               - Get user's projects
POST   /api/projects               - Create new project
GET    /api/projects/:id           - Get project by ID
PUT    /api/projects/:id           - Update project
DELETE /api/projects/:id           - Delete project
POST   /api/projects/:id/collaborators    - Add collaborator
DELETE /api/projects/:id/collaborators    - Remove collaborator
```

### Code Snippet Endpoints
```
GET    /api/code                   - Get snippets
POST   /api/code                   - Create snippet
GET    /api/code/:id               - Get snippet by ID
PUT    /api/code/:id               - Update snippet
DELETE /api/code/:id               - Delete snippet
POST   /api/code/:id/star          - Star/unstar snippet
POST   /api/code/:id/fork          - Fork snippet
POST   /api/code/:id/collaborators - Add snippet collaborator
```

### User Management Endpoints
```
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update profile
PUT    /api/users/email            - Update email
PUT    /api/users/password         - Update password
GET    /api/users/search           - Search users
```

## 🚀 Deployment

### Using Docker (Recommended)

1. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: devspace_db
      MYSQL_USER: devspace_user
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      DB_HOST: mysql
      DB_USER: devspace_user
      DB_PASSWORD: password
      DB_NAME: devspace_db
    depends_on:
      - mysql

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

2. **Deploy**:
```bash
docker-compose up -d
```

### Manual Deployment

1. **Prepare Production Environment**
   - Set up MySQL database
   - Configure environment variables
   - Install Node.js and PM2

2. **Build and Deploy**
```bash
# Build frontend
cd client
npm run build

# Start backend with PM2
cd ../server
pm2 start server.js --name "devspace-api"

# Serve frontend with nginx or serve
npm install -g serve
serve -s ../client/dist -l 3000
```

## 🧪 Testing

### Run Tests
```bash
# All tests from root
npm test

# Backend tests only
cd server
npm test

# Frontend tests (if available)
cd client
npm test
```

### Test Coverage
```bash
# Generate coverage report
cd server
npm run test:coverage
```

### Manual Testing Scripts
The project includes various test scripts for manual testing:
```bash
# Test collaboration functionality
node test-collaboration-security.js

# Test API endpoints
node test-api-endpoints.js

# Test user authentication
node test-login-debug.js
```

## 🛠️ Development

### Available Scripts

From the root directory:
```bash
npm run dev          # Start both frontend and backend in development mode
npm run start        # Start backend in production mode
npm run build        # Build frontend for production
npm run install:all  # Install dependencies for both frontend and backend
npm test            # Run backend tests
npm run lint        # Lint frontend code
npm run clean       # Clean all node_modules and build files
```

### Project Structure
```
devspace/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── package.json
└── README.md
```

### Adding New Features

1. **Backend**: Add routes in `server/routes/`, controllers in `server/controllers/`, and models in `server/models/`
2. **Frontend**: Create components in `client/src/components/` and pages in `client/src/pages/`
3. **API Integration**: Update API services in `client/src/services/api.js`
4. **Testing**: Add tests for new functionality

### Code Style Guidelines

- Use **ESLint** and **Prettier** for consistent formatting
- Follow **React Hooks** patterns for state management
- Use **async/await** for asynchronous operations
- Write **descriptive commit messages**
- Document complex functions with JSDoc comments

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Test Thoroughly**
5. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Write clear, descriptive commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing React library
- **Express.js** for the robust backend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Monaco Editor** for the powerful code editor
- **Sequelize** for the excellent ORM
- **All Contributors** who have helped improve this project

## 📞 Support

If you have any questions or need help:

- **Documentation**: Check the built-in `/docs` page
- **Issues**: Create an issue on GitHub
- **Discussions**: Join our community discussions
- **Email**: contact@devspace.dev (if applicable)

## 🗺️ Roadmap

### Short Term
- [x] **Strict collaboration permissions** - Only project collaborators can edit snippets
- [x] **Secure permission enforcement** - Frontend and backend validation
- [ ] Real-time collaborative editing
- [ ] Advanced search with filters
- [ ] Code snippet templates
- [ ] Browser extension
- [ ] Mobile app

### Long Term
- [ ] AI-powered code suggestions
- [ ] Integrated development environment
- [ ] Video tutorials integration
- [ ] Team workspace features
- [ ] Advanced analytics dashboard

---

**Happy Coding! 🚀**

Made with ❤️ by the DevSpace Team
