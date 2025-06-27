import React, { createContext, useContext, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const socket = useRef(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && !socket.current) {
      socket.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('accessToken')
        }
      })

      socket.current.on('connect', () => {
        console.log('Connected to server')
      })

      socket.current.on('disconnect', () => {
        console.log('Disconnected from server')
      })

      socket.current.on('error', (error) => {
        console.error('Socket error:', error)
      })
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect()
        socket.current = null
      }
    }
  }, [isAuthenticated])

  const joinProject = (projectId) => {
    if (socket.current) {
      socket.current.emit('join-project', projectId)
    }
  }

  const leaveProject = (projectId) => {
    if (socket.current) {
      socket.current.emit('leave-project', projectId)
    }
  }

  const sendCodeChange = (projectId, snippetId, content) => {
    if (socket.current) {
      socket.current.emit('code-change', {
        projectId,
        snippetId,
        content
      })
    }
  }

  const sendCursorPosition = (projectId, snippetId, position) => {
    if (socket.current) {
      socket.current.emit('cursor-move', {
        projectId,
        snippetId,
        position
      })
    }
  }

  const value = {
    socket: socket.current,
    joinProject,
    leaveProject,
    sendCodeChange,
    sendCursorPosition
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}