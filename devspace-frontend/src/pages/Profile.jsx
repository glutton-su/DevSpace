import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { 
  MapPin, 
  Link2, 
  Calendar, 
  Star, 
  GitFork, 
  Users, 
  Settings,
  Code,
  TrendingUp,
  Clock
} from 'lucide-react'

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState('projects')
  const [loading, setLoading] = useState(true)

  const isOwnProfile = !username || username === currentUser?.username

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const targetUsername = username || currentUser?.username
      
      const [profileRes, projectsRes, statsRes] = await Promise.all([
        api.get(`/users/${targetUsername}`),
        api.get(`/users/${targetUsername}/projects`),
        api.get(`/users/${targetUsername}/stats`)
      ])

      setProfile(profileRes.data)
      setProjects(projectsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getTopLanguages = () => {
    if (!stats.languages) return []
    return Object.entries(stats.languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          User not found
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={profile.avatar || '/default-avatar.png'}
                alt={profile.username}
                className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.displayName || profile.username}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    @{profile.username}
                  </p>
                </div>
                
                {isOwnProfile && (
                  <Link
                    to="/settings"
                    className="mt-3 sm:mt-0 btn-secondary inline-flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                {profile.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </span>
                )}
                
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Link2 className="h-4 w-4" />
                    <span>{profile.website}</span>
                  </a>
                )}
                
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.projectsCount || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Projects
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.starsReceived || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stars
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.forksReceived || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Forks
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.followersCount || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Followers
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Top Languages */}
          {getTopLanguages().length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Top Languages
              </h3>
              <div className="space-y-3">
                {getTopLanguages().map(([language, count]) => (
                  <div key={language} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {language}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Updated project "React Components"</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Star className="h-4 w-4" />
                <span>Starred "Vue.js Examples"</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <GitFork className="h-4 w-4" />
                <span>Forked "Python Scripts"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'projects'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Code className="h-4 w-4 inline mr-2" />
                  Projects ({projects.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('starred')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'starred'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Star className="h-4 w-4 inline mr-2" />
                  Starred
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'projects' && (
                <div>
                  {projects.length === 0 ? (
                    <div className="text-center py-12">
                      <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No projects yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {isOwnProfile 
                          ? "Create your first project to get started!"
                          : `${profile.username} hasn't created any projects yet.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <Link
                              to={`/project/${project.id}`}
                              className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                              {project.name}
                            </Link>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              project.visibility === 'public'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {project.visibility}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {project.description || 'No description provided'}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{project.starsCount || 0}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <GitFork className="h-3 w-3" />
                                <span>{project.forksCount || 0}</span>
                              </span>
                            </div>
                            <span>{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'starred' && (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No starred projects
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Star projects to keep track of them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile