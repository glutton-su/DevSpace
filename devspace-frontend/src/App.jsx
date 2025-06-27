import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
// import Layout from './components/layout/Layout'
import ProtectedRoute from './pages/auth/ProtectedRoute'

// Pages
// import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Project from './pages/Project'
import Profile from './pages/Profile'
import CreateProject from './pages/CreateProject'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/project/new" element={
                <ProtectedRoute>
                  <Layout><CreateProject /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/project/:id" element={
                <Layout><Project /></Layout>
              } />
              <Route path="/profile/:username?" element={
                <Layout><Profile /></Layout>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App