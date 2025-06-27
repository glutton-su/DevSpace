import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import api from '../../services/api'
import { 
  Play, 
  Save, 
  Copy, 
  Download, 
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const CodeEditor = ({ snippet, projectId, canEdit, onSnippetUpdate }) => {
  const [code, setCode] = useState(snippet?.content || '')
  const [language, setLanguage] = useState(snippet?.language || 'javascript')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const [cursors, setCursors] = useState({})
  
  const textareaRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  
  const { socket, sendCodeChange, sendCursorPosition } = useSocket()

  useEffect(() => {
    if (snippet) {
      setCode(snippet.content || '')
      setLanguage(snippet.language || 'javascript')
    }
  }, [snippet])

  useEffect(() => {
    if (socket && snippet) {
      // Listen for real-time code changes
      socket.on('code-changed', (data) => {
        if (data.snippetId === snippet.id && data.userId !== socket.id) {
          setCode(data.content)
        }
      })

      // Listen for cursor movements
      socket.on('cursor-moved', (data) => {
        if (data.snippetId === snippet.id) {
          setCursors(prev => ({
            ...prev,
            [data.userId]: data.position
          }))
        }
      })

      // Listen for user join/leave
      socket.on('user-joined', (data) => {
        setCollaborators(prev => [...prev, data.user])
      })

      socket.on('user-left', (data) => {
        setCollaborators(prev => prev.filter(u => u.id !== data.userId))
        setCursors(prev => {
          const updated = { ...prev }
          delete updated[data.userId]
          return updated
        })
      })

      return () => {
        socket.off('code-changed')
        socket.off('cursor-moved')
        socket.off('user-joined')
        socket.off('user-left')
      }
    }
  }, [socket, snippet])

  const handleCodeChange = (e) => {
    const newCode = e.target.value
    setCode(newCode)

    // Send real-time update
    if (canEdit && socket) {
      sendCodeChange(projectId, snippet.id, newCode)
    }

    // Auto-save with debounce
    if (canEdit) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveCode(newCode)
      }, 2000)
    }
  }

  const handleCursorMove = (e) => {
    if (socket && canEdit) {
      const position = e.target.selectionStart
      sendCursorPosition(projectId, snippet.id, position)
    }
  }

  const saveCode = async (codeToSave = code) => {
    if (!canEdit) return

    try {
      setIsSaving(true)
      const response = await api.put(`/projects/${projectId}/snippets/${snippet.id}`, {
        content: codeToSave,
        language
      })
      onSnippetUpdate(response.data)
      toast.success('Saved successfully', { duration: 2000 })
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveCode()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Code copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${snippet.title}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getLanguageClass = (lang) => {
    const languageMap = {
      javascript: 'language-javascript',
      python: 'language-python',
      java: 'language-java',
      cpp: 'language-cpp',
      html: 'language-html',
      css: 'language-css',
      json: 'language-json',
      markdown: 'language-markdown'
    }
    return languageMap[lang] || 'language-text'
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {snippet?.title}
          </h3>
          
          {canEdit && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          )}

          {isSaving && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Saving...
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-400" />
              <div className="flex -space-x-1">
                {collaborators.slice(0, 3).map((user) => (
                  <img
                    key={user.id}
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.username}
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-800"
                    title={user.username}
                  />
                ))}
                {collaborators.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      +{collaborators.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Copy code"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </button>

          {canEdit && (
            <button
              onClick={handleSave}
              className="p-2 text-blue-600 hover:text-blue-700"
              title="Save changes"
            >
              <Save className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onSelect={handleCursorMove}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          readOnly={!canEdit}
          className={`w-full p-4 font-mono text-sm border-none resize-none focus:outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${getLanguageClass(language)}`}
          style={{ 
            height: isFullscreen ? 'calc(100vh - 200px)' : '500px',
            tabSize: 2
          }}
          placeholder={canEdit ? "Start coding..." : "No content available"}
          spellCheck={false}
        />

        {/* Line numbers (simple implementation) */}
        <div className="absolute left-0 top-0 p-4 text-gray-400 select-none pointer-events-none font-mono text-sm">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-5">
              {index + 1}
            </div>
          ))}
        </div>

        {/* Cursor indicators for other users */}
        {Object.entries(cursors).map(([userId, position]) => (
          <div
            key={userId}
            className="absolute w-0.5 h-5 bg-blue-500 pointer-events-none"
            style={{
              left: `${position * 0.6}ch`, // Approximate character width
              top: `${Math.floor(position / 80) * 1.25}rem` // Approximate line height
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <div>
          Lines: {code.split('\n').length} | Characters: {code.length}
        </div>
        <div>
          Language: {language}
        </div>
      </div>
    </div>
  )
}

export default CodeEditor