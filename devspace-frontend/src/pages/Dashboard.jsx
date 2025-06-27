import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { 
  Plus, 
  Star, 
  GitFork, 
  Clock, 
  Code, 
  Users,
  TrendingUp,
  Filter
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStars: 0,
    totalForks: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, owned, starred, forked

  useEffect(() => {
    loadDashboardData()
  }, [filter])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load projects based on filter
      let projectsEndpoint = '/projects'
      if (filter === 'owned') projectsEndpoint = '/projects/my'
      else if (filter === 'starred') projectsEndpoint = '/projects/starred'
      else if (filter === 'forked') projectsEndpoint = '/projects/forked'

      const [projectsRes, statsRes, activityRes] = await Promise.all([
        api.get(projectsEndpoint),
        api.get('/users/stats'),
        api.get('/users/activity')
      ])

      setProjects(projectsRes.data.projects || projectsRes.data)
      setStats(statsRes.data)
      setRecentActivity(activityRes.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your projects
          </p>
        </div>
        <Link
          to="/project/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Code className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Projects
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Stars
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalStars}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <GitFork className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Forks
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalForks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Views
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalViews}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Projects
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Projects</option>
                <option value="owned">My Projects</option>
                <option value="starred">Starred</option>
                <option value="forked">Forked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'owned' 
                  ? "You haven't created any projects yet."
                  : "No projects match your current filter."
                }
              </p>
              {filter === 'owned' && (
                <Link
                  to="/project/new"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create your first project</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(project.updatedAt)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'star' && <Star className="h-4 w-4 text-yellow-500" />}
                    {activity.type === 'fork' && <GitFork className="h-4 w-4 text-green-600" />}
                    {activity.type === 'create' && <Plus className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard