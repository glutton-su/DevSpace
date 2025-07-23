import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import Collaborate from './pages/Collaborate';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import SnippetDetail from './pages/SnippetDetail';
import CreateProject from './components/features/CreateProject';
import ProjectDetail from './components/features/ProjectDetail';
import CollaborationRoom from './components/features/CollaborationRoom';
import ModerationPanel from './components/features/ModerationPanel';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Moderation Route Component (only for moderators/admins)
const ModerationRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'moderator' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/projects/new" element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          } />
          <Route path="/project/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="/snippet/:id" element={
            <ProtectedRoute>
              <SnippetDetail />
            </ProtectedRoute>
          } />
          <Route path="/collaborate" element={
            <ProtectedRoute>
              <Collaborate />
            </ProtectedRoute>
          } />
          <Route path="/collaborate/:roomId" element={
            <ProtectedRoute>
              <CollaborationRoom />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Moderation Routes */}
          <Route path="/moderation" element={
            <ModerationRoute>
              <ModerationPanel />
            </ModerationRoute>
          } />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgb(30 41 59)', // dark-800
            color: 'rgb(248 250 252)', // dark-50
            border: '1px solid rgb(71 85 105)', // dark-600
          },
          success: {
            iconTheme: {
              primary: 'rgb(34 197 94)', // green-500
              secondary: 'rgb(248 250 252)',
            },
          },
          error: {
            iconTheme: {
              primary: 'rgb(239 68 68)', // red-500
              secondary: 'rgb(248 250 252)',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;