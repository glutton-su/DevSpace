import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../services/api'
import CodeEditor from '../components/editor/CodeEditor'
import { 
  Star, 
  GitFork, 
  Download, 
  Share2, 
  Edit, 
  Trash2, 
  Users, 
  Plus,
  File,
  Folder,
  Eye,
  Lock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Project = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { joinProject, leaveProject } = useSocket()
  const navigate = useNavigate()
  
  const [project, setProject] = useState(null)
  const [codeSnippets, setCodeSnippets] = useState([])
  const [activeSnippet, setActiveSnippet] = useState(null)
  const [collaborators, setCollaborators] = useState([])
  const [isStarred, setIsStarred] = useState(false)
  const [isForked, setIsForked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewSnippetModal, setShowNewSnippetModal] = useState(false)

  useEffect(() => {
    loadProject()
    
    // Join project for real-time updates
    if (id) {
      joinProject(id)
    }

    return () => {
      if (id) {
        leaveProject(id)
      }
    }
  }, [id])

  const loadProject = async () => {
    try {
      setLoading(true)
      const [projectRes, snippetsRes, collaboratorsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/snippets`),
        api.get(`/projects/${id}/collaborators`)
      ])

      setProject(projectRes.data)
      setCodeSnippets(snippetsRes.data)
      setCollaborators(collaboratorsRes.data)
      setIsStarred(projectRes.data.isStarred)
      setIsForked(projectRes.data.isForked)

      // Set first snippet as active if exists
      if (snippetsRes.data.length > 0) {
        setActiveSnippet(snippetsRes.data[0])
      }
    } catch (error) {
      toast.error('Failed to load project')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleStar = async () => {
    try {
      if (isStarred) {
        await api.delete(`/projects/${id}/star`)
        setIsStarred(false)
        toast.success('Removed from starred')
      } else {
        await api.post(`/projects/${id}/star`)
        setIsStarred(true)
        toast.success('Added to starred')
      }
    } catch (error) {
      toast.error('Failed to update star status')
    }
  }

  const handleFork = async () => {
    try {
      const response = await api.post(`/projects/${id}/fork`)
      toast.success('Project forked successfully')
      navigate(`/project/${response.data.id}`)
    } catch (error) {
      toast.error('Failed to fork project')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted successfully')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const isOwner = project?.User?.id === user?.id
  const canEdit = isOwner || collaborators.some(c => c.id === user?.id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Project not found
        </h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${
                project.visibility === 'public'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {project.visibility === 'public' ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                <span>{project.visibility}</span>
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {project.description || 'No description provided'}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <Link 
                to={`/profile/${project.User.username}`}
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                <img
                  src={project.User.avatar || '/default-avatar.png'}
                  alt={project.User.username}
                  className="h-5 w-5 rounded-full"
                />
                <span>{project.User.username}</span>
              </Link>
              <span>{project.starsCount || 0} stars</span>
              <span>{project.forksCount || 0} forks</span>
              <span>{project.viewsCount || 0} views</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!isOwner && (
              <>
                <button
                  onClick={handleStar}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    isStarred
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
                  <span>{isStarred ? 'Starred' : 'Star'}</span>
                </button>

                <button
                  onClick={handleFork}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <GitFork className="h-4 w-4" />
                  <span>Fork</span>
                </button>
              </>
            )}

            {canEdit && (
              <Link
                to={`/project/${id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Files/Snippets */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Files</h3>
                {canEdit && (
                  <button
                    onClick={() => setShowNewSnippetModal(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-2">
              {codeSnippets.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm p-2">
                  No files yet
                </p>
              ) : (
                <div className="space-y-1">
                  {codeSnippets.map((snippet) => (
                    <button
                      key={snippet.id}
                      onClick={() => setActiveSnippet(snippet)}
                      className={`w-full text-left p-2 rounded-lg flex items-center space-x-2 transition-colors ${
                        activeSnippet?.id === snippet.id
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <File className="h-4 w-4" />
                      <span className="text-sm truncate">{snippet.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Collaborators */}
            {collaborators.length > 0 && (
              <>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Collaborators
                  </h3>
                  <div className="space-y-2">
                    {collaborators.map((collaborator) => (
                      <Link
                        key={collaborator.id}
                        to={`/profile/${collaborator.username}`}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <img
                          src={collaborator.avatar || '/default-avatar.png'}
                          alt={collaborator.username}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {collaborator.username}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-3">
          {activeSnippet ? (
            <CodeEditor
              snippet={activeSnippet}
              projectId={id}
              canEdit={canEdit}
              onSnippetUpdate={(updatedSnippet) => {
                setCodeSnippets(prev => 
                  prev.map(s => s.id === updatedSnippet.id ? updatedSnippet : s)
                )
                setActiveSnippet(updatedSnippet)
              }}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No file selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {codeSnippets.length === 0 
                  ? 'This project has no files yet.'
                  : 'Select a file from the sidebar to view its content.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Snippet Modal */}
      {showNewSnippetModal && (
        <NewSnippetModal
          projectId={id}
          onClose={() => setShowNewSnippetModal(false)}
          onSnippetCreated={(newSnippet) => {
            setCodeSnippets(prev => [...prev, newSnippet])
            setActiveSnippet(newSnippet)
            setShowNewSnippetModal(false)
          }}
        />
      )}
    </div>
  )
}

// New Snippet Modal Component
const NewSnippetModal = ({ projectId, onClose, onSnippetCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    language: 'javascript',
    content: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post(`/projects/${projectId}/snippets`, formData)
      onSnippetCreated(response.data)
      toast.success('File created successfully')
    } catch (error) {
      toast.error('Failed to create file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New File
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="input-field"
              placeholder="e.g., main.js"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              className="input-field"
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
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Project